import {
    getFilterState,
    subscribeFilterState
} from '../ui/components/filter/filter-store.js';

/**
 * @param {{ applyFilter?: (filter: ReturnType<typeof getFilterState>) => void } | undefined} poiBoxController
 * @param {{ applyFilter?: (filter: ReturnType<typeof getFilterState>) => void } | undefined} [floorPlanPoisController]
 */
export const bindFilterToPoiBoxes = (poiBoxController, floorPlanPoisController) => {
    const apply = (filter) => {
        poiBoxController?.applyFilter?.(filter);
        floorPlanPoisController?.applyFilter?.(filter);
    };

    apply(getFilterState());

    return subscribeFilterState(apply);
};
