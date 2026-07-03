/**
 * На touch после pointer-жестов (свайп и т.п.) браузер иногда не шлёт click.
 * На pointerup для touch/pen вызываем click() и подавляем дублирующий нативный click.
 *
 * @param {HTMLElement} root
 * @returns {() => void}
 */
export function bindTouchFriendlyButtons(root) {
    /** @type {Map<number, HTMLButtonElement>} */
    const pointerButtons = new Map();
    /** @type {HTMLElement | null} */
    let touchActivatedButton = null;
    let syntheticClick = false;

    /** @param {PointerEvent} event @returns {HTMLButtonElement | null} */
    const getButtonFromEvent = (event) => {
        if (!(event.target instanceof Element))
            return null;

        const btn = event.target.closest('button');

        if (!btn || !root.contains(btn))
            return null;

        if (btn.hasAttribute('data-native-touch'))
            return null;

        return /** @type {HTMLButtonElement} */ (btn);
    };

    /** @param {PointerEvent} event */
    const onPointerDown = (event) => {
        if (event.button !== 0)
            return;

        const btn = getButtonFromEvent(event);

        if (!btn)
            return;

        pointerButtons.set(event.pointerId, btn);
    };

    /** @param {PointerEvent} event */
    const onPointerUp = (event) => {
        if (event.button !== 0)
            return;

        const trackedBtn = pointerButtons.get(event.pointerId);
        pointerButtons.delete(event.pointerId);

        const btn = trackedBtn ?? getButtonFromEvent(event);

        if (!btn)
            return;

        if (event.pointerType === 'mouse')
            return;

        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        touchActivatedButton = btn;
        syntheticClick = true;
        btn.click();
        syntheticClick = false;

        setTimeout(() => {
            if (touchActivatedButton === btn)
                touchActivatedButton = null;
        }, 400);
    };

    /** @param {PointerEvent} event */
    const onPointerCancel = (event) => {
        pointerButtons.delete(event.pointerId);
    };

    /** @param {MouseEvent} event */
    const onClick = (event) => {
        if (syntheticClick)
            return;

        const btn = getButtonFromEvent(event);

        if (!btn)
            return;

        if (touchActivatedButton !== btn)
            return;

        touchActivatedButton = null;
        event.stopPropagation();
        event.preventDefault();
    };

    root.addEventListener('pointerdown', onPointerDown, true);
    root.addEventListener('pointerup', onPointerUp, true);
    root.addEventListener('pointercancel', onPointerCancel, true);
    root.addEventListener('click', onClick, true);

    return () => {
        root.removeEventListener('pointerdown', onPointerDown, true);
        root.removeEventListener('pointerup', onPointerUp, true);
        root.removeEventListener('pointercancel', onPointerCancel, true);
        root.removeEventListener('click', onClick, true);
        pointerButtons.clear();
        touchActivatedButton = null;
    };
}

/** @param {HTMLElement & { _touchFriendlyButtonsUnbind?: () => void }} host */
export function attachTouchFriendlyButtons(host) {
    host._touchFriendlyButtonsUnbind?.();
    host._touchFriendlyButtonsUnbind = bindTouchFriendlyButtons(host);
}

/** @param {HTMLElement & { _touchFriendlyButtonsUnbind?: () => void }} host */
export function detachTouchFriendlyButtons(host) {
    host._touchFriendlyButtonsUnbind?.();
    host._touchFriendlyButtonsUnbind = undefined;
}
