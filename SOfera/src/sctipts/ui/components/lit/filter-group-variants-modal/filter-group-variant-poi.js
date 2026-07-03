import dataArray from '../../../../../res/data.json';
import { mapDataItemToPoiInfo } from '../../../../poi/poi-data.js';

/** @typedef {import('./filter-group-variants-data.js').FilterGroupVariantItem} FilterGroupVariantItem */
/** @typedef {import('../poi-modal/poi-modal-utils.js').PoiInfo} PoiInfo */

/** @param {FilterGroupVariantItem | null | undefined} variant */
export const resolvePoiInfoFromVariant = (variant) => {
    if (!variant)
        return null;

    const favoriteId =
        typeof variant.favoriteId === 'number' && Number.isFinite(variant.favoriteId)
            ? variant.favoriteId
            : null;
    const name =
        typeof variant.name === 'string' ? variant.name.trim() : '';

    for (const item of dataArray) {
        if (favoriteId != null && item.id === favoriteId)
            return mapDataItemToPoiInfo(item);

        if (name && item.Name === name)
            return mapDataItemToPoiInfo(item);
    }

    return null;
};

/** @param {FilterGroupVariantItem | null | undefined} variant */
export const resolvePoiNodeNameFromVariant = (variant) => {
    const name =
        typeof variant?.name === 'string' ? variant.name.trim() : '';

    return name ? `POI_${name}` : '';
};
