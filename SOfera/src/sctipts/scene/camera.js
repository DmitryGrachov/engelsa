import { isPoiNarrowViewport } from '../poi/poi-viewport.js';

// Возвращает активную камеру сцены.
export const getMainCamera = (app) => {
    return app.root.findComponent('camera')?.entity ?? null;
};

// Ищет ближайший меш POI под курсором по лучу из камеры.
export const findNearestPoiMeshHit = (cameraEntity, poiEntity, x, y) => {
    const from = cameraEntity.camera.screenToWorld(
        x,
        y,
        cameraEntity.camera.nearClip
    );

    const to = cameraEntity.camera.screenToWorld(
        x,
        y,
        cameraEntity.camera.farClip
    );

    const direction = to.clone().sub(from).normalize();
    const ray = { origin: from, direction };
    const renderComponents = poiEntity.findComponents('render');

    let hitMeshInstance = null;
    let nearestDistanceSq = Infinity;

    for (const renderComponent of renderComponents) {
        const meshInstances = renderComponent.meshInstances || [];
        for (const meshInstance of meshInstances) {
            if (meshInstance.visible === false) continue;
            if (!meshInstance.aabb.intersectsRay(ray)) continue;

            const center = meshInstance.aabb.center;
            const dx = from.x - center.x;
            const dy = from.y - center.y;
            const dz = from.z - center.z;
            const distanceSq = dx * dx + dy * dy + dz * dz;
            if (distanceSq >= nearestDistanceSq) continue;

            nearestDistanceSq = distanceSq;
            hitMeshInstance = meshInstance;
        }
    }

    return hitMeshInstance;
};

// Расстояние орбиты до центра объекта, чтобы сфера с радиусом `radius` попала в кадр.
export const orbitDistanceToFrameSphere = (cameraEntity, radius, padding, app) => {
    const cam = cameraEntity.camera;
    const aspect = app.graphicsDevice.width / Math.max(1, app.graphicsDevice.height);
    let vFovDeg = cam.fov;

    if (cam.horizontalFov) {
        const h = (vFovDeg * Math.PI) / 180;
        vFovDeg = (2 * Math.atan(Math.tan(h / 2) / aspect) * 180) / Math.PI;
    }

    const vHalf = ((vFovDeg * Math.PI) / 180) * 0.5;
    const dVert = (radius * padding) / Math.sin(Math.max(1e-4, vHalf));
    const hHalf = Math.atan(Math.tan(vHalf) * aspect);
    const dHorz = (radius * padding) / Math.sin(Math.max(1e-4, hHalf));

    return Math.max(dVert, dHorz);
};

// Направление и расстояние в горизонтальной плоскости (XZ) от центра к камере подлёту.
export const horizontalTowardCamera = (camWorld, target, cameraEntity, minHorizFallback) => {
    const dx = camWorld.x - target.x;
    const dz = camWorld.z - target.z;
    let lenXZ = Math.sqrt(dx * dx + dz * dz);
    let outX;
    let outZ;

    if (lenXZ < 1e-4) {
        const fx = cameraEntity.forward.x;
        const fz = cameraEntity.forward.z;
        const lenF = Math.sqrt(fx * fx + fz * fz);

        if (lenF >= 1e-4) {
            outX = -fx / lenF;
            outZ = -fz / lenF;
        } else {
            outX = 1;
            outZ = 0;
        }

        lenXZ = minHorizFallback;
    } else {
        outX = dx / lenXZ;
        outZ = dz / lenXZ;
    }

    return { outX, outZ, horizontalDistXZ: lenXZ };
};

/** @typedef {{ x: number; z: number }} HorizontalPointXZ */

/**
 * Горизонтальное направление от центра здания к мешу (наружу от объёма POI).
 * @param {import('playcanvas').Vec3} target
 * @param {HorizontalPointXZ | null | undefined} buildingCenterXZ
 * @param {number} minHorizFallback
 */
