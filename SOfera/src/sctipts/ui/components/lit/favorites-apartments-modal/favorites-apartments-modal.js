import { createFavoritesApartmentsModalMobile } from './mob/favorites-apartments-modal-mobile.js';
import { focusApartmentFromVariant } from '../../../../poi/poi-focus.js';
import { getPoiModal } from '../../../../poi/modal/poi-modal.js';

/** Модалка избранных квартир (мобильная). */
export const createFavoritesApartmentsModal = () => {
    const mobile = createFavoritesApartmentsModalMobile();

    mobile?.view?.addEventListener('favorites-apartments-card-3d', (event) => {
        focusApartmentFromVariant(/** @type {CustomEvent} */ (event).detail?.variant);
    });

    mobile?.view?.addEventListener('favorites-apartments-card-tour', () => {
        getPoiModal()?.openTour?.();
    });

    return {
        open() {
            mobile?.open?.();
        },
        close() {
            mobile?.close?.();
        },
        isOpen() {
            return !!mobile?.isOpen?.();
        },
        refresh() {
            mobile?.refresh?.();
        },
        destroy() {
            mobile?.destroy?.();
        }
    };
};

let sharedInstance = null;

export const getFavoritesApartmentsModal = () => {
    if (!sharedInstance)
        sharedInstance = createFavoritesApartmentsModal();

    return sharedInstance;
};
