/**
 * MSAA нужен только для POI с alphaToCoverage. Пока боксы скрыты — выключаем multisample backbuffer (дешевле).
 * PlayCanvas хранит samples на graphicsDevice и пересоздаёт FBO через createBackbuffer.
 */

let lastPoiMsaaVisible = null;

const wantsCanvasAa = () =>
    typeof window !== 'undefined' && window.sse?.config?.aa === true;

const msaaSamplesCap = () => {
    let cap = Infinity;
    if (typeof navigator !== 'undefined') {
        const ua = navigator.userAgent || '';
        if (/Android|iPhone|iPad|iPod|Mobile/i.test(ua)) cap = 2;
        else if (typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches) cap = 2;
    }
    if (typeof window !== 'undefined' && window.sse?.config?.lite) cap = Math.min(cap, 2);
    return cap;
};

/** @param {any} app @param {boolean} poiMeshesVisible */
export const syncBackbufferMsaaForPoiVisibility = (app, poiMeshesVisible) => {
    if (!wantsCanvasAa()) return;

    const wantMsaa = poiMeshesVisible === true;
    if (wantMsaa === lastPoiMsaaVisible) return;

    const gd = app.graphicsDevice;
    if (!gd?.backBuffer || typeof gd.createBackbuffer !== 'function') return;

    if (gd.isWebGL2) {
        const maxHw = gd.maxSamples > 1 ? gd.maxSamples : 1;
        const cap = msaaSamplesCap();
        const max = Number.isFinite(cap) ? Math.min(maxHw, cap) : maxHw;
        const nextSamples = wantMsaa ? max : 1;

        gd.backBufferAntialias = wantMsaa && nextSamples > 1;
        gd.samples = nextSamples;

        gd.backBuffer.destroy();
        gd.backBuffer = null;
        gd.createBackbuffer(gd.defaultFramebuffer ?? null);
        gd.backBufferSize.set(gd.canvas.width, gd.canvas.height);
        lastPoiMsaaVisible = wantMsaa;
        app.renderNextFrame = true;
        return;
    }

    if (gd.isWebGPU) {
        const cap = msaaSamplesCap();
        const samples = wantMsaa ? (Number.isFinite(cap) ? Math.min(4, cap) : 4) : 1;
        gd.backBufferAntialias = wantMsaa;
        gd.samples = samples;
        gd.backBuffer.destroy();
        gd.backBuffer = null;
        gd.createBackbuffer();
        gd.backBufferSize.set(gd.canvas.width, gd.canvas.height);
        lastPoiMsaaVisible = wantMsaa;
        app.renderNextFrame = true;
    }
};
