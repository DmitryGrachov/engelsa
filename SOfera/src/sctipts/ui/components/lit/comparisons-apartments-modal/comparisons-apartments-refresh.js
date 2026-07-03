import { buildComparisonsApartments } from './comparisons-apartments-data.js';

/** @param {HTMLElement | null | undefined} view */
export const refreshComparisonsApartmentsView = (view) => {
    if (!view)
        return;

    const variants = buildComparisonsApartments();

    view.variants = variants;
    view.totalCount = variants.length;
};
