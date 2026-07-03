import {
    BaseElement,
    html,
    nothing,
    registerComponent
} from '../../../lit/index.js';
import { assetUrl } from '../../../../utils/asset-url.js';
import {
    formatCost,
    formatSquare,
    POI_STATUS_CLASS,
    POI_STATUS_LABELS,
    resolveFeatures,
    resolveLivingSquare,
    resolveRooms,
    resolveSection
} from './poi-modal-utils.js';

const HEART_ICON = html`
    <svg width="19" height="17" viewBox="0 0 19 17" aria-hidden="true">
        <path
            d="M2.20667 8.12727C1.81716 7.74034 1.50856 7.27977 1.29883 6.77237C1.08911 6.26498 0.98247 5.72092 0.985121 5.17191C0.985121 4.06151 1.42623 2.99659 2.2114 2.21141C2.99657 1.42624 4.06149 0.985139 5.17189 0.985139C6.72838 0.985139 8.08785 1.83234 8.80699 3.0933H9.91032C10.2759 2.45204 10.8049 1.91912 11.4435 1.5488C12.082 1.17848 12.8073 0.983995 13.5454 0.985139C14.6558 0.985139 15.7207 1.42624 16.5059 2.21141C17.2911 2.99659 17.7322 4.06151 17.7322 5.17191C17.7322 6.3245 17.2396 7.38843 16.5106 8.12727L9.35865 15.2694L2.20667 8.12727ZM17.2002 8.82671C18.1361 7.88099 18.7173 6.60033 18.7173 5.17191C18.7173 3.80024 18.1724 2.48475 17.2025 1.51483C16.2326 0.544911 14.9171 1.77834e-05 13.5454 1.77834e-05C11.8215 1.77834e-05 10.2945 0.837371 9.35865 2.13773C8.88097 1.47425 8.25197 0.934226 7.52384 0.562451C6.79571 0.190677 5.98944 -0.0021321 5.17189 1.77834e-05C3.80022 1.77834e-05 2.48473 0.544911 1.51481 1.51483C0.544894 2.48475 0 3.80024 0 5.17191C0 6.60033 0.581222 7.88099 1.51709 8.82671L9.35865 16.6683L17.2002 8.82671Z"
            fill="currentColor"
        />
    </svg>
`;

/** @typedef {'sheet' | 'desk-panel'} PoiModalDetailVariant */
/** @typedef {'layout' | 'floor' | 'gallery'} PoiModalDetailViewMode */

const PLAN_SWIPE_MODES = /** @type {const} */ (['layout', 'floor']);
const PLAN_SWIPE_THRESHOLD_PX = 40;

class PoiModalDetailView extends BaseElement {
    static properties = {
        info: { type: Object },
        planSrc: { type: String, attribute: 'plan-src' },
        floorPlanSrc: { type: String, attribute: 'floor-plan-src' },
        cardFallbackSrc: { type: String, attribute: 'card-fallback-src' },
        favorite: { type: Boolean, reflect: true },
        variant: { type: String, reflect: true },
        tagsExpanded: { type: Boolean, state: true },
        viewMode: { type: String, state: true }
    };

    constructor() {
        super();
        /** @type {import('./poi-modal-utils.js').PoiInfo | null} */
        this.info = null;
        this.planSrc = '';
        this.floorPlanSrc = '';
        this.cardFallbackSrc = '';
        this.favorite = false;
        /** @type {PoiModalDetailVariant} */
        this.variant = 'sheet';
        this.tagsExpanded = false;
        /** @type {PoiModalDetailViewMode} */
        this.viewMode = 'layout';
        /** @type {'plan' | 'fallback'} */
        this._planMode = 'plan';
        /** @type {{ el: HTMLElement; pointerId: number; startX: number; startScrollLeft: number } | null} */
        this._tagsDragState = null;
        /** @type {{ wrap: HTMLElement; pointerId: number; startX: number; startY: number } | null} */
        this._planSwipeState = null;
    }

    _canSwipePlans() {
        return !!(this.planSrc && this.floorPlanSrc);
    }

