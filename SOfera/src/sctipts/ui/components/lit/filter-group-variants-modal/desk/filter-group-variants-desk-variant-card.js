import {
    BaseElement,
    html,
    registerComponent,
    repeat
} from '../../../../lit/index.js';
import {
    attachTouchFriendlyButtons,
    detachTouchFriendlyButtons
} from '../../../../../utils/touch-friendly-buttons.js';
import { assetUrl } from '../../../../../utils/asset-url.js';
import { FILTER_ICON } from '../../../filter/button-icons.js';
import {
    formatGroupVariantDeskMeta,
    formatGroupVariantDeskNumber,
    formatGroupVariantDeskPrice,
    getGroupVariantStatusClass,
    getGroupVariantStatusLabel
} from '../filter-group-variants-utils.js';
import '../filter-group-variant-favorite-btn.js';
import '../../filter-results-modal/filter-mob-card-plan.js';

/** @typedef {import('../filter-group-variants-data.js').FilterGroupVariantItem} FilterGroupVariantItem */

class FilterGroupVariantsDeskVariantCard extends BaseElement {
    static properties = {
        variant: { type: Object }
    };

    constructor() {
        super();
        /** @type {FilterGroupVariantItem | null} */
        this.variant = null;
    }

    connectedCallback() {
        super.connectedCallback();
        attachTouchFriendlyButtons(this);
    }

    disconnectedCallback() {
        detachTouchFriendlyButtons(this);
        super.disconnectedCallback();
    }

    /** @param {string} action */
    _dispatchAction(action) {
        if (!this.variant)
            return;

        this.dispatchEvent(new CustomEvent(`filter-group-variant-${action}`, {
            bubbles: true,
            detail: { variant: this.variant }
        }));
    }

    render() {
        const variant = this.variant;

        if (!variant)
            return null;

        const statusClass = getGroupVariantStatusClass(variant);
        const tags = Array.isArray(variant.tags) ? variant.tags : [];

        return html`
            <article class="filterGroupVariantsDeskCard" part="card">
                <filter-group-variant-favorite-btn
                    appearance="card"
                    .variant=${variant}
                ></filter-group-variant-favorite-btn>

                <filter-mob-card-plan
                    class="filterGroupVariantsDeskCardPlan"
                    plan-src=${variant.planSrc || ''}
                    floor-plan-src=${variant.floorPlanSrc || ''}
                ></filter-mob-card-plan>

                ${tags.length
                    ? html`
                        <div class="filterGroupVariantsDeskCardTags" aria-label="Особенности">
                            ${repeat(
                                tags,
                                (tag, index) => `${variant.id}-tag-${index}`,
                                (tag) => html`
                                    <span class="filterGroupVariantsDeskCardTag">${tag}</span>
                                `
                            )}
                        </div>
                    `
                    : null}

                <div class="filterGroupVariantsDeskCardHead">
                    <h3 class="filterGroupVariantsDeskCardTitle">
                        ${formatGroupVariantDeskNumber(variant)}
                    </h3>
                    <span class="filterGroupVariantsDeskCardBadge filterGroupVariantsDeskCardBadge--${statusClass}">
                        ${getGroupVariantStatusLabel(variant)}
                    </span>
                </div>

                <p class="filterGroupVariantsDeskCardMeta">
                    ${formatGroupVariantDeskMeta(variant)}
                </p>

                <p class="filterGroupVariantsDeskCardPrice">
                    ${formatGroupVariantDeskPrice(variant)}
                </p>

                <div class="filterGroupVariantsDeskCardSecondaryActions">
                    <button
                        type="button"
                        class="filterGroupVariantsDeskCardSecondaryBtn"
                        @click=${() => this._dispatchAction('3d')}
                    >
                        <img
                            class="filterGroupVariantsDeskCardSecondaryBtnIcon"
                            src=${assetUrl('./assets/icons/buttons/black_plan.svg')}
                            alt=""
                            aria-hidden="true"
                        />
                        <span>На 3D</span>
                    </button>
                    <button
                        type="button"
                        class="filterGroupVariantsDeskCardSecondaryBtn"
                        @click=${() => this._dispatchAction('tour')}
                    >
                        <img
                            class="filterGroupVariantsDeskCardSecondaryBtnIcon"
                            src=${assetUrl('./assets/icons/details/person.svg')}
                            alt=""
                            aria-hidden="true"
                        />
                        <span>Тур</span>
                    </button>
                </div>

                <button
                    type="button"
                    class="filterGroupVariantsDeskCardDetailsBtn"
                    @click=${() => this._dispatchAction('details')}
                >
                    Подробнее
                </button>
            </article>
        `;
    }
}

registerComponent('filter-group-variants-desk-variant-card', FilterGroupVariantsDeskVariantCard);

export { FilterGroupVariantsDeskVariantCard };
