import dataArray from '../../res/data.json';
import { mapDataItemToPoiInfo } from '../poi/poi-data.js';
import { buildFloorPlanSliceFloors } from './floor-plan-config.js';
import { resolveFloorPlanMeshName } from './floor-plan-mesh.js';

/** @typedef {import('../ui/components/lit/poi-modal/poi-modal-utils.js').PoiInfo} PoiInfo */

/** @typedef {{
 *   byName: Map<string, PoiInfo>;
 *   byFloor: Map<number, PoiInfo[]>;
 *   byMeshKey: Map<string, PoiInfo[]>;
 *   sliceFloors: number[];
 * }} FloorPlanData */

/**
 * @param {PoiInfo} a
 * @param {PoiInfo} b
 */
const compareApartments = (a, b) => {
    const sectionDiff = (a.section ?? 0) - (b.section ?? 0);

    if (sectionDiff !== 0)
        return sectionDiff;

    return (a.number ?? 0) - (b.number ?? 0);
};

/** Индекс квартир для поэтажных планов из data.json. */
export const buildFloorPlanData = () => {
    /** @type {Map<string, PoiInfo>} */
    const byName = new Map();
    /** @type {Map<number, PoiInfo[]>} */
    const byFloor = new Map();
    /** @type {Map<string, PoiInfo[]>} */
    const byMeshKey = new Map();
    /** @type {Set<number>} */
    const floors = new Set();

    for (const item of dataArray) {
        const info = mapDataItemToPoiInfo(item);
        const name = typeof info.name === 'string' ? info.name.trim() : '';

        if (!name || typeof info.floor !== 'number')
            continue;

        byName.set(name, info);
        floors.add(info.floor);

        if (!byFloor.has(info.floor))
            byFloor.set(info.floor, []);

        byFloor.get(info.floor).push(info);

        const meshKey = resolveFloorPlanMeshName(info.floor, info.section);

        if (meshKey) {
            if (!byMeshKey.has(meshKey))
                byMeshKey.set(meshKey, []);

            byMeshKey.get(meshKey).push(info);
        }
    }

    for (const list of byFloor.values())
        list.sort(compareApartments);

    for (const list of byMeshKey.values())
        list.sort(compareApartments);

    const sliceFloors = buildFloorPlanSliceFloors(floors);

    return { byName, byFloor, byMeshKey, sliceFloors };
};
