/** Мобильная шторка модалки среза (поэтажный план): 1:1 с poi-modal-mobile.js. */
import { createTourWidgetFrame, TOUR_WIDGET_DEFAULT_URL } from '../ui/tour-widget-frame.js';
import { focusApartmentFromPoiInfo } from '../poi/poi-focus.js';
import {
    resolvePoiModalCardFallbackSrc,
    resolvePoiModalPlanSrc
} from '../ui/components/lit/poi-modal/poi-modal-sheet.js';
import { resolvePoiModalFloorPlanSrc } from '../ui/components/lit/poi-modal/poi-modal-utils.js';
import '../ui/components/lit/poi-modal/poi-modal-sheet-detail.js';
import { createPoiRegOverlay } from '../poi/modal/poi-reg-overlay.js';
import { isFavorite, setFavorite } from '../../../lib/favorites.js';
import { bindTouchFriendlyButtons } from '../utils/touch-friendly-buttons.js';

export const createFloorPlanSliceModalMobile = (options = {}) => {
    const onClosed = options.onClosed;
    const uiRoot = document.getElementById('ui');

    const modal = document.createElement('div');
    modal.id = 'floorPlanSliceModal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-hidden', 'true');

    const backdrop = document.createElement('div');
    backdrop.id = 'floorPlanSliceModalBackdrop';

    const sheet = document.createElement('div');
    sheet.id = 'floorPlanSliceModalSheet';

    const sheetCard = document.createElement('poi-modal-sheet');
    const sheetDetail = document.createElement('poi-modal-sheet-detail');

    const detailClose = document.createElement('button');
    detailClose.type = 'button';
    detailClose.id = 'floorPlanSliceModalDetailClose';
    detailClose.textContent = '×';
    detailClose.setAttribute('aria-label', 'Свернуть');

    const topClose = document.createElement('button');
    topClose.type = 'button';
    topClose.id = 'floorPlanSliceModalTopClose';
    topClose.className = 'floorPlanSliceModalTopClose';
    topClose.setAttribute('aria-label', 'Закрыть');
    topClose.innerHTML = '<span class="floorPlanSliceModalTopCloseIcon" aria-hidden="true">×</span>';

    sheet.append(topClose, sheetCard, sheetDetail, detailClose);
    modal.append(backdrop, sheet);
    uiRoot.appendChild(modal);

    const tourFrame = createTourWidgetFrame({
        parent: uiRoot,
        shellId: 'floorPlanSliceModalMobileTourShell',
        closeAriaLabel: 'Закрыть тур'
    });

    const regOverlay = createPoiRegOverlay('mobile', uiRoot);

    /** @type {import('../ui/components/lit/poi-modal/poi-modal-utils.js').PoiInfo | null} */
    let currentInfo = null;
    let detailCollapseTimer = null;
    /** @type {null | (() => void)} */
    let restoreOrbitAfterClose = null;

    const applySheetCard = info => {
        sheetCard.planSrc = resolvePoiModalPlanSrc(info);
        sheetCard.cardFallbackSrc = resolvePoiModalCardFallbackSrc(info);
        sheetCard.favorite = isFavorite(info?.id);
        sheetCard.info = info;
    };

    const applySheetDetail = info => {
        sheetDetail.planSrc = resolvePoiModalPlanSrc(info);
        sheetDetail.floorPlanSrc = resolvePoiModalFloorPlanSrc(info);
        sheetDetail.cardFallbackSrc = resolvePoiModalCardFallbackSrc(info);
        sheetDetail.favorite = sheetCard.favorite;
        sheetDetail.tagsExpanded = false;
        sheetDetail.viewMode = 'layout';
        sheetDetail.info = info;
    };

    const DETAIL_RESTORE_MS = 10;

    const collapseDetail = () => {
        if (!sheet.classList.contains('floor-plan-slice-modal-sheet--detail'))
            return;

        regOverlay.close();
        tourFrame.close();
        sheet.classList.remove('floor-plan-slice-modal-sheet--detail');

        if (detailCollapseTimer) clearTimeout(detailCollapseTimer);
        detailCollapseTimer = setTimeout(() => {
            detailCollapseTimer = null;
            if (currentInfo)
                applySheetCard(currentInfo);
        }, DETAIL_RESTORE_MS);
    };

    const openDetail = () => {
        if (!currentInfo)
            return;

        tourFrame.close();

        if (detailCollapseTimer) {
            clearTimeout(detailCollapseTimer);
            detailCollapseTimer = null;
        }

        applySheetDetail(currentInfo);

        modal.classList.add('floor-plan-slice-modal--open');
        modal.setAttribute('aria-hidden', 'false');
        sheet.classList.add('floor-plan-slice-modal-sheet--detail');
    };

    const openTour = () => {
        tourFrame.open(TOUR_WIDGET_DEFAULT_URL);
    };

    const open = (_apartment, info, restoreCamera) => {
        currentInfo = info;
        restoreOrbitAfterClose = typeof restoreCamera === 'function' ? restoreCamera : null;

        tourFrame.close();
        sheet.classList.remove('floor-plan-slice-modal-sheet--detail');

        if (detailCollapseTimer) {
            clearTimeout(detailCollapseTimer);
            detailCollapseTimer = null;
        }

        applySheetCard(info);

        modal.classList.add('floor-plan-slice-modal--open');
        modal.setAttribute('aria-hidden', 'false');
    };

    /** @param {{ restoreCamera?: boolean }} [opts] */
    const close = (opts = {}) => {
        const restore = opts.restoreCamera === true;

        if (detailCollapseTimer) {
            clearTimeout(detailCollapseTimer);
            detailCollapseTimer = null;
        }

        regOverlay.close();
        tourFrame.close();
        sheet.classList.remove('floor-plan-slice-modal-sheet--detail');

        modal.classList.remove('floor-plan-slice-modal--open');
        modal.setAttribute('aria-hidden', 'true');

        currentInfo = null;
        sheetCard.info = null;
        sheetCard.planSrc = '';
        sheetCard.cardFallbackSrc = '';
        sheetCard.favorite = false;
        sheetDetail.info = null;
        sheetDetail.planSrc = '';
        sheetDetail.floorPlanSrc = '';
        sheetDetail.cardFallbackSrc = '';
        sheetDetail.favorite = false;
        sheetDetail.tagsExpanded = false;
        sheetDetail.viewMode = 'layout';

        const doRestore = restoreOrbitAfterClose;

        restoreOrbitAfterClose = null;

        if (restore) {
            if (doRestore)
                doRestore();
        }

        onClosed?.();
    };

    const syncFavorite = favorite => {
        sheetCard.favorite = favorite;
        sheetDetail.favorite = favorite;

        if (typeof currentInfo?.id === 'number')
            setFavorite(currentInfo.id, favorite);
    };

    sheet.addEventListener('pointerdown', e => e.stopPropagation());
    sheetCard.addEventListener('pointerdown', e => e.stopPropagation());
    sheetDetail.addEventListener('pointerdown', e => e.stopPropagation());
    detailClose.addEventListener('pointerdown', e => e.stopPropagation());
    bindTouchFriendlyButtons(sheet);

    detailClose.addEventListener('click', e => {
        e.stopPropagation();
        collapseDetail();
    });

    const closeFully = () => close({ restoreCamera: true });

    topClose.addEventListener('click', closeFully);
    topClose.addEventListener('pointerdown', e => e.stopPropagation());

    sheetCard.addEventListener('poi-details', e => {
        e.stopPropagation();
        openDetail();
    });

    sheetCard.addEventListener('poi-tour', e => {
        e.stopPropagation();
        openTour();
    });

    sheetCard.addEventListener('poi-favorite', e => {
        e.stopPropagation();
        syncFavorite(/** @type {CustomEvent} */ (e).detail?.favorite === true);
    });

    sheetDetail.addEventListener('poi-tour', e => {
        e.stopPropagation();
        openTour();
    });

    sheetDetail.addEventListener('poi-3d', e => {
        e.stopPropagation();
        focusApartmentFromPoiInfo(currentInfo);
    });

    sheetDetail.addEventListener('poi-book', e => {
        e.stopPropagation();
        regOverlay.open();
    });

    sheetDetail.addEventListener('poi-calculator', e => {
        e.stopPropagation();
    });

    sheetDetail.addEventListener('poi-favorite', e => {
        e.stopPropagation();
        syncFavorite(/** @type {CustomEvent} */ (e).detail?.favorite === true);
    });

    return {
        open,
        close
    };
};
