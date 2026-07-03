/** @typedef {'house' | 'search' | 'map'} PanelMode */

/** @typedef {{ skipCameraNudge?: boolean }} PanelModeApplyOptions */

/** @type {((mode: PanelMode, options?: PanelModeApplyOptions) => void) | null} */
let applyPanelModeFn = null;

/** @param {(mode: PanelMode, options?: PanelModeApplyOptions) => void} fn */
export const setPanelModeApplier = (fn) => {
    applyPanelModeFn = typeof fn === 'function' ? fn : null;
};

/** @param {PanelModeApplyOptions} [options] */
export const activateSearchPanelMode = (options = {}) => {
    applyPanelModeFn?.('search', options);
};
