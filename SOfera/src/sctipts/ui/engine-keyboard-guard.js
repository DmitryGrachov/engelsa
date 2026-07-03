/**
 * PlayCanvas viewer (KeyboardMouseSource) слушает keydown/keyup на window и не
 * игнорирует поля ввода — WASD уезжает в камеру. Патчим обработчики один раз.
 */

/** @type {import('../../lib/index.js').Viewer | null} */
let viewerRef = null;

/** @param {EventTarget | null} target */
function isTextInputTarget(target) {
    if (!(target instanceof Element))
        return false;

    if (target.isContentEditable)
        return true;

    const tag = target.tagName;

    if (tag === 'TEXTAREA' || tag === 'SELECT')
        return true;

    if (tag !== 'INPUT')
        return false;

    const input = /** @type {HTMLInputElement} */ (target);
    const type = (input.type || 'text').toLowerCase();

    return type !== 'checkbox'
        && type !== 'radio'
        && type !== 'button'
        && type !== 'submit'
        && type !== 'reset'
        && type !== 'file'
        && type !== 'image'
        && type !== 'range'
        && type !== 'color';
}

/** @param {import('../../lib/index.js').Viewer | null | undefined} [viewer] */
export function clearEngineKeyboardState(viewer) {
    const desktopInput = (viewer ?? viewerRef)?.inputController?._desktopInput;

    if (!desktopInput)
        return;

    desktopInput._keyNow?.fill?.(0);
    desktopInput._keyPrev?.fill?.(0);
}

/**
 * @param {import('../../lib/index.js').Viewer | null | undefined} viewer
 */
export function installEngineTextInputKeyboardGuard(viewer) {
    viewerRef = viewer ?? null;
    const desktopInput = viewer?.inputController?._desktopInput;

    if (!desktopInput || desktopInput._textInputGuardInstalled)
        return;

    const origKeyDown = desktopInput._onKeyDown.bind(desktopInput);
    const origKeyUp = desktopInput._onKeyUp.bind(desktopInput);

    desktopInput._onKeyDown = event => {
        if (isTextInputTarget(event.target))
            return;

        origKeyDown(event);
    };

    desktopInput._onKeyUp = event => {
        if (isTextInputTarget(event.target))
            return;

        origKeyUp(event);
    };

    desktopInput._textInputGuardInstalled = true;

    document.addEventListener('focusin', event => {
        if (isTextInputTarget(event.target))
            clearEngineKeyboardState(viewer);
    }, true);
}
