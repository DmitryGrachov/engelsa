import { buildFilterResultsGroups } from './filter-results-groups.js';
import { countMatchingVariants } from '../../filter/count-variants.js';

/** @param {{ groups?: unknown; totalCount?: number }} view */
export const refreshFilterResultsView = (view) => {
    view.groups = buildFilterResultsGroups();
    view.totalCount = countMatchingVariants();
};
