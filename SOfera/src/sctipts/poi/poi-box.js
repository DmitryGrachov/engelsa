import {
    getMainCamera,
    findNearestPoiMeshHit,
    moveCamera,
    nudgeCameraForSearchPanelFocus,
    computeInterestSectionFocusPick,
    fireCameraPick,
    POI_MODAL_RESTORE_DISTANCE_SCALE,
    POI_MODAL_RESTORE_DISTANCE_SCALE_MOBILE,
    scalePickFromAwayFromTarget
} from '../scene/camera.js';
import {
    isPoiBoxDoubleTapViewport,
    isPoiNarrowViewport,
    isPointerInMobileOrbitGutter
} from './poi-viewport.js';
import { syncBackbufferMsaaForPoiVisibility } from './poi-msaa-sync.js';
import { matchesFilter } from '../ui/components/filter/filter-match.js';

/** @typedef {'msaa' | 'bayer'} PoiOpacityMode */

let activeMeshInstance = null;
/** @type {{ x: number; z: number } | null} */
let poiBuildingCenterXZ = null;

/** @param {import('playcanvas').Entity} poiEntity */
const computePoiMeshesCenterXZ = (poiEntity) => {
    let sumX = 0;
    let sumZ = 0;
    let count = 0;

    for (const renderComponent of poiEntity.findComponents('render')) {
        for (const meshInstance of renderComponent.meshInstances || []) {
            const nodeName = meshInstance.node?.name || '';

            if (isColliderPlaceholderMesh(nodeName))
                continue;

            const center = meshInstance.aabb?.center;

            if (!center)
                continue;

            sumX += center.x;
            sumZ += center.z;
            count++;
        }
    }

    if (count === 0)
        return null;

    return { x: sumX / count, z: sumZ / count };
};

/** @param {import('playcanvas').Entity} poiEntity */
const findPoiMeshInstanceByPoiName = (poiEntity, poiName) => {
    const want = `POI_${poiName}`;
    const renderComponents = poiEntity.findComponents('render');

    for (const renderComponent of renderComponents) {
        for (const meshInstance of renderComponent.meshInstances || []) {
            if ((meshInstance.node?.name || '') === want)
                return meshInstance;
        }
    }

    return null;
};

const STATUS_COLORS = {
    sold: { r: 1, g: 0.2, b: 0.2 },
    reserved: { r: 1, g: 0.85, b: 0.2 }
};

const BLEND_NONE = 3;

// BLEND_NONE + opacity: MSAA режим — alphaToCoverage; Bayer — opacityDither без MSAA backbuffer.
const configureTransparentPoiSurface = (material, /** @type {PoiOpacityMode} */ mode) => {
    material.opacity = 0.50;
    material.blendType = BLEND_NONE;

    if (mode === 'msaa') {
        material.opacityDither = 'none';
        material.opacityShadowDither = 'none';
        material.alphaToCoverage = true;
    } else {
        material.opacity = 0.50;
        material.opacityDither = 'bayer8';
        material.opacityShadowDither = 'bayer8';
        material.alphaToCoverage = false;
        material.depthWrite = true;
    }
};

const paintStatusOnPoiMaterial = (material, meshInstance, poiInfoByName) => {
    const nodeName = meshInstance.node?.name || '';
    const poiName = extractPoiName(nodeName);
    const poiInfo = poiName !== null ? poiInfoByName.get(poiName) : null;
    const st = poiInfo?.status;
    const statusColor =
        st === 'sold' || st === 'reserved' ? STATUS_COLORS[st] : null;

    if (statusColor) {
        material.diffuse.set(statusColor.r, statusColor.g, statusColor.b);
        material.emissive.set(statusColor.r, statusColor.g, statusColor.b);
        material.emissiveIntensity = 0.15;
    }
};