export const horizontalOutwardFromBuilding = (target, buildingCenterXZ, minHorizFallback) => {
    if (!buildingCenterXZ)
        return null;

    const dx = target.x - buildingCenterXZ.x;
    const dz = target.z - buildingCenterXZ.z;
    const lenXZ = Math.sqrt(dx * dx + dz * dz);

    if (lenXZ < 1e-4)
        return null;

    return { outX: dx / lenXZ, outZ: dz / lenXZ, horizontalDistXZ: lenXZ };
};

/**
 * Сторона подлёта: с текущей позиции камеры, но если она «внутри» дома — снаружи (от центра POI).
 * @param {import('playcanvas').Vec3} camWorld
 * @param {import('playcanvas').Vec3} target
 * @param {HorizontalPointXZ | null | undefined} buildingCenterXZ
 */
export const resolvePoiApproachHorizontal = (
    camWorld,
    target,
    buildingCenterXZ,
    cameraEntity,
    minHorizFallback
) => {
    const towardCam = horizontalTowardCamera(camWorld, target, cameraEntity, minHorizFallback);
    const outward = horizontalOutwardFromBuilding(target, buildingCenterXZ, minHorizFallback);

    if (!outward)
        return towardCam;

    const dot = towardCam.outX * outward.outX + towardCam.outZ * outward.outZ;

    if (dot < 0) {
        return {
            outX: outward.outX,
            outZ: outward.outZ,
            horizontalDistXZ: towardCam.horizontalDistXZ
        };
    }

    return towardCam;
};

/**
 * Та же линия «цель → позиция камеры», но расстояние умножено на scale (для возврата после модалки POI чуть дальше).
 * @param {import('playcanvas').Vec3} target
 * @param {import('playcanvas').Vec3} fromPos
 */
export const scalePickFromAwayFromTarget = (target, fromPos, scale) => {
    const out = fromPos.clone();

    out.x = target.x + (fromPos.x - target.x) * scale;
    out.y = target.y + (fromPos.y - target.y) * scale;
    out.z = target.z + (fromPos.z - target.z) * scale;

    return out;
};

/** На сколько отодвинуть камеру при закрытии карточки квартиры (относительно подлёта moveCamera), десктоп. */
export const POI_MODAL_RESTORE_DISTANCE_SCALE = 2;
/** То же на узкой вьюпорте (<820px). */
export const POI_MODAL_RESTORE_DISTANCE_SCALE_MOBILE = 1.4;
/** На мобильной вьюпорте подлёт чуть ближе к мешу (множитель к расчётному расстоянию). */
export const POI_APPROACH_DISTANCE_FACTOR_MOBILE = 1;

/**
 * Целевая горизонтальная дистанция камеры от центра POI — режим «Поиск» с панели (метры в XZ).
 * Применяется как есть, только нижний порог `minD` (0.4). Раньше сверху резали `framedDist` у мелких
 * мешей — из‑за этого любые значения ≥ framedDist выглядели «без эффекта».
 */
export const PANEL_SEARCH_ORBIT_DIST_XZ = 1.5;
/** То же на узкой вьюпорте. */
export const PANEL_SEARCH_ORBIT_DIST_XZ_MOBILE = 1;

/**
 * Доп. поворот орбиты в плоскости XZ (°) при подлёте к секции interest POI.
 * Положительное — влево от базового ракурса «Поиск»; отрицательное — вправо.
 */
export const INTEREST_SECTION_ORBIT_YAW_DEG = -50;

/** @typedef {{ x: number; y: number; z: number }} WorldPoint */

/**
 * Точка обзора при включении «Поиск» с панели (мировые координаты, без POI-меша).
 * Подкручивай x/y/z и дистанцию (`PANEL_SEARCH_ORBIT_DIST_XZ*`) отдельно.
 */
export const PANEL_SEARCH_FOCUS_TARGET = { x: 1.3, y: 0.5, z: -0.1};

/**
 * Горизонтальное направление подлёта для «Поиск» с панели.
 * Не зависит от текущей позиции камеры — иначе первый клик после свободного орбита даёт «кривой» ракурс.
 */
export const resolvePanelSearchApproachHorizontal = (target, buildingCenterXZ, minHorizFallback) => {
    const outward = horizontalOutwardFromBuilding(target, buildingCenterXZ, minHorizFallback);

    if (outward)
        return outward;

    return { outX: 0, outZ: 1, horizontalDistXZ: minHorizFallback };
};

