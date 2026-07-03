/** Ключ localStorage для обезличенного id посетителя. */
export const ANONYMOUS_USER_ID_STORAGE_KEY = 'anonymous_user_id';

const ANONYMOUS_USER_ID_RE = /^[0-9a-f]{8}$/i;
const LEGACY_UUID_V4_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** @type {string | null} */
let memoryAnonymousUserId = null;

/** @returns {string} */
const generateAnonymousUserId = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
        const bytes = new Uint8Array(4);
        crypto.getRandomValues(bytes);

        return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
    }

    return Array.from({ length: 8 }, () => ((Math.random() * 16) | 0).toString(16)).join('');
};

/** @param {unknown} value @returns {string | null} */
const normalizeAnonymousUserId = (value) => {
    if (typeof value !== 'string')
        return null;

    const trimmed = value.trim().toLowerCase();

    if (ANONYMOUS_USER_ID_RE.test(trimmed))
        return trimmed;

    if (LEGACY_UUID_V4_RE.test(trimmed))
        return trimmed.slice(0, 8);

    return null;
};

/** @returns {string | null} */
const readStoredAnonymousUserId = () => {
    if (typeof window === 'undefined')
        return null;

    try {
        const stored = window.localStorage.getItem(ANONYMOUS_USER_ID_STORAGE_KEY);

        const normalized = normalizeAnonymousUserId(stored);

        if (!normalized)
            return null;

        if (stored.trim().toLowerCase() !== normalized)
            writeStoredAnonymousUserId(normalized);

        return normalized;
    } catch {
        return null;
    }
};

/** @param {string} id */
const writeStoredAnonymousUserId = (id) => {
    if (typeof window === 'undefined')
        return;

    try {
        window.localStorage.setItem(ANONYMOUS_USER_ID_STORAGE_KEY, id);
    } catch {
        // private mode, quota, disabled storage
    }
};

/**
 * Стабильный обезличенный id посетителя (8 hex-символов).
 * При первом визите генерируется и сохраняется в localStorage.
 *
 * @returns {string}
 */
export const getAnonymousUserId = () => {
    const stored = readStoredAnonymousUserId();

    if (stored)
        return stored;

    if (memoryAnonymousUserId)
        return memoryAnonymousUserId;

    const id = generateAnonymousUserId();

    writeStoredAnonymousUserId(id);
    memoryAnonymousUserId = id;

    return id;
};

/**
 * Базовая инициализация метрик на старте сессии.
 * Пока только гарантирует наличие anonymous user id.
 *
 * @returns {string}
 */
export const initMetrics = () => getAnonymousUserId();