/** Клонируем и настраиваем материалы POI при первой загрузке GLB. */
const makePoiTransparent = (poiEntity, poiInfoByName, /** @type {PoiOpacityMode} */ mode) => {
    const renderComponents = poiEntity.findComponents('render');

    for (const renderComponent of renderComponents) {
        const meshInstances = renderComponent.meshInstances || [];

        for (const meshInstance of meshInstances) {
            const material = meshInstance.material.clone();

            configureTransparentPoiSurface(material, mode);
            paintStatusOnPoiMaterial(material, meshInstance, poiInfoByName);
            material.update();
            meshInstance.material = material;
        }
    }
};

const rebuildWhiteHighlightMaterial = meshInstance => {
    if (!meshInstance._originalMaterial) return null;

    const wm = meshInstance._originalMaterial.clone();

    wm.diffuse.set(1, 1, 1);
    wm.emissive.set(1, 1, 1);
    wm.emissiveIntensity = 1;
    wm.useLighting = false;
    wm.update();

    meshInstance._whiteMaterial = wm;

    return wm;
};

// Загружает GLB с POI-боксами и подключает обработку кликов по ним.
// Меши `POI_<Name>` — кликабельные боксы; позиция и поворот узла задают камеру при клике.
export const addPoiBoxModel = (app, poiInfoByName, poiModal, viewer) => {
    let poiEntity = null;
    let isVisible = false;
    let currentFilter = null;
    /** @type {PoiOpacityMode} */
    let poiOpacityMode = 'msaa';

    const syncMsaaBackbufferForState = () => {
        syncBackbufferMsaaForPoiVisibility(app, isVisible && poiOpacityMode === 'msaa');
    };

    const reapplyOpacityModeOnAllMeshes = () => {
        if (!poiEntity) return;

        const renderComponents = poiEntity.findComponents('render');

        for (const renderComponent of renderComponents) {
            for (const meshInstance of renderComponent.meshInstances || []) {
                const base = meshInstance._originalMaterial ?? meshInstance.material;

                configureTransparentPoiSurface(base, poiOpacityMode);
                paintStatusOnPoiMaterial(base, meshInstance, poiInfoByName);
                base.update();

                if (meshInstance._whiteMaterial) {
                    rebuildWhiteHighlightMaterial(meshInstance);

                    if (meshInstance === activeMeshInstance && meshInstance._whiteMaterial)
                        meshInstance.material = meshInstance._whiteMaterial;
                }
            }
        }

        app.renderNextFrame = true;
    };

    app.assets.loadFromUrl('../../models/MAIN_POI.glb', 'container', (err, asset) => {
        if (err) {
            console.error('Failed to load GLB:', err);
            return;
        }

        const entity = asset.resource.instantiateRenderEntity();

        entity.setLocalPosition(0.005, -0.015, -0.01);
        entity.setLocalScale(1, 1, 1);
        entity.setEulerAngles(0, 0, 0);

        entity.name = 'POI_BOX';

        app.root.addChild(entity);

        makePoiTransparent(entity, poiInfoByName, poiOpacityMode);
        entity.enabled = isVisible;
        poiEntity = entity;
        poiBuildingCenterXZ = computePoiMeshesCenterXZ(entity);

        syncMsaaBackbufferForState();

        logPoiStructure(entity);
        setupPoiBoxClick(app, entity, poiInfoByName, poiModal, viewer);
        refreshMeshFilterVisibility();
    });

    const refreshMeshFilterVisibility = () => {
        if (!poiEntity || !currentFilter)
            return;

        let activeMeshHidden = false;

        const renderComponents = poiEntity.findComponents('render');

        for (const renderComponent of renderComponents) {
            for (const meshInstance of renderComponent.meshInstances || []) {
                const nodeName = meshInstance.node?.name || '';

                if (isColliderPlaceholderMesh(nodeName))
                    continue;

                const poiName = extractPoiName(nodeName);
                const poiInfo = poiName !== null ? poiInfoByName.get(poiName) : null;
                const visible = matchesFilter(poiInfo, currentFilter);

                meshInstance.visible = visible;

                if (!visible && meshInstance === activeMeshInstance)
                    activeMeshHidden = true;
            }
        }

        if (activeMeshHidden) {
            clearActivePoiHighlight(app);
            poiModal.close();
        }

        app.renderNextFrame = true;
    };

    const applyMeshVisibility = () => {
        syncMsaaBackbufferForState();

        if (poiEntity) {
            poiEntity.enabled = isVisible;

            if (isVisible)
                refreshMeshFilterVisibility();
            else {
                clearActivePoiHighlight(app);
                poiModal.close();
            }

            app.renderNextFrame = true;
        }
    };

    return {
        toggleVisibility() {
            isVisible = !isVisible;
            applyMeshVisibility();
            return isVisible;
        },
        /** Явное включение/выключение POI-мешей (квартиры в GLB). */
        setMeshesVisible(want) {
            const v = !!want;

            if (isVisible === v)
                return isVisible;

            isVisible = v;
            applyMeshVisibility();
            return isVisible;
        },
        /** @returns {boolean} */
        getMeshesVisible: () => isVisible,

        /**
         * Подлёт к фиксированной точке (`PANEL_SEARCH_FOCUS_TARGET` в camera.js).
         * @param {boolean} [skipForMapTransition] true при переходе с «Карты» — сцена ещё подменяется.
         */
        nudgeCameraForSearchPanel(skipForMapTransition) {
            if (skipForMapTransition)
                return;

            const cameraEntity = getMainCamera(app);

            if (!cameraEntity || !viewer?.global?.events)
                return;

            const runNudge = (/** @type {number} */ attempt = 0) => {
                if (!poiBuildingCenterXZ && attempt < 120) {
                    requestAnimationFrame(() => runNudge(attempt + 1));
                    return;
                }

                nudgeCameraForSearchPanelFocus(viewer, cameraEntity, poiBuildingCenterXZ);
            };

            runNudge();
        },

        /**
         * Подлёт к interest POI (секция на карте) — та же орбита, что у «Поиск», но цель — worldTarget.
         * @param {{ x: number; y: number; z: number }} worldTarget
         */
        nudgeCameraTowardInterestPoint(worldTarget) {
            const cameraEntity = getMainCamera(app);

            if (!cameraEntity || !viewer?.global?.events || !worldTarget)
                return;

            const runNudge = (/** @type {number} */ attempt = 0) => {
                if (!poiBuildingCenterXZ && attempt < 120) {
                    requestAnimationFrame(() => runNudge(attempt + 1));
                    return;
                }

                const pick = computeInterestSectionFocusPick(
                    worldTarget,
                    cameraEntity,
                    undefined,
                    poiBuildingCenterXZ
                );

                if (pick)
                    viewer.global.events.fire('pick', pick.target.clone(), pick.fromPos.clone());
            };

            runNudge();
        },

        /** @returns {PoiOpacityMode} */
        getPoiOpacityMode: () => poiOpacityMode,

        /** @returns {PoiOpacityMode} */
        /** @param {ReturnType<import('../ui/components/filter/filter-state.js').serializeFilterState>} filter */
        applyFilter(filter) {
            currentFilter = filter;
            refreshMeshFilterVisibility();
        },

        togglePoiOpacityMode() {
            poiOpacityMode = poiOpacityMode === 'msaa' ? 'bayer' : 'msaa';
            reapplyOpacityModeOnAllMeshes();
            syncMsaaBackbufferForState();

            return poiOpacityMode;
        },

        /**
         * Белая подсветка меша POI_<name> и подлёт камеры.
         * @param {string} poiName
         * @param {{ openModal?: boolean }} [options]
         * @returns {boolean}
         */
        focusPoiByName(poiName, options = {}) {
            if (!poiEntity)
                return false;

            const hitMeshInstance = findPoiMeshInstanceByPoiName(
                poiEntity,
                String(poiName ?? '').trim()
            );

            if (!hitMeshInstance)
                return false;

            return focusPoiMeshInstance(
                app,
                viewer,
                hitMeshInstance,
                poiInfoByName,
                poiModal,
                { openModal: options.openModal === true }
            );
        },

        /** @returns {import('../ui/components/lit/poi-modal/poi-modal-utils.js').PoiInfo | null} */
        getActivePoiInfo() {
            if (!activeMeshInstance)
                return null;

            const poiName = extractPoiName(activeMeshInstance.node?.name || '');

            if (poiName === null)
                return null;

            return poiInfoByName.get(poiName) ?? null;
        }
    };
};

