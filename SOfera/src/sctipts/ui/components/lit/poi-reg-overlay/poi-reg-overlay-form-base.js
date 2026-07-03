import {
    RU_PHONE_PREFIX,
    formatRuPhoneDisplay,
    guardRuPhonePrefixKeydown,
    focusRuPhoneInput,
    isRuPhoneComplete,
    normalizeRuPhone,
    syncRuPhoneInputCaret
} from '../../../utils/ru-phone-mask.js';

/** @typedef {{ consent?: boolean; name?: string; phone?: string; comment?: string }} PoiRegOverlayFormState */

/**
 * @template {import('lit').LitElement} T
 * @param {T} SuperClass
 */
export const PoiRegOverlayFormMixin = SuperClass => class extends SuperClass {
    static properties = {
        ...(SuperClass.properties ?? {}),
        consent: { type: Boolean, state: true },
        name: { type: String, state: true },
        phone: { type: String, state: true },
        comment: { type: String, state: true },
        phoneError: { type: Boolean, state: true }
    };

    constructor() {
        super();
        /** @type {boolean} */
        this.consent = false;
        /** @type {string} */
        this.name = '';
        /** @type {string} */
        this.phone = RU_PHONE_PREFIX;
        /** @type {string} */
        this.comment = '';
        /** @type {boolean} */
        this.phoneError = false;
    }

    /** @param {Event} event */
    _stop(event) {
        event.stopPropagation();
    }

    /** @param {Event} event */
    _preventLink(event) {
        event.preventDefault();
        event.stopPropagation();
    }

    /** @param {KeyboardEvent} event */
    _onFormKeyDown(event) {
        event.stopPropagation();
    }

    /** @param {KeyboardEvent} event */
    _onFormKeyUp(event) {
        event.stopPropagation();
    }

    /** @param {Event} event */
    _onCloseClick(event) {
        this._stop(event);
        this.dispatchEvent(new CustomEvent('poi-reg-close', { bubbles: true }));
    }

    /** @param {Event} event */
    _onConsentChange(event) {
        const input = /** @type {HTMLInputElement} */ (event.target);
        this.consent = input.checked;
    }

    /** @param {InputEvent} event */
    _onNameInput(event) {
        this.name = /** @type {HTMLInputElement} */ (event.target).value;
    }

    /** @param {FocusEvent} event */
    _onPhoneFocus(event) {
        const input = /** @type {HTMLInputElement} */ (event.target);

        if (!this.phone.startsWith(RU_PHONE_PREFIX))
            this.phone = RU_PHONE_PREFIX;

        focusRuPhoneInput(input);
    }

    /** @param {KeyboardEvent} event */
    _onPhoneKeyDown(event) {
        event.stopPropagation();
        guardRuPhonePrefixKeydown(event);
    }

    /** @param {InputEvent} event */
    _onPhoneInput(event) {
        const input = /** @type {HTMLInputElement} */ (event.target);

        this.phone = formatRuPhoneDisplay(input.value);
        this.phoneError = false;
        syncRuPhoneInputCaret(input);
    }

    /** @param {ClipboardEvent} event */
    _onPhonePaste(event) {
        event.preventDefault();
        event.stopPropagation();

        const input = /** @type {HTMLInputElement} */ (event.target);
        const pasted = event.clipboardData?.getData('text') ?? '';

        this.phone = formatRuPhoneDisplay(pasted);
        this.phoneError = false;
        syncRuPhoneInputCaret(input);
    }

    /** @param {InputEvent} event */
    _onCommentInput(event) {
        this.comment = /** @type {HTMLTextAreaElement} */ (event.target).value;
    }

    /** @param {Event} event */
    _onSubmit(event) {
        event.preventDefault();
        event.stopPropagation();

        if (!this.consent)
            return;

        if (!isRuPhoneComplete(this.phone)) {
            this.phoneError = true;
            return;
        }

        this.dispatchEvent(new CustomEvent('poi-reg-submit', {
            bubbles: true,
            detail: {
                name: this.name.trim(),
                phone: normalizeRuPhone(this.phone),
                phoneFormatted: this.phone,
                comment: this.comment.trim()
            }
        }));
    }

    resetForm() {
        this.consent = false;
        this.name = '';
        this.phone = RU_PHONE_PREFIX;
        this.comment = '';
        this.phoneError = false;
    }
};
