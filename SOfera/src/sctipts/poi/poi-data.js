import dataArray from '../../res/data.json';
import { normalizeFilePlanPath } from '../utils/file-plan-path.js';

/** @typedef {import('../ui/components/lit/poi-modal/poi-modal-utils.js').PoiInfo} PoiInfo */

/** @param {string | undefined} status */
const normalizePoiStatus = status => {
    if (typeof status !== 'string')
        return 'active';

    const normalized = status.trim().toLowerCase();

    if (normalized === 'reserved' || normalized === 'sold')
        return normalized;

    if (normalized === 'available')
        return 'active';

    return 'active';
};

/** @param {Record<string, unknown>} item */
export const mapDataItemToPoiInfo = item => {
    /** @type {PoiInfo} */
    const info = {
        name: typeof item.Name === 'string' ? item.Name : undefined,
        id: typeof item.id === 'number' ? item.id : undefined,
        floor: typeof item.estateFloor === 'number' ? item.estateFloor : undefined,
        rooms: typeof item.estateRooms === 'number' ? item.estateRooms : undefined,
        status: normalizePoiStatus(/** @type {string | undefined} */ (item.status)),
        number: typeof item.geoFlatnum === 'number' ? item.geoFlatnum : undefined,
        features: Array.isArray(item.tags) ? item.tags : undefined,
        windowViewTags: Array.isArray(item.windowViewTag) ? item.windowViewTag : undefined,
        square: typeof item.estateArea === 'number' ? item.estateArea : undefined,
        pricePerSqm: typeof item.estatePriceM2 === 'number' ? item.estatePriceM2 : undefined,
        cost: typeof item.estatePrice === 'number' ? item.estatePrice : undefined,
        section: typeof item.section === 'number' ? item.section : undefined,
        filePlan: normalizeFilePlanPath(item.filePlan),
        filePlanOnFloor: normalizeFilePlanPath(item.file_plan_on_floor),
        gallery: Array.isArray(item.gallery)
            ? item.gallery.filter((path) => typeof path === 'string')
            : undefined
    };

    return info;
};

// Загружает данные POI из JSON и индексирует по Name (имя меша POI_<name>).
export const loadPoiInfoByName = async () => {
    const infoByName = new Map();

    for (const item of dataArray) {
        const name = typeof item?.Name === 'string' ? item.Name.trim() : '';

        if (!name)
            continue;

        infoByName.set(name, mapDataItemToPoiInfo(item));
    }

    return infoByName;
};