/**
 * Переключатель MSAA / Bayer для POI (кнопка под controlsMinimalTopRight).
 * @param {HTMLButtonElement | null} buttonEl
 * @param {{ getPoiOpacityMode?: () => string, togglePoiOpacityMode?: () => string } | undefined} controller
 */
export const bindPoiOpacityBlendButton = (buttonEl, controller) => {
    if (!buttonEl || !controller?.togglePoiOpacityMode || !controller.getPoiOpacityMode)
        return;

    const refreshUi = () => {
        const m = controller.getPoiOpacityMode();

        buttonEl.dataset.mode = m;
        buttonEl.title =
            m === 'msaa'
                ? 'POI: MSAA + alpha to coverage. Нажмите — Bayer dither'
                : 'POI: Bayer dither. Нажмите — MSAA';
    };

    buttonEl.addEventListener('click', () => {
        controller.togglePoiOpacityMode();
        refreshUi();
    });
    refreshUi();
};

// Делает меш белым
const setMeshWhite = (app, meshInstance) => {
    if (!meshInstance) return;

    if (!meshInstance._originalMaterial) {
        meshInstance._originalMaterial = meshInstance.material;

        const whiteMaterial = meshInstance.material.clone();

        whiteMaterial.diffuse.set(1, 1, 1);
        whiteMaterial.emissive.set(1, 1, 1);
        whiteMaterial.emissiveIntensity = 1;

        whiteMaterial.useLighting = false;

        whiteMaterial.update();

        meshInstance._whiteMaterial = whiteMaterial;
    }

    meshInstance.material = meshInstance._whiteMaterial;

    app.renderNextFrame = true;
};