    /** @returns {'layout' | 'floor'} */
    _getTwoPlanViewMode() {
        return this.viewMode === 'floor' ? 'floor' : 'layout';
    }

    willUpdate(changed) {
        if (
            changed.has('info')
            || changed.has('planSrc')
            || changed.has('floorPlanSrc')
            || changed.has('cardFallbackSrc')
            || changed.has('viewMode')
        ) {
            const requestedSrc = this._getRequestedPlanSrc();

            this._planMode = requestedSrc ? 'plan' : 'fallback';

            if (changed.has('info'))
                this.tagsExpanded = false;
        }
    }

    /** @returns {string} */
    _getRequestedPlanSrc() {
        const mode = this._getTwoPlanViewMode();

        if (mode === 'floor')
            return this.floorPlanSrc;

        return this.planSrc;
    }

    /** @param {PoiModalDetailViewMode} mode */
    _setViewMode(mode) {
        this.viewMode = mode;
    }

    /** @param {Event} event */
    _stop(event) {
        event.stopPropagation();
    }

    /** @param {string} name */
    _emit(name) {
        this.dispatchEvent(new CustomEvent(name, { bubbles: true }));
    }

    /** @param {Event} event */
    _onCloseClick(event) {
        this._stop(event);
        this._emit('poi-close');
    }

    /** @param {Event} event */
    _onDetailsClick(event) {
        this._stop(event);
        this._emit('poi-details');
    }

    /** @param {Event} event */
    _onTourClick(event) {
        this._stop(event);
        this._emit('poi-tour');
    }

    /** @param {Event} event */
    _on3dClick(event) {
        this._stop(event);
        this._emit('poi-3d');
    }

    /** @param {Event} event */
    _onBookClick(event) {
        this._stop(event);

        const status = typeof this.info?.status === 'string' ? this.info.status : 'active';

        if (status === 'reserved' || status === 'sold')
            return;

        this._emit('poi-book');
    }

    /** @param {Event} event */
    _onCalculatorClick(event) {
        this._stop(event);
        this._emit('poi-calculator');
    }

    /** @param {Event} event */
    _onFavoriteClick(event) {
        this._stop(event);
        this.favorite = !this.favorite;
        this.dispatchEvent(new CustomEvent('poi-favorite', {
            bubbles: true,
            detail: { favorite: this.favorite }
        }));
    }

    /** @param {Event} event */
    _onTagsMoreClick(event) {
        this._stop(event);
        this.tagsExpanded = true;
    }

    /** @param {WheelEvent} event */
    _onTagsWheel(event) {
        if (!this.tagsExpanded)
            return;

        const el = /** @type {HTMLElement} */ (event.currentTarget);

        if (el.scrollWidth <= el.clientWidth + 1)
            return;

        const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY)
            ? event.deltaX
            : event.deltaY;

        if (delta === 0)
            return;

