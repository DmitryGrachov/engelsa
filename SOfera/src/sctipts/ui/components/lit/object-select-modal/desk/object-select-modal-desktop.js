import '../object-select-view.js';

export const createObjectSelectModalDesktop = () => {
    const uiRoot = document.getElementById('ui');

    if (!uiRoot)
        return null;

    const root = document.createElement('div');
    root.id = 'objectSelectModalDesk';
    root.className = 'objectSelectModalRoot objectSelectModalRoot--desktop';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-hidden', 'true');
    root.setAttribute('aria-label', 'Выбор объекта');

    const backdrop = document.createElement('button');
    backdrop.type = 'button';
    backdrop.className = 'objectSelectModalBackdrop';
    backdrop.setAttribute('aria-label', 'Закрыть');

    const view = document.createElement('object-select-view');

    root.append(backdrop, view);
    uiRoot.appendChild(root);

    let open = false;

    const setOpen = (next) => {
        open = next;
        root.classList.toggle('object-select-modal--open', open);
        root.setAttribute('aria-hidden', open ? 'false' : 'true');
        root.dispatchEvent(
            new CustomEvent('objectselectmodal:change', { detail: { open } })
        );
    };

    const openModal = () => setOpen(true);
    const closeModal = () => setOpen(false);

    backdrop.addEventListener('click', closeModal);
    view.addEventListener('object-select-close', closeModal);

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
