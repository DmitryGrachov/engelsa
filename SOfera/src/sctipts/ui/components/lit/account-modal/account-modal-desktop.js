import './account-desk-view.js';
import { refreshAccountView } from './account-modal-refresh.js';
import { FAVORITES_CHANGE_EVENT, setFavorites } from '../../../../../../lib/favorites.js';
import { COMPARISONS_CHANGE_EVENT } from '../../../../../../lib/comparisons.js';
import { focusApartmentFromVariant } from '../../../../poi/poi-focus.js';
import { getPoiModal } from '../../../../poi/modal/poi-modal.js';
import { resolvePoiInfoFromVariant } from '../filter-group-variants-modal/filter-group-variant-poi.js';
import { getObjectSelectModal } from '../object-select-modal/index.js';
import { getGalleryModal } from '../gallery-modal/index.js';
import { sortFilterGroupVariants } from '../filter-group-variants-modal/filter-group-variants-sort/index.js';
import { downloadOfferPdf } from '../../../../offers/index.js';
import { toggleVariantComparison } from '../filter-group-variants-modal/filter-group-variant-comparison.js';
import { getComparisonsModal } from '../comparisons-modal/index.js';

export const createAccountModalDesktop = () => {
    const uiRoot = document.getElementById('ui');

    if (!uiRoot)
        return null;

    const root = document.createElement('div');
    root.id = 'accountModalDesk';
    root.className = 'accountModalRoot accountModalRoot--desktop';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-hidden', 'true');
    root.setAttribute('aria-label', 'Избранное');

    const panel = document.createElement('div');
    panel.className = 'accountDeskPanel';

    const view = document.createElement('account-desk-view');
    panel.appendChild(view);
    root.appendChild(panel);
    uiRoot.appendChild(root);

    let open = false;

    const refresh = () => {
        refreshAccountView(view);
    };

    const setOpen = (next) => {
        open = next;
        root.classList.toggle('account-modal--open', open);
        root.setAttribute('aria-hidden', open ? 'false' : 'true');
        root.dispatchEvent(
            new CustomEvent('accountmodal:change', { detail: { open } })
        );
    };

    const openModal = () => {
        refresh();
        setOpen(true);
    };

    const closeModal = () => setOpen(false);
    const toggleModal = () => (open ? closeModal() : openModal());

    view.addEventListener('account-close', closeModal);

    view.addEventListener('account-desk-favorites-card-3d', (event) => {
        focusApartmentFromVariant(/** @type {CustomEvent} */ (event).detail?.variant);
    });

    view.addEventListener('account-desk-favorites-card-tour', () => {
        getPoiModal()?.openTour?.();
    });

    view.addEventListener('account-desk-favorites-card-details', (event) => {
        const variant = /** @type {CustomEvent} */ (event).detail?.variant;
        const info = resolvePoiInfoFromVariant(variant);

        if (!info)
            return;

        getPoiModal()?.openDetail?.(info);
    });

    view.addEventListener('account-desk-favorites-card-compare', (event) => {
        const variant = /** @type {CustomEvent} */ (event).detail?.variant;

        toggleVariantComparison(variant);
    });

    view.addEventListener('account-desk-favorites-compare', () => {
        getComparisonsModal().open();
    });

    view.addEventListener('account-desk-favorites-user-menu-item', (event) => {
        const itemId = /** @type {CustomEvent} */ (event).detail?.itemId;

        if (itemId === 'object') {
            getObjectSelectModal()?.open?.();
            return;
        }

        if (itemId === 'favorites') {
            closeModal();
            return;
        }

        if (itemId === 'compare') {
            closeModal();
            getComparisonsModal().open();
            return;
        }

        if (itemId === 'gallery')
            getGalleryModal()?.open?.();
    });

    view.addEventListener('account-desk-favorites-clear', () => {
        setFavorites([]);
        refresh();
    });

    view.addEventListener('account-desk-favorites-offers', () => {
        const variants = Array.isArray(view.variants) ? view.variants : [];
        const sortedVariants = sortFilterGroupVariants(
            variants,
            view.sortField || null,
            view.sortDirection
        );

        void downloadOfferPdf({
            variants: sortedVariants,
            emptyMessage: 'В избранном пока нет квартир для подборки.'
        });
    });

    const onFavoritesChange = () => {
        if (open)
            refresh();
    };

    const onComparisonsChange = () => {
        if (open)
            refresh();
    };

    window.addEventListener(FAVORITES_CHANGE_EVENT, onFavoritesChange);
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
            window.removeEventListener(FAVORITES_CHANGE_EVENT, onFavoritesChange);
            window.removeEventListener(COMPARISONS_CHANGE_EVENT, onComparisonsChange);
            window.removeEventListener('keydown', onKeyDown);
            root.remove();
        }
    };
};
