import {
    BaseElement,
    html,
    nothing,
    registerComponent,
    repeat
} from '../../../../lit/index.js';
import {
    attachTouchFriendlyButtons,
    detachTouchFriendlyButtons
} from '../../../../../utils/touch-friendly-buttons.js';
import { assetUrl } from '../../../../../utils/asset-url.js';
import {
    bindVariantFavoritesListener,
    FAVORITE_HEART_ICON,
    isVariantFavorite,
    toggleVariantFavorite
} from '../../filter-group-variants-modal/filter-group-variant-favorite.js';
import {
    formatGroupVariantDeskMeta,
    formatGroupVariantDeskNumber,
    formatGroupVariantDeskPrice,
    getGroupVariantStatusClass,
    getGroupVariantStatusLabel
} from '../../filter-group-variants-modal/filter-group-variants-utils.js';
import '../../filter-results-modal/filter-mob-card-plan.js';

/** @typedef {import('../../filter-group-variants-modal/filter-group-variants-data.js').FilterGroupVariantItem} FilterGroupVariantItem */

class ComparisonsDeskCard extends BaseElement {
    static properties = {
        variant: { type: Object }
    };

    constructor() {
        super();
        /** @type {FilterGroupVariantItem | null} */
        this.variant = null;
        /** @type {(() => void) | null} */
        this._unbindFavoritesListener = null;
    }

    connectedCallback() {
        super.connectedCallback();
        attachTouchFriendlyButtons(this);
        this._unbindFavoritesListener = bindVariantFavoritesListener(this, () => {
            this.requestUpdate();
        });
    }

    disconnectedCallback() {
        detachTouchFriendlyButtons(this);
        this._unbindFavoritesListener?.();
        this._unbindFavoritesListener = null;
        super.disconnectedCallback();
    }

    /** @param {string} action */
    _dispatchAction(action) {
        if (!this.variant)
            return;

        this.dispatchEvent(new CustomEvent(`comparisons-desk-card-${action}`, {
            bubbles: true,
            detail: { variant: this.variant }
        }));
    }

    /** @param {Event} event */
    _onFavoriteClick(event) {
        event.stopPropagation();
        toggleVariantFavorite(this.variant);
    }

    render() {
        const variant = this.variant;

        if (!variant)
            return null;

        const statusClass = getGroupVariantStatusClass(variant);
        const tags = Array.isArray(variant.tags) ? variant.tags : [];
        const favorite = isVariantFavorite(variant);

        return html`
            <article class="accountDeskFavoritesCard accountDeskFavoritesCard--comparisons" part="card">
                <button
                    type="button"
                    class="accountDeskFavoritesCardFavorite${favorite ? ' accountDeskFavoritesCardFavorite--active' : ''}"
                    aria-label=${favorite ? 'Убрать из избранного' : 'Добавить в избранное'}
                    aria-pressed=${favorite ? 'true' : 'false'}
                    @click=${this._onFavoriteClick}
                >
                    ${FAVORITE_HEART_ICON}
                </button>

                <filter-mob-card-plan
                    class="accountDeskFavoritesCardPlan"
                    plan-src=${variant.planSrc || ''}
                    floor-plan-src=${variant.floorPlanSrc || ''}
                ></filter-mob-card-plan>

                <div
                    class="accountDeskFavoritesCardTags"
                    aria-label=${tags.length ? 'Особенности' : nothing}
                    aria-hidden=${tags.length ? 'false' : 'true'}
                >
                    ${tags.length
                        ? repeat(
                            tags,
                            (tag, index) => `${variant.id}-tag-${index}`,
                            (tag) => html`
                                <span class="accountDeskFavoritesCardTag">${tag}</span>
                            `
                        )
                        : null}
                </div>

                <div class="accountDeskFavoritesCardHead">
                    <h3 class="accountDeskFavoritesCardTitle">
                        ${formatGroupVariantDeskNumber(variant)}
                    </h3>
                    <span class="accountDeskFavoritesCardBadge accountDeskFavoritesCardBadge--${statusClass}">
                        ${getGroupVariantStatusLabel(variant)}
                    </span>
                </div>

                <p class="accountDeskFavoritesCardMeta">
                    ${formatGroupVariantDeskMeta(variant)}
                </p>

                <p class="accountDeskFavoritesCardPrice">
                    ${formatGroupVariantDeskPrice(variant)}
                </p>

                <div class="accountDeskFavoritesCardSecondaryActions">
                    <button
                        type="button"
                        class="accountDeskFavoritesCardSecondaryBtn"
                        @click=${() => this._dispatchAction('3d')}
                    >
                        <img
                            class="accountDeskFavoritesCardSecondaryBtnIcon"
                            src=${assetUrl('./assets/icons/buttons/black_plan.svg')}
                            alt=""
                            aria-hidden="true"
                        />
                        <span>На 3D</span>
                    </button>
                    <button
                        type="button"
                        class="accountDeskFavoritesCardSecondaryBtn"
                        @click=${() => this._dispatchAction('tour')}
                    >
                        <img
                            class="accountDeskFavoritesCardSecondaryBtnIcon"
                            src=${assetUrl('./assets/icons/details/person.svg')}
                            alt=""
                            aria-hidden="true"
                        />
                        <span>Тур</span>
                    </button>
                </div>

                <button
                    type="button"
                    class="accountDeskFavoritesCardDetailsBtn"
                    @click=${() => this._dispatchAction('details')}
                >
                    Подробнее
                </button>
            </article>
        `;
    }
}

registerComponent('comparisons-desk-card', ComparisonsDeskCard);

export { ComparisonsDeskCard };
