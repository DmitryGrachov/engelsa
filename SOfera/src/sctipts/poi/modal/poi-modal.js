import { createPoiModalMobile } from './poi-modal-mobile.js';
import { createPoiModalDesktop } from './poi-modal-desktop.js';
import { getPoiDesktopLayoutMediaQuery } from '../poi-viewport.js';

const DESKTOP_POI_MQ = getPoiDesktopLayoutMediaQuery();

const pickImpl = (mobile, desktop) =>
    typeof window !== 'undefined' && window.matchMedia(DESKTOP_POI_MQ).matches ? desktop : mobile;

/**
 * POI-модалка: при ширине ≥819px — десктопная панель слева, иначе — нижняя шторка.
 */
export const createPoiModal = () => {
    const mobile = createPoiModalMobile();
    const desktop = createPoiModalDesktop();
    /** @type {ReturnType<typeof createPoiModalMobile> | ReturnType<typeof createPoiModalDesktop> | null} */
    let activeImpl = null;

    const instance = {
        open(nodeName, info, restoreCamera) {
            activeImpl = pickImpl(mobile, desktop);
            activeImpl.open(nodeName, info, restoreCamera);
        },
        close(opts) {
            mobile.close(opts);
            desktop.close(opts);
            activeImpl = null;
        },
        /** @param {import('../ui/components/lit/poi-modal/poi-modal-utils.js').PoiInfo | null | undefined} info */
        openDetail(info) {
            if (!info)
                return;

            if (typeof window !== 'undefined' && window.matchMedia(DESKTOP_POI_MQ).matches)
                desktop.openDetail(info);
            else
                mobile.openDetail(info);
        },
        closeDetail() {
            mobile.closeDetail();
            desktop.closeDetail();
        },
        /** Полноэкранный тур по планировке (тот же виджет, что «Начать прогулку» в POI). */
        openTour() {
            if (typeof window !== 'undefined' && window.matchMedia(DESKTOP_POI_MQ).matches)
                desktop.openTour();
            else
                mobile.openTour();
        },
        setOnClose(fn) {
            const f = typeof fn === 'function' ? fn : () => {};

            mobile.setOnClose(f);
            desktop.setOnClose(f);
        },
        setOnSlice(fn) {
            const f = typeof fn === 'function' ? fn : () => {};

            mobile.setOnSlice(f);
        }
    };

    sharedPoiModal = instance;

    return instance;
};

/** @type {ReturnType<typeof createPoiModal> | null} */
let sharedPoiModal = null;

export const getPoiModal = () => sharedPoiModal;
