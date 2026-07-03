import {
    BaseElement,
    html,
    registerComponent
} from '../../../lit/index.js';
import {
    formatFilterResultsPriceFromDesk,
    formatFilterResultsShowLabel,
    parseFilterResultsPlanGroupTitle
} from './filter-results-utils.js';

class FilterResultsDeskPlanCard extends BaseElement {
    static properties = {
        title: { type: String },
        planSrc: { type: String, attribute: 'plan-src' },
        priceFrom: { type: Number, attribute: 'price-from' },
        variantCount: { type: Number, attribute: 'variant-count' },
        groupId: { type: String, attribute: 'group-id' }
    };

    constructor() {
        super();
        this.title = '';
        this.planSrc = '';
        this.priceFrom = 0;
        this.variantCount = 0;
        this.groupId = '';
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
        const { typeLabel, areaLabel } =
            parseFilterResultsPlanGroupTitle(this.title);

        return html`
            <article class="filterResultsDeskPlanCard" part="card">
                <div class="filterResultsDeskPlanCardPlan">
                    <img
                        class="filterResultsDeskPlanCardPlanImg"
                        src=${this.planSrc || ''}
                        alt=""
                        loading="lazy"
                        decoding="async"
                    />
                </div>

                <div class="filterResultsDeskPlanCardBody">
                    ${typeLabel
                        ? html`
                            <p class="filterResultsDeskPlanCardType">
                                ${typeLabel}
                            </p>
                        `
                        : null}

                    ${areaLabel
                        ? html`
                            <p class="filterResultsDeskPlanCardArea">
                                ${areaLabel}
                            </p>
                        `
                        : null}

                    <p class="filterResultsDeskPlanCardPriceLabel">
                        стоимость от:
                    </p>

                    <p class="filterResultsDeskPlanCardPrice">
                        ${formatFilterResultsPriceFromDesk(this.priceFrom)}
                    </p>

                    <button
                        type="button"
                        class="filterResultsDeskPlanCardBtn"
                        @click=${this._onShowClick}
                    >
                        ${formatFilterResultsShowLabel(this.variantCount)}
                    </button>
                </div>
            </article>
        `;
    }
}

registerComponent('filter-results-desk-plan-card', FilterResultsDeskPlanCard);

export { FilterResultsDeskPlanCard };