/**
 * Поворот горизонтального смещения камеры вокруг цели (ось Y вверх).
 * @param {number} offsetX
 * @param {number} offsetZ
 * @param {number} yawDeg градусы; + — против часовой (вид сверху), «влево» по орбите
 */
export const rotateHorizontalOffsetAroundY = (offsetX, offsetZ, yawDeg) => {
    if (!yawDeg)
        return { x: offsetX, z: offsetZ };

    const rad = (yawDeg * Math.PI) / 180;
    const c = Math.cos(rad);
    const s = Math.sin(rad);

    return {
        x: offsetX * c - offsetZ * s,
        z: offsetX * s + offsetZ * c
    };
};

/**
 * Цель и позиция камеры для подлёта к точке «Поиск» с панели (без события pick).
 * @param {WorldPoint} worldTarget
 * @param {import('playcanvas').Entity} cameraEntity
 * @param {number} [horizontalDistXZ]
 * @param {HorizontalPointXZ | null | undefined} [buildingCenterXZ]
 * @returns {{ target: import('playcanvas').Vec3; fromPos: import('playcanvas').Vec3 } | null}
 */
export const computePanelSearchFocusPick = (
    worldTarget,
    cameraEntity,
    horizontalDistXZ,
    buildingCenterXZ
) => {
    if (!cameraEntity || !worldTarget)
        return null;

    const target = cameraEntity.getPosition().clone();

    target.x = worldTarget.x;
    target.y = worldTarget.y;
    target.z = worldTarget.z;

    const minD = 0.4;
    const minHorizFallback = minD * 12;
    const fixed =
        typeof horizontalDistXZ === 'number' && Number.isFinite(horizontalDistXZ)
            ? horizontalDistXZ
            : (isPoiNarrowViewport() ? PANEL_SEARCH_ORBIT_DIST_XZ_MOBILE : PANEL_SEARCH_ORBIT_DIST_XZ);
    const desiredDist = Math.max(minD, fixed);
    const { outX, outZ } = resolvePanelSearchApproachHorizontal(
        target,
        buildingCenterXZ,
        minHorizFallback
    );

    const pickTarget = target.clone();
    const pickFrom = pickTarget.clone();

    pickFrom.x += outX * desiredDist;
    pickFrom.z += outZ * desiredDist;

    return { target: pickTarget, fromPos: pickFrom };
};

/**
 * Подлёт к секции interest POI: смотрим на `worldTarget`, ракурс — как у «Поиск» с панели
 * (одно направление с фасада), а не «наружу» от центра здания к каждой секции по X.
 * Настройка ракурса: `PANEL_SEARCH_FOCUS_TARGET` + `PANEL_SEARCH_ORBIT_DIST_XZ*`.
 * Поворот орбиты влево/вправо: `INTEREST_SECTION_ORBIT_YAW_DEG`.
 * Точка обзора по длине дома: `INTEREST_SECTION_POSITIONS` в poi-config.js.
 * @param {WorldPoint} worldTarget
 * @param {import('playcanvas').Entity} cameraEntity
 * @param {number} [horizontalDistXZ]
 * @param {HorizontalPointXZ | null | undefined} [buildingCenterXZ]
 * @returns {{ target: import('playcanvas').Vec3; fromPos: import('playcanvas').Vec3 } | null}
 */
