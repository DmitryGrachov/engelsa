import './filter-group-variants-mob-view.js';
import './filter-group-variants-mob-offers-bar.js';
import { refreshFilterGroupVariantsView } from '../filter-group-variants-refresh.js';
import { resolvePoiInfoFromVariant } from '../filter-group-variant-poi.js';
import { getPoiModal } from '../../../../../poi/modal/poi-modal.js';
import { bindTouchFriendlyButtons } from '../../../../../utils/touch-friendly-buttons.js';
import { sortFilterGroupVariants } from '../filter-group-variants-sort/index.js';
import { downloadFilterGroupVariantsOfferPdf } from '../../../../../offers/index.js';

export const createFilterGroupVariantsModalMobile = () => {
    const uiRoot = document.getElementById('ui');

    if (!uiRoot)
        return null;

    const root = document.createElement('div');
    root.id = 'filterGroupVariantsModal';
    root.className =
        'filterGroupVariantsModalRoot filterGroupVariantsModalRoot--mobile';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-hidden', 'true');

    const view = document.createElement('filter-group-variants-mob-view');
    const offersBar = document.createElement('filter-group-variants-mob-offers-bar');

    root.appendChild(view);
    root.appendChild(offersBar);
    uiRoot.appendChild(root);
    bindTouchFriendlyButtons(root);

    let open = false;
    /** @type {string | null} */
    let currentGroupId = null;

    const refreshView = () => {
        if (!currentGroupId)
            return;

        refreshFilterGroupVariantsView(view, currentGroupId);
    };

    const setOpen = (next) => {
        open = next;
        root.classList.toggle('filter-group-variants-modal--open', open);
        root.setAttribute('aria-hidden', open ? 'false' : 'true');
        root.dispatchEvent(
            new CustomEvent('filtergroupvariantsmodal:change', {
                bubbles: true,
                detail: { open, groupId: currentGroupId }
            })
        );
    };

    /** @param {string} groupId */
    const openModal = (groupId) => {
        currentGroupId = String(groupId ?? '').trim();

        if (!currentGroupId)
            return;

        refreshView();
        setOpen(true);
    };

    const closeModal = () => {
        setOpen(false);
        currentGroupId = null;
    };

    view.addEventListener('filter-group-variants-close', closeModal);

    offersBar.addEventListener('filter-group-variants-offers', () => {
        const variants = Array.isArray(view.variants) ? view.variants : [];
        const sortedVariants = sortFilterGroupVariants(
            variants,
            view.sortField || null,
            view.sortDirection
        );

        void downloadFilterGroupVariantsOfferPdf(
            sortedVariants,
            view.groupTitle
        );
    });

    view.addEventListener('filter-group-variant-details', (event) => {
        const variant = /** @type {CustomEvent} */ (event).detail?.variant;
        const info = resolvePoiInfoFromVariant(variant);

        if (!info)
            return;

        getPoiModal()?.openDetail?.(info);
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
        getGroupId: () => currentGroupId,
        refresh: refreshView,
        destroy() {
            window.removeEventListener('keydown', onKeyDown);
            root.remove();
        }
    };
};
