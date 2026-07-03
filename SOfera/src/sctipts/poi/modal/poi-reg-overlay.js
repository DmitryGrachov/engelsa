import '../../ui/components/lit/poi-reg-overlay/poi-reg-overlay-desk-form.js';
import '../../ui/components/lit/poi-reg-overlay/poi-reg-overlay-mob-form.js';
import { clearEngineKeyboardState } from '../../ui/engine-keyboard-guard.js';

/**
 * Полноэкранная модалка регистрации — Lit-форма на десктопе и мобилке.
 */

const FORM_TAG = {
    desk: 'poi-reg-overlay-desk-form',
    mobile: 'poi-reg-overlay-mob-form'
};

const TITLE_ID = {
    desk: 'poiRegOverlayDeskTitle',
    mobile: 'poiRegOverlayMobTitle'
};

const KEYBOARD_EVENTS = ['keydown', 'keyup', 'keypress'];

/** @param {Event} event */
const stopKeyboardBubble = event => {
    event.stopPropagation();
};

/**
 * @param {'desk' | 'mobile'} variant
 * @param {HTMLElement | null | undefined} [parent]
 */
export function createPoiRegOverlay(variant, parent) {
    const mount = parent ?? document.getElementById('ui') ?? document.body;
    const isDesk = variant === 'desk';
    const mod = isDesk ? 'poiRegOverlayDesk' : 'poiRegOverlayMob';

    const root = document.createElement('div');
    root.id = isDesk ? 'poiRegOverlayDesk' : 'poiRegOverlayMob';
    root.className = mod;
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-hidden', 'true');
    root.setAttribute('aria-labelledby', TITLE_ID[variant] ?? TITLE_ID.mobile);

    const inner = document.createElement('div');
    inner.className = `${mod}Inner`;

    const figure = document.createElement('div');
    figure.className = `${mod}Figure`;

    const form = document.createElement(FORM_TAG[variant] ?? FORM_TAG.mobile);
    figure.appendChild(form);

    inner.appendChild(figure);
    root.appendChild(inner);
    mount.appendChild(root);

    KEYBOARD_EVENTS.forEach(eventName => {
        root.addEventListener(eventName, stopKeyboardBubble);
    });

    let open = false;

    const focusFirstField = () => {
        requestAnimationFrame(() => {
            const input = root.querySelector('input[name="name"], input[type="text"], textarea');

            if (input instanceof HTMLElement)
                input.focus();
        });
    };

    const close = () => {
        if (!open)
            return;

        open = false;
        root.classList.remove(`${mod}--open`);
        root.setAttribute('aria-hidden', 'true');
        clearEngineKeyboardState();
    };

    const openOverlay = () => {
        if (open)
            return;

        open = true;
        clearEngineKeyboardState();
        root.classList.add(`${mod}--open`);
        root.setAttribute('aria-hidden', 'false');
        focusFirstField();
    };

    root.addEventListener('pointerdown', e => e.stopPropagation());
    // initUI в lib: #ui снимает focus с activeElement на click — без stop поле сразу теряет фокус
    root.addEventListener('click', e => e.stopPropagation());

    form.addEventListener('poi-reg-close', e => {
        e.stopPropagation();
        close();
    });

    form.addEventListener('poi-reg-submit', e => {
        e.stopPropagation();
        close();
    });

    return {
        open: openOverlay,
        close,
        isOpen: () => open,
        root
    };
}
