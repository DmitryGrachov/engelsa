import { createFilterGroupVariantsModalMobile } from './mob/filter-group-variants-modal-mobile.js';
import { createFilterGroupVariantsModalDesktop } from './desk/filter-group-variants-modal-desktop.js';
import { getPoiDesktopLayoutMediaQuery } from '../../../../poi/poi-viewport.js';
import { focusApartmentFromVariant } from '../../../../poi/poi-focus.js';
import { getPoiModal } from '../../../../poi/modal/poi-modal.js';

const DESKTOP_LAYOUT_MQ = getPoiDesktopLayoutMediaQuery();

const pickImpl = (mobile, desktop) =>
    typeof window !== 'undefined' && window.matchMedia(DESKTOP_LAYOUT_MQ).matches
        ? desktop
        : mobile;

/** @param {HTMLElement | null | undefined} view */
const bindCommonVariantActions = (view) => {
    if (!view)
        return;

    view.addEventListener('filter-group-variant-3d', (event) => {
        focusApartmentFromVariant(/** @type {CustomEvent} */ (event).detail?.variant);
    });

    view.addEventListener('filter-group-variant-tour', () => {
        getPoiModal()?.openTour?.();
    });
};

/** Модалка вариантов внутри группы планировки (plan_group_id). */
export const createFilterGroupVariantsModal = () => {
    const mobile = createFilterGroupVariantsModalMobile();
    const desktop = createFilterGroupVariantsModalDesktop();

    bindCommonVariantActions(mobile?.view);
    bindCommonVariantActions(desktop?.view);
    /** @type {ReturnType<typeof createFilterGroupVariantsModalMobile> | ReturnType<typeof createFilterGroupVariantsModalDesktop> | null} */
    let activeImpl = null;

    const resolveActive = () => {
        activeImpl = pickImpl(mobile, desktop);
        return activeImpl;
    };

    return {
        /** @param {string} groupId */
        open(groupId) {
            resolveActive()?.open?.(groupId);
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
        getGroupId() {
            return activeImpl?.getGroupId?.()
                ?? mobile?.getGroupId?.()
                ?? desktop?.getGroupId?.()
                ?? null;
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

export const getFilterGroupVariantsModal = () => {
    if (!sharedInstance)
        sharedInstance = createFilterGroupVariantsModal();

    return sharedInstance;
};
