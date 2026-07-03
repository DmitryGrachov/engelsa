/** Ключ localStorage: id избранных товаров для незарегистрированных пользователей. */
export const FAVORITES_STORAGE_KEY = 'favorites';

/** Событие window при изменении списка избранного. */
export const FAVORITES_CHANGE_EVENT = 'favorites:change';

/** @type {number[] | null} */
let memoryFavorites = null;

/** @param {unknown} value @returns {number[]} */
const normalizeFavorites = (value) => {
    if (!Array.isArray(value))
        return [];

    return value.filter((id) => typeof id === 'number' && Number.isFinite(id));
};

/** @returns {number[] | null} */
const readStoredFavorites = () => {
    if (typeof window === 'undefined')
        return null;

    try {
        const stored = window.localStorage.getItem(FAVORITES_STORAGE_KEY);

        if (stored === null)
            return null;

        return normalizeFavorites(JSON.parse(stored));
    } catch {
        return null;
    }
};

/** @param {number[]} favorites */
const emitFavoritesChange = (favorites) => {
    if (typeof window === 'undefined')
        return;

    window.dispatchEvent(new CustomEvent(FAVORITES_CHANGE_EVENT, {
        detail: {
            favorites,
            count: favorites.length
        }
    }));
};

/** @param {number[]} favorites */
const writeStoredFavorites = (favorites) => {
    if (typeof window === 'undefined')
        return;

    try {
        window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch {
        // private mode, quota, disabled storage
    }
};

/**
 * Список id избранных товаров незарегистрированного пользователя.
 *
 * @returns {number[]}
 */
export const getFavorites = () => {
    const stored = readStoredFavorites();

    if (stored)
        return stored;

    if (memoryFavorites)
        return memoryFavorites;

    return [];
};

/** @param {number[]} favorites */
export const setFavorites = (favorites) => {
    const normalized = normalizeFavorites(favorites);

    writeStoredFavorites(normalized);
    memoryFavorites = normalized;
    emitFavoritesChange(normalized);

    return normalized;
};

/**
 * Гарантирует наличие ключа favorites в localStorage (пустой массив при первом визите).
 *
 * @returns {number[]}
 */
export const initFavorites = () => {
    const stored = readStoredFavorites();

    if (stored !== null)
        return setFavorites(stored);

    return setFavorites([]);
};

/** @param {number | undefined} id */
export const isFavorite = (id) => {
    if (typeof id !== 'number' || !Number.isFinite(id))
        return false;

    return getFavorites().includes(id);
};

/** @param {number} id @param {boolean} favorite */
export const setFavorite = (id, favorite) => {
    if (typeof id !== 'number' || !Number.isFinite(id))
        return getFavorites();

    const favorites = getFavorites();
    const has = favorites.includes(id);

    if (favorite && !has)
        return setFavorites([...favorites, id]);

    if (!favorite && has)
        return setFavorites(favorites.filter((item) => item !== id));

    return favorites;
};