// Сброс материала меша на дефолтный
const resetMeshMaterial = (app, meshInstance) => {
    if (!meshInstance) return;
    if (!meshInstance._originalMaterial) return;

    meshInstance.material = meshInstance._originalMaterial;

    app.renderNextFrame = true;
};

const clearActivePoiHighlight = (app) => {
    if (!activeMeshInstance) return;

    resetMeshMaterial(app, activeMeshInstance);
    activeMeshInstance = null;
};

/** Меш только под «фейковую коллизию»: COLL_1, COLL_2, … — без карточки, без подлёта камеры */
const isColliderPlaceholderMesh = nodeName => /^COLL_\d+$/.test(nodeName);

// Управляет курсором/кликом по POI-боксам и открытием карточки.
const setupPoiBoxClick = (app, poiEntity, poiInfoByName, poiModal, viewer) => {
    poiModal.setOnClose(() => clearActivePoiHighlight(app));

    const canvas = app.graphicsDevice?.canvas;

    app.mouse.on('mousemove', (event) => {
        if (!poiEntity.enabled) {
            if (canvas) canvas.style.cursor = 'default';
            return;
        }

        const cameraEntity = getMainCamera(app);

        if (!cameraEntity || !canvas) return;

        const cx = typeof event.clientX === 'number' ? event.clientX : event.x;
        const cy = typeof event.clientY === 'number' ? event.clientY : event.y;

        // Вернуть нон тачи
        // if (isPointerInMobileOrbitGutter(cx, cy)) {
        //     canvas.style.cursor = 'default';
        //     return;
        // }

        const hitMeshInstance = findNearestPoiMeshHit(cameraEntity, poiEntity, event.x, event.y);
        const nodeName = hitMeshInstance?.node?.name || '';
        const poiName = extractPoiName(nodeName);
        const hasPoiData =
            !isColliderPlaceholderMesh(nodeName)
            && poiName !== null
            && poiInfoByName.has(poiName);

        canvas.style.cursor = hitMeshInstance && hasPoiData ? 'pointer' : 'default';
    });

    /** Ширина ≤900px: открытие POI по двойному tap / двойному клику по тому же мешу. */
    const MOBILE_POI_DOUBLE_MS = 420;
    const MOBILE_POI_DOUBLE_PX = 48;
    const MOBILE_POI_TAP_MOVE_PX = 14;

    /** @type {{ t: number; x: number; y: number; mesh: object } | null} */
    let mobilePoiDoubleTapPending = null;

    /** Активные touch-pointer на canvas — отличаем pinch от tap по POI. */
    const activeTouchPointerIds = new Set();

    /** @type {Map<number, { startX: number; startY: number; suppressTap: boolean }>} */
    const touchTapTracking = new Map();

    const getCanvasPointerCoords = (event) => {
        if (!canvas)
            return { x: 0, y: 0 };

        if (typeof event.offsetX === 'number' && typeof event.offsetY === 'number')
            return { x: event.offsetX, y: event.offsetY };

        const rect = canvas.getBoundingClientRect();
        const cx = typeof event.clientX === 'number' ? event.clientX : event.x;
        const cy = typeof event.clientY === 'number' ? event.clientY : event.y;
        const scaleX = canvas.clientWidth / Math.max(1, rect.width);
        const scaleY = canvas.clientHeight / Math.max(1, rect.height);

        return {
            x: (cx - rect.left) * scaleX,
            y: (cy - rect.top) * scaleY
        };
    };

    const resolveValidPoiHit = (cameraEntity, x, y) => {
        const hitMeshInstance = findNearestPoiMeshHit(cameraEntity, poiEntity, x, y);

        if (!hitMeshInstance)
            return null;

        const nodeName = hitMeshInstance.node?.name || '';

        if (isColliderPlaceholderMesh(nodeName))
            return null;

        const poiName = extractPoiName(nodeName);

        if (poiName !== null && !poiInfoByName.has(poiName))
            return null;

        return hitMeshInstance;
    };

    const markActiveTouchesAsGesture = () => {
        for (const state of touchTapTracking.values())
            state.suppressTap = true;

        mobilePoiDoubleTapPending = null;
    };

    const matchesMobilePoiDoubleTap = (pending, hitMeshInstance, clientX, clientY, now) => {
        if (!pending || !hitMeshInstance)
            return false;

        const distSq = (clientX - pending.x) * (clientX - pending.x)
            + (clientY - pending.y) * (clientY - pending.y);

        return pending.mesh === hitMeshInstance
            && now - pending.t <= MOBILE_POI_DOUBLE_MS
            && distSq <= MOBILE_POI_DOUBLE_PX * MOBILE_POI_DOUBLE_PX;
    };

    const executePoiPickFromHit = hitMeshInstance => {
        focusPoiMeshInstance(
            app,
            viewer,
            hitMeshInstance,
            poiInfoByName,
            poiModal,
            { openModal: true }
        );
    };

    /**
     * Capture: на мыши глушим pointerdown на POI-меше.
     * На любом touch (в т.ч. iPad landscape >900px) pick только на pointerup —
     * без stopImmediatePropagation, иначе ломаются pinch/two-finger pan.
     * ≤900px: double-tap; шире + touch: single tap.
     */
    canvas.addEventListener('pointerdown', (event) => {
        if (event.pointerType === 'touch') {
            const isMultiTouch = activeTouchPointerIds.size > 0;
            const cx = typeof event.clientX === 'number' ? event.clientX : event.x;
            const cy = typeof event.clientY === 'number' ? event.clientY : event.y;

            activeTouchPointerIds.add(event.pointerId);
            touchTapTracking.set(event.pointerId, {
                startX: cx,
                startY: cy,
                suppressTap: isMultiTouch
            });

            if (isMultiTouch) {
                markActiveTouchesAsGesture();
            } else if (
                isPoiBoxDoubleTapViewport()
                && poiEntity.enabled
                && mobilePoiDoubleTapPending
            ) {
                const cameraEntity = getMainCamera(app);
                const { x, y } = getCanvasPointerCoords(event);
                const hitMeshInstance = cameraEntity
                    ? resolveValidPoiHit(cameraEntity, x, y)
                    : null;

                if (
                    hitMeshInstance
                    && matchesMobilePoiDoubleTap(
                        mobilePoiDoubleTapPending,
                        hitMeshInstance,
                        cx,
                        cy,
                        performance.now()
                    )
                ) {
                    canvas.__poiSuppressEngineDblclickUntil =
                        performance.now() + MOBILE_POI_DOUBLE_MS;
                }
            }

            return;
        }

        if (!poiEntity.enabled)
            return;

        const cameraEntity = getMainCamera(app);

        if (!cameraEntity)
            return;

        if (event.button !== 0)
            return;

        const { x, y } = getCanvasPointerCoords(event);
        const hitMeshInstance = resolveValidPoiHit(cameraEntity, x, y);

        if (!hitMeshInstance)
            return;

        event.stopImmediatePropagation();
        executePoiPickFromHit(hitMeshInstance);
    }, { capture: true });

    canvas.addEventListener('pointermove', (event) => {
        if (event.pointerType !== 'touch')
            return;

        const state = touchTapTracking.get(event.pointerId);

        if (!state || state.suppressTap)
            return;

        const cx = typeof event.clientX === 'number' ? event.clientX : event.x;
        const cy = typeof event.clientY === 'number' ? event.clientY : event.y;
        const dx = cx - state.startX;
        const dy = cy - state.startY;

        if (dx * dx + dy * dy > MOBILE_POI_TAP_MOVE_PX * MOBILE_POI_TAP_MOVE_PX)
            state.suppressTap = true;
    }, { capture: true });

    const finalizeTouchPointer = (event) => {
        if (event.pointerType !== 'touch')
            return;

        activeTouchPointerIds.delete(event.pointerId);

        const state = touchTapTracking.get(event.pointerId);

        touchTapTracking.delete(event.pointerId);

        if (!poiEntity.enabled)
            return;

        if (activeTouchPointerIds.size > 0) {
            markActiveTouchesAsGesture();

            return;
        }

        if (!state || state.suppressTap) {
            mobilePoiDoubleTapPending = null;

            return;
        }

        const cameraEntity = getMainCamera(app);

        if (!cameraEntity)
            return;

        const { x, y } = getCanvasPointerCoords(event);
        const hitMeshInstance = resolveValidPoiHit(cameraEntity, x, y);

        if (!hitMeshInstance) {
            mobilePoiDoubleTapPending = null;

            return;
        }

        const cx = typeof event.clientX === 'number' ? event.clientX : event.x;
        const cy = typeof event.clientY === 'number' ? event.clientY : event.y;
        const now = performance.now();

        // Phone / узкий viewport: открытие по double-tap.
        if (isPoiBoxDoubleTapViewport()) {
            const p = mobilePoiDoubleTapPending;

            if (matchesMobilePoiDoubleTap(p, hitMeshInstance, cx, cy, now)) {
                mobilePoiDoubleTapPending = null;
                executePoiPickFromHit(hitMeshInstance);

                return;
            }

            mobilePoiDoubleTapPending = { t: now, x: cx, y: cy, mesh: hitMeshInstance };
            canvas.__poiSuppressEngineDblclickUntil = performance.now() + MOBILE_POI_DOUBLE_MS;

            return;
        }

        // iPad / широкий touch: single tap (без SIP на down — жесты доходят до камеры).
        mobilePoiDoubleTapPending = null;
        executePoiPickFromHit(hitMeshInstance);
    };

    canvas.addEventListener('pointerup', finalizeTouchPointer, { capture: true });
    canvas.addEventListener('pointercancel', finalizeTouchPointer, { capture: true });
};

