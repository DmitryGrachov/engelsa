import {
    BaseElement,
    html,
    registerComponent
} from '../../../../lit/index.js';
import {
    attachTouchFriendlyButtons,
    detachTouchFriendlyButtons
} from '../../../../../utils/touch-friendly-buttons.js';
import { assetUrl } from '../../../../../utils/asset-url.js';
import {
    formatGroupVariantDeskNumber,
    formatGroupVariantDeskPrice,
    getGroupVariantMetaParts,
    getGroupVariantStatusClass,
    getGroupVariantStatusLabel
} from '../filter-group-variants-utils.js';
import '../../filter-results-modal/filter-mob-card-tags.js';
import '../../filter-results-modal/filter-mob-card-plan.js';
import '../filter-group-variant-favorite-btn.js';

/** @typedef {import('../filter-group-variants-data.js').FilterGroupVariantItem} FilterGroupVariantItem */

class FilterGroupVariantCard extends BaseElement {
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
        const metaParts = getGroupVariantMetaParts(variant);

        return html`
            <article class="filterMobCard filterGroupVariantCard" part="card">
                <filter-group-variant-favorite-btn
                    appearance="mob-card"
                    .variant=${variant}
                ></filter-group-variant-favorite-btn>

                <filter-mob-card-plan
                    class="filterGroupVariantCardPlan"
                    plan-src=${variant.planSrc || ''}
                    floor-plan-src=${variant.floorPlanSrc || ''}
                >
                    <span
                        class="filterGroupVariantCardBadge filterGroupVariantCardBadge--${statusClass}"
                    >
                        ${getGroupVariantStatusLabel(variant)}
                    </span>
                </filter-mob-card-plan>

                <filter-mob-card-tags
                    item-id=${variant.id}
                    .tags=${tags}
                ></filter-mob-card-tags>

                <h3 class="filterMobCardTitle">
                    ${formatGroupVariantDeskNumber(variant)}
                </h3>

                ${metaParts.length
                    ? html`
                        <div class="filterMobCardMeta" aria-label="Характеристики">
                            ${metaParts.map((part, index) => html`
                                ${index > 0
                                    ? html`
                                        <span
                                            class="filterMobCardMetaDivider"
                                            aria-hidden="true"
                                        >|</span>
                                    `
                                    : null}
                                <span class="filterMobCardMetaItem">${part}</span>
                            `)}
                        </div>
                    `
                    : null}

                <p class="filterMobCardPrice">
                    ${formatGroupVariantDeskPrice(variant)} ₽
                </p>

                <div class="filterMobCardSecondaryActions">
                    <button
                        type="button"
                        class="filterMobCardSecondaryBtn"
                        @click=${() => this._dispatchAction('3d')}
                    >
                        <img
                            class="filterMobCardSecondaryBtnIcon"
                            src=${assetUrl('./assets/icons/buttons/black_plan.svg')}
                            alt=""
                            aria-hidden="true"
                        />
                        <span>На 3D</span>
                    </button>
                    <button
                        type="button"
                        class="filterMobCardSecondaryBtn"
                        @click=${() => this._dispatchAction('tour')}
                    >
                        <img
                            class="filterMobCardSecondaryBtnIcon"
                            src=${assetUrl('./assets/icons/details/person.svg')}
                            alt=""
                            aria-hidden="true"
                        />
                        <span>Тур</span>
                    </button>
                </div>

                <button
                    type="button"
                    class="filterMobCardPrimaryBtn"
                    @click=${() => this._dispatchAction('details')}
                >
                    Подробнее
                </button>
            </article>
        `;
    }
}

registerComponent('filter-group-variant-card', FilterGroupVariantCard);

export { FilterGroupVariantCard };
