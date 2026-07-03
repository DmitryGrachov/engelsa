import { getFilterResultsModal } from '../ui/components/lit/filter-results-modal/index.js';
import { getFilterGroupVariantsModal } from '../ui/components/lit/filter-group-variants-modal/index.js';
import { getFavoritesApartmentsModal } from '../ui/components/lit/favorites-apartments-modal/index.js';
import { getComparisonsModal } from '../ui/components/lit/comparisons-modal/index.js';
import { getFilterModal } from '../ui/components/filter/index.js';
import { getPoiModal } from './modal/poi-modal.js';
import { resolvePoiInfoFromVariant } from '../ui/components/lit/filter-group-variants-modal/filter-group-variant-poi.js';
import { getPoiDesktopLayoutMediaQuery } from './poi-viewport.js';
import { activateSearchPanelMode } from '../ui/panel-mode.js';

/** @typedef {import('../ui/components/lit/filter-group-variants-modal/filter-group-variants-data.js').FilterGroupVariantItem} FilterGroupVariantItem */

/** @typedef {{
 *   focusPoiByName?: (poiName: string, options?: { openModal?: boolean }) => boolean;
 *   setMeshesVisible?: (want: boolean) => boolean;
 * }} PoiFocusController */

const DESKTOP_POI_MQ = getPoiDesktopLayoutMediaQuery();

const isDesktopPoiLayout = () =>
    typeof window !== 'undefined' && window.matchMedia(DESKTOP_POI_MQ).matches;

/** @type {PoiFocusController | null} */
let poiBoxController = null;

/** @param {PoiFocusController | null} controller */
export const setPoiFocusController = (controller) => {
    poiBoxController = controller;
};

/** Закрывает оверлеи при переключении режима панели (дом / поиск / карта). */
export const closePanelModeOverlayModals = () => {
    getFilterGroupVariantsModal()?.close?.();
    getFilterResultsModal()?.close?.();
    getComparisonsModal()?.close?.();
    getPoiModal()?.closeDetail?.();
};

/** Закрывает модалки подбора квартир (результаты, варианты группы, карточка POI). */
export const closeApartmentPickerModals = () => {
    getFilterGroupVariantsModal()?.close?.();
    getFilterResultsModal()?.close?.();
    getFavoritesApartmentsModal()?.close?.();
    getComparisonsModal()?.close?.();
    getPoiModal()?.close?.();

    if (!isDesktopPoiLayout())
        getFilterModal()?.close?.();
};

/** @typedef {{ closeModals?: boolean; openPoiModal?: boolean }} FocusApartmentOptions */

/**
 * Показывает POI-меши, закрывает модалки (по умолчанию) и фокусирует камеру на POI_<name>.
 * @param {string} poiName
 * @param {FocusApartmentOptions} [options]
 * @returns {boolean}
 */
export const focusApartmentOnScene = (poiName, options = {}) => {
    const name = String(poiName ?? '').trim();

    if (!name)
        return false;

    if (options.closeModals !== false)
        closeApartmentPickerModals();

    poiBoxController?.setMeshesVisible?.(true);

    const openPoiModal = options.openPoiModal ?? true;
    const focused =
        poiBoxController?.focusPoiByName?.(name, { openModal: openPoiModal }) ?? false;

    activateSearchPanelMode({ skipCameraNudge: true });

    return focused;
};

/** @typedef {import('../ui/components/lit/poi-modal/poi-modal-utils.js').PoiInfo} PoiInfo */

/** @param {PoiInfo | null | undefined} info @param {FocusApartmentOptions} [options] */
export const focusApartmentFromPoiInfo = (info, options = {}) => {
    const name = typeof info?.name === 'string' ? info.name.trim() : '';

    return focusApartmentOnScene(name, options);
};

/**
 * Фокус на квартире из варианта фильтра (variant.name → POI_<name>).
 * @param {FilterGroupVariantItem | null | undefined} variant
 * @param {FocusApartmentOptions} [options]
 * @returns {boolean}
 */
export const focusApartmentFromVariant = (variant, options = {}) => {
    const info = resolvePoiInfoFromVariant(variant);

    if (info)
        return focusApartmentFromPoiInfo(info, options);

    const name =
        typeof variant?.name === 'string' ? variant.name.trim() : '';

    return focusApartmentOnScene(name, options);
};
