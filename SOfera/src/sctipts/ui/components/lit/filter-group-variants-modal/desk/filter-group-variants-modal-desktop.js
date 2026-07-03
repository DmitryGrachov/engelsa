import './filter-group-variants-desk-view.js';
import { refreshFilterGroupVariantsView } from '../filter-group-variants-refresh.js';
import { resolvePoiInfoFromVariant } from '../filter-group-variant-poi.js';
import { getPoiModal } from '../../../../../poi/modal/poi-modal.js';

export const createFilterGroupVariantsModalDesktop = () => {
    const uiRoot = document.getElementById('ui');

    if (!uiRoot)
        return null;

    const root = document.createElement('div');
    root.id = 'filterGroupVariantsModalDesk';
    root.className =
        'filterGroupVariantsModalRoot filterGroupVariantsModalRoot--desktop';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-hidden', 'true');

    const panel = document.createElement('div');
    panel.className = 'filterGroupVariantsDeskPanel';

    const view = document.createElement('filter-group-variants-desk-view');
    panel.appendChild(view);
    root.appendChild(panel);
    uiRoot.appendChild(root);

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

    view.addEventListener('filter-group-variants-offers', () => {
        // «Получить предложения» — логика позже
    });

    view.addEventListener('filter-group-variant-details', (event) => {
        const variant = /** @type {CustomEvent} */ (event).detail?.variant;
        const info = resolvePoiInfoFromVariant(variant);

        if (!info)
            return;

        getPoiModal()?.openDetail?.(info);
    });

    const onKeyDown = (event) => {
        if (event.key === 'Escape' && open) {
            const poiDetailOpen = document
                .getElementById('poiModalDeskFs')
                ?.classList.contains('poi-modal-desk-fs--open');

            if (poiDetailOpen)
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
        isOpen: () => open,
        getGroupId: () => currentGroupId,
        refresh: refreshView,
        destroy() {
            window.removeEventListener('keydown', onKeyDown);
            root.remove();
        }
    };
};
