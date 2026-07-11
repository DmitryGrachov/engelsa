import {
    BaseElement,
    html,
    registerComponent
} from '../../../lit/index.js';
import { assetUrl } from '../../../../utils/asset-url.js';
import {
    formatCost,
    formatSquare,
    POI_STATUS_CLASS,
    POI_STATUS_LABELS,
    resolvePoiModalCardFallbackSrc,
    resolvePoiModalPlanSrc,
    resolveRooms,
    resolveSection
} from './poi-modal-utils.js';

export {
    resolvePoiModalCardFallbackSrc,
    resolvePoiModalPlanSrc
} from './poi-modal-utils.js';

class PoiModalSheet extends BaseElement {
    static properties = {
        info: { type: Object },
        planSrc: { type: String, attribute: 'plan-src' },
        cardFallbackSrc: { type: String, attribute: 'card-fallback-src' },
        favorite: { type: Boolean, reflect: true },
        showSliceBtn: { type: Boolean, attribute: 'show-slice-btn' }
    };

    constructor() {
        super();
        /** @type {import('./poi-modal-utils.js').PoiInfo | null} */
        this.info = null;
        this.planSrc = '';
        this.cardFallbackSrc = '';
        this.favorite = false;
        this.showSliceBtn = false;
        /** @type {'plan' | 'fallback'} */
        this._planMode = 'plan';
    }

    willUpdate(changed) {
        if (changed.has('info') || changed.has('planSrc') || changed.has('cardFallbackSrc'))
            this._planMode = this.planSrc ? 'plan' : 'fallback';
    }

    /** @param {Event} event */
    _stop(event) {
        event.stopPropagation();
    }

    /** @param {Event} event */
    _onDetailsClick(event) {
        this._stop(event);
        this.dispatchEvent(new CustomEvent('poi-details', { bubbles: true }));
    }

    /** @param {Event} event */
    _onTourClick(event) {
        this._stop(event);
        this.dispatchEvent(new CustomEvent('poi-tour', { bubbles: true }));
    }

