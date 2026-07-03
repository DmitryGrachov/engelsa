import { getFavorites } from '../../../../../../lib/favorites.js';
import { getComparisons } from '../../../../../../lib/comparisons.js';
import { getAnonymousUserId } from '../../../../../../lib/metrics.js';
import { buildAccountMobRecommendations } from '../account-mob-recommendations/account-mob-recommendations-data.js';
import { buildFavoritesApartments } from '../favorites-apartments-modal/favorites-apartments-data.js';

/** @param {HTMLElement | null | undefined} view */
export const refreshAccountView = (view) => {
    if (!view)
        return;

    const apartmentsCount = getFavorites().length;
    const variants = buildFavoritesApartments();

    view.userId = getAnonymousUserId();
    view.apartmentsCount = apartmentsCount;
    view.parkingCount = 0;
    view.totalCount = apartmentsCount;

    if ('variants' in view) {
        view.variants = variants;
        view.compareCount = getComparisons().length;
    }

    if ('recommendations' in view)
        view.recommendations = buildAccountMobRecommendations();
};
