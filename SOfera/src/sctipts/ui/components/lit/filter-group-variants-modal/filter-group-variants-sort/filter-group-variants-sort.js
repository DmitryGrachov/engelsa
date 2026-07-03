/** @typedef {import('../filter-group-variants-data.js').FilterGroupVariantItem} FilterGroupVariantItem */
/** @typedef {'price' | 'area' | 'floor' | 'pricePerSqm'} FilterGroupVariantsSortField */
/** @typedef {'asc' | 'desc'} FilterGroupVariantsSortDirection */

/** @type {readonly FilterGroupVariantsSortField[]} */
export const FILTER_GROUP_VARIANTS_SORT_FIELDS = Object.freeze([
    'price',
    'area',
    'floor',
    'pricePerSqm'
]);

/** @param {import('../filter-group-variants-data.js').FilterGroupVariantItem} variant
 * @param {FilterGroupVariantsSortField} field */
const getSortValue = (variant, field) => {
    if (field === 'pricePerSqm')
        return sortableNumber(variant.pricePerSqm);

    return sortableNumber(variant[field]);
};

/** @param {number | null | undefined} value */
const sortableNumber = (value) =>
    typeof value === 'number' && Number.isFinite(value) ? value : null;

/** @param {number | null} a @param {number | null} b @param {number} mul */
const compareNullableNumbers = (a, b, mul) => {
    if (a === null && b === null)
        return 0;

    if (a === null)
        return 1;

    if (b === null)
        return -1;

    return (a - b) * mul;
};

/** @param {FilterGroupVariantItem[]} variants
 * @param {FilterGroupVariantsSortField | null} field
 * @param {FilterGroupVariantsSortDirection} direction */
export const sortFilterGroupVariants = (
    variants,
    field,
    direction = 'asc'
) => {
    if (!field || !Array.isArray(variants) || variants.length < 2)
        return variants;

    const mul = direction === 'asc' ? 1 : -1;

    return [...variants].sort((left, right) => {
        const valueA = getSortValue(left, field);
        const valueB = getSortValue(right, field);
        const byField = compareNullableNumbers(valueA, valueB, mul);

        if (byField !== 0)
            return byField;

        const floorA = sortableNumber(left.floor) ?? 0;
        const floorB = sortableNumber(right.floor) ?? 0;

        if (floorA !== floorB)
            return floorA - floorB;

        const numberA = sortableNumber(left.number) ?? 0;
        const numberB = sortableNumber(right.number) ?? 0;

        return numberA - numberB;
    });
};
