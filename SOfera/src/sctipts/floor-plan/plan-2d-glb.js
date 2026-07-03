import { assetUrl } from '../utils/asset-url.js';
import { buildFloorPlanSliceFloors } from './floor-plan-config.js';
import { resolveFloorPlanMeshName, floorPlanMeshName, FLOOR_PLAN_MAX_SECTIONS } from './floor-plan-mesh.js';

/**
 * GLB плана 2D — `models/plan2d.glb`, в корень сцены PlayCanvas (как POI_BOX).
 * Узлы `webэтаж.секция` — меши секций; `FPOI_{Name}` — позиции меток (опционально).
 *
 * @param {import('playcanvas').Application} app
 * @param {{ sliceFloors?: number[]; getMeshApartments?: (meshKey: string) => import('../ui/components/lit/poi-modal/poi-modal-utils.js').PoiInfo[] }} [options]
 * @returns {Promise<Plan2dPlanesCtl | null>}
 */

export { floorPlanMeshName, FLOOR_PLAN_MAX_SECTIONS } from './floor-plan-mesh.js';

/** Шаг при открытии «Поэтажные планы». */
export const FLOOR_PLAN_PANEL_INITIAL_STEP = 1;

/**
 * Шаг панели для этажа среза (1 — первый этаж в sliceFloors).
 * @param {number} floor
 * @param {number[]} sliceFloors
 */
export const getFloorPlanPanelStepForFloor = (floor, sliceFloors) => {
    const index = sliceFloors.indexOf(floor);

    if (index < 0)
        return null;

    return index + 1;
};

/**
 * Открытие «Поэтажные планы»: перенос выбранной в POI_BOX квартиры только для этажей среза.
 * @param {PoiInfo | null | undefined} selectedPoi
 * @param {number[]} sliceFloors
 */
export const resolveFloorPlanOpenFromSelectedPoi = (selectedPoi, sliceFloors) => {
    const defaultStep = FLOOR_PLAN_PANEL_INITIAL_STEP;

    if (!selectedPoi || typeof selectedPoi.floor !== 'number')
        return { step: defaultStep, apartment: null };

    const step = getFloorPlanPanelStepForFloor(selectedPoi.floor, sliceFloors);

    if (step == null)
        return { step: defaultStep, apartment: null };

    return { step, apartment: selectedPoi };
};

/** Секции, видимые на одном шаге. */
const FLOOR_PLAN_VISIBLE_SECTIONS = [1, 2, 3, 4, 5];

/** @typedef {import('../ui/components/lit/poi-modal/poi-modal-utils.js').PoiInfo} PoiInfo */

/** @typedef {{
 *   setFloorPlanPanelPlaneStep: (step: number) => void;
 *   hideAllPlanPlanes: () => void;
 *   getFocusPlaneMeshInstance: () => import('playcanvas').MeshInstance | null;
 *   setApartmentFloorPlan: (info: PoiInfo | null | undefined) => void;
 *   resetFloorPlanTextures: () => void;
 *   resolveApartmentWorldPosition: (info: PoiInfo) => { x: number; y: number; z: number } | null;
 *   getPanelFloor: (step: number) => number | null;
 *   getSliceFloors: () => number[];
 *   getPanelCounter: (step: number) => number;
 *   maxStep: number;
 *   stepHasPlanes: (step: number) => boolean;
 *   canStepUp: (step: number) => boolean;
 *   canStepDown: (step: number) => boolean;
 * }} Plan2dPlanesCtl */

const PLAN_TEXTURE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.PNG', '.JPG', '.JPEG', '.WEBP'];

/**
 * @param {number[]} sliceFloors
 */
const buildStepVisiblePlanes = sliceFloors => [
    [],
    ...sliceFloors.map(floor =>
        FLOOR_PLAN_VISIBLE_SECTIONS.map(section => floorPlanMeshName(floor, section))
    )
];

/** @param {number} step @param {number[]} sliceFloors */
export const getFloorPlanPanelFloor = (step, sliceFloors) => {
    const s = Math.floor(step);

    if (s <= 0 || s > sliceFloors.length)
        return null;

    return sliceFloors[s - 1] ?? null;
};

