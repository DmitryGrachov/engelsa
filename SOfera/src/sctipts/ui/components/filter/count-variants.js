import dataArray from '../../../../res/data.json';
import { mapDataItemToPoiInfo } from '../../../poi/poi-data.js';
import { getFilterState } from './filter-store.js';
import { matchesFilter } from './filter-match.js';

export const countMatchingVariants = () => {
    const filter = getFilterState();
    let count = 0;

    for (const item of dataArray) {
        const poiInfo = mapDataItemToPoiInfo(item);

        if (matchesFilter(poiInfo, filter))
            count++;
    }

    return count;
};
