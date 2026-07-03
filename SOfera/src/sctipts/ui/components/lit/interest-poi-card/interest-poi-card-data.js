/** @typedef {'mask' | 'raster' | 'none'} InterestPoiCardIconType */

/**
 * @typedef {Object} InterestPoiWideCardSpec
 * @property {string} title
 * @property {string} location
 * @property {string} bg
 * @property {string} [icon]
 * @property {InterestPoiCardIconType} [iconType]
 */

const INTERESTS_BG = './assets/interests/bg';
const INTERESTS_ICON = './assets/interests/icons';
const FALLBACK_INTEREST_ICON = `${INTERESTS_ICON}/squer.svg`;

/** Данные wide-карточек interest POI (секции — отдельная вёрстка). */
export const INTEREST_POI_WIDE_CARD_BY_TITLE = {
    парк: {
        title: 'Центральный парк культуры и отдыха им. П.П.Белоусова',
        location: 'Городской парк, сквер, парк аттракционов',
        bg: `${INTERESTS_BG}/park.svg`,
        icon: FALLBACK_INTEREST_ICON,
        iconType: 'mask'
    },
    музей: {
        title: 'Тульский музей изобразительных искусств',
        location: 'Музей',
        bg: `${INTERESTS_BG}/museum.svg`,
        icon: `${INTERESTS_ICON}/museum.svg`,
        iconType: 'mask'
    },
    аквапарк: {
        title: 'Аквапарк “Аква Тула”',
        location: 'Аквапарк',
        bg: `${INTERESTS_BG}/aquapark.svg`,
        icon: FALLBACK_INTEREST_ICON,
        iconType: 'mask'
    },
    сквер: {
        title: 'Толстовский сквер',
        location: 'Сквер, лесопарк',
        bg: `${INTERESTS_BG}/squer.svg`,
        icon: `${INTERESTS_ICON}/squer.svg`,
        iconType: 'mask'
    },
    ТЦ: {
        title: 'ТЦ Ликёрка-лофт',
        location: 'Торговый центр',
        bg: `${INTERESTS_BG}/mall.svg`,
        icon: `${INTERESTS_ICON}/mall.svg`,
        iconType: 'mask'
    },
    больница: {
        title: 'ГУЗ Тульская областная клиническая больница',
        location: 'Клинико-диагностический центр',
        bg: `${INTERESTS_BG}/hospital.svg`,
        icon: `${INTERESTS_ICON}/hospital.svg`,
        iconType: 'mask'
    },
    Двор: {
        title: 'Двор',
        location: 'Благоустройство',
        bg: `${INTERESTS_BG}/yard.svg`,
        icon: './assets/icons/pois/yard.svg',
        iconType: 'raster'
    }
};

/**
 * @param {string} poiTitle
 * @returns {InterestPoiWideCardSpec | null}
 */
export const getInterestPoiWideCardSpec = poiTitle =>
    INTEREST_POI_WIDE_CARD_BY_TITLE[poiTitle] ?? null;
