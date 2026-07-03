import {
    AREA_MIN,
    AREA_MAX,
    COST_MIN,
    COST_MAX,
    FLOOR_MIN,
    FLOOR_MAX
} from './constants.js';

/** Свежее состояние фильтра (новые Set при каждом вызове). */
export const createDefaultFilterState = () => ({
    sections: new Set(),
    rooms: new Set(),
    status: new Set(),
    layoutTags: new Set(),
    windowViewTags: new Set(),
    areaFrom: AREA_MIN,
    areaTo: AREA_MAX,
    costFrom: COST_MIN,
    costTo: COST_MAX,
    floorFrom: FLOOR_MIN,
    floorTo: FLOOR_MAX,
    viewMode: 'list'
});

/** @param {ReturnType<typeof createDefaultFilterState>} target
 * @param {ReturnType<typeof createDefaultFilterState> | ReturnType<typeof serializeFilterState>} source */
export const assignFilterState = (target, source) => {
    const rooms =
        source.rooms instanceof Set ? source.rooms : new Set(source.rooms);
    const status =
        source.status instanceof Set ? source.status : new Set(source.status);
    const layoutTags =
        source.layoutTags instanceof Set
            ? source.layoutTags
            : new Set(source.layoutTags ?? []);
    const windowViewTags =
        source.windowViewTags instanceof Set
            ? source.windowViewTags
            : new Set(source.windowViewTags ?? []);
    const sections =
        source.sections instanceof Set
            ? source.sections
            : new Set(source.sections ?? []);

    target.sections = new Set(sections);
    target.rooms = new Set(rooms);
    target.status = new Set(status);
    target.layoutTags = new Set(layoutTags);
    target.windowViewTags = new Set(windowViewTags);
    target.areaFrom = source.areaFrom;
    target.areaTo = source.areaTo;
    target.costFrom = source.costFrom;
    target.costTo = source.costTo;
    target.floorFrom = source.floorFrom;
    target.floorTo = source.floorTo;
    target.viewMode = source.viewMode;
};

/** @param {{ sections: Set<number>; rooms: Set<number>; status: Set<string>; layoutTags: Set<string>; windowViewTags: Set<string>; areaFrom: number; areaTo: number; costFrom: number; costTo: number; floorFrom: number; floorTo: number; viewMode: '3d' | 'list' }} source */
export const cloneFilterState = (source) => {
    const clone = createDefaultFilterState();
    assignFilterState(clone, source);
    return clone;
};

/** @param {{ sections: Iterable<number>; rooms: Iterable<number>; status: Iterable<string>; layoutTags: Iterable<string>; windowViewTags: Iterable<string>; areaFrom: number; areaTo: number; costFrom: number; costTo: number; floorFrom: number; floorTo: number; viewMode: '3d' | 'list' }} source */
export const serializeFilterState = (source) => ({
    sections: [...source.sections].sort((a, b) => a - b),
    rooms: [...source.rooms].sort((a, b) => a - b),
    status: [...source.status],
    layoutTags: [...source.layoutTags],
    windowViewTags: [...source.windowViewTags],
    areaFrom: source.areaFrom,
    areaTo: source.areaTo,
    costFrom: source.costFrom,
    costTo: source.costTo,
    floorFrom: source.floorFrom,
    floorTo: source.floorTo,
    viewMode: source.viewMode
});
