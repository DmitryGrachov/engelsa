import { formatMoneyRu } from '../../filter/format.js';

export const FILTER_RESULTS_DESK_PROJECT_TITLE = 'ЖК «Прайм Энгельса»';

/** @typedef {{
 *   id: string;
 *   title: string;
 *   planSrc: string;
 *   floorPlanSrc: string;
 *   tags: string[];
 *   priceFrom: number;
 *   variantCount: number;
 * }} FilterResultsPlanGroup */

/** @param {number} count */
export const formatFilterResultsCountLine = (count) =>
    `${count} ${pluralVariantsRu(count)}`;

/** @param {number} count */
export const formatFilterResultsTitle = (count) =>
    `Доступно ${formatFilterResultsCountLine(count)}`;

/** @param {number} n */
const pluralVariantsRu = (n) => {
    const mod10 = n % 10;
    const mod100 = n % 100;

    if (mod10 === 1 && mod100 !== 11)
        return 'вариант';

    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20))
        return 'варианта';

    return 'вариантов';
};

/** @param {number} value */
export const formatFilterResultsPriceFrom = (value) =>
    formatMoneyRu(value);

/** @param {number} count */
export const formatFilterResultsShowLabel = (count) =>
    `Показать ${count} ${pluralVariantsRu(count)}`;

/** @param {number} n */
const pluralOffersRu = (n) => {
    const mod10 = n % 10;
    const mod100 = n % 100;

    if (mod10 === 1 && mod100 !== 11)
        return 'предложение';

    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20))
        return 'предложения';

    return 'предложений';
};

/** @param {number} count */
export const formatFilterResultsDeskCountLine = (count) =>
    `${count} ${pluralOffersRu(count)}`;

/** @param {string} title */
export const parseFilterResultsPlanGroupTitle = (title) => {
    const raw = String(title ?? '').trim();
    const match = raw.match(/^(.+?)\s+от\s+([\d.,]+)\s*м²$/i);

    if (match) {
        return {
            typeLabel: `${match[1]} от:`,
            areaLabel: `${match[2]} м²`
        };
    }

    return { typeLabel: raw ? `${raw}:` : '', areaLabel: '' };
};

/** @param {number} value */
export const formatFilterResultsPriceFromDesk = (value) =>
    `${formatMoneyRu(value)} руб.`;
