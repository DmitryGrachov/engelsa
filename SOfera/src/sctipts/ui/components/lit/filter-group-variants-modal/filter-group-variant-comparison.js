import {
    COMPARISONS_CHANGE_EVENT,
    COMPARISONS_MAX_COUNT,
    isComparisonAtLimit,
    isInComparison,
    setComparison
} from '../../../../../../lib/comparisons.js';
import { getVariantFavoriteId } from './filter-group-variant-favorite.js';

/** @typedef {import('./filter-group-variants-data.js').FilterGroupVariantItem} FilterGroupVariantItem */

export { COMPARISONS_CHANGE_EVENT, COMPARISONS_MAX_COUNT };

/** @param {FilterGroupVariantItem | null | undefined} variant */
export const isVariantInComparison = (variant) => {
    const id = getVariantFavoriteId(variant);

    return id != null && isInComparison(id);
};

/** @param {FilterGroupVariantItem | null | undefined} variant
 * @returns {boolean | null} null — нет id; false — лимит, не добавили */
export const toggleVariantComparison = (variant) => {
    const id = getVariantFavoriteId(variant);

    if (id == null)
        return null;

    const next = !isInComparison(id);

    if (next && isComparisonAtLimit())
        return false;

    setComparison(id, next);

    return next;
};

/** @param {EventTarget | null} host
 * @param {() => void} onChange */
export const bindVariantComparisonsListener = (host, onChange) => {
    if (!host || typeof onChange !== 'function')
        return () => {};

    const handler = () => {
        onChange();
    };

    window.addEventListener(COMPARISONS_CHANGE_EVENT, handler);

    return () => {
        window.removeEventListener(COMPARISONS_CHANGE_EVENT, handler);
    };
};
