import { createGalleryModalMobile } from './mob/gallery-modal-mobile.js';
import { createGalleryModalDesktop } from './desk/gallery-modal-desktop.js';
import { getPoiDesktopLayoutMediaQuery } from '../../../../poi/poi-viewport.js';

const DESKTOP_LAYOUT_MQ = getPoiDesktopLayoutMediaQuery();

const pickImpl = (mobile, desktop) =>
    typeof window !== 'undefined' && window.matchMedia(DESKTOP_LAYOUT_MQ).matches
        ? desktop
        : mobile;

export const createGalleryModal = () => {
    const mobile = createGalleryModalMobile();
    const desktop = createGalleryModalDesktop();
    /** @type {ReturnType<typeof createGalleryModalMobile> | ReturnType<typeof createGalleryModalDesktop> | null} */
    let activeImpl = null;

    const resolveActive = () => {
        activeImpl = pickImpl(mobile, desktop);
        return activeImpl;
    };

    return {
        /** @param {import('./gallery-data.js').GalleryModalOpenOptions} [options] */
        open(options) {
            resolveActive()?.open?.(options);
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

export const getGalleryModal = () => {
    if (!sharedInstance)
        sharedInstance = createGalleryModal();

    return sharedInstance;
};
