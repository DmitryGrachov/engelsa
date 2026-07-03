import dataArray from '../../../../../res/data.json';
import { getFavorites } from '../../../../../../lib/favorites.js';
import { assetUrl } from '../../../../utils/asset-url.js';
import { normalizeFilePlanPath } from '../../../../utils/file-plan-path.js';

/** @typedef {import('../filter-results-modal/filter-results-utils.js').FilterResultsPlanGroup} FilterResultsPlanGroup */

const MAX_GROUPS = 2;

/** @param {string} groupId @returns {FilterResultsPlanGroup | null} */
const buildPlanGroupFromData = (groupId) => {
    /** @type {FilterResultsPlanGroup | null} */
    let group = null;

    for (const item of dataArray) {
        const itemGroupId =
            typeof item.plan_group_id === 'string'
                ? item.plan_group_id.trim()
                : '';

        if (itemGroupId !== groupId)
            continue;

        const groupName =
            typeof item.plan_group_name === 'string'
                ? item.plan_group_name.trim()
                : '';

        if (!groupName)
            continue;

        const price =
            typeof item.estatePrice === 'number' ? item.estatePrice : NaN;

        if (!Number.isFinite(price))
            continue;

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
        }

        group.variantCount += 1;

        if (price < group.priceFrom)
            group.priceFrom = price;
    }

    return group;
};

/** @returns {FilterResultsPlanGroup[]} */
export const buildAccountMobRecommendations = () => {
    const favoriteIds = getFavorites();

    if (favoriteIds.length === 0)
        return [];

    /** @type {Map<number, (typeof dataArray)[number]>} */
    const itemsById = new Map();

    for (const item of dataArray) {
        if (typeof item.id === 'number')
            itemsById.set(item.id, item);
    }

    const seenGroupIds = new Set();
    /** @type {string[]} */
    const groupIds = [];

    for (const favoriteId of favoriteIds) {
        if (groupIds.length >= MAX_GROUPS)
            break;

        const item = itemsById.get(favoriteId);

        if (!item)
            continue;

        const groupId =
            typeof item.plan_group_id === 'string'
                ? item.plan_group_id.trim()
                : '';

        if (!groupId || seenGroupIds.has(groupId))
            continue;

        seenGroupIds.add(groupId);
        groupIds.push(groupId);
    }

    /** @type {FilterResultsPlanGroup[]} */
    const groups = [];

    for (const groupId of groupIds) {
        const group = buildPlanGroupFromData(groupId);

        if (group)
            groups.push(group);
    }

    return groups;
};
