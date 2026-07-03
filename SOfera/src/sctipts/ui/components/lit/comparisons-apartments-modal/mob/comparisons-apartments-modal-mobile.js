import './comparisons-apartments-mob-view.js';
import { refreshComparisonsApartmentsView } from '../comparisons-apartments-refresh.js';
import { resolvePoiInfoFromVariant } from '../../filter-group-variants-modal/filter-group-variant-poi.js';
import { getPoiModal } from '../../../../../poi/modal/poi-modal.js';
import { COMPARISONS_CHANGE_EVENT, setComparisons } from '../../../../../../../lib/comparisons.js';

export const createComparisonsApartmentsModalMobile = () => {
    const uiRoot = document.getElementById('ui');

    if (!uiRoot)
        return null;

    const root = document.createElement('div');
    root.id = 'comparisonsApartmentsModal';
    root.className =
        'favoritesApartmentsModalRoot favoritesApartmentsModalRoot--mobile comparisonsApartmentsModalRoot';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-hidden', 'true');
    root.setAttribute('aria-label', 'Сравнение квартир');

    const view = document.createElement('comparisons-apartments-mob-view');

    root.appendChild(view);
    uiRoot.appendChild(root);

    let open = false;

    const refreshView = () => {
        refreshComparisonsApartmentsView(view);
    };

    const setOpen = (next) => {
        open = next;
        root.classList.toggle('favorites-apartments-modal--open', open);
        root.classList.toggle('comparisons-apartments-modal--open', open);
        root.setAttribute('aria-hidden', open ? 'false' : 'true');
        root.dispatchEvent(
            new CustomEvent('comparisonsapartmentsmodal:change', {
                detail: { open }
            })
        );
    };

    const openModal = () => {
        refreshView();
        setOpen(true);
    };

    const closeModal = () => setOpen(false);

    view.addEventListener('comparisons-apartments-close', closeModal);

    view.addEventListener('comparisons-apartments-clear', () => {
        setComparisons([]);
        refreshView();
    });

    const onComparisonsChange = () => {
        if (open)
            refreshView();
    };

    window.addEventListener(COMPARISONS_CHANGE_EVENT, onComparisonsChange);

    const onKeyDown = (event) => {
        if (event.key === 'Escape' && open)
            closeModal();
    };

    window.addEventListener('keydown', onKeyDown);

    view.addEventListener('comparisons-apartments-card-details', (event) => {
        const variant = /** @type {CustomEvent} */ (event).detail?.variant;
        const info = resolvePoiInfoFromVariant(variant);

        if (!info)
            return;

        getPoiModal()?.openDetail?.(info);
    });

    return {
        root,
        view,
        open: openModal,
        close: closeModal,
        isOpen: () => open,
        refresh: refreshView,
        destroy() {
            window.removeEventListener(COMPARISONS_CHANGE_EVENT, onComparisonsChange);
            window.removeEventListener('keydown', onKeyDown);
            root.remove();
        }
    };
};
