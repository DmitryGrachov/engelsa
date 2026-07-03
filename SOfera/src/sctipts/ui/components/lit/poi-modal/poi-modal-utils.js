import { assetUrl } from '../../../../utils/asset-url.js';
import { normalizeFilePlanPath } from '../../../../utils/file-plan-path.js';

/** @typedef {{
 *   name?: string;
 *   id?: number;
 *   floor?: number;
 *   number?: number;
 *   square?: number;
 *   livingSquare?: number;
 *   cost?: number;
 *   status?: string;
 *   rooms?: number;
 *   section?: number;
 *   filePlan?: string;
 *   filePlanOnFloor?: string;
 *   gallery?: string[];
 *   planImage?: string;
 *   image?: string;
 *   fullscreen?: string;
 *   features?: string[];
 *   windowViewTags?: string[];
 *   pricePerSqm?: number;
 *   mortgageFrom?: number;
 * }} PoiInfo */

export const POI_STATUS_LABELS = {
    active: 'Доступно',
    reserved: 'В брони',
    sold: 'Продано'
};

export const POI_STATUS_CLASS = {
    active: 'available',
    reserved: 'reserved',
    sold: 'sold'
};

/** @type {readonly string[]} */
export const POI_DEFAULT_FEATURES = Object.freeze([
    'терраса',
    '2+ санузла',
    'постирочная',
    'постирочная',
    'постирочная'
]);

/** @param {number | undefined} value */
export function formatSquare(value) {
    if (typeof value !== 'number' || Number.isNaN(value))
        return '—';

    return value.toLocaleString('ru-RU', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
    }).replace('.', ',');
}

/** @param {number | undefined} value */
export function formatCost(value) {
    if (typeof value !== 'number' || Number.isNaN(value))
        return '—';

    return `${value.toLocaleString('ru-RU').replace(/\u00A0/g, ' ')} ₽`;
}

/** @param {number | undefined} value */
export function formatCostRub(value) {
    if (typeof value !== 'number' || Number.isNaN(value))
        return '—';

    return `${value.toLocaleString('ru-RU').replace(/\u00A0/g, ' ')} Руб.`;
}

/** @param {PoiInfo | null | undefined} info */
export function resolvePricePerSqm(info) {
    if (typeof info?.pricePerSqm === 'number' && !Number.isNaN(info.pricePerSqm))
        return info.pricePerSqm;

    if (typeof info?.cost === 'number' && typeof info?.square === 'number' && info.square > 0)
        return Math.round(info.cost / info.square);

    return null;
}

/** @param {PoiInfo | null | undefined} info */
export function formatPricePerSqm(info) {
    const value = resolvePricePerSqm(info);

    if (value === null)
        return '—';

    return `${value.toLocaleString('ru-RU').replace(/\u00A0/g, ' ')} руб. / кв.м`;
}

/** @param {PoiInfo | null | undefined} info */
export function resolveMortgageFrom(info) {
    if (typeof info?.mortgageFrom === 'number' && !Number.isNaN(info.mortgageFrom))
        return info.mortgageFrom;

    if (typeof info?.cost === 'number')
        return Math.round((info.cost * 0.00261) / 100) * 100;

    return null;
}

/** @param {PoiInfo | null | undefined} info */
export function formatMortgageFrom(info) {
    const value = resolveMortgageFrom(info);

    if (value === null)
        return '—';

    return value.toLocaleString('ru-RU').replace(/\u00A0/g, ' ');
}

export const POI_STATUS_LABELS_DESK = {
    active: 'Доступна',
    reserved: 'В брони',
    sold: 'Продана'
};

/** @param {PoiInfo | null | undefined} info */
export function resolveRooms(info) {
    if (typeof info?.rooms === 'number' && info.rooms > 0)
        return info.rooms;

    return 1;
}

/** @param {PoiInfo | null | undefined} info */
export function resolveSection(info) {
    if (typeof info?.section === 'number' && info.section > 0)
        return info.section;

    return typeof info?.floor === 'number' ? info.floor : '—';
}

/** @param {PoiInfo | null | undefined} info */
export function resolveLivingSquare(info) {
    if (typeof info?.livingSquare === 'number' && !Number.isNaN(info.livingSquare))
        return info.livingSquare;

    return info?.square;
}

/** @param {PoiInfo | null | undefined} info */
export function resolveFeatures(info) {
    if (Array.isArray(info?.features) && info.features.length > 0)
        return info.features;

    return POI_DEFAULT_FEATURES;
}

/** @param {PoiInfo | null | undefined} info */
export function resolvePoiModalPlanSrc(info) {
    const filePlanPath = normalizeFilePlanPath(info?.filePlan);

    if (filePlanPath.startsWith('./assets/'))
        return assetUrl(filePlanPath);

    if (info?.planImage && typeof info.planImage === 'string')
        return assetUrl(info.planImage);

    if (typeof info?.number === 'number')
        return assetUrl(`./assets/plans/${info.number}.png`);

    return '';
}

/** @param {PoiInfo | null | undefined} info */
export function resolvePoiModalFloorPlanSrc(info) {
    const floorPlanPath = normalizeFilePlanPath(info?.filePlanOnFloor);

    if (floorPlanPath.startsWith('./assets/'))
        return assetUrl(floorPlanPath);

    return '';
}

/** @param {PoiInfo | null | undefined} info */
export function resolvePoiModalCardFallbackSrc(info) {
    if (info?.image && typeof info.image === 'string')
        return assetUrl(info.image);

    const status = typeof info?.status === 'string' ? info.status : 'active';

    return assetUrl(`./assets/status/${status}.svg`);
}

/** @param {PoiInfo | null | undefined} info */
export function resolvePoiModalDeskCardFallbackSrc(info) {
    if (info?.image && typeof info.image === 'string')
        return assetUrl(info.image);

    const status = typeof info?.status === 'string' ? info.status : 'active';

    return assetUrl(`./assets/status/desk/${status}.svg`);
}

/** @param {PoiInfo | null | undefined} info */
export function resolvePoiGalleryImageSrcs(info) {
    if (!Array.isArray(info?.gallery) || !info.gallery.length)
        return [];

    return info.gallery
        .map((path) => normalizeFilePlanPath(path))
        .filter((path) => path.startsWith('./assets/'))
        .map((path) => assetUrl(path));
}
