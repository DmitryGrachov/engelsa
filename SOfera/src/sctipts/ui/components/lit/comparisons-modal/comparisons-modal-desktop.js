import './desk/comparisons-desk-view.js';
import { refreshComparisonsView } from './comparisons-modal-refresh.js';
import { COMPARISONS_CHANGE_EVENT } from '../../../../../../lib/comparisons.js';
import { focusApartmentFromVariant } from '../../../../poi/poi-focus.js';
import { getPoiModal } from '../../../../poi/modal/poi-modal.js';
import { resolvePoiInfoFromVariant } from '../filter-group-variants-modal/filter-group-variant-poi.js';
import { getObjectSelectModal } from '../object-select-modal/index.js';
import { getGalleryModal } from '../gallery-modal/index.js';
import { getAccountModal } from '../account-modal/index.js';
import { sortFilterGroupVariants } from '../filter-group-variants-modal/filter-group-variants-sort/index.js';
import { downloadOfferPdf } from '../../../../offers/index.js';

export const createComparisonsModalDesktop = () => {
    const uiRoot = document.getElementById('ui');

    if (!uiRoot)
        return null;

    const root = document.createElement('div');
    root.id = 'comparisonsModalDesk';
    root.className = 'accountModalRoot accountModalRoot--desktop comparisonsModalRoot';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-hidden', 'true');
    root.setAttribute('aria-label', 'Сравнение');

    const panel = document.createElement('div');
    panel.className = 'accountDeskPanel';

    const view = document.createElement('comparisons-desk-view');
    panel.appendChild(view);
    root.appendChild(panel);
    uiRoot.appendChild(root);

    let open = false;

    const refresh = () => {
        refreshComparisonsView(view);
    };

    const setOpen = (next) => {
        open = next;
        root.classList.toggle('account-modal--open', open);
        root.classList.toggle('comparisons-modal--open', open);
        root.setAttribute('aria-hidden', open ? 'false' : 'true');
        root.dispatchEvent(
            new CustomEvent('comparisonsmodal:change', { detail: { open } })
        );
    };

    const openModal = () => {
        refresh();
        setOpen(true);
    };

    const closeModal = () => setOpen(false);
    const toggleModal = () => (open ? closeModal() : openModal());

    view.addEventListener('comparisons-close', closeModal);

    view.addEventListener('comparisons-desk-card-3d', (event) => {
        focusApartmentFromVariant(/** @type {CustomEvent} */ (event).detail?.variant);
    });

    view.addEventListener('comparisons-desk-card-tour', () => {
        getPoiModal()?.openTour?.();
    });

    view.addEventListener('comparisons-desk-card-details', (event) => {
        const variant = /** @type {CustomEvent} */ (event).detail?.variant;
        const info = resolvePoiInfoFromVariant(variant);

        if (!info)
            return;

        getPoiModal()?.openDetail?.(info);
    });

    view.addEventListener('comparisons-desk-user-menu-item', (event) => {
        const itemId = /** @type {CustomEvent} */ (event).detail?.itemId;

        if (itemId === 'object') {
            getObjectSelectModal()?.open?.();
            return;
        }

        if (itemId === 'favorites') {
            closeModal();
            getAccountModal()?.open?.();
            return;
        }

        if (itemId === 'compare')
            return;

        if (itemId === 'gallery')
            getGalleryModal()?.open?.();
    });

    view.addEventListener('comparisons-desk-offers', () => {
        const variants = Array.isArray(view.variants) ? view.variants : [];
        const sortedVariants = sortFilterGroupVariants(
            variants,
            view.sortField || null,
            view.sortDirection
        );

        void downloadOfferPdf({
            variants: sortedVariants,
            emptyMessage: 'В сравнении пока нет квартир для подборки.'
        });
    });

    const onComparisonsChange = () => {
        if (open)
            refresh();
    };

    window.addEventListener(COMPARISONS_CHANGE_EVENT, onComparisonsChange);

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
        toggle: toggleModal,
        isOpen: () => open,
        refresh,
        destroy() {
            window.removeEventListener(COMPARISONS_CHANGE_EVENT, onComparisonsChange);
            window.removeEventListener('keydown', onKeyDown);
            root.remove();
        }
    };
};
