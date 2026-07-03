/** @typedef {'active' | 'reserved' | 'sold'} FloorPoiStatus */

/** @param {string | undefined} status */
export const normalizeFloorPoiStatus = status => {
    if (status === 'reserved' || status === 'sold')
        return status;

    return 'active';
};

/** @param {number | undefined} rooms */
export const formatFloorPoiRoomsLabel = rooms => {
    const value = typeof rooms === 'number' && rooms > 0 ? Math.floor(rooms) : 1;

    return `${value}K`;
};

/** @param {number | undefined} square */
export const formatFloorPoiSquareValue = square => {
    if (typeof square !== 'number' || Number.isNaN(square))
        return '—';

    return square.toLocaleString('ru-RU', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
    }).replace('.', ',');
};