    /** @param {Event} event */
    _onSliceClick(event) {
        this._stop(event);
        this.dispatchEvent(new CustomEvent('poi-slice', { bubbles: true }));
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
    _onPlanError(event) {
        const img = /** @type {HTMLImageElement | null} */ (event.currentTarget);

        if (!img || this._planMode === 'fallback')
            return;

        if (this.cardFallbackSrc) {
            this._planMode = 'fallback';
            img.classList.add('poiModalSheetPlanImg--fallback');
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
        const statusLabel = POI_STATUS_LABELS[status] ?? POI_STATUS_LABELS.active;
        const statusClass = POI_STATUS_CLASS[status] ?? POI_STATUS_CLASS.active;
        const planImageSrc = this._planMode === 'fallback'
            ? this.cardFallbackSrc
            : (this.planSrc || this.cardFallbackSrc);
        const planImgClass = this._planMode === 'fallback'
            ? 'poiModalSheetPlanImg poiModalSheetPlanImg--fallback'
            : 'poiModalSheetPlanImg';

        return html`
            <div class="poiModalSheetCard" part="card">
                <div class="poiModalSheetMain">
                    <div class="poiModalSheetHead">
                        <h2 class="poiModalSheetTitle">${rooms}-к Квартира | № ${number}</h2>
                        <span class="poiModalSheetBadge poiModalSheetBadge--${statusClass}">
                            ${statusLabel}
                        </span>
                    </div>

                    <div class="poiModalSheetArea">${formatSquare(info?.square)} м²</div>

                    <div class="poiModalSheetMeta" aria-label="Этаж и секция">
                        <div class="poiModalSheetMetaItem">
                            <span class="poiModalSheetMetaValue">${info?.floor ?? '—'}</span>
                            <span class="poiModalSheetMetaLabel">этаж</span>
                        </div>
                        <div class="poiModalSheetMetaItem">
                            <span class="poiModalSheetMetaValue">${resolveSection(info)}</span>
                            <span class="poiModalSheetMetaLabel">секция</span>
                        </div>
                        <button
                            type="button"
                            class="poiModalSheetFavorite ${this.favorite ? 'poiModalSheetFavorite--active' : ''}"
                            aria-label="${this.favorite ? 'Убрать из избранного' : 'Добавить в избранное'}"
                            aria-pressed="${this.favorite ? 'true' : 'false'}"
                            @click=${this._onFavoriteClick}
                            @pointerdown=${this._stop}
                        >
                            <svg width="19" height="17" viewBox="0 0 19 17" aria-hidden="true">
                                <path
                                    d="M2.20667 8.12727C1.81716 7.74034 1.50856 7.27977 1.29883 6.77237C1.08911 6.26498 0.98247 5.72092 0.985121 5.17191C0.985121 4.06151 1.42623 2.99659 2.2114 2.21141C2.99657 1.42624 4.06149 0.985139 5.17189 0.985139C6.72838 0.985139 8.08785 1.83234 8.80699 3.0933H9.91032C10.2759 2.45204 10.8049 1.91912 11.4435 1.5488C12.082 1.17848 12.8073 0.983995 13.5454 0.985139C14.6558 0.985139 15.7207 1.42624 16.5059 2.21141C17.2911 2.99659 17.7322 4.06151 17.7322 5.17191C17.7322 6.3245 17.2396 7.38843 16.5106 8.12727L9.35865 15.2694L2.20667 8.12727ZM17.2002 8.82671C18.1361 7.88099 18.7173 6.60033 18.7173 5.17191C18.7173 3.80024 18.1724 2.48475 17.2025 1.51483C16.2326 0.544911 14.9171 1.77834e-05 13.5454 1.77834e-05C11.8215 1.77834e-05 10.2945 0.837371 9.35865 2.13773C8.88097 1.47425 8.25197 0.934226 7.52384 0.562451C6.79571 0.190677 5.98944 -0.0021321 5.17189 1.77834e-05C3.80022 1.77834e-05 2.48473 0.544911 1.51481 1.51483C0.544894 2.48475 0 3.80024 0 5.17191C0 6.60033 0.581222 7.88099 1.51709 8.82671L9.35865 16.6683L17.2002 8.82671Z"
                                    fill="currentColor"
                                />
                            </svg>
                        </button>
                    </div>

                    <div class="poiModalSheetPrice${status === 'sold' ? ' poiModalSheetPrice--sold' : ''}">${formatCost(info?.cost)}</div>

                    <div class="poiModalSheetActions">
                        <button
                            type="button"
                            class="poiModalSheetBtn poiModalSheetBtnDetails"
                            @click=${this._onDetailsClick}
                            @pointerdown=${this._stop}
                        >
                            Подробнее
                        </button>
                        <button
                            type="button"
                            class="poiModalSheetBtn poiModalSheetBtnTour"
                            @click=${this._onTourClick}
                            @pointerdown=${this._stop}
                        >
                            <img
                                class="poiModalSheetBtnTourIcon"
                                src=${assetUrl('./assets/icons/details/person.svg')}
                                alt=""
                                draggable="false"
                            />
                            <span>Тур</span>
                        </button>
                        ${this.showSliceBtn ? html`
                            <button
                                type="button"
                                class="poiModalSheetBtn poiModalSheetBtnTour"
                                @click=${this._onSliceClick}
                                @pointerdown=${this._stop}
                            >
                                <img
                                    class="poiModalSheetBtnTourIcon"
                                    src=${assetUrl('./assets/icons/slice.svg')}
                                    alt=""
                                    draggable="false"
                                />
                                <span>Срез</span>
                            </button>
                        ` : ''}
                    </div>
                </div>

                <div class="poiModalSheetPlan" aria-hidden="true">
                    ${planImageSrc ? html`
                        <img
                            class=${planImgClass}
                            src=${planImageSrc}
                            alt=""
                            draggable="false"
                            @error=${this._onPlanError}
                        />
                    ` : html`<div class="poiModalSheetPlanEmpty"></div>`}
                </div>
            </div>
        `;
    }
}

registerComponent('poi-modal-sheet', PoiModalSheet);

export { PoiModalSheet };
