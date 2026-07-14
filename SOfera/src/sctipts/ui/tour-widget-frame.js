/**
 * Полноэкранная оболочка под виджет тура: верхняя панель с × и iframe.
 * Стили: `.tourWidgetFrame*` в `ui.css`.
 */

import { pauseEngineRender } from './engine-render-pause.js';
import {
    destroyHeavyIframe,
    resumeEngineRenderAfterIframe
} from '../utils/embed-iframe-dispose.js';

/** URL по умолчанию (Hart OST widget). */
export const TOUR_WIDGET_DEFAULT_URL =
    'https://ost.widget.hart-estate.ru/beta/?crmPlanId=544026&miniplan=original';

const createTourIframe = () => {
    const iframe = document.createElement('iframe');

    iframe.className = 'tourWidgetFrameIframe';
    iframe.title = 'Тур по планировке';
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    /* Виджет может дергать WebXR / сенсоры — без allow Chrome даёт Violation: xr-spatial-tracking is not allowed */
    iframe.setAttribute(
        'allow',
        'xr-spatial-tracking *; fullscreen *; accelerometer *; gyroscope *; magnetometer *'
    );

    return iframe;
};

/**
 * @param {{ parent: HTMLElement; shellId?: string; closeAriaLabel?: string }} opts
 * @returns {{ root: HTMLDivElement; open: (url?: string) => void; close: () => void; destroy: () => void }}
 */
export function createTourWidgetFrame(opts) {
    const parent = opts?.parent;

    if (!parent) {
        throw new Error('createTourWidgetFrame: parent is required');
    }

    const shellId = opts.shellId ?? 'tourWidgetFrameShell';
    const closeAriaLabel = opts.closeAriaLabel ?? 'Закрыть';

    const root = document.createElement('div');
    root.id = shellId;
    root.className = 'tourWidgetFrameShell';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-hidden', 'true');

    const bar = document.createElement('div');
    bar.className = 'tourWidgetFrameBar';

    const btnClose = document.createElement('button');
    btnClose.type = 'button';
    btnClose.className = 'tourWidgetFrameClose';
    btnClose.setAttribute('aria-label', closeAriaLabel);
    btnClose.innerHTML = '<span class="tourWidgetFrameCloseIcon" aria-hidden="true">×</span>';

    /** @type {HTMLIFrameElement} */
    let iframe = createTourIframe();
    let open = false;
    let disposing = false;
    /** @type {string | null} */
    let pendingOpenUrl = null;

    bar.appendChild(btnClose);
    root.append(bar, iframe);
    parent.appendChild(root);

    const ensureIframeMounted = () => {
        if (iframe.isConnected)
            return;

        root.appendChild(iframe);
    };

    const close = () => {
        if (!open && !disposing)
            return;

        open = false;
        root.classList.remove('tourWidgetFrameShell--open');
        root.setAttribute('aria-hidden', 'true');

        if (disposing)
            return;

        disposing = true;
        const doomed = iframe;

        // Новый пустой iframe (ещё не в DOM), чтобы open во время dispose не писал в doomed.
        iframe = createTourIframe();

        void destroyHeavyIframe(doomed)
            .then(() => {
                disposing = false;
                ensureIframeMounted();

                if (open && pendingOpenUrl) {
                    const url = pendingOpenUrl;

                    pendingOpenUrl = null;
                    iframe.src = url;
                    root.classList.add('tourWidgetFrameShell--open');
                    root.setAttribute('aria-hidden', 'false');

                    return;
                }

                pendingOpenUrl = null;

                return resumeEngineRenderAfterIframe();
            })
            .catch(() => {
                disposing = false;
                ensureIframeMounted();
                resumeEngineRenderAfterIframe();
            });
    };

    const openFrame = (url = TOUR_WIDGET_DEFAULT_URL) => {
        if (disposing) {
            pendingOpenUrl = url;
            open = true;

            return;
        }

        if (!open)
            pauseEngineRender();

        open = true;
        ensureIframeMounted();
        iframe.src = url;
        root.classList.add('tourWidgetFrameShell--open');
        root.setAttribute('aria-hidden', 'false');
    };

    root.addEventListener('pointerdown', e => e.stopPropagation());
    btnClose.addEventListener('click', e => {
        e.stopPropagation();
        close();
    });

    const destroy = () => {
        close();
        root.remove();
    };

    return { root, open: openFrame, close, destroy };
}
