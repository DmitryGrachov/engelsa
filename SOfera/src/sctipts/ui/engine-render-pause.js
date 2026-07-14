/**
 * Приостанавливает рендер родительского PlayCanvas, пока открыт iframe с WebGL
 * (тур по двору, виджет планировки и т.п.) — два контекста одновременно бьют VRAM на телефонах.
 */

/** @type {import('../../lib/index.js').Viewer | null} */
let viewerRef = null;

let pauseCount = 0;

/** @param {import('../../lib/index.js').Viewer | null | undefined} viewer */
export function installEngineRenderPause(viewer) {
    viewerRef = viewer ?? null;

    const app = viewer?.global?.app;

    if (!app || app._engineRenderPauseHookInstalled)
        return;

    app.on('framerender', () => {
        if (pauseCount <= 0)
            return;

        app.renderNextFrame = false;

        if (viewerRef)
            viewerRef.forceRenderNextFrame = false;
    });

    app._engineRenderPauseHookInstalled = true;
}

export function pauseEngineRender() {
    if (!viewerRef?.global?.app)
        return;

    pauseCount += 1;

    if (pauseCount !== 1)
        return;

    const { app } = viewerRef.global;

    viewerRef.forceRenderNextFrame = false;
    app.renderNextFrame = false;

    const canvas = app.graphicsDevice?.canvas;

    if (canvas instanceof HTMLCanvasElement)
        canvas.style.visibility = 'hidden';
}

export function resumeEngineRender() {
    if (!viewerRef?.global?.app || pauseCount <= 0)
        return;

    pauseCount -= 1;

    if (pauseCount !== 0)
        return;

    const { app } = viewerRef.global;
    const canvas = app.graphicsDevice?.canvas;

    if (canvas instanceof HTMLCanvasElement)
        canvas.style.visibility = '';

    app.renderNextFrame = true;
}
