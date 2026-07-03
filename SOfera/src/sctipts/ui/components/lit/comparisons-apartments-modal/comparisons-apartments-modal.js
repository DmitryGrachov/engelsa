import { createComparisonsApartmentsModalMobile } from './mob/comparisons-apartments-modal-mobile.js';
import { focusApartmentFromVariant } from '../../../../poi/poi-focus.js';
import { getPoiModal } from '../../../../poi/modal/poi-modal.js';

/** Модалка сравнения квартир (мобильная). */
export const createComparisonsApartmentsModal = () => {
    const mobile = createComparisonsApartmentsModalMobile();

    mobile?.view?.addEventListener('comparisons-apartments-card-3d', (event) => {
        focusApartmentFromVariant(/** @type {CustomEvent} */ (event).detail?.variant);
    });

    mobile?.view?.addEventListener('comparisons-apartments-card-tour', () => {
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

export const getComparisonsApartmentsModal = () => {
    if (!sharedInstance)
        sharedInstance = createComparisonsApartmentsModal();

    return sharedInstance;
};