export const computeInterestSectionFocusPick = (
    worldTarget,
    cameraEntity,
    horizontalDistXZ,
    buildingCenterXZ
) => {
    if (!cameraEntity || !worldTarget)
        return null;

    const target = cameraEntity.getPosition().clone();

    target.x = worldTarget.x;
    target.y = worldTarget.y;
    target.z = worldTarget.z;

    const minD = 0.4;
    const minHorizFallback = minD * 12;
    const fixed =
        typeof horizontalDistXZ === 'number' && Number.isFinite(horizontalDistXZ)
            ? horizontalDistXZ
            : (isPoiNarrowViewport() ? PANEL_SEARCH_ORBIT_DIST_XZ_MOBILE : PANEL_SEARCH_ORBIT_DIST_XZ);
    const desiredDist = Math.max(minD, fixed);

    const referenceTarget = cameraEntity.getPosition().clone();

    referenceTarget.x = PANEL_SEARCH_FOCUS_TARGET.x;
    referenceTarget.y = PANEL_SEARCH_FOCUS_TARGET.y;
    referenceTarget.z = PANEL_SEARCH_FOCUS_TARGET.z;

    const { outX, outZ } = resolvePanelSearchApproachHorizontal(
        referenceTarget,
        buildingCenterXZ,
        minHorizFallback
    );

    const yawed = rotateHorizontalOffsetAroundY(outX, outZ, INTEREST_SECTION_ORBIT_YAW_DEG);

    const pickTarget = target.clone();
    const pickFrom = pickTarget.clone();

    pickFrom.x += yawed.x * desiredDist;
    pickFrom.z += yawed.z * desiredDist;

    return { target: pickTarget, fromPos: pickFrom };
};

/** Подлёт камеры к фиксированной точке при включении «Поиск» с панели. */
export const nudgeCameraForSearchPanelFocus = (
    viewer,
    cameraEntity,
    buildingCenterXZ,
    worldTarget = PANEL_SEARCH_FOCUS_TARGET
) => {
    const pick = computePanelSearchFocusPick(
        worldTarget,
        cameraEntity,
        undefined,
        buildingCenterXZ
    );

    if (!pick || !viewer?.global?.events)
        return;

    viewer.global.events.fire('pick', pick.target.clone(), pick.fromPos.clone());
};

/**
 * Дистанция от центра меша до камеры вдоль `node.forward`.
 * Должна быть ≤ ORBIT_DISTANCE_MAX (4) во viewer, иначе орбита клампит zoom и ломает ракурс.
 */
export const POI_MESH_ORBIT_FOCUS_DISTANCE = 0.45;

/**
 * Подлёт по мешу `POI_<name>`: центр AABB — точка взгляда, поворот узла — ракурс.
 * @param {object} hitMeshInstance
 * @returns {{ target: import('playcanvas').Vec3; fromPos: import('playcanvas').Vec3 } | null}
 */
export const computePoiMeshCameraApproachPick = (hitMeshInstance) => {
    const node = hitMeshInstance?.node;
    const center = hitMeshInstance?.aabb?.center;

    if (!node || !center || typeof node.getPosition !== 'function')
        return null;

    const viewDir = node.forward?.clone?.();

    if (!viewDir || viewDir.lengthSq() < 1e-8)
        return null;

    viewDir.normalize();

    const pickTarget = center.clone();

    const nodePos = node.getPosition();
    const distAlongView = -(
        (nodePos.x - center.x) * viewDir.x
        + (nodePos.y - center.y) * viewDir.y
        + (nodePos.z - center.z) * viewDir.z
    );

    const dist = Math.max(
        POI_MESH_ORBIT_FOCUS_DISTANCE,
        distAlongView > 1e-4 ? distAlongView : POI_MESH_ORBIT_FOCUS_DISTANCE
    );

    const fromPos = center.clone().sub(viewDir.mulScalar(dist));

    return { target: pickTarget, fromPos };
};

/**
 * @param {object} viewer
 * @param {{ target: import('playcanvas').Vec3; fromPos: import('playcanvas').Vec3 }} pick
 */
export const fireCameraPick = (viewer, pick) => {
    if (!pick || !viewer?.global?.events)
        return;

    viewer.global.events.fire(
        'pick',
        pick.target.clone(),
        pick.fromPos.clone()
    );
};

/**
 * Цель и позиция камеры для подлёта к мешу POI (без события pick).
 * @param {number} [fixedHorizontalDistanceXZ] если задано — дистанция по XZ до `fromPos` задаётся числом
 * (только `minD` снизу; без `framedDist`, см. константы панели).
 * @param {HorizontalPointXZ | null | undefined} [buildingCenterXZ] центр POI-мешей — для подлёта снаружи дома.
 * @returns {{ target: import('playcanvas').Vec3; fromPos: import('playcanvas').Vec3 } | null}
 */
