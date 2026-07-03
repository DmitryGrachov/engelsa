/** @param {number} count */
export const formatComparisonsInCountLine = (count) => {
    const value = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;

    return `${value} в сравнении`;
};
