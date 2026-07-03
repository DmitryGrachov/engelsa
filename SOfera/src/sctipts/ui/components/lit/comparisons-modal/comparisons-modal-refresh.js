import { getComparisons } from '../../../../../../lib/comparisons.js';
import { getAnonymousUserId } from '../../../../../../lib/metrics.js';
import { buildComparisonsApartments } from '../comparisons-apartments-modal/comparisons-apartments-data.js';

/** @param {HTMLElement | null | undefined} view */
export const refreshComparisonsView = (view) => {
    if (!view)
        return;

    const apartmentsCount = getComparisons().length;
    const variants = buildComparisonsApartments();

    view.userId = getAnonymousUserId();
    view.apartmentsCount = apartmentsCount;
    view.parkingCount = 0;
    view.totalCount = apartmentsCount;

    if ('variants' in view)
        view.variants = variants;
};
