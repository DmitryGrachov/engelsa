/**
 * Десктопная карточка POI (min-width: 819px): панель слева + полноэкран «Подробнее».
 */
import { createTourWidgetFrame, TOUR_WIDGET_DEFAULT_URL } from '../../ui/tour-widget-frame.js';
import {
    resolvePoiModalDeskCardFallbackSrc,
    resolvePoiModalFloorPlanSrc,
    resolvePoiModalPlanSrc,
    resolvePoiGalleryImageSrcs,
    resolveRooms
} from '../../ui/components/lit/poi-modal/poi-modal-utils.js';
import '../../ui/components/lit/poi-modal/poi-modal-desk-panel.js';
import '../../ui/components/lit/poi-modal/poi-modal-desk-detail.js';
import { getGalleryModal } from '../../ui/components/lit/gallery-modal/index.js';
import { getDefaultGalleryImages } from '../../ui/components/lit/gallery-modal/gallery-data.js';
import { downloadPoiOfferPdf } from '../../offers/index.js';
import { createPoiRegOverlay } from './poi-reg-overlay.js';
import { isFavorite, setFavorite } from '../../../../lib/favorites.js';
import { bindTouchFriendlyButtons } from '../../utils/touch-friendly-buttons.js';

export const createPoiModalDesktop = () => {
    const uiRoot = document.getElementById('ui');

    const root = document.createElement('div');
    root.id = 'poiModalDesk';
    root.className = 'poiModalDeskRoot';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-hidden', 'true');

    const panel = document.createElement('div');
    panel.className = 'poiModalDeskPanel';

    const deskPanel = document.createElement('poi-modal-desk-panel');

    panel.appendChild(deskPanel);
    root.appendChild(panel);
    uiRoot.appendChild(root);

    const fs = document.createElement('div');
    fs.id = 'poiModalDeskFs';
    fs.className = 'poiModalDeskFs';
    fs.setAttribute('role', 'dialog');
    fs.setAttribute('aria-modal', 'true');
    fs.setAttribute('aria-hidden', 'true');

    const fsDetail = document.createElement('poi-modal-desk-detail');

    fs.appendChild(fsDetail);
    uiRoot.appendChild(fs);

    const tourFrame = createTourWidgetFrame({
        parent: uiRoot,
        shellId: 'poiModalDeskTourShell',
        closeAriaLabel: 'Закрыть тур'
    });

    const regOverlay = createPoiRegOverlay('desk', uiRoot);

    let currentInfo = null;
    /** @type {null | (() => void)} */
    let restoreOrbitAfterClose = null;

    const applyDeskPanel = info => {
        deskPanel.planSrc = resolvePoiModalPlanSrc(info);
        deskPanel.floorPlanSrc = resolvePoiModalFloorPlanSrc(info);
        deskPanel.cardFallbackSrc = resolvePoiModalDeskCardFallbackSrc(info);
        deskPanel.favorite = isFavorite(info?.id);
        deskPanel.tagsExpanded = false;
        deskPanel.viewMode = 'layout';
        deskPanel.info = info;
    };

    const applyFsDetail = info => {
        fsDetail.planSrc = resolvePoiModalPlanSrc(info);
        fsDetail.floorPlanSrc = resolvePoiModalFloorPlanSrc(info);
        fsDetail.cardFallbackSrc = resolvePoiModalDeskCardFallbackSrc(info);
        fsDetail.favorite = isFavorite(info?.id);
        fsDetail.viewMode = 'layout';
        fsDetail.info = info;
    };

    const resetFsDetail = () => {
        fsDetail.info = null;
        fsDetail.planSrc = '';
        fsDetail.floorPlanSrc = '';
        fsDetail.cardFallbackSrc = '';
        fsDetail.favorite = false;
        fsDetail.viewMode = 'layout';
    };

    const closeFullscreen = () => {
        regOverlay.close();
        fs.classList.remove('poi-modal-desk-fs--open');
        fs.setAttribute('aria-hidden', 'true');
        root.classList.remove('poi-modal-desk--fs-open');
        resetFsDetail();
    };

    const openFullscreen = () => {
        if (!currentInfo) return;

        applyFsDetail(currentInfo);
        fs.classList.add('poi-modal-desk-fs--open');
        fs.setAttribute('aria-hidden', 'false');
        root.classList.add('poi-modal-desk--fs-open');
    };

    /** @param {import('../../ui/components/lit/poi-modal/poi-modal-utils.js').PoiInfo | null | undefined} info */
    const openDetail = (info) => {
        if (!info)
            return;

        currentInfo = info;
        restoreOrbitAfterClose = null;

        tourFrame.close();
        regOverlay.close();

        applyFsDetail(info);
        fs.classList.add('poi-modal-desk-fs--open');
        fs.setAttribute('aria-hidden', 'false');
        root.classList.add('poi-modal-desk--fs-open');
    };

    const open = (_nodeName, info, restoreCamera) => {
        currentInfo = info;
        restoreOrbitAfterClose = typeof restoreCamera === 'function' ? restoreCamera : null;

        closeFullscreen();
        tourFrame.close();

        applyDeskPanel(info);

        root.classList.add('poi-modal-desk--open');
        root.setAttribute('aria-hidden', 'false');
    };

    let onCloseHook = () => {};

    /** @param {{ resetPoiHighlight?: boolean }} [opts] */
    const close = (opts = {}) => {
        const reset = opts.resetPoiHighlight === true;

        regOverlay.close();
        closeFullscreen();
        tourFrame.close();

        root.classList.remove('poi-modal-desk--open');
        root.setAttribute('aria-hidden', 'true');

        currentInfo = null;
        deskPanel.info = null;
        deskPanel.planSrc = '';
        deskPanel.floorPlanSrc = '';
        deskPanel.cardFallbackSrc = '';
        deskPanel.favorite = false;
        deskPanel.tagsExpanded = false;
        deskPanel.viewMode = 'layout';

        const doRestore = restoreOrbitAfterClose;

        restoreOrbitAfterClose = null;

        if (reset) {
            if (doRestore)
                doRestore();

            onCloseHook();
        }
    };

    const closeFully = () => close({ resetPoiHighlight: true });

    const openTour = () => {
        closeFullscreen();
        tourFrame.open(TOUR_WIDGET_DEFAULT_URL);
    };

    const openGallery = () => {
        const info = currentInfo;

        if (!info)
            return;

        const rooms = resolveRooms(info);
        const number = typeof info.number === 'number' ? info.number : '—';
        const images = resolvePoiGalleryImageSrcs(info);

        getGalleryModal()?.open?.({
            sectionLabel: 'Галерея',
            title: `${rooms}-к квартира № ${number}`,
            projectTitle: 'Прайм Энегельса',
            images: images.length ? images : getDefaultGalleryImages()
        });
    };

    const syncFavorite = favorite => {
        deskPanel.favorite = favorite;
        fsDetail.favorite = favorite;

        if (typeof currentInfo?.id === 'number')
            setFavorite(currentInfo.id, favorite);
    };

    panel.addEventListener('pointerdown', e => e.stopPropagation());
    fs.addEventListener('pointerdown', e => e.stopPropagation());
    deskPanel.addEventListener('pointerdown', e => e.stopPropagation());
    fsDetail.addEventListener('pointerdown', e => e.stopPropagation());
    bindTouchFriendlyButtons(deskPanel);

    deskPanel.addEventListener('poi-close', e => {
        e.stopPropagation();
        closeFully();
    });

    deskPanel.addEventListener('poi-details', e => {
        e.stopPropagation();
        openFullscreen();
    });

    deskPanel.addEventListener('poi-tour', e => {
        e.stopPropagation();
        openTour();
    });

    deskPanel.addEventListener('poi-calculator', e => {
        e.stopPropagation();
    });

    deskPanel.addEventListener('poi-favorite', e => {
        e.stopPropagation();
        syncFavorite(/** @type {CustomEvent} */ (e).detail?.favorite === true);
    });

    fsDetail.addEventListener('poi-back', e => {
        e.stopPropagation();
        closeFullscreen();
    });

    fsDetail.addEventListener('poi-tour', e => {
        e.stopPropagation();
        openTour();
    });

    fsDetail.addEventListener('poi-book', e => {
        e.stopPropagation();
        regOverlay.open();
    });

    fsDetail.addEventListener('poi-calculator', e => {
        e.stopPropagation();
    });

    fsDetail.addEventListener('poi-presentation', e => {
        e.stopPropagation();

        if (!currentInfo)
            return;

        void downloadPoiOfferPdf(currentInfo, {
            planSrc: fsDetail.planSrc,
            floorPlanSrc: fsDetail.floorPlanSrc
        });
    });

    fsDetail.addEventListener('poi-gallery', e => {
        e.stopPropagation();
        openGallery();
    });

    fsDetail.addEventListener('poi-favorite', e => {
        e.stopPropagation();
        syncFavorite(/** @type {CustomEvent} */ (e).detail?.favorite === true);
    });

    return {
        open,
        close,
        openDetail,
        closeDetail: closeFullscreen,
        openTour,
        setOnClose(fn) {
            onCloseHook = typeof fn === 'function' ? fn : () => {};
        }
    };
};