/**
 * @param {import('playcanvas').GraphNode} root
 * @param {(name: string) => boolean} match
 */
function collectNamedNodes(root, match) {
    /** @type {Map<string, import('playcanvas').Entity>} */
    const map = new Map();

    const visit = /** @param {import('playcanvas').GraphNode} */ node => {
        const n = node.name;

        if (typeof n === 'string' && match(n))
            map.set(n, /** @type {import('playcanvas').Entity} */ (node));

        const ch = node.children;

        for (let i = 0; i < ch.length; i++)
            visit(ch[i]);
    };

    visit(root);

    return map;
}

/** @param {import('playcanvas').GraphNode} root */
function collectPlaneEntities(root) {
    return collectNamedNodes(root, name => {
        const m = name.match(/^web(\d+)\.(\d+)$/i);

        if (!m)
            return false;

        const section = Number(m[2]);

        return section >= 1 && section <= FLOOR_PLAN_MAX_SECTIONS;
    });
}

/** @param {import('playcanvas').GraphNode} root */
function collectFpoiEntities(root) {
    return collectNamedNodes(root, name => /^FPOI_/i.test(name));
}

/**
 * @param {Map<string, import('playcanvas').Entity>} fpoiEntities
 */
function buildFpoiNameIndex(fpoiEntities) {
    /** @type {Map<string, import('playcanvas').Entity>} */
    const byApartmentName = new Map();

    for (const [nodeName, entity] of fpoiEntities) {
        const m = nodeName.match(/^FPOI_(.+)$/i);

        if (m?.[1])
            byApartmentName.set(m[1], entity);
    }

    return byApartmentName;
}

/**
 * @param {import('playcanvas').GraphNode} node
 * @returns {import('playcanvas').MeshInstance | null}
 */
function findFirstMeshInstance(node) {
    if ('findComponents' in node && typeof node.findComponents === 'function') {
        for (const rc of /** @type {import('playcanvas').Entity} */ (node).findComponents('render')) {
            const mi = rc.meshInstances?.[0];

            if (mi)
                return mi;
        }
    }

    const ch = node.children;

    for (let i = 0; i < ch.length; i++) {
        const found = findFirstMeshInstance(ch[i]);

        if (found)
            return found;
    }

    return null;
}

/**
 * @param {import('playcanvas').GraphNode} node
 */
function getNodeWorldCenter(node) {
    const mesh = findFirstMeshInstance(node);
    const center = mesh?.aabb?.center;

    if (center)
        return { x: center.x, y: center.y, z: center.z };

    if ('getPosition' in node && typeof node.getPosition === 'function') {
        const p = node.getPosition();

        return { x: p.x, y: p.y, z: p.z };
    }

    return null;
}

/**
 * @param {Map<string, import('playcanvas').Entity>} planeEntities
 * @param {string} name
 */
function getPlaneMeshInstance(planeEntities, name) {
    const ent = planeEntities.get(name);

    if (!ent)
        return null;

    return findFirstMeshInstance(ent);
}

/**
 * @param {import('playcanvas').MeshInstance} meshInstance
 * @param {number} index
 * @param {number} total
 */
function layoutPositionInMeshAabb(meshInstance, index, total) {
    const center = meshInstance.aabb?.center;
    const half = meshInstance.aabb?.halfExtents;

    if (!center || !half || total <= 0)
        return null;

    const t = (index + 0.5) / total;

    return {
        x: center.x - half.x + half.x * 2 * t,
        y: center.y + 0.02,
        z: center.z
    };
}

/**
 * @param {import('playcanvas').Application} app
 * @param {string} path
 */
