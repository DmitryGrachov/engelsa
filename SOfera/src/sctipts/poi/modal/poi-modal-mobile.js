/** Нижняя шторка POI — мобильная версия (ширина экрана меньше 819px). */
import { createTourWidgetFrame, TOUR_WIDGET_DEFAULT_URL } from '../../ui/tour-widget-frame.js';
import { focusApartmentFromPoiInfo } from '../poi-focus.js';
import {
    resolvePoiModalCardFallbackSrc,
    resolvePoiModalPlanSrc
} from '../../ui/components/lit/poi-modal/poi-modal-sheet.js';
import { resolvePoiModalFloorPlanSrc } from '../../ui/components/lit/poi-modal/poi-modal-utils.js';
import '../../ui/components/lit/poi-modal/poi-modal-sheet-detail.js';
import { createPoiRegOverlay } from './poi-reg-overlay.js';
import { isFavorite, setFavorite } from '../../../../lib/favorites.js';
import { bindTouchFriendlyButtons } from '../../utils/touch-friendly-buttons.js';

export const createPoiModalMobile = () => {
    const uiRoot = document.getElementById('ui');

    const modal = document.createElement('div');
    modal.id = 'poiModal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-hidden', 'true');

    const backdrop = document.createElement('div');
    backdrop.id = 'poiModalBackdrop';

    const sheet = document.createElement('div');
    sheet.id = 'poiModalSheet';

    const sheetCard = document.createElement('poi-modal-sheet');
    const sheetDetail = document.createElement('poi-modal-sheet-detail');

    const detailClose = document.createElement('button');
    detailClose.type = 'button';
    detailClose.id = 'poiModalDetailClose';
    detailClose.textContent = '×';
    detailClose.setAttribute('aria-label', 'Свернуть');

    const topClose = document.createElement('button');

    topClose.type = 'button';
    topClose.id = 'poiModalTopClose';
    topClose.className = 'poiModalTopClose';
    topClose.setAttribute('aria-label', 'Закрыть');
    topClose.innerHTML = '<span class="poiModalTopCloseIcon" aria-hidden="true">×</span>';

    sheet.append(topClose, sheetCard, sheetDetail, detailClose);
    modal.append(backdrop, sheet);
    uiRoot.appendChild(modal);

    const tourFrame = createTourWidgetFrame({
        parent: uiRoot,
        shellId: 'poiModalMobileTourShell',
        closeAriaLabel: 'Закрыть тур'
    });

    const regOverlay = createPoiRegOverlay('mobile', uiRoot);

    let currentInfo = null;
    let detailCollapseTimer = null;
    /** @type {null | (() => void)} восстановление орбиты после «Назад» */
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
        if (!sheet.classList.contains('poi-modal-sheet--detail'))
            return;

        regOverlay.close();
        tourFrame.close();
        sheet.classList.remove('poi-modal-sheet--detail');

        if (detailCollapseTimer) clearTimeout(detailCollapseTimer);
        detailCollapseTimer = setTimeout(() => {
            detailCollapseTimer = null;
            if (currentInfo)
                applySheetCard(currentInfo);
        }, DETAIL_RESTORE_MS);
    };

    const openDetail = (info) => {
        const nextInfo = info ?? currentInfo;

        if (!nextInfo)
            return;

        currentInfo = nextInfo;
        restoreOrbitAfterClose = null;

        tourFrame.close();

        if (detailCollapseTimer) {
            clearTimeout(detailCollapseTimer);
            detailCollapseTimer = null;
        }

        applySheetDetail(currentInfo);

        modal.classList.add('poi-modal--open');
        modal.setAttribute('aria-hidden', 'false');
        sheet.classList.add('poi-modal-sheet--detail');
    };

    const openTour = () => {
        tourFrame.open(TOUR_WIDGET_DEFAULT_URL);
    };

    const open = (_nodeName, info, restoreCamera) => {
        currentInfo = info;
        restoreOrbitAfterClose = typeof restoreCamera === 'function' ? restoreCamera : null;

        tourFrame.close();
        sheet.classList.remove('poi-modal-sheet--detail');

        if (detailCollapseTimer) {
            clearTimeout(detailCollapseTimer);
            detailCollapseTimer = null;
        }

        applySheetCard(info);

        modal.classList.add('poi-modal--open');
        modal.setAttribute('aria-hidden', 'false');
    };

    let onCloseHook = () => {};

    /** @param {{ resetPoiHighlight?: boolean }} [opts] */
    const close = (opts = {}) => {
        const reset = opts.resetPoiHighlight === true;

        if (detailCollapseTimer) {
            clearTimeout(detailCollapseTimer);
            detailCollapseTimer = null;
        }

        regOverlay.close();
        tourFrame.close();
        sheet.classList.remove('poi-modal-sheet--detail');

        modal.classList.remove('poi-modal--open');
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
        if (reset) {
            if (doRestore)
                doRestore();

            onCloseHook();
        }
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

    const closeFully = () => close({ resetPoiHighlight: true });

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
        close,
        openDetail,
        closeDetail: collapseDetail,
        openTour,
        setOnClose(fn) {
            onCloseHook = typeof fn === 'function' ? fn : () => {};
        }
    };
};
