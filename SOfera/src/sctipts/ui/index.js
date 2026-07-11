import { header } from './components/header.js';
import { createAppShell } from './app-shell.js';

/**
 * Единая точка входа для UI приложения.
 * @param {Awaited<ReturnType<typeof import('../../lib/index.js').main>> | undefined} viewer
 * @param {{
 *   poiBoxController: ReturnType<typeof import('../poi/poi-box.js').addPoiBoxModel>;
 *   interestPoisCtl: ReturnType<typeof import('../poi/interest-pois.js').createInterestPois>;
 *   plan2dPlanesCtl?: null | import('../floor-plan/plan-2d-glb.js').Plan2dPlanesCtl;
 *   floorPlanPoisCtl?: ReturnType<typeof import('../poi/floor-plan-pois.js').createFloorPlanPois> | null;
 *   poiModal?: ReturnType<typeof import('../poi/modal/poi-modal.js').createPoiModal> | null;
 * }} deps
 */
export function mountAppUi(viewer, deps) {
    const headerUi = header(viewer);

    createAppShell({
        ...deps,
        viewer,
        headerUi
    });

    return { headerUi };
}

export { header } from './components/header.js';
export { panel } from './components/panel.js';

// Новые Lit-компоненты: импортируйте из `./lit/index.js` (не реэкспортируем — lit в бандл только при использовании).
