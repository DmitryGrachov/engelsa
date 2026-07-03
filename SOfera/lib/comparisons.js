/** Ключ localStorage: id квартир в листе сравнения. */
export const COMPARISONS_STORAGE_KEY = 'comparisons';

/** Максимум квартир в листе сравнения. */
export const COMPARISONS_MAX_COUNT = 6;

/** Событие window при изменении листа сравнения. */
export const COMPARISONS_CHANGE_EVENT = 'comparisons:change';

/** @type {number[] | null} */
let memoryComparisons = null;

/** @param {unknown} value @returns {number[]} */
const normalizeComparisons = (value) => {
    if (!Array.isArray(value))
        return [];

    const ids = value.filter((id) => typeof id === 'number' && Number.isFinite(id));

    return [...new Set(ids)].slice(0, COMPARISONS_MAX_COUNT);
};

/** @returns {number[] | null} */
const readStoredComparisons = () => {
    if (typeof window === 'undefined')
        return null;

    try {
        const stored = window.localStorage.getItem(COMPARISONS_STORAGE_KEY);

        if (stored === null)
            return null;

        return normalizeComparisons(JSON.parse(stored));
    } catch {
        return null;
    }
};

/** @param {number[]} comparisons */
const emitComparisonsChange = (comparisons) => {
    if (typeof window === 'undefined')
        return;

    window.dispatchEvent(new CustomEvent(COMPARISONS_CHANGE_EVENT, {
        detail: {
            comparisons,
            count: comparisons.length
        }
    }));
};

/** @param {number[]} comparisons */
const writeStoredComparisons = (comparisons) => {
    if (typeof window === 'undefined')
        return;

    try {
        window.localStorage.setItem(COMPARISONS_STORAGE_KEY, JSON.stringify(comparisons));
    } catch {
        // private mode, quota, disabled storage
    }
};

/**
 * Список id квартир в листе сравнения.
 *
 * @returns {number[]}
 */
export const getComparisons = () => {
    const stored = readStoredComparisons();

    if (stored)
        return stored;

    if (memoryComparisons)
        return memoryComparisons;

    return [];
};

/** @returns {boolean} */
export const isComparisonAtLimit = () => getComparisons().length >= COMPARISONS_MAX_COUNT;

/** @param {number[]} comparisons */
export const setComparisons = (comparisons) => {
    const normalized = normalizeComparisons(comparisons);

    writeStoredComparisons(normalized);
    memoryComparisons = normalized;
    emitComparisonsChange(normalized);

    return normalized;
};

/**
 * Гарантирует наличие ключа comparisons в localStorage (пустой массив при первом визите).
 *
 * @returns {number[]}
 */
export const initComparisons = () => {
    const stored = readStoredComparisons();

    if (stored !== null)
        return setComparisons(stored);

    return setComparisons([]);
};

/** @param {number | undefined} id */
export const isInComparison = (id) => {
    if (typeof id !== 'number' || !Number.isFinite(id))
        return false;

    return getComparisons().includes(id);
};

/** @param {number} id @param {boolean} inComparison */
export const setComparison = (id, inComparison) => {
    if (typeof id !== 'number' || !Number.isFinite(id))
        return getComparisons();

    const comparisons = getComparisons();
    const has = comparisons.includes(id);

    if (inComparison && !has) {
        if (comparisons.length >= COMPARISONS_MAX_COUNT)
            return comparisons;

        return setComparisons([...comparisons, id]);
    }

    if (!inComparison && has)
        return setComparisons(comparisons.filter((item) => item !== id));

    return comparisons;
};
