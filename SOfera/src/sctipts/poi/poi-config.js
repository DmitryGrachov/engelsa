/** Секции interest POI, скрываемые при открытых «Поэтажные планы». */
export const getFloorPlanHiddenInterestTitles = () => getInterestSectionTitles();

const INTEREST_SECTION_COUNT = 5;

/** @returns {string[]} */
export const getInterestSectionTitles = () =>
    Array.from({ length: INTEREST_SECTION_COUNT }, (_, index) => `Секция №${index + 1}`);

/** Какие домашние «облака» интересов видны в каждом режиме нижней панели */
export const PANEL_MODE_INTEREST_TITLES = {
    house: ['Двор', ...getInterestSectionTitles()],
    search: getInterestSectionTitles(),
    map: ['парк', 'музей', 'аквапарк', 'сквер', 'ТЦ', 'больница']
};

const INTEREST_SECTION_POSITIONS = [
    { x: 2, y: 0.45, z: 0.4 },
    { x: 1.5, y: 0.45, z: 0.2 },
    { x: 1, y: 0.45, z: 0.2 },
    { x: 0.5, y: 0.45, z: 0.2 },
    { x: 0.2, y: 0.45, z: 0.2 }
];
/** Позиции маркеров секций на карте; камера смотрит сюда. Ракурс — camera.js (`PANEL_SEARCH_FOCUS_TARGET`, `PANEL_SEARCH_ORBIT_DIST_XZ`). */

const INTEREST_SECTION_POIS = getInterestSectionTitles().map((title, index) => ({
    title,
    description: title,
    position: INTEREST_SECTION_POSITIONS[index] ?? INTEREST_SECTION_POSITIONS[0]
}));

export const INTEREST_POIS = [
    {
        title: 'Двор',
        description: 'Удобный двор для всей семьи',
        position: { x: 0.5, y: 0, z: -0.1 }
    },
    {
        title: 'парк',
        description: 'Парк',
        position: { x: 6, y: 0, z: -0.8 }
    },
    {
        title: 'музей',
        description: 'Музей',
        position: { x: 0, y: 0.2, z: -0.8 }
    },
    {
        title: 'аквапарк',
        description: 'Аквапарк',
        position: { x: 0, y: 0.6, z: -3 }
    },
    {
        title: 'сквер',
        description: 'Сквер',
        position: { x: -2.7, y: 0, z: -1.7 }
    },
    {
        title: 'ТЦ',
        description: 'Торговый центр',
        position: { x: -5.5, y: 0, z: -1.5 }
    },
    {
        title: 'больница',
        description: 'Больница',
        position: { x: 0, y: 0.2, z: 3 }
    },
    ...INTEREST_SECTION_POIS
];

/** Данные карточки модалки среза (пока 1:1 с POI active; пути картинок — из status, как у POI). */
export const FLOOR_PLAN_SLICE_MODAL_DEFAULT_INFO = {
    status: 'active'
};
