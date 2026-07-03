import {
    BaseElement,
    html,
    nothing,
    registerComponent
} from '../../../lit/index.js';

/** @typedef {'layout' | 'floor'} FilterMobCardPlanMode */
/** @typedef {'pending' | 'vertical' | 'horizontal'} FilterMobCardPlanSwipeAxis */

const PLAN_SWIPE_THRESHOLD_PX = 40;
const PLAN_SWIPE_AXIS_LOCK_PX = 10;

class FilterMobCardPlan extends BaseElement {
    static properties = {
        planSrc: { type: String, attribute: 'plan-src' },
        floorPlanSrc: { type: String, attribute: 'floor-plan-src' },
        viewMode: { type: String, state: true }
    };

    constructor() {
        super();
        this.planSrc = '';
        this.floorPlanSrc = '';
        /** @type {FilterMobCardPlanMode} */
        this.viewMode = 'layout';
        /** @type {{
         *   wrap: HTMLElement;
         *   pointerId: number;
         *   startX: number;
         *   startY: number;
         *   axis: FilterMobCardPlanSwipeAxis;
         * } | null} */
        this._planSwipeState = null;
        /** @type {((event: PointerEvent) => void) | null} */
        this._planSwipeDocumentMove = null;
        /** @type {((event: PointerEvent) => void) | null} */
        this._planSwipeDocumentEnd = null;
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this._clearPlanSwipeTracking();
    }

    /** @returns {FilterMobCardPlanMode[]} */
    _getPlanModes() {
        /** @type {FilterMobCardPlanMode[]} */
        const modes = [];

        if (this.planSrc)
            modes.push('layout');

        if (this.floorPlanSrc)
            modes.push('floor');

        return modes;
    }

    willUpdate(changed) {
        if (changed.has('planSrc') || changed.has('floorPlanSrc')) {
            const modes = this._getPlanModes();

            if (!modes.includes(this.viewMode))
                this.viewMode = modes[0] ?? 'layout';
        }
    }

    /** @returns {string} */
    _getActivePlanSrc() {
        if (this.viewMode === 'floor')
            return this.floorPlanSrc;

        return this.planSrc;
    }

    /** @param {FilterMobCardPlanMode} mode */
    _setViewMode(mode) {
        if (!this._getPlanModes().includes(mode))
            return;

        this.viewMode = mode;
    }

    _clearPlanSwipeTracking() {
        if (this._planSwipeDocumentMove) {
            document.removeEventListener(
                'pointermove',
                this._planSwipeDocumentMove,
                true
            );
            this._planSwipeDocumentMove = null;
        }

        if (this._planSwipeDocumentEnd) {
            document.removeEventListener(
                'pointerup',
                this._planSwipeDocumentEnd,
                true
            );
            document.removeEventListener(
                'pointercancel',
                this._planSwipeDocumentEnd,
                true
            );
            this._planSwipeDocumentEnd = null;
        }

        this._planSwipeState = null;
    }

    /** @param {Event} event */
    _stop(event) {
        event.stopPropagation();
    }

