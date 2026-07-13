import './interest-poi-tour-view.js';

export const createInterestPoiTourModal = () => {
    const uiRoot = document.getElementById('ui');

    if (!uiRoot)
        return null;

    const view = document.createElement('interest-poi-tour-view');
    uiRoot.appendChild(view);

    const openModal = () => {
        view.open = true;
    };

    const closeModal = () => {
        view.open = false;
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
