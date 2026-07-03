import {
    BaseElement,
    html,
    nothing,
    registerComponent
} from '../../../lit/index.js';
import { assetUrl } from '../../../../utils/asset-url.js';

/** @typedef {'pending' | 'vertical' | 'horizontal'} GalleryCarouselSwipeAxis */

const SWIPE_THRESHOLD_PX = 40;
const SWIPE_AXIS_LOCK_PX = 10;

class GalleryCarousel extends BaseElement {
    static properties = {
        images: { type: Array },
        index: { type: Number },
        swipeHintHidden: { type: Boolean, state: true }
    };

    constructor() {
        super();
        this.images = [];
        this.index = 0;
        this.swipeHintHidden = false;
        /** @type {{
         *   wrap: HTMLElement;
         *   pointerId: number;
         *   startX: number;
         *   startY: number;
         *   axis: GalleryCarouselSwipeAxis;
         * } | null} */
        this._swipeState = null;
        /** @type {((event: PointerEvent) => void) | null} */
        this._swipeDocumentMove = null;
        /** @type {((event: PointerEvent) => void) | null} */
        this._swipeDocumentEnd = null;
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this._clearSwipeTracking();
    }

    willUpdate(changed) {
        if (changed.has('images')) {
            const total = this.images.length;

            if (!total)
                this.index = 0;
            else if (this.index >= total)
                this.index = total - 1;

            this.swipeHintHidden = false;
        }
    }

    /** @param {number} next */
    setIndex(next) {
        const total = this.images.length;

        if (!total)
            return;

        this.index = Math.max(0, Math.min(total - 1, next));
    }

    _clearSwipeTracking() {
        if (this._swipeDocumentMove) {
            document.removeEventListener(
                'pointermove',
                this._swipeDocumentMove,
                true
            );
            this._swipeDocumentMove = null;
        }

        if (this._swipeDocumentEnd) {
            document.removeEventListener(
                'pointerup',
                this._swipeDocumentEnd,
                true
            );
            document.removeEventListener(
                'pointercancel',
                this._swipeDocumentEnd,
                true
            );
            this._swipeDocumentEnd = null;
        }

        this._swipeState = null;
    }

    /** @param {Event} event */
    _stop(event) {
        event.stopPropagation();
    }

    /** @param {PointerEvent} event */
    _onPointerDown(event) {
        if (event.button !== 0 || this.images.length < 2)
            return;

        this._clearSwipeTracking();

        const wrap = /** @type {HTMLElement} */ (event.currentTarget);
        const state = {
            wrap,
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            axis: /** @type {GalleryCarouselSwipeAxis} */ ('pending')
        };

        this._swipeState = state;

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
                absDx < SWIPE_AXIS_LOCK_PX
                && absDy < SWIPE_AXIS_LOCK_PX
            )
                return;

            if (absDy > absDx) {
                state.axis = 'vertical';
                this._clearSwipeTracking();
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
            const absDx = Math.abs(dx);
            const absDy = Math.abs(dy);
            let axis = state.axis;

            if (axis === 'pending') {
                if (absDy > absDx && absDy >= SWIPE_AXIS_LOCK_PX)
                    axis = 'vertical';
                else if (absDx > absDy && absDx >= SWIPE_AXIS_LOCK_PX)
                    axis = 'horizontal';
            }

            if (state.wrap.hasPointerCapture(endEvent.pointerId))
                state.wrap.releasePointerCapture(endEvent.pointerId);

            if (
                axis === 'horizontal'
                && this.images.length >= 2
                && absDx >= SWIPE_THRESHOLD_PX
                && absDx > absDy
            ) {
                this.swipeHintHidden = true;

                if (dx < 0 && this.index < this.images.length - 1)
                    this.setIndex(this.index + 1);
                else if (dx > 0 && this.index > 0)
                    this.setIndex(this.index - 1);
            }

            this._clearSwipeTracking();
        };

        this._swipeDocumentMove = onDocumentPointerMove;
        this._swipeDocumentEnd = onDocumentPointerEnd;

        document.addEventListener('pointermove', onDocumentPointerMove, true);
        document.addEventListener('pointerup', onDocumentPointerEnd, true);
        document.addEventListener('pointercancel', onDocumentPointerEnd, true);
    }

    /** @param {Event} event */
    _onTourClick(event) {
        this._stop(event);
        this.dispatchEvent(new CustomEvent('gallery-tour', { bubbles: true }));
    }

    render() {
        const images = Array.isArray(this.images) ? this.images : [];
        const total = images.length;
        const currentSrc = total ? images[this.index] : '';
        const swipeable = total > 1;
        const tourIconSrc = assetUrl('./assets/icons/details/person_white.svg');
        const swipeHintSrc = assetUrl('./assets/icons/details/swipe.svg');

        return html`
            <div class="galleryCarousel">
                <div
                    class="galleryCarouselFrame ${swipeable ? 'galleryCarouselFrame--swipeable' : ''}"
                    @pointerdown=${this._onPointerDown}
                >
                    ${currentSrc ? html`
                        <img
                            class="galleryCarouselImg"
                            src=${currentSrc}
                            alt=""
                            draggable="false"
                            loading="lazy"
                            decoding="async"
                        />
                    ` : nothing}

                    ${!this.swipeHintHidden && swipeable ? html`
                        <div class="galleryCarouselOverlay" aria-hidden="true">
                            <img
                                class="galleryCarouselSwipeHint"
                                src=${swipeHintSrc}
                                alt=""
                                draggable="false"
                            />
                        </div>
                    ` : nothing}

                    <button
                        type="button"
                        class="galleryCarouselTourBtn"
                        @click=${this._onTourClick}
                        @pointerdown=${this._stop}
                    >
                        <span>3D Тур</span>
                        <img
                            class="galleryCarouselTourBtnIcon"
                            src=${tourIconSrc}
                            alt=""
                            aria-hidden="true"
                            draggable="false"
                        />
                    </button>
                </div>

                ${total ? html`
                    <div class="galleryCarouselCounter" aria-live="polite">
                        ${this.index + 1}/${total}
                    </div>
                ` : nothing}
            </div>
        `;
    }
}

registerComponent('gallery-carousel', GalleryCarousel);

export { GalleryCarousel };
