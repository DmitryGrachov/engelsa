/** Максимум секций на этаж в GLB (имена `webN.1` … `webN.5`). */
export const FLOOR_PLAN_MAX_SECTIONS = 5;

/** @param {number} floor @param {number} section */
export const floorPlanMeshName = (floor, section) => `web${floor}.${section}`;

/** @param {number | undefined} floor @param {number | undefined} section */
export const resolveFloorPlanMeshName = (floor, section) => {
    if (typeof floor !== 'number' || typeof section !== 'number')
        return null;

    if (section < 1 || section > FLOOR_PLAN_MAX_SECTIONS)
        return null;

    return floorPlanMeshName(floor, section);
};