function loadPlanTexturePath(app, path) {
    return new Promise((resolve, reject) => {
        const trimmed = String(path || '').trim();

        if (!trimmed) {
            reject(new Error('[PLAN_2D] empty texture path'));
            return;
        }

        const hasExt = /\.[a-z0-9]+$/i.test(trimmed);

        const tryLoad = (/** @type {string} */ url) =>
            new Promise((res, rej) => {
                app.assets.loadFromUrl(url, 'texture', (err, asset) => {
                    if (err || !asset?.resource)
                        rej(err ?? new Error(`texture load failed: ${url}`));
                    else
                        res(asset.resource);
                });
            });

        if (hasExt) {
            tryLoad(assetUrl(trimmed)).then(resolve).catch(reject);
            return;
        }

        const tryNext = (/** @type {string[]} */ exts) => {
            if (!exts.length) {
                reject(new Error(`[PLAN_2D] texture not found: ${trimmed}`));
                return;
            }

            const [ext, ...rest] = exts;

            tryLoad(assetUrl(`${trimmed}${ext}`))
                .then(resolve)
                .catch(() => tryNext(rest));
        };

        tryNext(PLAN_TEXTURE_EXTENSIONS);
    });
}

/**
 * @param {import('playcanvas').Application} app
 * @param {Map<string, import('playcanvas').Entity>} planeEntities
 * @param {Map<string, import('playcanvas').Entity>} fpoiByApartmentName
 * @param {number[]} sliceFloors
 * @param {number[][]} stepVisiblePlanes
 * @param {(meshKey: string) => PoiInfo[]} getMeshApartments
 */
function makePlanesCtl(app, planeEntities, fpoiByApartmentName, sliceFloors, stepVisiblePlanes, getMeshApartments) {
    const maxStep = stepVisiblePlanes.length - 1;

    /** @type {Map<string, { material: import('playcanvas').StandardMaterial; defaultDiffuse: import('playcanvas').Texture | null }>} */
    const meshMaterials = new Map();
    /** @type {Map<string, import('playcanvas').Texture>} */
    const textureCache = new Map();
    /** @type {Map<string, Promise<import('playcanvas').Texture>>} */
    const textureLoads = new Map();

    for (const meshName of planeEntities.keys()) {
        const mesh = getPlaneMeshInstance(planeEntities, meshName);

        if (!mesh?.material)
            continue;

        const material = /** @type {import('playcanvas').StandardMaterial} */ (mesh.material.clone());

        mesh.material = material;
        meshMaterials.set(meshName, {
            material,
            defaultDiffuse: material.diffuseMap ?? null
        });
    }

    const focusMeshName = sliceFloors.length
        ? floorPlanMeshName(sliceFloors[0], 1)
        : null;

    const applyStep = (/** @type {number} */ step) => {
        const s = Math.max(0, Math.min(maxStep, Math.floor(step)));
        const allow = new Set(stepVisiblePlanes[s]);

        for (const [name, ent] of planeEntities)
            ent.enabled = allow.has(name);
    };

    const ensureTexture = (/** @type {string} */ path) => {
        const cached = textureCache.get(path);

        if (cached)
            return Promise.resolve(cached);

        const inflight = textureLoads.get(path);

        if (inflight)
            return inflight;

        const loadPromise = loadPlanTexturePath(app, path)
            .then(texture => {
                textureCache.set(path, texture);
                textureLoads.delete(path);

                return texture;
            })
            .catch(err => {
                textureLoads.delete(path);
                console.error(err);
                throw err;
            });

        textureLoads.set(path, loadPromise);

        return loadPromise;
    };

    const applyTextureToMesh = (/** @type {string} */ meshName, /** @type {import('playcanvas').Texture | null} */ texture) => {
        const entry = meshMaterials.get(meshName);

        if (!entry)
            return;

        entry.material.diffuseMap = texture;
        entry.material.update();
        app.renderNextFrame = true;
    };

    const resetAllMeshTextures = () => {
        for (const [, entry] of meshMaterials) {
            entry.material.diffuseMap = entry.defaultDiffuse;
            entry.material.update();
        }

        app.renderNextFrame = true;
    };

    /** @type {PoiInfo | null} */
    let selectedApartment = null;

    const applySelectedApartmentTexture = () => {
        resetAllMeshTextures();

        if (!selectedApartment)
            return;

        const meshName = resolveFloorPlanMeshName(selectedApartment.floor, selectedApartment.section);
        const texturePath = selectedApartment.filePlanOnFloor;

        if (!meshName || !texturePath)
            return;

        const capturedName = selectedApartment.name;

        ensureTexture(texturePath)
            .then(texture => {
                if (selectedApartment?.name !== capturedName)
                    return;

                applyTextureToMesh(meshName, texture);
            })
            .catch(() => {});
    };

    const resetFloorPlanTextures = () => {
        selectedApartment = null;
        resetAllMeshTextures();
    };

    const setApartmentFloorPlan = (/** @type {PoiInfo | null | undefined} */ info) => {
        selectedApartment = info ?? null;
        applySelectedApartmentTexture();
    };

    const resolveApartmentWorldPosition = (/** @type {PoiInfo} */ info) => {
        const name = info.name;

        if (name) {
            const fpoi = fpoiByApartmentName.get(name);
            const pos = fpoi ? getNodeWorldCenter(fpoi) : null;

            if (pos)
                return pos;
        }

        const meshName = resolveFloorPlanMeshName(info.floor, info.section);
        const mesh = meshName ? getPlaneMeshInstance(planeEntities, meshName) : null;

        if (!mesh || !meshName)
            return null;

        const apartments = getMeshApartments(meshName);
        const index = Math.max(0, apartments.findIndex(item => item.name === info.name));
        const total = Math.max(1, apartments.length);

        return layoutPositionInMeshAabb(mesh, index, total);
    };

    return {
        setFloorPlanPanelPlaneStep: applyStep,
        hideAllPlanPlanes: () => {
            for (const [, ent] of planeEntities)
                ent.enabled = false;
        },
        getFocusPlaneMeshInstance: () =>
            focusMeshName ? getPlaneMeshInstance(planeEntities, focusMeshName) : null,
        setApartmentFloorPlan,
        resetFloorPlanTextures,
        resolveApartmentWorldPosition,
        getPanelFloor: step => getFloorPlanPanelFloor(step, sliceFloors),
        getSliceFloors: () => sliceFloors.slice(),
        getPanelCounter: step => getFloorPlanPanelFloor(step, sliceFloors) ?? 0,
        maxStep,
        stepHasPlanes: step => {
            const s = Math.max(0, Math.min(maxStep, Math.floor(step)));

            return stepVisiblePlanes[s].length > 0;
        },
        canStepUp: step => step > 0 && stepVisiblePlanes[Math.max(0, Math.floor(step) - 1)]?.length > 0,
        canStepDown: step =>
            step < maxStep && stepVisiblePlanes[Math.min(maxStep, Math.floor(step) + 1)]?.length > 0
    };
}

