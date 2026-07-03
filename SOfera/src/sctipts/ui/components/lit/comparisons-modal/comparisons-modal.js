import { createComparisonsApartmentsModal } from '../comparisons-apartments-modal/comparisons-apartments-modal.js';
import { createComparisonsModalDesktop } from './comparisons-modal-desktop.js';
import { getPoiDesktopLayoutMediaQuery } from '../../../../poi/poi-viewport.js';

const DESKTOP_LAYOUT_MQ = getPoiDesktopLayoutMediaQuery();

const pickImpl = (mobile, desktop) =>
    typeof window !== 'undefined' && window.matchMedia(DESKTOP_LAYOUT_MQ).matches
        ? desktop
        : mobile;

/**
 * Сравнение квартир: ≥819px — десктопная панель, иначе — мобильная вёрстка.
 */
export const createComparisonsModal = () => {
    const mobile = createComparisonsApartmentsModal();
    const desktop = createComparisonsModalDesktop();
    /** @type {ReturnType<typeof createComparisonsApartmentsModal> | ReturnType<typeof createComparisonsModalDesktop> | null} */
    let activeImpl = null;

    const resolveActive = () => {
        activeImpl = pickImpl(mobile, desktop);
        return activeImpl;
    };

    return {
        open() {
            resolveActive()?.open?.();
        },
        close() {
            if (activeImpl)
                activeImpl.close();
            else {
                mobile?.close?.();
                desktop?.close?.();
            }
        },
        toggle() {
            const impl = activeImpl && (
                (activeImpl === mobile && !window.matchMedia(DESKTOP_LAYOUT_MQ).matches)
                || (activeImpl === desktop && window.matchMedia(DESKTOP_LAYOUT_MQ).matches)
            )
                ? activeImpl
                : resolveActive();

            impl?.toggle?.();
        },
        isOpen() {
            return !!(mobile?.isOpen?.() || desktop?.isOpen?.());
        },
        refresh() {
            mobile?.refresh?.();
            desktop?.refresh?.();
        },
        destroy() {
            mobile?.destroy?.();
            desktop?.destroy?.();
        }
    };
};

let sharedInstance = null;

export const getComparisonsModal = () => {
    if (!sharedInstance)
        sharedInstance = createComparisonsModal();

    return sharedInstance;
};
