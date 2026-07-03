import {
    BaseElement,
    html,
    registerComponent
} from '../../../../lit/index.js';
import { assetUrl } from '../../../../../utils/asset-url.js';
import {
    formatCost,
    formatSquare
} from '../../poi-modal/poi-modal-utils.js';
import {
    getGroupVariantStatusClass,
    getGroupVariantStatusLabel
} from '../../filter-group-variants-modal/filter-group-variants-utils.js';
import '../../filter-group-variants-modal/filter-group-variant-favorite-btn.js';
import '../../filter-results-modal/filter-mob-card-tags.js';

/** @typedef {import('../../filter-group-variants-modal/filter-group-variants-data.js').FilterGroupVariantItem} FilterGroupVariantItem */

const cardFallbackSrc = assetUrl('./assets/account/apartment.png');

/** @param {FilterGroupVariantItem} variant */
const formatCardTitle = (variant) => {
    const number = variant.number != null ? variant.number : '—';

    if (variant.groupTitle && /студия/i.test(variant.groupTitle))
        return `Студия | № ${number}`;

    const rooms = variant.rooms != null && variant.rooms > 0 ? variant.rooms : 1;

    return `${rooms}-к Квартира | № ${number}`;
};

class ComparisonsApartmentsMobCard extends BaseElement {
    static properties = {
        variant: { type: Object }
    };

    constructor() {
        super();
        /** @type {FilterGroupVariantItem | null} */
        this.variant = null;
        /** @type {'plan' | 'fallback'} */
        this._planMode = 'plan';
    }

    willUpdate(changed) {
        if (changed.has('variant'))
            this._planMode = this.variant?.planSrc ? 'plan' : 'fallback';
    }

    /** @param {Event} event */
    _stop(event) {
        event.stopPropagation();
    }

    /** @param {string} action */
    _dispatchAction(action) {
        if (!this.variant)
            return;

        this.dispatchEvent(new CustomEvent(`comparisons-apartments-card-${action}`, {
            bubbles: true,
            detail: { variant: this.variant }
        }));
    }

    /** @param {Event} event */
    _onPlanError(event) {
        const img = /** @type {HTMLImageElement | null} */ (event.currentTarget);

        if (!img || this._planMode === 'fallback')
            return;

        this._planMode = 'fallback';
        img.classList.add('favoritesApartmentsMobCardPlanImg--fallback');
        img.src = cardFallbackSrc;
    }

    render() {
        const variant = this.variant;

        if (!variant)
            return null;

        const statusClass = getGroupVariantStatusClass(variant);
        const statusLabel = getGroupVariantStatusLabel(variant);
        const planImageSrc = this._planMode === 'fallback'
            ? cardFallbackSrc
            : (variant.planSrc || cardFallbackSrc);
        const planImgClass = this._planMode === 'fallback'
            ? 'favoritesApartmentsMobCardPlanImg favoritesApartmentsMobCardPlanImg--fallback'
            : 'favoritesApartmentsMobCardPlanImg';
        const sold = variant.status === 'sold';
        const tags = Array.isArray(variant.tags) ? variant.tags : [];

        return html`
            <article class="favoritesApartmentsMobCard" part="card">
                <div class="favoritesApartmentsMobCardBody">
                    <button
                        type="button"
                        class="favoritesApartmentsMobCardBtn3d"
                        aria-label="На 3D"
                        @click=${() => this._dispatchAction('3d')}
                        @pointerdown=${this._stop}
                    >
                        3D
                    </button>

                    <div class="favoritesApartmentsMobCardMain">
                        <div class="favoritesApartmentsMobCardHead">
                            <h3 class="favoritesApartmentsMobCardTitle">
                                ${formatCardTitle(variant)}
                            </h3>
                            <span
                                class="favoritesApartmentsMobCardBadge favoritesApartmentsMobCardBadge--${statusClass}"
                            >
                                ${statusLabel}
                            </span>
                        </div>

                        <div class="favoritesApartmentsMobCardArea">
                            ${formatSquare(variant.area ?? undefined)} м²
                        </div>

                        ${tags.length ? html`
                            <div class="favoritesApartmentsMobCardTags">
                                <filter-mob-card-tags
                                    item-id=${variant.id}
                                    .tags=${tags}
                                ></filter-mob-card-tags>
                            </div>
                        ` : null}

                        <div class="favoritesApartmentsMobCardMeta" aria-label="Этаж и секция">
                            <div class="favoritesApartmentsMobCardMetaItem">
                                <span class="favoritesApartmentsMobCardMetaValue">
                                    ${variant.floor ?? '—'}
                                </span>
                                <span class="favoritesApartmentsMobCardMetaLabel">этаж</span>
                            </div>
                            <div class="favoritesApartmentsMobCardMetaItem">
                                <span class="favoritesApartmentsMobCardMetaValue">
                                    ${variant.section ?? '—'}
                                </span>
                                <span class="favoritesApartmentsMobCardMetaLabel">секция</span>
                            </div>
                            <filter-group-variant-favorite-btn
                                appearance="mob-card"
                                .variant=${variant}
                                @click=${this._stop}
                                @pointerdown=${this._stop}
                            ></filter-group-variant-favorite-btn>
                        </div>

                        <div class="favoritesApartmentsMobCardPrice${sold ? ' favoritesApartmentsMobCardPrice--sold' : ''}">
                            ${formatCost(variant.price ?? undefined)}
                        </div>

                        <div class="favoritesApartmentsMobCardActions">
                            <button
                                type="button"
                                class="favoritesApartmentsMobCardBtn favoritesApartmentsMobCardBtnTour"
                                @click=${() => this._dispatchAction('tour')}
                                @pointerdown=${this._stop}
                            >
                                <img
                                    class="favoritesApartmentsMobCardBtnTourIcon"
                                    src=${assetUrl('./assets/icons/details/person.svg')}
                                    alt=""
                                    draggable="false"
                                />
                                <span>Тур</span>
                            </button>
                            <button
                                type="button"
                                class="favoritesApartmentsMobCardBtn favoritesApartmentsMobCardBtnDetails"
                                @click=${() => this._dispatchAction('details')}
                                @pointerdown=${this._stop}
                            >
                                Подробнее
                            </button>
                        </div>
                    </div>

                    <div class="favoritesApartmentsMobCardPlan" aria-hidden="true">
                        ${planImageSrc ? html`
                            <img
                                class=${planImgClass}
                                src=${planImageSrc}
                                alt=""
                                draggable="false"
                                loading="lazy"
                                decoding="async"
                                @error=${this._onPlanError}
                            />
                        ` : html`<div class="favoritesApartmentsMobCardPlanEmpty"></div>`}
                    </div>
                </div>
            </article>
        `;
    }
}

registerComponent('comparisons-apartments-mob-card', ComparisonsApartmentsMobCard);

export { ComparisonsApartmentsMobCard };