/**
 * @param {import('playcanvas').Application} app
 * @param {{ sliceFloors?: number[]; getMeshApartments?: (meshKey: string) => PoiInfo[] }} [options]
 */
export function addPlan2dGlb(app, options = {}) {
    const sliceFloors = options.sliceFloors?.length
        ? options.sliceFloors
        : buildFloorPlanSliceFloors([9, 8, 7, 6, 5, 4, 3, 2, 1]);
    const stepVisiblePlanes = buildStepVisiblePlanes(sliceFloors);
    const getMeshApartments = options.getMeshApartments ?? (() => []);

    return new Promise(resolve => {
        if (!app?.assets?.loadFromUrl || !app?.root) {
            resolve(null);
            return;
        }

        app.assets.loadFromUrl('../../models/plan2d.glb', 'container', (err, asset) => {
            if (err) {
                console.error('[PLAN_2D] Failed to load GLB:', err);
                resolve(null);
                return;
            }

            const entity = asset.resource.instantiateRenderEntity();

            entity.name = 'PLAN_2D';
            entity.setLocalPosition(0, 0, 0);
            entity.setLocalScale(1, 1, 1);
            entity.setEulerAngles(0, 0, 0);

            const planeEntities = collectPlaneEntities(entity);
            const fpoiByApartmentName = buildFpoiNameIndex(collectFpoiEntities(entity));
            const ctl = makePlanesCtl(
                app,
                planeEntities,
                fpoiByApartmentName,
                sliceFloors,
                stepVisiblePlanes,
                getMeshApartments
            );

            app.root.addChild(entity);
            app.renderNextFrame = true;

            resolve(ctl);
        });
    });
}
