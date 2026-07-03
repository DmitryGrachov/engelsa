import {
    BaseElement,
    html,
    registerComponent
} from '../../../lit/index.js';
import { assetUrl } from '../../../../utils/asset-url.js';
import {
    formatCostRub,
    formatMortgageFrom,
    formatPricePerSqm,
    formatSquare,
    POI_STATUS_CLASS,
    POI_STATUS_LABELS_DESK,
    resolveFeatures,
    resolveRooms,
    resolveSection
} from './poi-modal-utils.js';

/** @typedef {'layout' | 'floor' | 'gallery'} DeskDetailView */

/** @param {DeskDetailView} viewMode */
const getDeskDetailViewLabel = viewMode => {
    if (viewMode === 'floor')
        return 'План этажа';

    if (viewMode === 'gallery')
        return 'Галерея';

    return 'Планировка';
};

const HEART_ICON = html`
    <svg width="19" height="17" viewBox="0 0 19 17" aria-hidden="true">
        <path
            d="M2.20667 8.12727C1.81716 7.74034 1.50856 7.27977 1.29883 6.77237C1.08911 6.26498 0.98247 5.72092 0.985121 5.17191C0.985121 4.06151 1.42623 2.99659 2.2114 2.21141C2.99657 1.42624 4.06149 0.985139 5.17189 0.985139C6.72838 0.985139 8.08785 1.83234 8.80699 3.0933H9.91032C10.2759 2.45204 10.8049 1.91912 11.4435 1.5488C12.082 1.17848 12.8073 0.983995 13.5454 0.985139C14.6558 0.985139 15.7207 1.42624 16.5059 2.21141C17.2911 2.99659 17.7322 4.06151 17.7322 5.17191C17.7322 6.3245 17.2396 7.38843 16.5106 8.12727L9.35865 15.2694L2.20667 8.12727ZM17.2002 8.82671C18.1361 7.88099 18.7173 6.60033 18.7173 5.17191C18.7173 3.80024 18.1724 2.48475 17.2025 1.51483C16.2326 0.544911 14.9171 1.77834e-05 13.5454 1.77834e-05C11.8215 1.77834e-05 10.2945 0.837371 9.35865 2.13773C8.88097 1.47425 8.25197 0.934226 7.52384 0.562451C6.79571 0.190677 5.98944 -0.0021321 5.17189 1.77834e-05C3.80022 1.77834e-05 2.48473 0.544911 1.51481 1.51483C0.544894 2.48475 0 3.80024 0 5.17191C0 6.60033 0.581222 7.88099 1.51709 8.82671L9.35865 16.6683L17.2002 8.82671Z"
            fill="currentColor"
        />
    </svg>
`;

