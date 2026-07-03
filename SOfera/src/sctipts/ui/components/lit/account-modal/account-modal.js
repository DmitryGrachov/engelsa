import { createAccountModalMobile } from './account-modal-mobile.js';
import { createAccountModalDesktop } from './account-modal-desktop.js';
import { getPoiDesktopLayoutMediaQuery } from '../../../../poi/poi-viewport.js';

const DESKTOP_LAYOUT_MQ = getPoiDesktopLayoutMediaQuery();

const pickImpl = (mobile, desktop) =>
    typeof window !== 'undefined' && window.matchMedia(DESKTOP_LAYOUT_MQ).matches
        ? desktop
        : mobile;

/**
 * Личный кабинет: ≥819px — десктопное избранное, иначе — мобильная вёрстка.
 */
export const createAccountModal = () => {
    const mobile = createAccountModalMobile();
    const desktop = createAccountModalDesktop();
    /** @type {ReturnType<typeof createAccountModalMobile> | ReturnType<typeof createAccountModalDesktop> | null} */
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

export const getAccountModal = () => {
    if (!sharedInstance)
        sharedInstance = createAccountModal();

    return sharedInstance;
};