        event.preventDefault();
        event.stopPropagation();
        el.scrollLeft += delta;
    }

    /** @param {PointerEvent} event */
    _onTagsPointerDown(event) {
        if (!this.tagsExpanded || event.button !== 0)
            return;

        const el = /** @type {HTMLElement} */ (event.currentTarget);

        if (el.scrollWidth <= el.clientWidth + 1)
            return;

        this._tagsDragState = {
            el,
            pointerId: event.pointerId,
            startX: event.clientX,
            startScrollLeft: el.scrollLeft
        };

        el.setPointerCapture(event.pointerId);
        el.classList.add('poiModalDetailTagsList--dragging');
    }

    /** @param {PointerEvent} event */
    _onTagsPointerMove(event) {
        const drag = this._tagsDragState;

        if (!drag || drag.pointerId !== event.pointerId)
            return;

        drag.el.scrollLeft = drag.startScrollLeft - (event.clientX - drag.startX);
    }

    /** @param {PointerEvent} event */
    _onTagsPointerUp(event) {
        const drag = this._tagsDragState;

        if (!drag || drag.pointerId !== event.pointerId)
            return;

        drag.el.releasePointerCapture(event.pointerId);
        drag.el.classList.remove('poiModalDetailTagsList--dragging');
        this._tagsDragState = null;
    }

    /** @param {Event} event */
    _onPlanError(event) {
        const img = /** @type {HTMLImageElement | null} */ (event.currentTarget);

        if (!img || this._planMode === 'fallback')
            return;

        if (this.cardFallbackSrc) {
            this._planMode = 'fallback';
            img.classList.add('poiModalDetailPlanImg--fallback');
            img.src = this.cardFallbackSrc;
            return;
        }

        img.removeAttribute('src');
    }

    /** @param {PointerEvent} event */
    _onPlanPointerDown(event) {
        if (event.button !== 0 || !this._canSwipePlans())
            return;

        const wrap = /** @type {HTMLElement} */ (event.currentTarget);

        this._planSwipeState = {
            wrap,
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY
        };

        wrap.setPointerCapture(event.pointerId);
    }

    /** @param {PointerEvent} event */
    _onPlanPointerLostCapture(event) {
        if (
            this._planSwipeState
            && this._planSwipeState.pointerId === event.pointerId
        )
            this._planSwipeState = null;
    }

    /** @param {PointerEvent} event */
    _onPlanPointerUp(event) {
        const swipe = this._planSwipeState;

        if (!swipe || swipe.pointerId !== event.pointerId)
            return;

        if (swipe.wrap.hasPointerCapture(event.pointerId))
            swipe.wrap.releasePointerCapture(event.pointerId);

        this._planSwipeState = null;

        const dx = event.clientX - swipe.startX;
        const dy = event.clientY - swipe.startY;

        if (
            Math.abs(dx) < PLAN_SWIPE_THRESHOLD_PX
            || Math.abs(dx) <= Math.abs(dy)
        )
            return;

        const currentMode = this._getTwoPlanViewMode();
        const currentIndex = PLAN_SWIPE_MODES.indexOf(currentMode);
        let nextMode = null;

        if (dx < 0 && currentIndex < PLAN_SWIPE_MODES.length - 1)
            nextMode = PLAN_SWIPE_MODES[currentIndex + 1];
        else if (dx > 0 && currentIndex > 0)
            nextMode = PLAN_SWIPE_MODES[currentIndex - 1];

        if (nextMode)
            queueMicrotask(() => this._setViewMode(nextMode));
    }

    /** @param {PoiModalDetailViewMode} mode @param {Event} event */
    _onPlanDotClick(mode, event) {
        this._stop(event);
        this._setViewMode(mode);
    }

    /** @param {PoiModalDetailVariant} variant @param {string} planImageSrc @param {string} planImgClass */
    _renderPlanSection(variant, planImageSrc, planImgClass) {
        const planViewMode = this._getTwoPlanViewMode();

        return html`
            <div class="poiModalDetailPlanSection">
                <div
                    class="poiModalDetailPlanWrap ${this._canSwipePlans() ? 'poiModalDetailPlanWrap--swipeable' : ''}"
                    @pointerdown=${this._onPlanPointerDown}
                    @pointerup=${this._onPlanPointerUp}
                    @pointercancel=${this._onPlanPointerUp}
                    @lostpointercapture=${this._onPlanPointerLostCapture}
                >
                    ${planImageSrc ? html`
                        <img
                            class=${planImgClass}
                            src=${planImageSrc}
                            alt=""
                            draggable="false"
                            @error=${this._onPlanError}
                        />
                    ` : html`<div class="poiModalDetailPlanEmpty"></div>`}
                </div>

                <div
                    class="poiModalDetailPlanDots"
                    role="tablist"
                    aria-label="План"
                >
                    <button
                        type="button"
                        class="poiModalDetailPlanDot ${planViewMode === 'layout' ? 'poiModalDetailPlanDot--active' : ''}"
                        role="tab"
                        aria-label="Планировка"
                        aria-selected=${planViewMode === 'layout' ? 'true' : 'false'}
                        @click=${(event) => this._onPlanDotClick('layout', event)}
                        @pointerdown=${this._stop}
                    ></button>
                    <button
                        type="button"
                        class="poiModalDetailPlanDot ${planViewMode === 'floor' ? 'poiModalDetailPlanDot--active' : ''}"
                        role="tab"
                        aria-label="План этажа"
                        aria-selected=${planViewMode === 'floor' ? 'true' : 'false'}
                        @click=${(event) => this._onPlanDotClick('floor', event)}
                        @pointerdown=${this._stop}
                    ></button>
                </div>
            </div>
        `;
    }

    /** @param {PoiModalDetailVariant} variant @param {string} status */
    _renderFooter(variant, status) {
        if (variant === 'desk-panel') {
            return html`
                <button
                    type="button"
                    class="poiModalDetailTourBtn"
                    @click=${this._onTourClick}
                    @pointerdown=${this._stop}
                >
                    <img
                        class="poiModalDetailTourBtnIcon"
                        src=${assetUrl('./assets/icons/details/person.svg')}
                        alt=""
                        draggable="false"
                    />
                    <span>Тур</span>
                </button>

                <button
                    type="button"
                    class="poiModalDetailDetailsBtn"
                    @click=${this._onDetailsClick}
                    @pointerdown=${this._stop}
                >
                    Подробнее
                </button>

                <button
                    type="button"
                    class="poiModalDetailCalculator"
                    @click=${this._onCalculatorClick}
                    @pointerdown=${this._stop}
                >
                    <img
                        class="poiModalDetailCalculatorIcon"
                        src=${assetUrl('./assets/icons/details/calculator.svg')}
                        alt=""
                        draggable="false"
                    />
                    <span>Калькулятор покупки</span>
                </button>
            `;
        }

        return html`
            <div class="poiModalDetailSecondaryActions">
                <button
                    type="button"
                    class="poiModalDetailSecondaryBtn"
                    @click=${this._onTourClick}
                    @pointerdown=${this._stop}
                >
                    <img
                        class="poiModalDetailSecondaryBtnIcon"
                        src=${assetUrl('./assets/icons/details/person.svg')}
                        alt=""
                        draggable="false"
                    />
                    <span>Тур</span>
                </button>
                <button
                    type="button"
                    class="poiModalDetailSecondaryBtn"
                    @click=${this._on3dClick}
                    @pointerdown=${this._stop}
                >
                    <span>на 3D</span>
                </button>
            </div>

            <button
                type="button"
                class="poiModalDetailBookBtn${status === 'reserved' ? ' poiModalDetailBookBtn--reserved' : ''}${status === 'sold' ? ' poiModalDetailBookBtn--sold' : ''}"
                @click=${this._onBookClick}
                @pointerdown=${this._stop}
            >
                Забронировать
            </button>

            <button
                type="button"
                class="poiModalDetailCalculator"
                @click=${this._onCalculatorClick}
                @pointerdown=${this._stop}
            >
                <img
                    class="poiModalDetailCalculatorIcon"
                    src=${assetUrl('./assets/icons/details/calculator.svg')}
                    alt=""
                    draggable="false"
                />
                <span>Калькулятор покупки</span>
            </button>
        `;
    }

    render() {
        const info = this.info;
        const variant = this.variant === 'desk-panel' ? 'desk-panel' : 'sheet';
        const rooms = resolveRooms(info);
        const number = typeof info?.number === 'number' ? info.number : '—';
        const status = typeof info?.status === 'string' ? info.status : 'active';
        const statusLabel = POI_STATUS_LABELS[status] ?? POI_STATUS_LABELS.active;
        const statusClass = POI_STATUS_CLASS[status] ?? POI_STATUS_CLASS.active;
        const features = resolveFeatures(info);
        const visibleTags = this.tagsExpanded ? features : features.slice(0, 3);
        const hasHiddenTags = features.length > 3;
        const requestedPlanSrc = this._getRequestedPlanSrc();
        const planImageSrc = this._planMode === 'fallback'
            ? this.cardFallbackSrc
            : (requestedPlanSrc || this.cardFallbackSrc);
        const planImgClass = this._planMode === 'fallback'
            ? 'poiModalDetailPlanImg poiModalDetailPlanImg--fallback'
            : 'poiModalDetailPlanImg';

        return html`
            <div class="poiModalDetail poiModalDetail--${variant}" part="detail">
                <div class="poiModalDetailScroll">
                    <header class="poiModalDetailHead">
                        <div class="poiModalDetailHeadMain">
                            <div class="poiModalDetailTitleRow">
                                <h2 class="poiModalDetailTitle">${rooms}-к Квартира</h2>
                                <span class="poiModalDetailNumber">№ ${number}</span>
                            </div>
                            <p class="poiModalDetailArea">${formatSquare(info?.square)} м²</p>
                            <span class="poiModalDetailBadge poiModalDetailBadge--${statusClass}">
                                ${statusLabel}
                            </span>
                        </div>
                        ${variant === 'desk-panel' ? html`
                            <button
                                type="button"
                                class="poiModalDetailClose"
                                aria-label="Закрыть"
                                @click=${this._onCloseClick}
                                @pointerdown=${this._stop}
                            >
                                <span class="poiModalDetailCloseIcon" aria-hidden="true">×</span>
                            </button>
                        ` : nothing}
                    </header>

                    ${this._renderPlanSection(variant, planImageSrc, planImgClass)}

                    <div
                        class="poiModalDetailTags${this.tagsExpanded ? ' poiModalDetailTags--expanded' : ''}"
                        aria-label="Особенности"
                    >
                        <div
                            class="poiModalDetailTagsList${this.tagsExpanded ? ' poiModalDetailTagsList--scrollable' : ''}"
                            @wheel=${this._onTagsWheel}
                            @pointerdown=${this._onTagsPointerDown}
                            @pointermove=${this._onTagsPointerMove}
                            @pointerup=${this._onTagsPointerUp}
                            @pointercancel=${this._onTagsPointerUp}
                        >
                            ${visibleTags.map(tag => html`
                                <span class="poiModalDetailTag">${tag}</span>
                            `)}
                        </div>
                        ${hasHiddenTags && !this.tagsExpanded ? html`
                            <button
                                type="button"
                                class="poiModalDetailTagMore"
                                @click=${this._onTagsMoreClick}
                                @pointerdown=${this._stop}
                            >
                                Больше
                                <svg
                                    class="poiModalDetailTagChevron"
                                    width="7"
                                    height="7"
                                    viewBox="0 0 10 6"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M1 1L5 5L9 1"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="1.5"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    />
                                </svg>
                            </button>
                        ` : nothing}
                    </div>

                    <div class="poiModalDetailStats" aria-label="Площадь, этаж и секция">
                        <div class="poiModalDetailStat">
                            <span class="poiModalDetailStatValue">${formatSquare(resolveLivingSquare(info))}</span>
                            <span class="poiModalDetailStatLabel">м2</span>
                        </div>
                        <div class="poiModalDetailStat">
                            <span class="poiModalDetailStatValue">${info?.floor ?? '—'}</span>
                            <span class="poiModalDetailStatLabel">этаж</span>
                        </div>
                        <div class="poiModalDetailStat">
                            <span class="poiModalDetailStatValue">${resolveSection(info)}</span>
                            <span class="poiModalDetailStatLabel">секция</span>
                        </div>
                        <button
                            type="button"
                            class="poiModalDetailFavorite ${this.favorite ? 'poiModalDetailFavorite--active' : ''}"
                            aria-label="${this.favorite ? 'Убрать из избранного' : 'Добавить в избранное'}"
                            aria-pressed="${this.favorite ? 'true' : 'false'}"
                            @click=${this._onFavoriteClick}
                            @pointerdown=${this._stop}
                        >
                            ${HEART_ICON}
                        </button>
                    </div>

                    <div class="poiModalDetailPrice${status === 'sold' ? ' poiModalDetailPrice--sold' : ''}">
                        ${formatCost(info?.cost)}
                    </div>

                    ${this._renderFooter(variant, status)}
                </div>
            </div>
        `;
    }
}

/** @param {string} tagName @param {PoiModalDetailVariant} variant */
export function registerPoiModalDetailVariant(tagName, variant) {
    class PoiModalDetailVariantElement extends PoiModalDetailView {
        constructor() {
            super();
            this.variant = variant;
        }
    }

    registerComponent(tagName, PoiModalDetailVariantElement);
}

export { PoiModalDetailView };
