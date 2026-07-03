import { createFilterResultsModalMobile } from './filter-results-modal-mobile.js';
import { createFilterResultsModalDesktop } from './filter-results-modal-desktop.js';
import { getPoiDesktopLayoutMediaQuery } from '../../../../poi/poi-viewport.js';
import { subscribeFilterState } from '../../filter/filter-store.js';

const DESKTOP_LAYOUT_MQ = getPoiDesktopLayoutMediaQuery();

const pickImpl = (mobile, desktop) =>
    typeof window !== 'undefined' && window.matchMedia(DESKTOP_LAYOUT_MQ).matches
        ? desktop
        : mobile;

/**
 * Модалка результатов фильтра: ≥819px — десктоп, иначе — мобильный список карточек.
 */
export const createFilterResultsModal = () => {
    const mobile = createFilterResultsModalMobile();
    const desktop = createFilterResultsModalDesktop();
    /** @type {ReturnType<typeof createFilterResultsModalMobile> | ReturnType<typeof createFilterResultsModalDesktop> | null} */
    let activeImpl = null;

    const refreshIfOpen = () => {
        if (!mobile?.isOpen?.() && !desktop?.isOpen?.())
            return;

        mobile?.refresh?.();
        desktop?.refresh?.();
    };

    const unsubscribeFilter = subscribeFilterState(refreshIfOpen);

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
            unsubscribeFilter();
            mobile?.destroy?.();
            desktop?.destroy?.();
        }
    };
};

let sharedInstance = null;

export const getFilterResultsModal = () => {
    if (!sharedInstance)
        sharedInstance = createFilterResultsModal();

    return sharedInstance;
};