export const computePoiApproachPick = (
    hitMeshInstance,
    cameraEntity,
    app,
    fixedHorizontalDistanceXZ,
    buildingCenterXZ
) => {
    const target = hitMeshInstance.aabb?.center;
    if (!target || !cameraEntity)
        return null;

    const minD = 0.4;
    const camWorld = cameraEntity.getPosition().clone();
    const { outX, outZ, horizontalDistXZ } = resolvePoiApproachHorizontal(
        camWorld,
        target,
        buildingCenterXZ,
        cameraEntity,
        minD * 12
    );

    const currentDistXZ = horizontalDistXZ;
    let desiredDist;
    if (typeof fixedHorizontalDistanceXZ === 'number' && Number.isFinite(fixedHorizontalDistanceXZ)) {
        desiredDist = Math.max(minD, fixedHorizontalDistanceXZ);
    } else {
        const he = hitMeshInstance.aabb?.halfExtents;
        const radius =
            he && typeof he.length === 'function' ? he.length() : 0.2;
        const padding = 1.25;
        const framedDist = orbitDistanceToFrameSphere(cameraEntity, radius, padding, app);

        desiredDist = Math.max(minD, Math.min(currentDistXZ, framedDist));
        if (isPoiNarrowViewport()) {
            desiredDist = Math.max(minD, desiredDist * POI_APPROACH_DISTANCE_FACTOR_MOBILE);
        }
    }

    const pickTarget = target.clone();
    const pickFrom = pickTarget.clone();

    pickFrom.x += outX * desiredDist;
    pickFrom.z += outZ * desiredDist;

    return { target: pickTarget, fromPos: pickFrom };
};

// Перемещение камеры; возвращает позы pick для повторного подлёта (например при «Назад» в POI-модалке).
export const moveCamera = (
    hitMeshInstance,
    viewer,
    cameraEntity,
    app,
    buildingCenterXZ
) => {
    const pick = computePoiMeshCameraApproachPick(hitMeshInstance)
        ?? computePoiApproachPick(hitMeshInstance, cameraEntity, app, undefined, buildingCenterXZ);
    if (!pick || !viewer?.global?.events)
        return undefined;

    fireCameraPick(viewer, pick);

    return pick;
};

/**
 * Подлёт к мешу на фиксированной горизонтальной дистанции (панель «Поиск»).
 * @param {number} [horizontalDistXZ] переопределить дистанцию; иначе константы панели по вьюпорту.
 */
/** Отступ при кадрировании плейна «Поэтажные планы» (чуть дальше типового подлёта). */
export const FLOOR_PLAN_PLANE_FRAME_PADDING = 1.48;
/** Доля вертикали в направлении «сверху под углом» (тангаж вниз на меш). */
export const FLOOR_PLAN_PLANE_VIEW_PITCH_Y = 1;
/** Доп. множитель дистанции от расчётного frame. */
export const FLOOR_PLAN_PLANE_DISTANCE_MUL = 1.12;

/**
 * Камера на меш плейна: чуть дальше, смотрит сверху под углом на центр AABB.
 * @returns {{ target: import('playcanvas').Vec3; fromPos: import('playcanvas').Vec3 } | null}
 */
export const computeFloorPlanPlaneCameraPick = (hitMeshInstance, cameraEntity, app) => {
    const center = hitMeshInstance.aabb?.center;

    if (!center || !cameraEntity)
        return null;

    const he = hitMeshInstance.aabb?.halfExtents;
    const radius =
        he && typeof he.length === 'function' ? he.length() : 0.2;
    const frameDist = orbitDistanceToFrameSphere(
        cameraEntity,
        radius,
        FLOOR_PLAN_PLANE_FRAME_PADDING,
        app
    );
    const dist = Math.max(0.5, frameDist * FLOOR_PLAN_PLANE_DISTANCE_MUL);

    const camWorld = cameraEntity.getPosition();
    const { outX, outZ } = horizontalTowardCamera(
        camWorld,
        center,
        cameraEntity,
        dist * 0.5
    );

    let hx = outX;
    let hy = FLOOR_PLAN_PLANE_VIEW_PITCH_Y;
    let hz = outZ;
    const hlen = Math.hypot(hx, hy, hz) || 1;

    hx /= hlen;
    hy /= hlen;
    hz /= hlen;

    const target = center.clone();
    const fromPos = target.clone();

    fromPos.x += hx * dist;
    fromPos.y += hy * dist;
    fromPos.z += hz * dist;

    return { target, fromPos };
};

