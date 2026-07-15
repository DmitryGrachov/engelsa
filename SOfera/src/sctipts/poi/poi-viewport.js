/** Совпадает с переключением POI-модалки (poi-modal): ≥819 — десктопная панель, иначе шторка. */
export const POI_DESKTOP_LAYOUT_MIN_WIDTH_PX = 819;

/** Кнопки «Карта» / «Инфраструктура»: десктоп с 820px (моб. — ≤819). */
export const MAP_CONTROLS_DESKTOP_MIN_WIDTH_PX = 820;

/**
 * Максимальная глубина клина «орбиты» у середины экрана (px).
 * Должна совпадать с `width` у `#ui .mobileOrbitGutter` в index.css.
 */
export const MOBILE_ORBIT_GUTTER_MAX_DEPTH_PX = 76;

export const getPoiDesktopLayoutMediaQuery = () =>
    `(min-width: ${POI_DESKTOP_LAYOUT_MIN_WIDTH_PX}px)`;

export const isPoiNarrowViewport = () =>
    typeof window !== 'undefined' &&
    !window.matchMedia(getPoiDesktopLayoutMediaQuery()).matches;

/**
 * Узкий десктоп (ширина 819–899px): POI и фильтр scale 0.88. См. `media.css`.
 */
export const POI_DESKTOP_NARROW_MAX_WIDTH_PX = 899;
export const POI_DESKTOP_NARROW_WIDTH_SCALE = 0.88;

/**
 * Десктоп, низкая высота (≥900px по ширине, <900px по высоте): масштаб 2/3.
 * См. `media.css` — `.poiModalDeskPanel`, `#filterModal .filterModalShell`.
 */
export const POI_DESKTOP_COMPACT_MAX_HEIGHT_PX = 900;
export const POI_DESKTOP_COMPACT_SCALE = 2 / 3;
export const POI_DESKTOP_COMPACT_MIN_WIDTH_PX = POI_DESKTOP_NARROW_MAX_WIDTH_PX + 1;

export const getPoiDesktopNarrowWidthMediaQuery = () =>
    `(min-width: ${POI_DESKTOP_LAYOUT_MIN_WIDTH_PX}px) and (max-width: ${POI_DESKTOP_NARROW_MAX_WIDTH_PX}px)`;

export const getPoiDesktopCompactHeightMediaQuery = () =>
    `(min-width: ${POI_DESKTOP_COMPACT_MIN_WIDTH_PX}px) and (max-height: ${POI_DESKTOP_COMPACT_MAX_HEIGHT_PX - 1}px)`;

export const isPoiDesktopCompactHeight = () =>
    typeof window !== 'undefined' &&
    window.matchMedia(getPoiDesktopCompactHeightMediaQuery()).matches;

/**
 * POI_BOX touch: двойной tap при ширине ≤900px, одиночный — при ≥901px (iPad landscape и т.п.).
 * На любом touch pick без stopImmediatePropagation — см. poi-box.js.
 */
export const POI_BOX_DOUBLE_TAP_MAX_WIDTH_PX = 900;

export const isPoiBoxDoubleTapViewport = () =>
    typeof window !== 'undefined' &&
    !window.matchMedia(`(min-width: ${POI_BOX_DOUBLE_TAP_MAX_WIDTH_PX + 1}px)`).matches;

/** Активна вторая кнопка панели — «Поиск» (как у клинов орбиты на мобиле). */
export const isPanelSearchModeActive = () =>
    typeof document !== 'undefined' &&
    !!document.querySelector('#panel button[data-panel-mode="search"].active');

/**
 * Точка в клиновидной зоне у левого/правого края (верхний и нижний углы — узко, по центру экрана — шире).
 * Совпадает с `clip-path: polygon(...)` у `.mobileOrbitGutter` (прямые рёбра клина).
 * @param {number} clientX
 * @param {number} [clientY]
 */
export const isPointerInMobileOrbitGutter = (clientX, clientY) => {
    if (typeof window === 'undefined' || !isPoiNarrowViewport())
        return false;

    if (!isPanelSearchModeActive())
        return false;

    const w = window.innerWidth;
    const h = Math.max(1, window.innerHeight);
    const y =
        typeof clientY === 'number' && !Number.isNaN(clientY) ? clientY : h * 0.5;

    const yNorm = Math.min(1, Math.max(0, y / h));
    const bulge = 2 * Math.min(yNorm, 1 - yNorm);
    const depth = MOBILE_ORBIT_GUTTER_MAX_DEPTH_PX * bulge;

    if (clientX < depth)
        return true;

    if (clientX > w - depth - 1)
        return true;

    return false;
};
