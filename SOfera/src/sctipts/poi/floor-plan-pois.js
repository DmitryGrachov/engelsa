import {
    computeFloorPlanApartmentNudgePick,
    getMainCamera,
    POI_MODAL_RESTORE_DISTANCE_SCALE,
    POI_MODAL_RESTORE_DISTANCE_SCALE_MOBILE,
    scalePickFromAwayFromTarget
} from '../scene/camera.js';
import { isPoiNarrowViewport } from './poi-viewport.js';
import { matchesFilter } from '../ui/components/filter/filter-match.js';
import '../ui/components/lit/floor-poi/index.js';

/** @typedef {import('../ui/components/lit/poi-modal/poi-modal-utils.js').PoiInfo} PoiInfo */
/** @typedef {import('../floor-plan/floor-plan-data.js').FloorPlanData} FloorPlanData */

const FLOOR_PLAN_POI_UI_SCALE_MIN_MOBILE = 0.42;
const FLOOR_PLAN_POI_UI_SCALE_MAX_MOBILE = 1;
const FLOOR_PLAN_POI_UI_SCALE_SMOOTH_MOBILE = 0.2;
/** Квартира, к которой подлетает камера при открытии поэтажных планов (без выбора). */
const DEFAULT_FLOOR_PLAN_APARTMENT_NUMBER = 88;

/**
 * @param {import('../../lib/index.js').main extends (...args: unknown[]) => Promise<infer V> ? V : never | undefined} viewer
 */
const getOrbitDistance = viewer => {
    const dist = viewer?.cameraManager?.camera?.distance;

    return typeof dist === 'number' && Number.isFinite(dist) && dist > 0 ? dist : null;
};

/**
 * @param {number} refDist
 * @param {number} currentDist
 */
const computeFloorPlanPoiUiScaleFromDist = (refDist, currentDist) => {
    if (!(currentDist > 0))
        return FLOOR_PLAN_POI_UI_SCALE_MAX_MOBILE;

    const raw = refDist / currentDist;

    return Math.min(
        FLOOR_PLAN_POI_UI_SCALE_MAX_MOBILE,
        Math.max(FLOOR_PLAN_POI_UI_SCALE_MIN_MOBILE, raw)
    );
};

/**
 * @param {PoiInfo} info
 */
const buildApartmentTitle = info => {
    if (typeof info.number === 'number')
        return `Квартира №${info.number}`;

    if (info.name)
        return `Квартира ${info.name}`;

    return 'Квартира';
};

const buildFloorPlanPoiEl = (/** @type {PoiInfo} */ info, /** @type {string} */ title) => {
    const el = document.createElement('floor-poi-card');

    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-pressed', 'false');
    el.setAttribute('aria-label', title);
    el.setFromPoiInfo(info);

    return el;
};

/**
 * @param {import('playcanvas').Application} app
 * @param {FloorPlanData} floorPlanData
 * @param {{
 *   onApartmentSelect?: (info: PoiInfo | null) => void;
 *   resolveApartmentWorldPosition?: (info: PoiInfo) => { x: number; y: number; z: number } | null;
 *   sliceModal?: ReturnType<typeof import('./floor-plan-slice-modal.js').createFloorPlanSliceModal>;
 *   poiModal?: ReturnType<typeof import('./poi-modal.js').createPoiModal>;
 *   viewer?: import('../../lib/index.js').main extends (...args: unknown[]) => Promise<infer V> ? V : never;
 * } | undefined} options
 */
