import { isPoiNarrowViewport } from '../poi/poi-viewport.js';
import { resumeEngineRender } from '../ui/engine-render-pause.js';

/** Ждём about:blank, затем выкидываем node — надёжнее для WebGL VRAM на мобе. */
const IFRAME_BLANK_TIMEOUT_MS = 450;
const IFRAME_AFTER_BLANK_MS = 50;
const ENGINE_RESUME_DELAY_MOBILE_MS = 400;
const ENGINE_RESUME_DELAY_DESKTOP_MS = 100;

/**
 * about:blank → пауза → remove из DOM (жёсткая выгрузка browsing context / WebGL).
 * @param {HTMLIFrameElement | null | undefined} iframe
 * @returns {Promise<void>}
 */
export const destroyHeavyIframe = iframe => {
    if (!(iframe instanceof HTMLIFrameElement))
        return Promise.resolve();

    return new Promise(resolve => {
        let settled = false;

        const finish = () => {
            if (settled)
                return;

            settled = true;

            try {
                iframe.removeAttribute('src');
            } catch {
                /* ignore */
            }

            iframe.remove();
            resolve();
        };

        const timer = setTimeout(finish, IFRAME_BLANK_TIMEOUT_MS);

        iframe.addEventListener(
            'load',
            () => {
                clearTimeout(timer);
                setTimeout(finish, IFRAME_AFTER_BLANK_MS);
            },
            { once: true }
        );

        try {
            iframe.src = 'about:blank';
        } catch {
            clearTimeout(timer);
            finish();
        }
    });
};

/**
 * Resume PlayCanvas после dispose iframe — с задержкой, чтобы GPU успел отдать VRAM.
 * @param {number} [ms]
 * @returns {Promise<void>}
 */
export const resumeEngineRenderAfterIframe = ms => {
    const delay =
        typeof ms === 'number'
            ? ms
            : (isPoiNarrowViewport()
                ? ENGINE_RESUME_DELAY_MOBILE_MS
                : ENGINE_RESUME_DELAY_DESKTOP_MS);

    return new Promise(resolve => {
        setTimeout(() => {
            resumeEngineRender();
            resolve();
        }, delay);
    });
};
