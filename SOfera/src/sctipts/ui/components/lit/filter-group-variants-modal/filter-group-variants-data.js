import dataArray from '../../../../../res/data.json';
import { mapDataItemToPoiInfo } from '../../../../poi/poi-data.js';
import { matchesFilter } from '../../filter/filter-match.js';
import { getFilterState } from '../../filter/filter-store.js';
import { assetUrl } from '../../../../utils/asset-url.js';
import { normalizeFilePlanPath } from '../../../../utils/file-plan-path.js';

/** @typedef {{
 *   id: string;
 *   favoriteId: number | null;
 *   name: string;
 *   groupId: string;
 *   groupTitle: string;
 *   number: number | null;
 *   section: number | null;
 *   floor: number | null;
 *   rooms: number | null;
 *   area: number | null;
 *   price: number | null;
 *   pricePerSqm: number | null;
 *   status: string;
 *   planSrc: string;
 *   floorPlanSrc: string;
 *   tags: string[];
 * }} FilterGroupVariantItem */

/** @typedef {{
 *   groupId: string;
 *   groupTitle: string;
 *   variants: FilterGroupVariantItem[];
 * }} FilterGroupVariantsPayload */

/** @param {string} groupId
 * @param {ReturnType<import('../../filter/filter-state.js').serializeFilterState>} [filter] */
export const buildFilterGroupVariants = (
    groupId,
    filter = getFilterState()
) => {
    const normalizedGroupId = String(groupId ?? '').trim();
    /** @type {FilterGroupVariantItem[]} */
    const variants = [];
    let groupTitle = '';

    if (!normalizedGroupId) {
        return { groupId: '', groupTitle: '', variants };
    }

    for (const item of dataArray) {
        const itemGroupId =
            typeof item.plan_group_id === 'string'
                ? item.plan_group_id.trim()
                : '';

        if (itemGroupId !== normalizedGroupId)
            continue;

        const poiInfo = mapDataItemToPoiInfo(item);

        if (!matchesFilter(poiInfo, filter))
            continue;

        const itemGroupTitle =
            typeof item.plan_group_name === 'string'
                ? item.plan_group_name.trim()
                : '';

        if (itemGroupTitle && !groupTitle)
            groupTitle = itemGroupTitle;

        const planPath = normalizeFilePlanPath(item.filePlan);
        const floorPlanPath = normalizeFilePlanPath(item.file_plan_on_floor);
        const tags = Array.isArray(item.tags)
            ? item.tags.filter((tag) => typeof tag === 'string')
            : [];

        const price =
            typeof item.estatePrice === 'number' ? item.estatePrice : null;
        const area =
            typeof item.estateArea === 'number' ? item.estateArea : null;
        const pricePerSqmRaw =
            typeof item.estatePriceM2 === 'number' ? item.estatePriceM2 : null;
        const pricePerSqm =
            pricePerSqmRaw ??
            (price != null && area != null && area > 0
                ? Math.round(price / area)
                : null);

        variants.push({
            id: typeof item.id === 'number' ? String(item.id) : String(item.Name ?? ''),
            favoriteId: typeof item.id === 'number' ? item.id : null,
            name: typeof item.Name === 'string' ? item.Name : '',
            groupId: itemGroupId,
            groupTitle: itemGroupTitle,
            number: typeof item.geoFlatnum === 'number' ? item.geoFlatnum : null,
            section: typeof item.section === 'number' ? item.section : null,
            floor: typeof item.estateFloor === 'number' ? item.estateFloor : null,
            rooms: typeof item.estateRooms === 'number' ? item.estateRooms : null,
            area,
            price,
            pricePerSqm,
            status: typeof poiInfo.status === 'string' ? poiInfo.status : 'active',
            planSrc: planPath ? assetUrl(planPath) : '',
            floorPlanSrc: floorPlanPath ? assetUrl(floorPlanPath) : '',
            tags
        });
    }

    variants.sort((a, b) => {
        const floorA = a.floor ?? 0;
        const floorB = b.floor ?? 0;

        if (floorA !== floorB)
            return floorA - floorB;

        const numA = a.number ?? 0;
        const numB = b.number ?? 0;

        return numA - numB;
    });

    return {
        groupId: normalizedGroupId,
        groupTitle,
        variants
    };
};
