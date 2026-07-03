import '../gallery-view.js';
import { bindTouchFriendlyButtons } from '../../../../../utils/touch-friendly-buttons.js';
import { resolveGalleryContent } from '../gallery-data.js';
import { getPoiModal } from '../../../../../poi/modal/poi-modal.js';

/** @param {import('../gallery-data.js').GalleryModalOpenOptions} content */
const applyGalleryViewContent = (view, content) => {
    view.sectionLabel = content.sectionLabel;
    view.title = content.title;
    view.projectTitle = content.projectTitle;
    view.description = content.description;
    view.images = content.images;
    view.initialIndex = content.initialIndex;

    requestAnimationFrame(() => {
        view.querySelector('gallery-carousel')?.setIndex?.(content.initialIndex);
    });
};

export const createGalleryModalDesktop = () => {
    const uiRoot = document.getElementById('ui');

    if (!uiRoot)
        return null;

    const root = document.createElement('div');
    root.id = 'galleryModalDesk';
    root.className = 'galleryModalRoot galleryModalRoot--desktop';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-hidden', 'true');
    root.setAttribute('aria-label', 'Галерея');

    const backdrop = document.createElement('button');
    backdrop.type = 'button';
    backdrop.className = 'galleryModalBackdrop';
    backdrop.setAttribute('aria-label', 'Закрыть');

    const panel = document.createElement('div');
    panel.className = 'galleryModalPanel galleryModalPanel--desktop';

    const view = document.createElement('gallery-view');
    panel.appendChild(view);
    root.append(backdrop, panel);
    uiRoot.appendChild(root);
    bindTouchFriendlyButtons(root);

    let open = false;

    const setOpen = (next) => {
        open = next;
        root.classList.toggle('gallery-modal--open', open);
        root.setAttribute('aria-hidden', open ? 'false' : 'true');
        root.dispatchEvent(
            new CustomEvent('gallerymodal:change', {
                bubbles: true,
                detail: { open }
            })
        );
    };

  /** @param {import('../gallery-data.js').GalleryModalOpenOptions} [options] */
    const openModal = (options = {}) => {
        applyGalleryViewContent(view, resolveGalleryContent(options));
        setOpen(true);
    };

    const closeModal = () => setOpen(false);

    backdrop.addEventListener('click', closeModal);

    view.addEventListener('gallery-tour', () => {
        closeModal();
        getPoiModal()?.openTour?.();
    });

    const onKeyDown = (event) => {
        if (event.key === 'Escape' && open)
            closeModal();
    };

    window.addEventListener('keydown', onKeyDown);

    return {
        root,
        view,
        open: openModal,
        close: closeModal,
        isOpen: () => open,
        destroy() {
            window.removeEventListener('keydown', onKeyDown);
            root.remove();
        }
    };
};
