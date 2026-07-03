/** @param {number} count */
export const formatFavoritesInCountLine = (count) => {
    const value = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;

    return `${value} в избранном`;
};

/** @param {number} count */
export const formatSavedCountLine = (count) => {
    const value = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;

    return `${value} сохраненных`;
};
