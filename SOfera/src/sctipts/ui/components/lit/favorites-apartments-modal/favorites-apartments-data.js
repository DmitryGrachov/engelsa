import dataArray from '../../../../../res/data.json';
import { getFavorites } from '../../../../../../lib/favorites.js';
import { mapDataItemToPoiInfo } from '../../../../poi/poi-data.js';
import { assetUrl } from '../../../../utils/asset-url.js';
import { normalizeFilePlanPath } from '../../../../utils/file-plan-path.js';

/** @typedef {import('../filter-group-variants-modal/filter-group-variants-data.js').FilterGroupVariantItem} FilterGroupVariantItem */

/** @returns {FilterGroupVariantItem[]} */
export const buildFavoritesApartments = () => {
    const favoriteIds = new Set(getFavorites());
    /** @type {FilterGroupVariantItem[]} */
    const variants = [];

    if (favoriteIds.size === 0)
        return variants;

    for (const item of dataArray) {
        if (typeof item.id !== 'number' || !favoriteIds.has(item.id))
            continue;

        const poiInfo = mapDataItemToPoiInfo(item);
        const itemGroupId =
            typeof item.plan_group_id === 'string'
                ? item.plan_group_id.trim()
                : '';
        const itemGroupTitle =
            typeof item.plan_group_name === 'string'
                ? item.plan_group_name.trim()
                : '';
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
            id: String(item.id),
            favoriteId: item.id,
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

    variants.sort((left, right) => {
        const floorA = left.floor ?? 0;
        const floorB = right.floor ?? 0;

        if (floorA !== floorB)
            return floorA - floorB;

        const numberA = left.number ?? 0;
        const numberB = right.number ?? 0;

        return numberA - numberB;
    });

    return variants;
};
