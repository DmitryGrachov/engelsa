import './favorites-apartments-mob-view.js';
import { refreshFavoritesApartmentsView } from '../favorites-apartments-refresh.js';
import { resolvePoiInfoFromVariant } from '../../filter-group-variants-modal/filter-group-variant-poi.js';
import { getPoiModal } from '../../../../../poi/modal/poi-modal.js';
import { FAVORITES_CHANGE_EVENT, setFavorites } from '../../../../../../../lib/favorites.js';
import { COMPARISONS_CHANGE_EVENT } from '../../../../../../../lib/comparisons.js';
import { toggleVariantComparison } from '../../filter-group-variants-modal/filter-group-variant-comparison.js';

export const createFavoritesApartmentsModalMobile = () => {
    const uiRoot = document.getElementById('ui');

    if (!uiRoot)
        return null;

    const root = document.createElement('div');
    root.id = 'favoritesApartmentsModal';
    root.className =
        'favoritesApartmentsModalRoot favoritesApartmentsModalRoot--mobile';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-hidden', 'true');
    root.setAttribute('aria-label', 'Избранные квартиры');

    const view = document.createElement('favorites-apartments-mob-view');

    root.appendChild(view);
    uiRoot.appendChild(root);

    let open = false;

    const refreshView = () => {
        refreshFavoritesApartmentsView(view);
    };

    const setOpen = (next) => {
        open = next;
        root.classList.toggle('favorites-apartments-modal--open', open);
        root.setAttribute('aria-hidden', open ? 'false' : 'true');
        root.dispatchEvent(
            new CustomEvent('favoritesapartmentsmodal:change', {
                detail: { open }
            })
        );
    };

    const openModal = () => {
        refreshView();
        setOpen(true);
    };

    const closeModal = () => setOpen(false);

    view.addEventListener('favorites-apartments-close', closeModal);

    view.addEventListener('favorites-apartments-clear', () => {
        setFavorites([]);
        refreshView();
    });

    const onFavoritesChange = () => {
        if (open)
            refreshView();
    };

    window.addEventListener(FAVORITES_CHANGE_EVENT, onFavoritesChange);

    const onKeyDown = (event) => {
        if (event.key === 'Escape' && open)
            closeModal();
    };

    window.addEventListener('keydown', onKeyDown);

    view.addEventListener('favorites-apartments-card-details', (event) => {
        const variant = /** @type {CustomEvent} */ (event).detail?.variant;
        const info = resolvePoiInfoFromVariant(variant);

        if (!info)
            return;

        getPoiModal()?.openDetail?.(info);
    });

    view.addEventListener('favorites-apartments-card-compare', (event) => {
        const variant = /** @type {CustomEvent} */ (event).detail?.variant;

        toggleVariantComparison(variant);
    });

    const onComparisonsChange = () => {
        if (open)
            refreshView();
    };

    window.addEventListener(COMPARISONS_CHANGE_EVENT, onComparisonsChange);

    return {
        root,
        view,
        open: openModal,
        close: closeModal,
        isOpen: () => open,
        refresh: refreshView,
        destroy() {
            window.removeEventListener(FAVORITES_CHANGE_EVENT, onFavoritesChange);
            window.removeEventListener(COMPARISONS_CHANGE_EVENT, onComparisonsChange);
            window.removeEventListener('keydown', onKeyDown);
            root.remove();
        }
    };
};
