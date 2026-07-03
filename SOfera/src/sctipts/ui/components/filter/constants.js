/** Лимиты и шаги полей фильтра (из `src/res/data.json`, estateArea / estatePrice / estateFloor). */

export const AREA_MIN = 41;
export const AREA_MAX = 162;

export const COST_MIN = 11_900_000;
export const COST_MAX = 77_800_000;
export const COST_STEP = 100_000;

export const FLOOR_MIN = 1;
export const FLOOR_MAX = 9;

/** Количество секций в `src/res/data.json` (`section`: 1…5). */
export const SECTION_COUNT = 5;

/** @type {readonly [string, string][]} */
export const STATUS_DEFINITIONS = Object.freeze([
    ['available', 'Доступно'],
    ['reserved', 'Забронировано'],
    ['sold', 'Продано']
]);
