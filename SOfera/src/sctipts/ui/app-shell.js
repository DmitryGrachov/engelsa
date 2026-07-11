import { panel } from './components/panel.js';
import { getFavoritesApartmentsModal } from './components/lit/favorites-apartments-modal/index.js';
import { getComparisonsModal } from './components/lit/comparisons-modal/index.js';
import { getAccountModal } from './components/lit/account-modal/index.js';
import { getObjectSelectModal } from './components/lit/object-select-modal/index.js';
import { getGalleryModal } from './components/lit/gallery-modal/index.js';
import { getUserMenuModal } from './components/lit/user-menu-modal/index.js';
import { createFloorPlansDock } from './components/floor-plans-dock.js';
import { createMapModeDock } from './components/map-mode-dock.js';
import { getFloorPlanHiddenInterestTitles, PANEL_MODE_INTEREST_TITLES } from '../poi/poi-config.js';
import { mountInstructionGateIfNeeded } from './instruction-gate.js';
import { setPanelModeApplier } from './panel-mode.js';
import { closePanelModeOverlayModals } from '../poi/poi-focus.js';

/** @typedef {'house' | 'search' | 'map'} PanelMode */

/** @typedef {import('./panel-mode.js').PanelModeApplyOptions} PanelModeApplyOptions */

/** Расширенная сцена для режима «Карта» (тот же координатный контекст, больше splats). */
export const MAP_PANEL_SOG_URL = '../../models/SOfera2_big.sog';

/** Задержка перед nudge камеры при входе в «Поиск» (чтобы не перебить focus с «На 3D»). */
const SEARCH_PANEL_CAMERA_NUDGE_DELAY_MS = 120;

function fetchSogBody(/** @type {string} */ url) {
    return fetch(new URL(url, location.href).href);
}

function scheduleIdle(/** @type {() => void} */ fn) {
    if (typeof requestIdleCallback === 'function') {
        requestIdleCallback(() => fn(), { timeout: 4000 });
    } else {
        setTimeout(fn, 800);
    }
}

/**
 * Связывает панель режимов, доки и viewer.
 * @param {{
 *   poiBoxController: ReturnType<typeof import('../poi/poi-box.js').addPoiBoxModel>;
 *   interestPoisCtl: ReturnType<typeof import('../poi/interest-pois.js').createInterestPois>;
 *   viewer?: {
 *     swapGsplatContent?: (url: string, contents: Promise<Response>, options?: { panelMapView?: 'enter' | 'leave'; restoreOrbit?: boolean }) => Promise<void>;
 *     preloadGsplatScene?: (url: string, contents: Promise<Response>) => Promise<void> | undefined;
 *     resetFloorSliceToInitial?: () => void;
 *     global?: { events?: { fire?: Function; once?: Function } };
 *   };
 *   headerUi?: ReturnType<typeof import('./components/header.js').header> | null;
 *   plan2dPlanesCtl?: null | import('../floor-plan/plan-2d-glb.js').Plan2dPlanesCtl;
 *   floorPlanPoisCtl?: ReturnType<typeof import('../poi/floor-plan-pois.js').createFloorPlanPois> | null;
 *   poiModal?: ReturnType<typeof import('../poi/modal/poi-modal.js').createPoiModal> | null;
 * }} deps
 */
