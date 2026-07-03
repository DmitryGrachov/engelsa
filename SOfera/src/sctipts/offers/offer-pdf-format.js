import { formatSquare, formatCost } from '../ui/components/lit/poi-modal/poi-modal-utils.js';
import {
    getGroupVariantStatusClass,
    getGroupVariantStatusLabel
} from '../ui/components/lit/filter-group-variants-modal/filter-group-variants-utils.js';

/** @typedef {import('../ui/components/lit/filter-group-variants-modal/filter-group-variants-data.js').FilterGroupVariantItem} FilterGroupVariantItem */

export const OFFER_PDF_COVER_TITLE = 'Прайм Энгельса';

/** @type {Record<string, string>} */
export const OFFER_PDF_STATUS_COLORS = {
    available: '#26BDA9',
    reserved: '#F8CC53',
    sold: '#F27D59'
};

/** @param {FilterGroupVariantItem} variant */
export const formatOfferCardTitle = (variant) => {
    const number = variant.number != null ? variant.number : '—';

    if (variant.groupTitle && /студия/i.test(variant.groupTitle))
        return `Студия | № ${number}`;

    const rooms = variant.rooms != null && variant.rooms > 0 ? variant.rooms : 1;

    return `${rooms}-к Квартира | № ${number}`;
};

/** @param {FilterGroupVariantItem} variant */
export const formatOfferCardArea = (variant) =>
    `${formatSquare(variant.area ?? undefined)} м²`;

/** @param {FilterGroupVariantItem} variant */
export const formatOfferCardPrice = (variant) =>
    formatCost(variant.price ?? undefined);

/** @param {FilterGroupVariantItem} variant */
export const getOfferCardStatus = (variant) => ({
    label: getGroupVariantStatusLabel(variant),
    className: getGroupVariantStatusClass(variant),
    color: OFFER_PDF_STATUS_COLORS[getGroupVariantStatusClass(variant)] ?? '#26BDA9'
});

/** @param {FilterGroupVariantItem} variant */
export const formatOfferCardTagsLine = (variant) => {
    const tags = Array.isArray(variant.tags) ? variant.tags.filter(Boolean) : [];

    return tags.length ? tags.join(' · ') : '';
};
