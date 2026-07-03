import { buildFilterGroupVariants } from './filter-group-variants-data.js';

/** @param {{ groupTitle?: string; totalCount?: number; variants?: unknown[] }} view
 * @param {string} groupId */
export const refreshFilterGroupVariantsView = (view, groupId) => {
    const payload = buildFilterGroupVariants(groupId);

    view.groupTitle = payload.groupTitle;
    view.variants = payload.variants;
    view.totalCount = payload.variants.length;

    return payload;
};
