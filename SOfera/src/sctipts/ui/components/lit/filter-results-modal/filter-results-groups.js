import dataArray from '../../../../../res/data.json';
import { mapDataItemToPoiInfo } from '../../../../poi/poi-data.js';
import { matchesFilter } from '../../filter/filter-match.js';
import { getFilterState } from '../../filter/filter-store.js';
import { assetUrl } from '../../../../utils/asset-url.js';
import { normalizeFilePlanPath } from '../../../../utils/file-plan-path.js';

/** @typedef {import('./filter-results-utils.js').FilterResultsPlanGroup} FilterResultsPlanGroup */

/** @param {ReturnType<import('../../filter/filter-state.js').serializeFilterState>} [filter] */
export const buildFilterResultsGroups = (filter = getFilterState()) => {
    /** @type {Map<string, FilterResultsPlanGroup>} */
    const groups = new Map();

    for (const item of dataArray) {
        const groupId =
            typeof item.plan_group_id === 'string'
                ? item.plan_group_id.trim()
                : '';

        const groupName =
            typeof item.plan_group_name === 'string'
                ? item.plan_group_name.trim()
                : '';

        if (!groupId || !groupName)
            continue;

        const poiInfo = mapDataItemToPoiInfo(item);

        if (!matchesFilter(poiInfo, filter))
            continue;

        const price =
            typeof item.estatePrice === 'number' ? item.estatePrice : NaN;

        if (!Number.isFinite(price))
            continue;

        let group = groups.get(groupId);

        if (!group) {
            const planPath = normalizeFilePlanPath(item.filePlan);
            const floorPlanPath = normalizeFilePlanPath(item.file_plan_on_floor);
            const tags = Array.isArray(item.tags)
                ? item.tags.filter((tag) => typeof tag === 'string')
                : [];

            group = {
                id: groupId,
                title: groupName,
                planSrc: planPath ? assetUrl(planPath) : '',
                floorPlanSrc: floorPlanPath ? assetUrl(floorPlanPath) : '',
                tags,
                priceFrom: price,
                variantCount: 0
            };
            groups.set(groupId, group);
        }

        group.variantCount += 1;

        if (price < group.priceFrom)
            group.priceFrom = price;
    }

    return [...groups.values()].sort((a, b) =>
        a.title.localeCompare(b.title, 'ru')
    );
};
