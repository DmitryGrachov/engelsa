import './interest-poi-tour-view.js';
import { pauseEngineRender } from '../../../engine-render-pause.js';
import { resumeEngineRenderAfterIframe } from '../../../../utils/embed-iframe-dispose.js';

export const createInterestPoiTourModal = () => {
    const uiRoot = document.getElementById('ui');

    if (!uiRoot)
        return null;

    const view = document.createElement('interest-poi-tour-view');
    uiRoot.appendChild(view);

    let closing = false;

    const openModal = () => {
        pauseEngineRender();
        view.open = true;
    };

    const closeModal = () => {
        if (closing)
            return;

        closing = true;

        const run = async () => {
            try {
                if (typeof view.disposeTourIframe === 'function')
                    await view.disposeTourIframe();
                else if (typeof view.unloadTourIframe === 'function')
                    await Promise.resolve(view.unloadTourIframe());

                view.open = false;
                await resumeEngineRenderAfterIframe();
            } finally {
                closing = false;
            }
        };

        void run();
    };

    view.addEventListener('interest-poi-tour-close', closeModal);

    const onKeyDown = (event) => {
        if (event.key === 'Escape' && view.open)
            closeModal();
    };

    window.addEventListener('keydown', onKeyDown);

    return {
        view,
        open: openModal,
        close: closeModal,
        isOpen: () => view.open,
        destroy() {
            window.removeEventListener('keydown', onKeyDown);
            closeModal();
            view.remove();
        }
    };
};

let sharedInstance = null;

export const getInterestPoiTourModal = () => {
    if (!sharedInstance)
        sharedInstance = createInterestPoiTourModal();

    return sharedInstance;
};
