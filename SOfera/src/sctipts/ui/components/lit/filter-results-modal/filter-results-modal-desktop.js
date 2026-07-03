import './filter-results-desk-view.js';
import { refreshFilterResultsView } from './filter-results-refresh.js';
import { getFilterGroupVariantsModal } from '../filter-group-variants-modal/index.js';

export const createFilterResultsModalDesktop = () => {
    const uiRoot = document.getElementById('ui');

    if (!uiRoot)
        return null;

    const root = document.createElement('div');
    root.id = 'filterResultsModalDesk';
    root.className = 'filterResultsModalRoot filterResultsModalRoot--desktop';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-hidden', 'true');

    const panel = document.createElement('div');
    panel.className = 'filterResultsDeskPanel';

    const view = document.createElement('filter-results-desk-view');
    panel.appendChild(view);
    root.appendChild(panel);
    uiRoot.appendChild(root);

    let open = false;

    const refreshCounts = () => {
        refreshFilterResultsView(view);
    };

    const setOpen = (next) => {
        open = next;
        root.classList.toggle('filter-results-modal--open', open);
        root.setAttribute('aria-hidden', open ? 'false' : 'true');
        root.dispatchEvent(
            new CustomEvent('filterresultsmodal:change', {
                bubbles: true,
                detail: { open }
            })
        );
    };

    const openModal = () => {
        refreshCounts();
        setOpen(true);
    };

    const closeModal = () => setOpen(false);
    const toggleModal = () => (open ? closeModal() : openModal());

    view.addEventListener('filter-results-close', closeModal);

    view.addEventListener('filter-results-offers', () => {
        // «Получить предложения» — логика позже
    });

    view.addEventListener('filter-results-filter', closeModal);

    view.addEventListener('filter-results-show-group', (event) => {
        const groupId = /** @type {CustomEvent} */ (event).detail?.groupId;

        if (typeof groupId === 'string' && groupId)
            getFilterGroupVariantsModal().open(groupId);
    });

    const onKeyDown = (event) => {
        if (event.key === 'Escape' && open) {
            if (getFilterGroupVariantsModal().isOpen())
                return;

            closeModal();
        }
    };

    window.addEventListener('keydown', onKeyDown);

    return {
        root,
        view,
        open: openModal,
        close: closeModal,
        toggle: toggleModal,
        isOpen: () => open,
        refresh: refreshCounts,
        destroy() {
            window.removeEventListener('keydown', onKeyDown);
            root.remove();
        }
    };
};