/**
 * Подсветка меша и подлёт камеры; опционально открывает карточку POI.
 * @param {import('playcanvas').AppBase} app
 * @param {object} viewer
 * @param {object} hitMeshInstance
 * @param {Map<string, object>} poiInfoByName
 * @param {{ open: Function, close: Function }} poiModal
 * @param {{ openModal?: boolean }} [options]
 * @returns {boolean}
 */
const focusPoiMeshInstance = (
    app,
    viewer,
    hitMeshInstance,
    poiInfoByName,
    poiModal,
    { openModal = false } = {}
) => {
    if (!hitMeshInstance || hitMeshInstance.visible === false)
        return false;

    const nodeName = hitMeshInstance.node?.name || '';

    if (isColliderPlaceholderMesh(nodeName))
        return false;

    const poiName = extractPoiName(nodeName);

    if (poiName !== null && !poiInfoByName.has(poiName))
        return false;

    const cameraEntity = getMainCamera(app);

    if (!cameraEntity)
        return false;

    const poiInfo = poiName !== null ? poiInfoByName.get(poiName) : null;

    if (!poiInfo) {
        clearActivePoiHighlight(app);

        if (openModal)
            poiModal.close();

        moveCamera(hitMeshInstance, viewer, cameraEntity, app, poiBuildingCenterXZ);

        return true;
    }

    if (activeMeshInstance && activeMeshInstance !== hitMeshInstance)
        resetMeshMaterial(app, activeMeshInstance);

    setMeshWhite(app, hitMeshInstance);
    activeMeshInstance = hitMeshInstance;

    const flyPick = moveCamera(
        hitMeshInstance,
        viewer,
        cameraEntity,
        app,
        poiBuildingCenterXZ
    );

    if (openModal) {
        poiModal.open(
            nodeName,
            poiInfo,
            flyPick
                ? () => {
                      const restoreScale = isPoiNarrowViewport()
                          ? POI_MODAL_RESTORE_DISTANCE_SCALE_MOBILE
                          : POI_MODAL_RESTORE_DISTANCE_SCALE;

                      const from = scalePickFromAwayFromTarget(
                          flyPick.target,
                          flyPick.fromPos,
                          restoreScale
                      );

                      fireCameraPick(
                          viewer,
                          { target: flyPick.target.clone(), fromPos: from }
                      );
                  }
                : null
        );
    }

    return true;
};

// Достает имя POI из имени меша вида POI_<name>.
const extractPoiName = nodeName => {
    const match = /^POI_(.+)$/.exec(nodeName);

    if (!match)
        return null;

    return match[1];
};

// Логирует имена мешей внутри контейнера POI для отладки.
const logPoiStructure = (poiEntity) => {
    const renderComponents = poiEntity.findComponents('render');
    const nodeNames = [];
    const seenNames = new Set();

    for (const renderComponent of renderComponents) {
        const meshInstances = renderComponent.meshInstances || [];

        for (const meshInstance of meshInstances) {
            const nodeName = meshInstance.node?.name || '(без имени)';

            if (!seenNames.has(nodeName)) {
                seenNames.add(nodeName);
                nodeNames.push(nodeName);
            }
        }
    }

    console.log(`[POI_BOX] mesh count: ${nodeNames.length}`);
    console.log('[POI_BOX] mesh nodes:', nodeNames);
};
