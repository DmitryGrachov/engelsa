/** @typedef {import('../lit/poi-modal/poi-modal-utils.js').PoiInfo} PoiInfo */
/** @typedef {ReturnType<import('./filter-state.js').serializeFilterState>} FilterSnapshot */

/** @param {string[]} values @param {string[]} selected */
const matchesAllSelectedTags = (values, selected) => {
    if (selected.length === 0)
        return true;

    const normalizedValues = values.map((value) => value.toLowerCase());

    return selected.every((tag) =>
        normalizedValues.includes(tag.toLowerCase())
    );
};

/** @param {PoiInfo} poiInfo @param {FilterSnapshot} filter */
export const matchesFilter = (poiInfo, filter) => {
    if (!poiInfo)
        return false;

    if (
        filter.sections.length > 0
        && (typeof poiInfo.section !== 'number' || !filter.sections.includes(poiInfo.section))
    )
        return false;

    if (
        filter.rooms.length > 0
        && (typeof poiInfo.rooms !== 'number' || !filter.rooms.includes(poiInfo.rooms))
    )
        return false;

    if (filter.status.length > 0) {
        const poiStatusKey =
            poiInfo.status === 'active' ? 'available' : poiInfo.status;

        if (!poiStatusKey || !filter.status.includes(poiStatusKey))
            return false;
    }

    if (
        typeof poiInfo.square === 'number'
        && (poiInfo.square < filter.areaFrom || poiInfo.square > filter.areaTo)
    )
        return false;

    if (
        typeof poiInfo.cost === 'number'
        && (poiInfo.cost < filter.costFrom || poiInfo.cost > filter.costTo)
    )
        return false;

    if (
        typeof poiInfo.floor === 'number'
        && (poiInfo.floor < filter.floorFrom || poiInfo.floor > filter.floorTo)
    )
        return false;

    if (!matchesAllSelectedTags(poiInfo.features ?? [], filter.layoutTags))
        return false;

    if (!matchesAllSelectedTags(poiInfo.windowViewTags ?? [], filter.windowViewTags))
        return false;

    return true;
};
