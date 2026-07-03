import { createFloorPlanSliceModalMobile } from './floor-plan-slice-modal-mobile.js';
import { createFloorPlanSliceModalDesktop } from './floor-plan-slice-modal-desktop.js';
import { getPoiDesktopLayoutMediaQuery } from '../poi/poi-viewport.js';

const DESKTOP_SLICE_MQ = getPoiDesktopLayoutMediaQuery();

const pickImpl = (mobile, desktop) =>
    typeof window !== 'undefined' && window.matchMedia(DESKTOP_SLICE_MQ).matches ? desktop : mobile;

/** Модалка среза поэтажного плана: ≥819px — панель слева, иначе — нижняя шторка. */
export const createFloorPlanSliceModal = () => {
    /** @type {(() => void) | null} */
    let onCloseCallback = null;
    const notifyClosed = () => onCloseCallback?.();

    const mobile = createFloorPlanSliceModalMobile({ onClosed: notifyClosed });
    const desktop = createFloorPlanSliceModalDesktop({ onClosed: notifyClosed });
    /** @type {ReturnType<typeof createFloorPlanSliceModalMobile> | ReturnType<typeof createFloorPlanSliceModalDesktop> | null} */
    let activeImpl = null;

    return {
        open(apartment, info, restoreCamera) {
            activeImpl = pickImpl(mobile, desktop);
            activeImpl.open(apartment, info, restoreCamera);
        },
        close(opts) {
            mobile.close(opts);
            desktop.close(opts);
            activeImpl = null;
        },
        /** @param {() => void} fn */
        onClose(fn) {
            onCloseCallback = fn;
        }
    };
};
