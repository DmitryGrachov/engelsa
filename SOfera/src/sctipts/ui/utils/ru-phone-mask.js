/** @example +7 (---) --- -- -- */
export const RU_PHONE_PREFIX = '+7 (';

export const RU_PHONE_MASK_MAX_LENGTH = 18;

/** @param {string} value */
export function extractRuPhoneDigits(value) {
    let digits = String(value ?? '').replace(/\D/g, '');

    if (digits.startsWith('7') || digits.startsWith('8'))
        digits = digits.slice(1);

    return digits.slice(0, 10);
}

/** @param {string} value */
export function formatRuPhoneDisplay(value) {
    const digits = extractRuPhoneDigits(value);
    let out = RU_PHONE_PREFIX;

    if (digits.length === 0)
        return out;

    out += digits.slice(0, Math.min(3, digits.length));

    if (digits.length <= 3)
        return out;

    out += ') ' + digits.slice(3, Math.min(6, digits.length));

    if (digits.length <= 6)
        return out;

    out += ' ' + digits.slice(6, Math.min(8, digits.length));

    if (digits.length <= 8)
        return out;

    return out + ' ' + digits.slice(8, 10);
}

/** @param {string} value */
export function isRuPhoneComplete(value) {
    return extractRuPhoneDigits(value).length === 10;
}

/** @param {string} value */
export function normalizeRuPhone(value) {
    const digits = extractRuPhoneDigits(value);

    return digits.length === 10 ? `+7${digits}` : '';
}

/** @param {KeyboardEvent} event */
export function guardRuPhonePrefixKeydown(event) {
    const input = /** @type {HTMLInputElement | null} */ (event.target);

    if (!(input instanceof HTMLInputElement))
        return;

    const prefixLen = RU_PHONE_PREFIX.length;
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;

    if (event.key === 'Backspace' && start <= prefixLen && end <= prefixLen) {
        event.preventDefault();
        return;
    }

    if (event.key === 'Delete' && start < prefixLen)
        event.preventDefault();
}

/** @param {HTMLInputElement} input */
export function focusRuPhoneInput(input) {
    if (!input.value.startsWith(RU_PHONE_PREFIX))
        input.value = RU_PHONE_PREFIX;

    requestAnimationFrame(() => {
        const pos = input.value.length;

        input.setSelectionRange(
            Math.max(pos, RU_PHONE_PREFIX.length),
            Math.max(pos, RU_PHONE_PREFIX.length)
        );
    });
}

/** @param {HTMLInputElement} input */
export function syncRuPhoneInputCaret(input) {
    requestAnimationFrame(() => {
        const pos = input.value.length;

        input.setSelectionRange(pos, pos);
    });
}
