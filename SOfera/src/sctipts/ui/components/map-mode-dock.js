import { createMapInfrastructurePanel, MAP_WALK_RADIUS_INITIAL_STEP } from '../map-infrastructure-panel.js';

/**
 * Док режима «Карта»: «Вид сверху» и панель инфраструктуры.
 * @param {{
 *   viewer?: {
 *     goToMapTopView?: () => void;
 *     setMapWalkRadiusActive?: (on: boolean) => void;
 *     setMapWalkRadiusStep?: (step: number) => void;
 *   };
 * }} opts
 */
export function createMapModeDock(opts = {}) {
    const { viewer } = opts;

    const mapTopViewDock = document.createElement('div');

    mapTopViewDock.id = 'mapTopViewDock';

    const mapTopViewBtn = document.createElement('button');

    mapTopViewBtn.id = 'mapTopViewBtn';
    mapTopViewBtn.type = 'button';
    mapTopViewBtn.className = 'mapTopViewBtn';
    mapTopViewBtn.textContent = 'Вид сверху';
    mapTopViewBtn.setAttribute('aria-label', 'Вид сверху');

    const mapInfraDock = document.createElement('div');

    mapInfraDock.id = 'mapInfraDock';

    const mapInfraPanel = createMapInfrastructurePanel({
        onStepChange: step => {
            viewer?.setMapWalkRadiusStep?.(step);
        },
        onClose: () => {
            mapTopViewDock.classList.remove('mapTopViewDock--infra-open');
            syncMapWalkRadius(false);
        }
    });

    const syncMapWalkRadius = (/** @type {boolean} */ on) => {
        if (on) {
            viewer?.setMapWalkRadiusActive?.(true);
            viewer?.setMapWalkRadiusStep?.(mapInfraPanel.getStep());
        } else {
            viewer?.setMapWalkRadiusActive?.(false);
        }
    };

    const showMapInfra = () => {
        mapTopViewDock.classList.add('mapTopViewDock--infra-open');
        mapInfraPanel.open();
        syncMapWalkRadius(true);
    };

    mapInfraDock.appendChild(mapTopViewBtn);
    mapTopViewDock.append(mapInfraPanel.root);

    mapTopViewBtn.addEventListener('click', e => {
        e.stopPropagation();
        viewer?.goToMapTopView?.();
    });

    return {
        mapTopViewDock,
        mapInfraDock,

        /** @param {'house' | 'search' | 'map'} mode */
        syncForMode(mode) {
            if (!mapTopViewDock.isConnected)
                return;

            const on = mode === 'map';

            mapTopViewDock.classList.toggle('mapTopViewDock--visible', on);
            mapTopViewBtn.setAttribute('aria-hidden', on ? 'false' : 'true');
            mapTopViewDock.setAttribute('aria-hidden', on ? 'false' : 'true');

            mapInfraDock.classList.toggle('mapInfraDock--visible', on);
            mapInfraDock.setAttribute('aria-hidden', on ? 'false' : 'true');

            if (!on) {
                mapTopViewDock.classList.remove('mapTopViewDock--infra-open');
                mapInfraPanel.resetForMapEnter();
                syncMapWalkRadius(false);
                viewer?.setMapWalkRadiusStep?.(MAP_WALK_RADIUS_INITIAL_STEP);
            } else {
                mapInfraPanel.resetForMapEnter();
                showMapInfra();
            }
        }
    };
}
