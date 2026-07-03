import { createObjectSelectModalMobile } from './mob/object-select-modal-mobile.js';
import { createObjectSelectModalDesktop } from './desk/object-select-modal-desktop.js';
import { getPoiDesktopLayoutMediaQuery } from '../../../../poi/poi-viewport.js';

const DESKTOP_LAYOUT_MQ = getPoiDesktopLayoutMediaQuery();

const pickImpl = (mobile, desktop) =>
    typeof window !== 'undefined' && window.matchMedia(DESKTOP_LAYOUT_MQ).matches
        ? desktop
        : mobile;

export const createObjectSelectModal = () => {
    const mobile = createObjectSelectModalMobile();
    const desktop = createObjectSelectModalDesktop();
    /** @type {ReturnType<typeof createObjectSelectModalMobile> | ReturnType<typeof createObjectSelectModalDesktop> | null} */
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
        isOpen() {
            return !!(mobile?.isOpen?.() || desktop?.isOpen?.());
        },
        destroy() {
            mobile?.destroy?.();
            desktop?.destroy?.();
        }
    };
};

let sharedInstance = null;

export const getObjectSelectModal = () => {
    if (!sharedInstance)
        sharedInstance = createObjectSelectModal();

    return sharedInstance;
};