export function createAppShell(deps) {
    const {
        poiBoxController,
        interestPoisCtl,
        viewer,
        headerUi,
        plan2dPlanesCtl,
        floorPlanPoisCtl,
        poiModal
    } = deps;

    const panelEntity = panel();

    if (!panelEntity?.buttonsByMode || !interestPoisCtl?.setAllowedInterestTitles)
        return;

    const { buttonsByMode, favoritesButton, accountModal, filterModal } = panelEntity;
    const uiRoot = document.getElementById('ui');

    const getActivePanelMode = () => {
        if (buttonsByMode.search?.classList.contains('active'))
            return 'search';
        if (buttonsByMode.map?.classList.contains('active'))
            return 'map';
        if (buttonsByMode.house?.classList.contains('active'))
            return 'house';

        return null;
    };

    const floorPlansDock = createFloorPlansDock({
        plan2dPlanesCtl,
        poiBoxController,
        viewer,
        isSearchModeActive: () => buttonsByMode.search?.classList.contains('active') ?? false,
        onStateChange: syncFloorPlansPanelUi
    });

    /** @type {number | null} */
    let lastFloorPlanPanelFloor = null;

    const mapModeDock = createMapModeDock({ viewer });

    uiRoot?.appendChild(mapModeDock.mapTopViewDock);
    uiRoot?.appendChild(mapModeDock.mapInfraDock);
    uiRoot?.appendChild(floorPlansDock.root);

    poiModal?.setOnSlice?.(info => {
        if (!info)
            return;

        poiModal.close({ resetPoiHighlight: false });
        floorPlansDock.openForPoi(info);
    });

    function syncFloorPlansPanelUi() {
        const showFloorPlanPois = floorPlansDock.shouldShowFloorPlanPois();
        const panelFloor = floorPlansDock.getPanelFloor();
        const pendingApartment = showFloorPlanPois
            ? floorPlansDock.consumePendingApartmentOnOpen?.() ?? null
            : null;

        if (panelFloor !== lastFloorPlanPanelFloor) {
            lastFloorPlanPanelFloor = panelFloor;
        }

        floorPlanPoisCtl?.setActiveFloor?.(showFloorPlanPois ? panelFloor : null);
        floorPlanPoisCtl?.setFloorPlanPoisVisible?.(showFloorPlanPois, {
            skipDefaultCameraNudge: pendingApartment != null
        });

        if (pendingApartment) {
            floorPlanPoisCtl?.selectApartment?.(pendingApartment, {
                nudgeCamera: true,
                showModal: true
            });
        }

        if (!showFloorPlanPois) {
            lastFloorPlanPanelFloor = null;
            plan2dPlanesCtl?.resetFloorPlanTextures?.();
            floorPlanPoisCtl?.closeSliceModal?.();
        }

        const mode = getActivePanelMode();

        if (!mode)
            return;

        const baseTitles = PANEL_MODE_INTEREST_TITLES[mode] ?? [];
        const hiddenSectionTitles = new Set(getFloorPlanHiddenInterestTitles());
        const titles = floorPlansDock.isExpanded()
            ? baseTitles.filter(t => !hiddenSectionTitles.has(t))
            : baseTitles;

        interestPoisCtl.setAllowedInterestTitles(titles);
    }

    const btnMap = buttonsByMode.map;

    const setMapPanelAssetReady = (/** @type {boolean} */ ready) => {
        if (!btnMap)
            return;
        btnMap.classList.toggle('panelButtonMapPreload', !ready);
        btnMap.setAttribute('aria-busy', ready ? 'false' : 'true');
    };

    const watchMapPanelPreload = () => {
        if (!viewer?.preloadGsplatScene)
            return;
        const p = viewer.preloadGsplatScene(MAP_PANEL_SOG_URL, fetchSogBody(MAP_PANEL_SOG_URL));
        if (p && typeof p.then === 'function') {
            setMapPanelAssetReady(false);
            p.then(() => setMapPanelAssetReady(true)).catch(() => {
                setMapPanelAssetReady(false);
            });
        }
    };

    const baseSogUrl = window.sse?.config?.contentUrl ?? '../../models/SOfera2.sog';

    /** @type {PanelMode | null} */
    let currentMode = null;

    const fireViewerCameraReset = (/** @type {Event | undefined} */ event) => {
        viewer?.global?.events?.fire?.('inputEvent', 'reset', event);
    };

    const syncHeaderSliceYQuick = (/** @type {PanelMode} */ mode) => {
        const el = headerUi?.sliceYQuick;
        if (!el)
            return;
        const show = mode === 'house';
        el.classList.toggle('hidden', !show);
        el.setAttribute('aria-hidden', show ? 'false' : 'true');
    };

    const applyPanelMode = (/** @type {PanelMode} */ mode, /** @type {PanelModeApplyOptions} */ options = {}) => {
        const titles = PANEL_MODE_INTEREST_TITLES[mode];
        if (!titles) return;

        const skipCameraNudge = options.skipCameraNudge === true;

        accountModal?.close();
        closePanelModeOverlayModals();

        if (currentMode === mode)
            return;

        const prevMode = currentMode;
        currentMode = mode;

        for (const btn of Object.values(buttonsByMode))
            btn?.classList.toggle('active', false);

        buttonsByMode[mode]?.classList.add('active');

        if (mode === 'search')
            poiBoxController?.setMeshesVisible?.(true);
        else
            poiBoxController?.setMeshesVisible?.(false);

        if (prevMode === 'search' && mode !== 'search')
            viewer?.resetFloorSliceToInitial?.();

        syncHeaderSliceYQuick(mode);
        floorPlansDock.syncForMode(mode);
        syncFloorPlansPanelUi();
        mapModeDock.syncForMode(mode);

        const scheduleSearchPanelCameraNudge = (/** @type {boolean} */ fromMap) => {
            if (skipCameraNudge)
                return;

            setTimeout(() => {
                poiBoxController?.nudgeCameraForSearchPanel?.(fromMap);
            }, SEARCH_PANEL_CAMERA_NUDGE_DELAY_MS);
        };

        if (mode === 'search') {
            mountInstructionGateIfNeeded();
            scheduleSearchPanelCameraNudge(prevMode === 'map');
        }

        if (!viewer?.swapGsplatContent)
            return;

        if (mode === 'map' && prevMode !== 'map') {
            viewer.swapGsplatContent(MAP_PANEL_SOG_URL, fetchSogBody(MAP_PANEL_SOG_URL), { panelMapView: 'enter' });
        } else if (prevMode === 'map' && mode !== 'map') {
            viewer.swapGsplatContent(baseSogUrl, fetchSogBody(baseSogUrl), {
                panelMapView: 'leave',
                restoreOrbit: mode !== 'house'
            }).finally(() => {
                if (viewer?.preloadGsplatScene) {
                    scheduleIdle(() => {
                        watchMapPanelPreload();
                    });
                }
                if (mode === 'house')
                    fireViewerCameraReset();
                if (mode === 'search')
                    scheduleSearchPanelCameraNudge(false);
            });
        }
    };

    buttonsByMode.house?.addEventListener('click', (event) => {
        if (currentMode !== 'map')
            fireViewerCameraReset(event);

        applyPanelMode('house');
    });
    buttonsByMode.search?.addEventListener('click', () => applyPanelMode('search'));
    buttonsByMode.map?.addEventListener('click', () => applyPanelMode('map'));

    const syncFavoritesPanelActive = () => {
        const open = accountModal?.isOpen?.() ?? false;

        favoritesButton?.classList.toggle('active', open);

        if (open) {
            buttonsByMode.house?.classList.remove('active');
            buttonsByMode.search?.classList.remove('active');
            buttonsByMode.map?.classList.remove('active');
            return;
        }

        if (currentMode)
            buttonsByMode[currentMode]?.classList.add('active');
    };

    favoritesButton?.addEventListener('click', () => {
        const willOpen = !(accountModal?.isOpen?.() ?? false);

        if (willOpen)
            filterModal?.close?.();

        accountModal?.toggle();
        syncFavoritesPanelActive();
    });

    for (const modalId of ['accountModal', 'accountModalDesk']) {
        document.getElementById(modalId)?.addEventListener('accountmodal:change', syncFavoritesPanelActive);
    }

    document
        .querySelector('#accountModal account-mob-view')
        ?.addEventListener('account-search-apartments', () => {
            accountModal?.close();
            applyPanelMode('search');
        });

    document
        .querySelector('#accountModal account-mob-view')
        ?.addEventListener('account-open-favorites-apartments', () => {
            getFavoritesApartmentsModal().open();
        });

    getUserMenuModal();
    getObjectSelectModal();
    getGalleryModal();
    getComparisonsModal();

    uiRoot?.addEventListener('account-menu', () => {
        getUserMenuModal()?.open?.();
    });

    uiRoot?.addEventListener('favorites-apartments-menu', () => {
        getUserMenuModal()?.open?.();
    });

    uiRoot?.addEventListener('comparisons-apartments-menu', () => {
        getUserMenuModal()?.open?.();
    });

    uiRoot?.addEventListener('favorites-apartments-compare-open', () => {
        getComparisonsModal().open();
    });

    uiRoot?.addEventListener('user-menu-item', (event) => {
        const itemId = event.detail?.itemId;
        const userMenu = getUserMenuModal();

        userMenu?.close?.();

        if (itemId === 'object') {
            getFavoritesApartmentsModal()?.close?.();
            getComparisonsModal()?.close?.();
            getObjectSelectModal()?.open?.();
            return;
        }

        if (itemId === 'favorites') {
            getComparisonsModal()?.close?.();
            getFavoritesApartmentsModal().open();
        }

        if (itemId === 'compare') {
            getFavoritesApartmentsModal()?.close?.();
            getAccountModal()?.close?.();
            getComparisonsModal().open();
        }

        if (itemId === 'gallery')
            getGalleryModal()?.open?.();
    });

    applyPanelMode('house');
    setPanelModeApplier(applyPanelMode);

    setMapPanelAssetReady(false);

    if (viewer?.preloadGsplatScene && viewer.global?.events) {
        viewer.global.events.once('firstFrame', () => {
            scheduleIdle(() => {
                watchMapPanelPreload();
            });
        });
    }
}
