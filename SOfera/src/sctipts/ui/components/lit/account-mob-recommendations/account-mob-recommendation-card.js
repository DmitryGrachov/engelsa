import {
    BaseElement,
    html,
    registerComponent
} from '../../../lit/index.js';
import {
    attachTouchFriendlyButtons,
    detachTouchFriendlyButtons
} from '../../../../utils/touch-friendly-buttons.js';
import {
    formatFilterResultsPriceFrom,
    formatFilterResultsShowLabel,
    parseFilterResultsPlanGroupTitle
} from '../filter-results-modal/filter-results-utils.js';
import '../filter-results-modal/filter-mob-card-tags.js';
import '../filter-results-modal/filter-mob-card-plan.js';

class AccountMobRecommendationCard extends BaseElement {
    static properties = {
        title: { type: String },
        planSrc: { type: String, attribute: 'plan-src' },
        floorPlanSrc: { type: String, attribute: 'floor-plan-src' },
        tags: { type: Array },
        priceFrom: { type: Number, attribute: 'price-from' },
        variantCount: { type: Number, attribute: 'variant-count' },
        groupId: { type: String, attribute: 'group-id' }
    };

    constructor() {
        super();
        this.title = '';
        this.planSrc = '';
        this.floorPlanSrc = '';
        this.tags = [];
        this.priceFrom = 0;
        this.variantCount = 0;
        this.groupId = '';
    }

    connectedCallback() {
        super.connectedCallback();
        attachTouchFriendlyButtons(this);
    }

    disconnectedCallback() {
        detachTouchFriendlyButtons(this);
        super.disconnectedCallback();
    }

    /** @param {Event} event */
    _onShowClick(event) {
        event.stopPropagation();
        this.dispatchEvent(new CustomEvent('filter-results-show-group', {
            bubbles: true,
            detail: { groupId: this.groupId }
        }));
    }

    render() {
        const tags = Array.isArray(this.tags) ? this.tags : [];
        const { typeLabel, areaLabel } =
            parseFilterResultsPlanGroupTitle(this.title);
        const typeText = typeLabel.replace(/:+$/, '').trim();
        const infoLine = [typeText, areaLabel].filter(Boolean).join(' ');

        return html`
            <article class="filterMobCard filterResultsPlanCard accountMobRecommendationCard" part="card">
                <filter-mob-card-plan
                    plan-src=${this.planSrc || ''}
                    floor-plan-src=${this.floorPlanSrc || ''}
                ></filter-mob-card-plan>

                <filter-mob-card-tags
                    item-id=${this.groupId}
                    .tags=${tags}
                ></filter-mob-card-tags>

                ${infoLine
                    ? html`
                        <p class="filterResultsPlanCardInfo">${infoLine}</p>
                    `
                    : null}

                <p class="filterMobCardPrice">
                    <span class="filterResultsPlanCardPricePrefix">от</span>
                    ${formatFilterResultsPriceFrom(this.priceFrom)} ₽
                </p>

                <button
                    type="button"
                    class="filterMobCardPrimaryBtn"
                    @click=${this._onShowClick}
                >
                    ${formatFilterResultsShowLabel(this.variantCount)}
                </button>
            </article>
        `;
    }
}

registerComponent('account-mob-recommendation-card', AccountMobRecommendationCard);

export { AccountMobRecommendationCard };
