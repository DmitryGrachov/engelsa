import { formatMoneyRu } from '../../filter/format.js';
import {
    POI_STATUS_CLASS,
    POI_STATUS_LABELS
} from '../poi-modal/poi-modal-utils.js';

/** @typedef {import('./filter-group-variants-data.js').FilterGroupVariantItem} FilterGroupVariantItem */

/** @param {string} groupTitle */
export const formatFilterGroupVariantsDeskTitle = (groupTitle) => {
    const raw = String(groupTitle ?? '').trim();

    if (/студия/i.test(raw))
        return 'Студии';

    const roomMatch = raw.match(/^(\d+)\s+комнат/i);

    if (roomMatch)
        return `${roomMatch[1]}-к квартиры`;

    return raw || 'Квартиры';
};

/** @param {FilterGroupVariantItem} variant */
export const formatGroupVariantRoomLabel = (variant) => {
    if (variant.groupTitle && /студия/i.test(variant.groupTitle))
        return 'Студия';

    if (variant.rooms != null)
        return `${variant.rooms} комн.`;

    return null;
};

/** @param {FilterGroupVariantItem} variant */
export const formatGroupVariantListNumber = (variant) =>
    variant.number != null ? `№ ${variant.number}` : '—';

/** @param {FilterGroupVariantItem} variant */
export const formatGroupVariantListRooms = (variant) => {
    if (variant.groupTitle && /студия/i.test(variant.groupTitle))
        return 'Студия';

    if (variant.rooms != null)
        return `${variant.rooms}к`;

    return '—';
};

/** @param {FilterGroupVariantItem} variant */
export const formatGroupVariantListArea = (variant) => {
    if (variant.area == null)
        return '—';

    return `${variant.area.toLocaleString('ru-RU', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
    })} м²`;
};

/** @param {FilterGroupVariantItem} variant */
export const formatGroupVariantListPrice = (variant) =>
    variant.price != null ? `${formatMoneyRu(variant.price)} руб.` : '—';

/** @param {FilterGroupVariantItem} variant */
export const formatGroupVariantDeskNumber = (variant) =>
    variant.number != null ? `КВ №${variant.number}` : 'Квартира';

/** @param {FilterGroupVariantItem} variant */
export const getGroupVariantMetaParts = (variant) => {
    const typeArea = [
        formatGroupVariantRoomLabel(variant),
        variant.area != null ? formatGroupVariantListArea(variant) : null
    ].filter(Boolean).join(' ');

    return [
        typeArea || null,
        variant.floor != null ? `${variant.floor} этаж` : null,
        variant.section != null ? `Секция ${variant.section}` : null
    ].filter(Boolean);
};

/** @param {FilterGroupVariantItem} variant */
export const formatGroupVariantDeskMeta = (variant) =>
    getGroupVariantMetaParts(variant).join(' | ');

/** @param {FilterGroupVariantItem} variant */
export const formatGroupVariantDeskPrice = (variant) =>
    variant.price != null ? formatMoneyRu(variant.price) : '—';

/** @param {FilterGroupVariantItem} variant */
export const getGroupVariantStatusLabel = (variant) =>
    POI_STATUS_LABELS[/** @type {keyof typeof POI_STATUS_LABELS} */ (variant.status)]
    ?? POI_STATUS_LABELS.active;

/** @param {FilterGroupVariantItem} variant */
export const getGroupVariantStatusClass = (variant) =>
    POI_STATUS_CLASS[/** @type {keyof typeof POI_STATUS_CLASS} */ (variant.status)]
    ?? POI_STATUS_CLASS.active;

/** @param {FilterGroupVariantItem} variant */
export const formatGroupVariantStatus = (variant) => {
    if (variant.status === 'reserved')
        return 'Забронировано';

    if (variant.status === 'sold')
        return 'Продано';

    return 'Доступно';
};

/** @param {FilterGroupVariantItem} variant */
export const formatGroupVariantSummary = (variant) => {
    const parts = [
        variant.number != null ? `№ ${variant.number}` : null,
        variant.section != null ? `секция ${variant.section}` : null,
        variant.floor != null ? `этаж ${variant.floor}` : null,
        variant.rooms != null ? `${variant.rooms} комн.` : null,
        variant.area != null ? `${variant.area} м²` : null,
        variant.price != null ? `${formatMoneyRu(variant.price)} ₽` : null,
        formatGroupVariantStatus(variant)
    ].filter(Boolean);

    return parts.join(' · ');
};
