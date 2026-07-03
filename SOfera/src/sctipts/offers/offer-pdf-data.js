/** @typedef {import('../ui/components/lit/poi-modal/poi-modal-utils.js').PoiInfo} PoiInfo */
/** @typedef {import('../ui/components/lit/filter-group-variants-modal/filter-group-variants-data.js').FilterGroupVariantItem} FilterGroupVariantItem */

/** @param {PoiInfo | null | undefined} info
 * @param {{ planSrc?: string, floorPlanSrc?: string }} [sources] */
export const poiInfoToOfferVariant = (info, sources = {}) => {
    if (!info)
        return null;

    const area =
        typeof info.square === 'number' && Number.isFinite(info.square)
            ? info.square
            : null;
    const price =
        typeof info.cost === 'number' && Number.isFinite(info.cost)
            ? info.cost
            : null;
    const pricePerSqmRaw =
        typeof info.pricePerSqm === 'number' && Number.isFinite(info.pricePerSqm)
            ? info.pricePerSqm
            : null;
    const pricePerSqm =
        pricePerSqmRaw ??
        (price != null && area != null && area > 0
            ? Math.round(price / area)
            : null);
    const tags = Array.isArray(info.features)
        ? info.features.filter((tag) => typeof tag === 'string')
        : [];

    return {
        id: String(info.id ?? info.name ?? ''),
        favoriteId:
            typeof info.id === 'number' && Number.isFinite(info.id)
                ? info.id
                : null,
        name: typeof info.name === 'string' ? info.name : '',
        groupId: '',
        groupTitle: '',
        number: typeof info.number === 'number' ? info.number : null,
        section: typeof info.section === 'number' ? info.section : null,
        floor: typeof info.floor === 'number' ? info.floor : null,
        rooms: typeof info.rooms === 'number' ? info.rooms : null,
        area,
        price,
        pricePerSqm,
        status: typeof info.status === 'string' ? info.status : 'active',
        planSrc: sources.planSrc ?? '',
        floorPlanSrc: sources.floorPlanSrc ?? '',
        tags
    };
};