export const createFloorPlanPois = (app, floorPlanData, options) => {
    const uiRoot = document.getElementById('ui');

    if (!uiRoot || !floorPlanData?.byFloor)
        return null;

    const onApartmentSelect = options?.onApartmentSelect;
    const resolveApartmentWorldPosition = options?.resolveApartmentWorldPosition;
    const sliceModal = options?.sliceModal;
    const poiModal = options?.poiModal;
    const viewer = options?.viewer;

    let panelVisible = false;
    /** @type {number | null} */
    let activeFloor = null;
    /** @type {string | null} */
    let activeApartmentName = null;

    let mobileScaleRefOrbitDist = null;
    let mobileUiScaleSmoothed = 1;
    let mobileScaleRefCapturePending = false;
    /** @type {ReturnType<import('../ui/components/filter/filter-state.js').serializeFilterState> | null} */
    let currentFilter = null;

    /** @type {Map<string, { info: PoiInfo; el: import('../ui/components/lit/floor-poi/floor-poi-card.js').FloorPoiCard }>} */
    const poiViewsByName = new Map();

    for (const list of floorPlanData.byFloor.values()) {
        for (const info of list) {
            const name = info.name;

            if (!name || poiViewsByName.has(name))
                continue;

            const title = buildApartmentTitle(info);
            const el = buildFloorPlanPoiEl(info, title);

            uiRoot.appendChild(el);

            el.addEventListener('mousedown', event => event.stopPropagation());
            el.addEventListener('click', event => {
                event.stopPropagation();
                selectApartment(info, { nudgeCamera: true });
            });

            poiViewsByName.set(name, { info, el });
        }
    }

    const isVisibleByFilter = (/** @type {PoiInfo} */ info) => {
        if (!currentFilter)
            return true;

        return matchesFilter(info, currentFilter);
    };

    const syncActiveUi = () => {
        for (const [name, view] of poiViewsByName) {
            const isActive = name === activeApartmentName;

            view.el.selected = isActive;
            view.el.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        }
    };

    const syncFloorVisibility = () => {
        for (const [name, view] of poiViewsByName) {
            const onFloor = panelVisible && activeFloor != null && view.info.floor === activeFloor;
            const show = onFloor && isVisibleByFilter(view.info);

            view.el.classList.toggle('hidden', !show);
            view.el.setAttribute('aria-hidden', show ? 'false' : 'true');
        }
    };

    const getApartmentWorldPosition = (/** @type {PoiInfo} */ info) =>
        resolveApartmentWorldPosition?.(info) ?? null;

    const buildRestoreCamera = (/** @type {ReturnType<typeof computeFloorPlanApartmentNudgePick>} */ flyPick) => {
        if (!flyPick || !viewer?.global?.events)
            return null;

        return () => {
            const scale = isPoiNarrowViewport()
                ? POI_MODAL_RESTORE_DISTANCE_SCALE_MOBILE
                : POI_MODAL_RESTORE_DISTANCE_SCALE;
            const from = scalePickFromAwayFromTarget(flyPick.target, flyPick.fromPos, scale);

            viewer.global.events.fire('pick', flyPick.target.clone(), from);
        };
    };

    const openSliceModalForApartment = (
        /** @type {PoiInfo} */ info,
        /** @type {{ x: number; y: number; z: number }} */ worldPosition,
        /** @type {boolean} */ nudgeCamera
    ) => {
        if (!panelVisible || !sliceModal)
            return;

        poiModal?.close();

        let restoreCamera = null;

        if (viewer) {
            const cameraEntity = getMainCamera(app);
            const flyPick = nudgeCamera
                ? computeFloorPlanApartmentNudgePick(worldPosition, cameraEntity)
                : null;

            if (flyPick) {
                viewer.global.events.fire('pick', flyPick.target.clone(), flyPick.fromPos.clone());
                restoreCamera = buildRestoreCamera(flyPick);
                mobileScaleRefCapturePending = true;
                mobileUiScaleSmoothed = 1;
            }
        }

        sliceModal.open(
            info.name ?? '',
            info,
            restoreCamera
        );
    };

    const clearApartmentSelection = () => {
        activeApartmentName = null;
        syncActiveUi();
        onApartmentSelect?.(null);
    };

    sliceModal?.onClose?.(clearApartmentSelection);

    const notifyApartmentSelection = () => {
        if (!activeApartmentName)
            onApartmentSelect?.(null);
        else {
            const view = poiViewsByName.get(activeApartmentName);

            onApartmentSelect?.(view?.info ?? null);
        }
    };

    const selectApartment = (
        /** @type {PoiInfo} */ info,
        /** @type {{ notify?: boolean; nudgeCamera?: boolean; showModal?: boolean }} */ opts = {}
    ) => {
        const { notify = true, nudgeCamera = false, showModal = true } = opts;
        const name = info.name ?? null;

        activeApartmentName = name;
        syncActiveUi();

        if (!notify)
            return;

        notifyApartmentSelection();

        const worldPosition = getApartmentWorldPosition(info);

        if (worldPosition && showModal)
            openSliceModalForApartment(info, worldPosition, nudgeCamera);
    };

    const findDefaultApartmentOnFloor = (/** @type {number} */ floor) => {
        const byName = poiViewsByName.get(String(DEFAULT_FLOOR_PLAN_APARTMENT_NUMBER));

        if (byName?.info.floor === floor && isVisibleByFilter(byName.info))
            return byName.info;

        for (const view of poiViewsByName.values()) {
            if (
                view.info.number === DEFAULT_FLOOR_PLAN_APARTMENT_NUMBER
                && view.info.floor === floor
                && isVisibleByFilter(view.info)
            )
                return view.info;
        }

        for (const view of poiViewsByName.values()) {
            if (view.info.floor === floor && isVisibleByFilter(view.info))
                return view.info;
        }

        return null;
    };

    const nudgeCameraOnPanelOpen = () => {
        if (!panelVisible || activeFloor == null || activeApartmentName)
            return;

        const info = findDefaultApartmentOnFloor(activeFloor);

        if (!info)
            return;

        const worldPosition = getApartmentWorldPosition(info);

        if (!worldPosition || !viewer)
            return;

        const cameraEntity = getMainCamera(app);
        const flyPick = computeFloorPlanApartmentNudgePick(worldPosition, cameraEntity);

        if (!flyPick)
            return;

        viewer.global.events.fire('pick', flyPick.target.clone(), flyPick.fromPos.clone());
        mobileScaleRefCapturePending = true;
        mobileUiScaleSmoothed = 1;
    };

    const updateScreenPosition = () => {
        const cameraEntity = getMainCamera(app);
        const graphics = app.graphicsDevice;

        if (!cameraEntity || !graphics)
            return;

        graphics.updateClientRect();
        const { width: viewW, height: viewH } = graphics.clientRect;

        const useMobileDistanceScale = panelVisible && isPoiNarrowViewport();
        let mobileUiScale = 1;

        const visibleViews = [...poiViewsByName.values()].filter(
            view => panelVisible
                && activeFloor != null
                && view.info.floor === activeFloor
                && isVisibleByFilter(view.info)
        );

        if (useMobileDistanceScale && visibleViews.length > 0) {
            const orbitDist = getOrbitDistance(viewer);

            if (mobileScaleRefCapturePending && orbitDist != null) {
                mobileScaleRefOrbitDist = orbitDist;
                mobileScaleRefCapturePending = false;
                mobileUiScaleSmoothed = 1;
            }

            let targetScale = FLOOR_PLAN_POI_UI_SCALE_MAX_MOBILE;

            if (orbitDist != null && mobileScaleRefOrbitDist != null) {
                targetScale = Math.min(
                    targetScale,
                    computeFloorPlanPoiUiScaleFromDist(mobileScaleRefOrbitDist, orbitDist)
                );
            }

            if (mobileScaleRefOrbitDist != null) {
                mobileUiScaleSmoothed +=
                    (targetScale - mobileUiScaleSmoothed) * FLOOR_PLAN_POI_UI_SCALE_SMOOTH_MOBILE;
            }

            mobileUiScale = mobileUiScaleSmoothed;
        }

        for (const view of visibleViews) {
            const worldPosition = getApartmentWorldPosition(view.info);

            if (!worldPosition) {
                view.el.classList.add('hidden');
                continue;
            }

            const screenPosition = cameraEntity.camera.worldToScreen(worldPosition);
            const isInFront = screenPosition.z > 0;
            const isOnScreen = isInFront
                && screenPosition.x >= 0
                && screenPosition.x <= viewW
                && screenPosition.y >= 0
                && screenPosition.y <= viewH;

            const showUi = panelVisible && isOnScreen;

            view.el.style.left = `${screenPosition.x}px`;
            view.el.style.top = `${screenPosition.y}px`;

            if (useMobileDistanceScale && showUi)
                view.el.style.transform = `translate(-50%, -50%) scale(${mobileUiScale})`;
            else
                view.el.style.transform = 'translate(-50%, -50%)';

            view.el.classList.toggle('hidden', !showUi);
        }
    };

    const setActiveFloor = (/** @type {number | null} */ floor) => {
        if (activeFloor === floor)
            return;

        const hadSelection = activeApartmentName != null;

        activeFloor = floor;
        activeApartmentName = null;
        syncActiveUi();

        if (hadSelection)
            sliceModal?.close({ restoreCamera: false });

        syncFloorVisibility();
        updateScreenPosition();

        if (panelVisible)
            onApartmentSelect?.(null);
    };

    const setFloorPlanPoisVisible = (
        /** @type {boolean} */ on,
        /** @type {{ skipDefaultCameraNudge?: boolean }} */ options = {}
    ) => {
        const wasVisible = panelVisible;

        panelVisible = !!on;

        if (!panelVisible) {
            sliceModal?.close({ restoreCamera: true });
            mobileScaleRefOrbitDist = null;
            mobileScaleRefCapturePending = false;
            mobileUiScaleSmoothed = 1;
        }

        syncFloorVisibility();
        updateScreenPosition();

        if (panelVisible && !wasVisible && !options.skipDefaultCameraNudge)
            nudgeCameraOnPanelOpen();
    };

    app.on('update', updateScreenPosition);
    window.addEventListener('resize', updateScreenPosition);
    syncFloorVisibility();
    updateScreenPosition();

    const applyFilter = (
        /** @type {ReturnType<import('../ui/components/filter/filter-state.js').serializeFilterState>} */ filter
    ) => {
        currentFilter = filter;

        if (activeApartmentName) {
            const view = poiViewsByName.get(activeApartmentName);

            if (view && !isVisibleByFilter(view.info)) {
                sliceModal?.close({ restoreCamera: false });
                activeApartmentName = null;
                syncActiveUi();
                onApartmentSelect?.(null);
            }
        }

        syncFloorVisibility();
        updateScreenPosition();
    };

    return {
        setFloorPlanPoisVisible,
        setActiveFloor,
        selectApartment,
        clearApartmentSelection,
        closeSliceModal: () => sliceModal?.close({ restoreCamera: true }),
        applyFilter
    };
};