    /** @param {PointerEvent} event */
    _onPlanPointerDown(event) {
        if (event.button !== 0 || this._getPlanModes().length < 2)
            return;

        this._clearPlanSwipeTracking();

        const wrap = /** @type {HTMLElement} */ (event.currentTarget);

        const state = {
            wrap,
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            axis: /** @type {FilterMobCardPlanSwipeAxis} */ ('pending')
        };

        this._planSwipeState = state;

        /** @param {PointerEvent} moveEvent */
        const onDocumentPointerMove = (moveEvent) => {
            if (
                moveEvent.pointerId !== state.pointerId
                || state.axis !== 'pending'
            )
                return;

            const dx = moveEvent.clientX - state.startX;
            const dy = moveEvent.clientY - state.startY;
            const absDx = Math.abs(dx);
            const absDy = Math.abs(dy);

            if (
                absDx < PLAN_SWIPE_AXIS_LOCK_PX
                && absDy < PLAN_SWIPE_AXIS_LOCK_PX
            )
                return;

            if (absDy > absDx) {
                state.axis = 'vertical';
                this._clearPlanSwipeTracking();
                return;
            }

            state.axis = 'horizontal';

            if (!state.wrap.hasPointerCapture(moveEvent.pointerId))
                state.wrap.setPointerCapture(moveEvent.pointerId);
        };

        /** @param {PointerEvent} endEvent */
        const onDocumentPointerEnd = (endEvent) => {
            if (endEvent.pointerId !== state.pointerId)
                return;

            const dx = endEvent.clientX - state.startX;
            const dy = endEvent.clientY - state.startY;
            const modes = this._getPlanModes();
            const absDx = Math.abs(dx);
            const absDy = Math.abs(dy);
            let axis = state.axis;

            if (axis === 'pending') {
                if (absDy > absDx && absDy >= PLAN_SWIPE_AXIS_LOCK_PX)
                    axis = 'vertical';
                else if (absDx > absDy && absDx >= PLAN_SWIPE_AXIS_LOCK_PX)
                    axis = 'horizontal';
            }

            if (state.wrap.hasPointerCapture(endEvent.pointerId))
                state.wrap.releasePointerCapture(endEvent.pointerId);

            if (
                axis === 'horizontal'
                && modes.length >= 2
                && absDx >= PLAN_SWIPE_THRESHOLD_PX
                && absDx > absDy
            ) {
                const currentIndex = modes.indexOf(this.viewMode);
                let nextMode = null;

                if (dx < 0 && currentIndex < modes.length - 1)
                    nextMode = modes[currentIndex + 1];
                else if (dx > 0 && currentIndex > 0)
                    nextMode = modes[currentIndex - 1];

                if (nextMode)
                    queueMicrotask(() => this._setViewMode(nextMode));
            }

            this._clearPlanSwipeTracking();
        };

        this._planSwipeDocumentMove = onDocumentPointerMove;
        this._planSwipeDocumentEnd = onDocumentPointerEnd;

        document.addEventListener('pointermove', onDocumentPointerMove, true);
        document.addEventListener('pointerup', onDocumentPointerEnd, true);
        document.addEventListener('pointercancel', onDocumentPointerEnd, true);
    }

    /** @param {FilterMobCardPlanMode} mode @param {Event} event */
    _onPlanDotClick(mode, event) {
        this._stop(event);
        this._setViewMode(mode);
    }

    render() {
        const modes = this._getPlanModes();
        const planSrc = this._getActivePlanSrc();
        const hasSwipe = modes.length > 1;
        const planViewMode = modes.includes(this.viewMode)
            ? this.viewMode
            : (modes[0] ?? 'layout');

        return html`
            <div class="filterMobCardPlanSection">
                <div class="filterMobCardPlan">
                    <slot></slot>

                    <div
                        class="filterMobCardPlanWrap ${hasSwipe ? 'filterMobCardPlanWrap--swipeable' : ''}"
                        @pointerdown=${this._onPlanPointerDown}
                    >
                        ${planSrc ? html`
                            <img
                                class="filterMobCardPlanImg"
                                src=${planSrc}
                                alt=""
                                loading="lazy"
                                decoding="async"
                                draggable="false"
                            />
                        ` : nothing}
                    </div>
                </div>

                ${hasSwipe ? html`
                    <div
                        class="filterMobCardPlanDots"
                        role="tablist"
                        aria-label="План"
                    >
                        ${modes.includes('layout') ? html`
                            <button
                                type="button"
                                class="filterMobCardPlanDot ${planViewMode === 'layout' ? 'filterMobCardPlanDot--active' : ''}"
                                role="tab"
                                aria-label="Планировка"
                                aria-selected=${planViewMode === 'layout' ? 'true' : 'false'}
                                @click=${(event) => this._onPlanDotClick('layout', event)}
                                @pointerdown=${this._stop}
                            ></button>
                        ` : nothing}
                        ${modes.includes('floor') ? html`
                            <button
                                type="button"
                                class="filterMobCardPlanDot ${planViewMode === 'floor' ? 'filterMobCardPlanDot--active' : ''}"
                                role="tab"
                                aria-label="План этажа"
                                aria-selected=${planViewMode === 'floor' ? 'true' : 'false'}
                                @click=${(event) => this._onPlanDotClick('floor', event)}
                                @pointerdown=${this._stop}
                            ></button>
                        ` : nothing}
                    </div>
                ` : nothing}
            </div>
        `;
    }
}

registerComponent('filter-mob-card-plan', FilterMobCardPlan);

export { FilterMobCardPlan };
