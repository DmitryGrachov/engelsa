import { assetUrl } from '../../utils/asset-url.js';
import { FLOOR_PLAN_PANEL_INITIAL_STEP, resolveFloorPlanOpenFromSelectedPoi } from '../../floor-plan/plan-2d-glb.js';

/**
 * Док «Поэтажные планы» в режиме «Поиск».
 * @param {{
 *   plan2dPlanesCtl?: import('../../floor-plan/plan-2d-glb.js').Plan2dPlanesCtl | null;
 *   poiBoxController?: ReturnType<typeof import('../../poi/poi-box.js').addPoiBoxModel>;
 *   viewer?: {
 *     getFloorSliceRegionQuickStep?: () => number;
 *     shiftFloorSliceRegionMaxLocalY?: (delta: number) => void;
 *     resetFloorSliceToInitial?: () => void;
 *   };
 *   isSearchModeActive?: () => boolean;
 *   onStateChange?: () => void;
 * }} opts
 */
export function createFloorPlansDock(opts = {}) {
    const {
        plan2dPlanesCtl,
        poiBoxController,
        viewer,
        isSearchModeActive = () => false,
        onStateChange
    } = opts;

    let floorPlanPlaneStep = 0;
    /** @type {import('./lit/poi-modal/poi-modal-utils.js').PoiInfo | null} */
    let pendingApartmentOnOpen = null;

    const floorPlansDock = document.createElement('div');

    floorPlansDock.id = 'floorPlansSearchDock';

    const floorPlansBtn = document.createElement('button');

    floorPlansBtn.id = 'floorPlansSearchBtn';
    floorPlansBtn.type = 'button';
    floorPlansBtn.className = 'floorPlansSearchBtn';
    floorPlansBtn.textContent = 'Поэтажные планы';
    floorPlansBtn.setAttribute('aria-label', 'Поэтажные планы');

    const floorPlansQuick = document.createElement('div');

    floorPlansQuick.className = 'floorPlansSearchQuick';
    floorPlansQuick.setAttribute('aria-hidden', 'true');

    const floorPlansQuickIcon = (/** @type {string} */ src, /** @type {number} */ w, /** @type {number} */ h) => {
        const img = document.createElement('img');

        img.src = assetUrl(src);
        img.alt = '';
        img.width = w;
        img.height = h;
        img.decoding = 'async';
        img.draggable = false;

        return img;
    };

    const floorPlansSliceUpWrap = document.createElement('div');

    floorPlansSliceUpWrap.className = 'floorPlansSearchQuickCloseWrap floorPlansSearchQuickCloseWrapAction';

    const floorPlansSliceUp = document.createElement('button');

    floorPlansSliceUp.type = 'button';
    floorPlansSliceUp.className = 'floorPlansSearchQuickSliceBtn';
    floorPlansSliceUp.title = 'Уменьшить max Y (на 4 пункта)';
    floorPlansSliceUp.setAttribute('aria-label', floorPlansSliceUp.title);
    floorPlansSliceUp.appendChild(floorPlansQuickIcon('./assets/slice/up.svg', 11, 15));

    floorPlansSliceUpWrap.appendChild(floorPlansSliceUp);

    const floorPlansCloseWrap = document.createElement('div');

    floorPlansCloseWrap.className = 'floorPlansSearchQuickCloseWrap';

    const floorPlansClose = document.createElement('button');

    floorPlansClose.type = 'button';
    floorPlansClose.className = 'floorPlansSearchCloseBtn';
    floorPlansClose.title = 'Поэтажные планы';
    floorPlansClose.setAttribute('aria-label', 'Закрыть панель поэтажных планов');
    floorPlansClose.appendChild(floorPlansQuickIcon('./assets/slice/close.svg', 11, 11));

    floorPlansCloseWrap.appendChild(floorPlansClose);

    const floorPlansSliceDownWrap = document.createElement('div');

    floorPlansSliceDownWrap.className = 'floorPlansSearchQuickCloseWrap floorPlansSearchQuickCloseWrapAction';

    const floorPlansSliceDown = document.createElement('button');

    floorPlansSliceDown.type = 'button';
    floorPlansSliceDown.className = 'floorPlansSearchQuickSliceBtn';
    floorPlansSliceDown.title = 'Увеличить max Y (на 4 пункта)';
    floorPlansSliceDown.setAttribute('aria-label', floorPlansSliceDown.title);
    floorPlansSliceDown.appendChild(floorPlansQuickIcon('./assets/slice/down.svg', 11, 15));

    floorPlansSliceDownWrap.appendChild(floorPlansSliceDown);

    floorPlansQuick.append(floorPlansSliceUpWrap, floorPlansCloseWrap, floorPlansSliceDownWrap);

    const floorPlansFloorCounter = document.createElement('div');

    floorPlansFloorCounter.className = 'floorPlansSearchFloorCounter';
    floorPlansFloorCounter.setAttribute('aria-hidden', 'true');

    floorPlansDock.append(floorPlansBtn, floorPlansFloorCounter, floorPlansQuick);

    const notify = () => onStateChange?.();

    const stepFloorPlansSliceY = () => (viewer?.getFloorSliceRegionQuickStep?.() ?? 0.04);

    const applyFloorPlanPlaneStep = () => {
        plan2dPlanesCtl?.setFloorPlanPanelPlaneStep(floorPlanPlaneStep);
    };

    const getPanelFloor = () => plan2dPlanesCtl?.getPanelFloor?.(floorPlanPlaneStep) ?? null;

    const syncFloorPlanCounterDisplay = () => {
        const v = plan2dPlanesCtl?.getPanelCounter?.(floorPlanPlaneStep) ?? 0;

        floorPlansFloorCounter.textContent = String(v);
        const maxFloor = plan2dPlanesCtl?.getPanelCounter?.(FLOOR_PLAN_PANEL_INITIAL_STEP) ?? v;
        const minFloor = plan2dPlanesCtl?.getPanelCounter?.(plan2dPlanesCtl?.maxStep ?? 0) ?? v;
        const digits = Math.max(String(maxFloor).length, String(minFloor).length, 1);

        floorPlansFloorCounter.style.minWidth = `calc(${digits}ch + 22px)`;
    };

    const syncFloorPlanNavButtons = () => {
        const canUp = plan2dPlanesCtl?.canStepUp?.(floorPlanPlaneStep) ?? false;
        const canDown = plan2dPlanesCtl?.canStepDown?.(floorPlanPlaneStep) ?? false;

        floorPlansSliceUp.disabled = !canUp;
        floorPlansSliceDown.disabled = !canDown;
        floorPlansSliceUpWrap.classList.toggle('floorPlansSearchQuickCloseWrap--disabled', !canUp);
        floorPlansSliceDownWrap.classList.toggle('floorPlansSearchQuickCloseWrap--disabled', !canDown);
        floorPlansSliceUp.setAttribute('aria-disabled', canUp ? 'false' : 'true');
        floorPlansSliceDown.setAttribute('aria-disabled', canDown ? 'false' : 'true');
    };

    const syncExpandedChrome = () => {
        const expanded = floorPlansDock.classList.contains('floorPlansSearchDock--expanded');

        floorPlansBtn.setAttribute('aria-hidden', expanded ? 'true' : 'false');
        floorPlansQuick.setAttribute('aria-hidden', expanded ? 'false' : 'true');
        floorPlansFloorCounter.setAttribute('aria-hidden', expanded ? 'false' : 'true');

        if (expanded)
            syncFloorPlanCounterDisplay();
    };

    floorPlansSliceUpWrap.addEventListener('click', e => {
        e.stopPropagation();

        if (!(plan2dPlanesCtl?.canStepUp?.(floorPlanPlaneStep)))
            return;

        const prev = floorPlanPlaneStep;

        floorPlanPlaneStep = Math.max(0, floorPlanPlaneStep - 1);
        applyFloorPlanPlaneStep();
        syncFloorPlanCounterDisplay();
        syncFloorPlanNavButtons();
        notify();

        if (floorPlanPlaneStep !== prev)
            viewer?.shiftFloorSliceRegionMaxLocalY?.(-stepFloorPlansSliceY());
    });

    floorPlansSliceDownWrap.addEventListener('click', e => {
        e.stopPropagation();
        if (!(plan2dPlanesCtl?.canStepDown?.(floorPlanPlaneStep)))
            return;

        const prev = floorPlanPlaneStep;
        const maxStep = plan2dPlanesCtl?.maxStep ?? 0;

        floorPlanPlaneStep = Math.min(maxStep, floorPlanPlaneStep + 1);
        applyFloorPlanPlaneStep();
        syncFloorPlanCounterDisplay();
        syncFloorPlanNavButtons();
        notify();

        if (floorPlanPlaneStep !== prev)
            viewer?.shiftFloorSliceRegionMaxLocalY?.(stepFloorPlansSliceY());
    });

    const openFloorPlansForPoi = (/** @type {import('./lit/poi-modal/poi-modal-utils.js').PoiInfo | null | undefined} */ selectedPoi) => {
        const sliceFloors = plan2dPlanesCtl?.getSliceFloors?.() ?? [];
        const { step, apartment } = resolveFloorPlanOpenFromSelectedPoi(selectedPoi, sliceFloors);

        floorPlanPlaneStep = step;
        pendingApartmentOnOpen = apartment;
        applyFloorPlanPlaneStep();
        syncFloorPlanCounterDisplay();
        syncFloorPlanNavButtons();
        viewer?.shiftFloorSliceRegionMaxLocalY?.(step * stepFloorPlansSliceY());
        floorPlansDock.classList.add('floorPlansSearchDock--expanded');
        syncExpandedChrome();
        poiBoxController?.setMeshesVisible?.(false);
        notify();
    };

    floorPlansBtn.addEventListener('click', e => {
        e.stopPropagation();
        openFloorPlansForPoi(poiBoxController?.getActivePoiInfo?.() ?? null);
    });

    floorPlansCloseWrap.addEventListener('click', e => {
        e.stopPropagation();
        floorPlanPlaneStep = 0;
        plan2dPlanesCtl?.hideAllPlanPlanes?.();
        floorPlansDock.classList.remove('floorPlansSearchDock--expanded');
        syncExpandedChrome();
        syncFloorPlanCounterDisplay();
        notify();

        if (isSearchModeActive()) {
            poiBoxController?.setMeshesVisible?.(true);
            viewer?.resetFloorSliceToInitial?.();
            requestAnimationFrame(() => {
                poiBoxController?.nudgeCameraForSearchPanel?.(false);
            });
        }
    });

    return {
        root: floorPlansDock,

        isVisible() {
            return floorPlansDock.classList.contains('floorPlansSearchDock--visible');
        },

        isExpanded() {
            return floorPlansDock.classList.contains('floorPlansSearchDock--expanded');
        },

        getPlaneStep() {
            return floorPlanPlaneStep;
        },

        getPanelFloor() {
            return getPanelFloor();
        },

        consumePendingApartmentOnOpen() {
            const apartment = pendingApartmentOnOpen;

            pendingApartmentOnOpen = null;

            return apartment;
        },

        /** @param {import('./lit/poi-modal/poi-modal-utils.js').PoiInfo | null | undefined} poiInfo */
        openForPoi(poiInfo) {
            openFloorPlansForPoi(poiInfo);
        },

        shouldShowFloorPlanPois() {
            return this.isVisible()
                && this.isExpanded()
                && (plan2dPlanesCtl?.stepHasPlanes?.(floorPlanPlaneStep) ?? false);
        },

        /** @param {'house' | 'search' | 'map'} mode */
        syncForMode(mode) {
            if (!floorPlansDock.isConnected)
                return;

            const on = mode === 'search';

            floorPlansDock.classList.toggle('floorPlansSearchDock--visible', on);

            if (!on) {
                floorPlansDock.classList.remove('floorPlansSearchDock--expanded');
                floorPlanPlaneStep = 0;
                plan2dPlanesCtl?.hideAllPlanPlanes?.();
                syncFloorPlanCounterDisplay();
            }

            floorPlansBtn.setAttribute('aria-hidden', on ? 'false' : 'true');
            floorPlansDock.setAttribute('aria-hidden', on ? 'false' : 'true');
            floorPlansQuick.setAttribute(
                'aria-hidden',
                !on || !floorPlansDock.classList.contains('floorPlansSearchDock--expanded')
                    ? 'true'
                    : 'false'
            );

            floorPlansFloorCounter.setAttribute(
                'aria-hidden',
                !on || !floorPlansDock.classList.contains('floorPlansSearchDock--expanded')
                    ? 'true'
                    : 'false'
            );

            if (on && floorPlansDock.classList.contains('floorPlansSearchDock--expanded'))
                syncFloorPlanCounterDisplay();
        }
    };
}
