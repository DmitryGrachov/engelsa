/**
 * lib/index.js вешает на #ui wheel с preventDefault — зум камеры вместо скролла.
 * Этот обработчик регистрируем раньше и не даём событию дойти до forwarder'а,
 * если колёсико должно прокручивать overflow-контейнер внутри UI.
 *
 * @param {HTMLElement | null | undefined} uiRoot
 */
export const installUiWheelScrollFix = (uiRoot) => {
    if (!uiRoot || uiRoot.dataset.uiWheelScrollFix === '1')
        return;

    uiRoot.dataset.uiWheelScrollFix = '1';

    /** @param {CSSStyleDeclaration} style @param {'x' | 'y'} axis */
    const hasScrollableOverflow = (style, axis) => {
        const value = axis === 'y' ? style.overflowY : style.overflowX;

        return value === 'auto' || value === 'scroll' || value === 'overlay';
    };

    /**
     * @param {HTMLElement} el
     * @param {number} deltaY
     * @param {number} deltaX
     */
    const canConsumeWheel = (el, deltaY, deltaX) => {
        const style = getComputedStyle(el);

        if (hasScrollableOverflow(style, 'y') && el.scrollHeight > el.clientHeight + 1 && deltaY !== 0) {
            const maxTop = el.scrollHeight - el.clientHeight;

            if (deltaY < 0 && el.scrollTop > 0)
                return true;

            if (deltaY > 0 && el.scrollTop < maxTop - 1)
                return true;
        }

        if (hasScrollableOverflow(style, 'x') && el.scrollWidth > el.clientWidth + 1 && deltaX !== 0) {
            const maxLeft = el.scrollWidth - el.clientWidth;

            if (deltaX < 0 && el.scrollLeft > 0)
                return true;

            if (deltaX > 0 && el.scrollLeft < maxLeft - 1)
                return true;
        }

        return false;
    };

    uiRoot.addEventListener('wheel', (event) => {
        let el = event.target instanceof Element ? event.target : null;

        while (el && el !== uiRoot) {
            if (el instanceof HTMLElement && canConsumeWheel(el, event.deltaY, event.deltaX)) {
                event.stopImmediatePropagation();

                return;
            }

            el = el.parentElement;
        }
    }, { passive: true });
};
