import { buildFavoritesApartments } from './favorites-apartments-data.js';
import { getComparisons } from '../../../../../../lib/comparisons.js';

/** @param {HTMLElement | null | undefined} view */
export const refreshFavoritesApartmentsView = (view) => {
    if (!view)
        return;

    const variants = buildFavoritesApartments();

    view.variants = variants;
    view.totalCount = variants.length;

    if ('compareCount' in view)
        view.compareCount = getComparisons().length;
};
