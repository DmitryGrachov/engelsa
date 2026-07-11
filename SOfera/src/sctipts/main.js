import { main } from '../../lib/index.js';
import { initMetrics } from '../../lib/metrics.js';
import { initFavorites } from '../../lib/favorites.js';
import { initComparisons } from '../../lib/comparisons.js';
import { applyPosterIfNeeded } from './utils/poster.js';
import { INTEREST_POIS } from './poi/poi-config.js';
import { loadPoiInfoByName } from './poi/poi-data.js';
import { createPoiModal } from './poi/modal/poi-modal.js';
import { createFloorPlanSliceModal } from './floor-plan/floor-plan-slice-modal.js';
import { addPoiBoxModel, bindPoiOpacityBlendButton } from './poi/poi-box.js';
import { setPoiFocusController } from './poi/poi-focus.js';
import { bindFilterToPoiBoxes } from './poi/filter-poi-bind.js';
import { createFloorPlanPois } from './poi/floor-plan-pois.js';
import { createInterestPois } from './poi/interest-pois.js';
import { mountAppUi } from './ui/index.js';
import { installUiWheelScrollFix } from './ui/ui-wheel-scroll-fix.js';
import { installEngineTextInputKeyboardGuard } from './ui/engine-keyboard-guard.js';
import { syncBackbufferMsaaForPoiVisibility } from './poi/poi-msaa-sync.js';
import { bindCanvasQuarterResButton } from './dev/canvas-quarter-res-button.js';
import { bindFloorSliceUi } from './floor-plan/floor-slice-ui.js';
import { addPlan2dGlb } from './floor-plan/plan-2d-glb.js';
import { buildFloorPlanData } from './floor-plan/floor-plan-data.js';

const { config, settings } = window.sse;
const { poster } = config;

applyPosterIfNeeded(poster);

// Точка входа: запускает viewer, данные POI и UI.
document.addEventListener('DOMContentLoaded', async () => {
    initMetrics();

    installUiWheelScrollFix(document.getElementById('ui'));

    const canvas = document.getElementById('application-canvas');
    const settingsJson = await settings;
    const viewer = await main(canvas, settingsJson, config);

    installEngineTextInputKeyboardGuard(viewer);

    const app = viewer.global.app;
    const floorPlanData = buildFloorPlanData();

    const plan2dPlanesCtl = await addPlan2dGlb(app, {
        sliceFloors: floorPlanData.sliceFloors,
        getMeshApartments: meshKey => floorPlanData.byMeshKey.get(meshKey) ?? []
    });

    /* POI по умолчанию скрыты — MSAA выключаем, пока слой не включили (?noaa отключает всю эту схему). */
    syncBackbufferMsaaForPoiVisibility(app, false);

    initFavorites();
    initComparisons();
    const poiInfoByName = await loadPoiInfoByName();
    const poiModal = createPoiModal();
    const floorPlanSliceModal = createFloorPlanSliceModal();

    const poiBoxController = addPoiBoxModel(app, poiInfoByName, poiModal, viewer);

    setPoiFocusController(poiBoxController);

    bindPoiOpacityBlendButton(document.getElementById('poiOpacityBlendMode'), poiBoxController);
    bindCanvasQuarterResButton(document.getElementById('canvasQuarterRes'), viewer);

    const interestPoisCtl = createInterestPois(app, INTEREST_POIS, { poiBoxController });
    const floorPlanPoisCtl = createFloorPlanPois(app, floorPlanData, {
        sliceModal: floorPlanSliceModal,
        poiModal,
        viewer,
        resolveApartmentWorldPosition: info =>
            plan2dPlanesCtl?.resolveApartmentWorldPosition?.(info) ?? null,
        onApartmentSelect: info => {
            plan2dPlanesCtl?.setApartmentFloorPlan?.(info ?? null);
        }
    });
    bindFilterToPoiBoxes(poiBoxController, floorPlanPoisCtl);
    mountAppUi(viewer, {
        poiBoxController,
        interestPoisCtl,
        plan2dPlanesCtl,
        floorPlanPoisCtl,
        poiModal
    });
    bindFloorSliceUi(viewer);
});
