import './user-menu-panel.js';
import { getAnonymousUserId } from '../../../../../../lib/metrics.js';

export const createUserMenuModal = () => {
    const uiRoot = document.getElementById('ui');

    if (!uiRoot)
        return null;

    const root = document.createElement('div');
    root.id = 'userMenuModal';
    root.className = 'userMenuModalRoot';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-hidden', 'true');
    root.setAttribute('aria-label', 'Меню пользователя');

    const backdrop = document.createElement('button');
    backdrop.type = 'button';
    backdrop.className = 'userMenuModalBackdrop';
    backdrop.setAttribute('aria-label', 'Закрыть меню');

    const panel = document.createElement('user-menu-panel');
    root.append(backdrop, panel);
    uiRoot.appendChild(root);

    let open = false;

    const refresh = () => {
        panel.userId = getAnonymousUserId();
    };

    const setOpen = (next) => {
        open = next;
        root.classList.toggle('user-menu-modal--open', open);
        root.setAttribute('aria-hidden', open ? 'false' : 'true');
        root.dispatchEvent(
            new CustomEvent('usermenumodal:change', { detail: { open } })
        );
    };

    const openModal = () => {
        refresh();
        setOpen(true);
    };

    const closeModal = () => setOpen(false);

    backdrop.addEventListener('click', closeModal);
    panel.addEventListener('user-menu-close', closeModal);

    const onKeyDown = (event) => {
        if (event.key === 'Escape' && open)
            closeModal();
    };

    window.addEventListener('keydown', onKeyDown);

    return {
        root,
        panel,
        open: openModal,
        close: closeModal,
        isOpen: () => open,
        refresh,
        destroy() {
            window.removeEventListener('keydown', onKeyDown);
            root.remove();
        }
    };
};

let sharedInstance = null;

export const getUserMenuModal = () => {
    if (!sharedInstance)
        sharedInstance = createUserMenuModal();

    return sharedInstance;
};
