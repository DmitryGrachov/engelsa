import './account-mob-header.js';
import './account-mob-view.js';
import './account-mob-share-bar.js';
import { refreshAccountView } from './account-modal-refresh.js';
import { FAVORITES_CHANGE_EVENT } from '../../../../../../lib/favorites.js';
import { COMPARISONS_CHANGE_EVENT } from '../../../../../../lib/comparisons.js';
import { getFilterGroupVariantsModal } from '../filter-group-variants-modal/index.js';
import { bindTouchFriendlyButtons } from '../../../../utils/touch-friendly-buttons.js';
import { downloadFavoritesOfferPdf } from '../../../../offers/index.js';

export const createAccountModalMobile = () => {
    const uiRoot = document.getElementById('ui');

    if (!uiRoot)
        return null;

    const root = document.createElement('div');
    root.id = 'accountModal';
    root.className = 'accountModalRoot accountModalRoot--mobile';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-hidden', 'true');
    root.setAttribute('aria-label', 'Личный кабинет');

    const header = document.createElement('account-mob-header');
    const view = document.createElement('account-mob-view');
    const shareBar = document.createElement('account-mob-share-bar');
    root.appendChild(header);
    root.appendChild(view);
    root.appendChild(shareBar);
    uiRoot.appendChild(root);
    bindTouchFriendlyButtons(view);

    view.addEventListener('filter-results-show-group', (event) => {
        const groupId = /** @type {CustomEvent} */ (event).detail?.groupId;

        if (typeof groupId === 'string' && groupId)
            getFilterGroupVariantsModal().open(groupId);
    });

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

    shareBar.addEventListener('account-share', () => {
        void downloadFavoritesOfferPdf();
    });

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