class PoiModalDeskDetail extends BaseElement {
    static properties = {
        info: { type: Object },
        planSrc: { type: String, attribute: 'plan-src' },
        floorPlanSrc: { type: String, attribute: 'floor-plan-src' },
        cardFallbackSrc: { type: String, attribute: 'card-fallback-src' },
        favorite: { type: Boolean, reflect: true },
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
        /** @type {DeskDetailView} */
        this.viewMode = 'layout';
        /** @type {'plan' | 'fallback'} */
        this._planMode = 'plan';
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
        }
    }

    /** @returns {string} */
    _getRequestedPlanSrc() {
        if (this.viewMode === 'floor')
            return this.floorPlanSrc;

        if (this.viewMode === 'gallery')
            return '';

        return this.planSrc;
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
    _onBackClick(event) {
        this._stop(event);
        this._emit('poi-back');
    }

    /** @param {Event} event */
    _onTourClick(event) {
        this._stop(event);
        this._emit('poi-tour');
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
    _onPresentationClick(event) {
        this._stop(event);
        this._emit('poi-presentation');
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

    /** @param {DeskDetailView} mode */
    _setViewMode(mode) {
        this.viewMode = mode;
    }

    /** @param {Event} event */
    _onGalleryTabClick(event) {
        this._stop(event);
        this._emit('poi-gallery');
    }

    /** @param {Event} event */
    _onPlanError(event) {
        const img = /** @type {HTMLImageElement | null} */ (event.currentTarget);

        if (!img || this._planMode === 'fallback')
            return;

        if (this.cardFallbackSrc) {
            this._planMode = 'fallback';
            img.classList.add('poiModalDeskDetailPlanImg--fallback');
            img.src = this.cardFallbackSrc;
            return;
        }

        img.removeAttribute('src');
    }

    render() {
        const info = this.info;
        const rooms = resolveRooms(info);
        const number = typeof info?.number === 'number' ? info.number : '—';
        const status = typeof info?.status === 'string' ? info.status : 'active';
        const statusLabel = POI_STATUS_LABELS_DESK[status] ?? POI_STATUS_LABELS_DESK.active;
        const statusClass = POI_STATUS_CLASS[status] ?? POI_STATUS_CLASS.active;
        const features = resolveFeatures(info);
        const requestedPlanSrc = this._getRequestedPlanSrc();
        const planImageSrc = this._planMode === 'fallback'
            ? this.cardFallbackSrc
            : (requestedPlanSrc || this.cardFallbackSrc);
        const planImgClass = this._planMode === 'fallback'
            ? 'poiModalDeskDetailPlanImg poiModalDeskDetailPlanImg--fallback'
            : 'poiModalDeskDetailPlanImg';
        const viewLabel = getDeskDetailViewLabel(this.viewMode);

        return html`
            <div class="poiModalDeskDetail" part="detail">
                <header class="poiModalDeskDetailTop">
                    <img
                        class="poiModalDeskDetailLogo"
                        src=${assetUrl('./assets/main_logo_black.svg')}
                        alt="OCT"
                        draggable="false"
                    />
                    <button
                        type="button"
                        class="poiModalDeskDetailBack"
                        aria-label="Назад"
                        @click=${this._onBackClick}
                        @pointerdown=${this._stop}
                    >
                        <svg width="18" height="14" viewBox="0 0 18 14" aria-hidden="true">
                            <path
                                d="M6.5 1L1 7L6.5 13"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="1.6"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                            <path
                                d="M1 7H17"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="1.6"
                                stroke-linecap="round"
                            />
                        </svg>
                    </button>
                </header>

                <div class="poiModalDeskDetailBody">
                    <aside class="poiModalDeskDetailInfo">
                        <div class="poiModalDeskDetailInfoHead">
                            <div class="poiModalDeskDetailTitleRow">
                                <h1 class="poiModalDeskDetailTitle">${rooms}-к квартира</h1>
                                <span class="poiModalDeskDetailNumber">№ ${number}</span>
                            </div>
                            <p class="poiModalDeskDetailArea">${formatSquare(info?.square)} м²</p>
                            <span class="poiModalDeskDetailBadge poiModalDeskDetailBadge--${statusClass}">
                                ${statusLabel}
                            </span>
                        </div>

                        <dl class="poiModalDeskDetailSpecs">
                            <div class="poiModalDeskDetailSpec">
                                <dt class="poiModalDeskDetailSpecLabel">Секция</dt>
                                <dd class="poiModalDeskDetailSpecValue">${resolveSection(info)}</dd>
                            </div>
                            <div class="poiModalDeskDetailSpec">
                                <dt class="poiModalDeskDetailSpecLabel">Этаж</dt>
                                <dd class="poiModalDeskDetailSpecValue">${info?.floor ?? '—'}</dd>
                            </div>
                            <div class="poiModalDeskDetailSpec">
                                <dt class="poiModalDeskDetailSpecLabel">Площадь</dt>
                                <dd class="poiModalDeskDetailSpecValue">${formatSquare(info?.square)} м²</dd>
                            </div>
                        </dl>

                        <div class="poiModalDeskDetailActions">
                            <button
                                type="button"
                                class="poiModalDeskDetailActionBtn ${this.favorite ? 'poiModalDeskDetailActionBtn--active' : ''}"
                                aria-label="${this.favorite ? 'Убрать из избранного' : 'Добавить в избранное'}"
                                @click=${this._onFavoriteClick}
                                @pointerdown=${this._stop}
                            >
                                <span>${this.favorite ? 'В избранном' : 'В избранное'}</span>
                                ${HEART_ICON}
                            </button>
                            <button
                                type="button"
                                class="poiModalDeskDetailActionBtn"
                                @click=${this._onPresentationClick}
                                @pointerdown=${this._stop}
                            >
                                <span>Презентация</span>
                                <img
                                    class="poiModalSheetBtnTourIcon"
                                    src=${assetUrl('./assets/icons/buttons/dock.svg')}
                                    alt=""
                                    draggable="false"
                                />
                            </button>
                        </div>

                        <div class="poiModalDeskDetailFeatures">
                            <h2 class="poiModalDeskDetailFeaturesTitle">Особенности планировки:</h2>
                            <div class="poiModalDeskDetailFeatureTags">
                                ${features.map(feature => html`
                                    <span class="poiModalDeskDetailFeatureTag">${feature}</span>
                                `)}
                            </div>
                        </div>
                    </aside>

                    <section class="poiModalDeskDetailVisual" aria-label=${viewLabel}>
                        <div class="poiModalDeskDetailPlanWrap">
                            ${planImageSrc ? html`
                                <img
                                    class=${planImgClass}
                                    src=${planImageSrc}
                                    alt=""
                                    draggable="false"
                                    @error=${this._onPlanError}
                                />
                            ` : html`<div class="poiModalDeskDetailPlanEmpty"></div>`}
                        </div>

                        <button
                            type="button"
                            class="poiModalDeskDetailTourBtn"
                            @click=${this._onTourClick}
                            @pointerdown=${this._stop}
                        >
                            <img
                                src=${assetUrl('./assets/icons/details/person.svg')}
                                alt=""
                                draggable="false"
                            />
                            <span>Начать прогулку</span>
                        </button>

                        <div class="poiModalDeskDetailViewTabs" role="tablist" aria-label="Режим просмотра">
                            <button
                                type="button"
                                role="tab"
                                class="poiModalDeskDetailViewTab ${this.viewMode === 'layout' ? 'poiModalDeskDetailViewTab--active' : ''}"
                                aria-selected=${this.viewMode === 'layout' ? 'true' : 'false'}
                                @click=${() => this._setViewMode('layout')}
                                @pointerdown=${this._stop}
                            >
                                Планировка
                            </button>
                            <button
                                type="button"
                                role="tab"
                                class="poiModalDeskDetailViewTab ${this.viewMode === 'floor' ? 'poiModalDeskDetailViewTab--active' : ''}"
                                aria-selected=${this.viewMode === 'floor' ? 'true' : 'false'}
                                @click=${() => this._setViewMode('floor')}
                                @pointerdown=${this._stop}
                            >
                                План этажа
                            </button>
                            <button
                                type="button"
                                role="tab"
                                class="poiModalDeskDetailViewTab"
                                aria-selected="false"
                                @click=${this._onGalleryTabClick}
                                @pointerdown=${this._stop}
                            >
                                Галерея
                            </button>
                        </div>
                    </section>

                    <aside class="poiModalDeskDetailPriceCard">
                        <div class="poiModalDeskDetailPriceBlock">
                            <p class="poiModalDeskDetailPriceLabel">Стоимость</p>
                            <p class="poiModalDeskDetailPriceValue${status === 'sold' ? ' poiModalDeskDetailPriceValue--sold' : ''}">${formatCostRub(info?.cost)}</p>
                            <p class="poiModalDeskDetailPricePerSqm">${formatPricePerSqm(info)}</p>

                            <button
                                type="button"
                                class="poiModalDeskDetailBookBtn${status === 'reserved' ? ' poiModalDeskDetailBookBtn--reserved' : ''}${status === 'sold' ? ' poiModalDeskDetailBookBtn--sold' : ''}"
                                @click=${this._onBookClick}
                                @pointerdown=${this._stop}
                            >
                                Забронировать
                            </button>
                        </div>

                        <div class="poiModalDeskDetailMortgageBlock">
                            <p class="poiModalDeskDetailMortgageLabel">В ипотеку</p>
                            <p class="poiModalDeskDetailMortgageValue">от ${formatMortgageFrom(info)} руб./мес</p>

                            <button
                                type="button"
                                class="poiModalDeskDetailCalcBtn"
                                @click=${this._onCalculatorClick}
                                @pointerdown=${this._stop}
                            >
                                Ипотечный калькулятор
                            </button>
                        </div>
                    </aside>
                </div>
            </div>
        `;
    }
}

registerComponent('poi-modal-desk-detail', PoiModalDeskDetail);

export { PoiModalDeskDetail };