/**
 * Фиксированная 3D-дистанция подлёта к метке квартиры (одинакова при любом угле камеры).
 */
export const FLOOR_PLAN_APARTMENT_ORBIT_DIST = 0.2;
/** То же на узкой вьюпорте. */
export const FLOOR_PLAN_APARTMENT_ORBIT_DIST_MOBILE = 0.2;

/**
 * Центрирование на метке квартиры: фиксированная дистанция, камера чуть сверху (как кадр плейна).
 * @param {{ x: number; y: number; z: number }} worldPosition
 * @returns {{ target: import('playcanvas').Vec3; fromPos: import('playcanvas').Vec3 } | null}
 */
export const computeFloorPlanApartmentNudgePick = (worldPosition, cameraEntity) => {
    if (!cameraEntity || !worldPosition)
        return null;

    const pickTarget = cameraEntity.getPosition().clone();

    pickTarget.x = worldPosition.x;
    pickTarget.y = worldPosition.y;
    pickTarget.z = worldPosition.z;

    const camWorld = cameraEntity.getPosition();
    const minD = 0.4;
    const desiredDist = Math.max(
        minD,
        isPoiNarrowViewport()
            ? FLOOR_PLAN_APARTMENT_ORBIT_DIST_MOBILE
            : FLOOR_PLAN_APARTMENT_ORBIT_DIST
    );

    const { outX, outZ } = horizontalTowardCamera(
        camWorld,
        pickTarget,
        cameraEntity,
        minD * 12
    );

    let hx = outX;
    let hy = FLOOR_PLAN_PLANE_VIEW_PITCH_Y;
    let hz = outZ;
    const hlen = Math.hypot(hx, hy, hz) || 1;

    hx /= hlen;
    hy /= hlen;
    hz /= hlen;

    const pickFrom = pickTarget.clone();

    pickFrom.x += hx * desiredDist;
    pickFrom.y += hy * desiredDist;
    pickFrom.z += hz * desiredDist;

    return { target: pickTarget, fromPos: pickFrom };
};

/** Смещение камеры к выбранной квартире на поэтажном плане. */
export const nudgeCameraTowardFloorPlanApartment = (worldPosition, viewer, cameraEntity) => {
    const pick = computeFloorPlanApartmentNudgePick(worldPosition, cameraEntity);

    if (!pick || !viewer?.global?.events)
        return;

    viewer.global.events.fire('pick', pick.target.clone(), pick.fromPos.clone());
};

/** Подлёт к мешу поэтажного плана (`web10.1` и т.п.). */
export const frameCameraOnFloorPlanPlane = (hitMeshInstance, viewer, cameraEntity, app) => {
    const pick = computeFloorPlanPlaneCameraPick(hitMeshInstance, cameraEntity, app);

    if (!pick || !viewer?.global?.events)
        return;

    viewer.global.events.fire('pick', pick.target.clone(), pick.fromPos.clone());
};

export const nudgeCameraTowardPoiMesh = (
    hitMeshInstance,
    viewer,
    cameraEntity,
    app,
    horizontalDistXZ,
    buildingCenterXZ
) => {
    const fixed =
        typeof horizontalDistXZ === 'number' && Number.isFinite(horizontalDistXZ)
            ? horizontalDistXZ
            : (isPoiNarrowViewport() ? PANEL_SEARCH_ORBIT_DIST_XZ_MOBILE : PANEL_SEARCH_ORBIT_DIST_XZ);
    const pick = computePoiApproachPick(hitMeshInstance, cameraEntity, app, fixed, buildingCenterXZ);
    if (!pick || !viewer?.global?.events)
        return;

    viewer.global.events.fire('pick', pick.target.clone(), pick.fromPos.clone());
};