/**
 * ВРЕМЕННО: нижняя граница навигации поэтажного среза (этажи ниже не доступны).
 * Чтобы снять ограничение — поставить `null` или удалить этот файл и фильтр.
 */
export const FLOOR_PLAN_SLICE_MIN_FLOOR_TEMP = null;

/**
 * Этажи для шагов панели «Поэтажные планы» (сверху вниз).
 * @param {Iterable<number>} floors
 * @returns {number[]}
 */
export const buildFloorPlanSliceFloors = floors => {
    const sorted = [...floors].sort((a, b) => b - a);

    if (FLOOR_PLAN_SLICE_MIN_FLOOR_TEMP == null)
        return sorted;

    return sorted.filter(f => f >= FLOOR_PLAN_SLICE_MIN_FLOOR_TEMP);
};
