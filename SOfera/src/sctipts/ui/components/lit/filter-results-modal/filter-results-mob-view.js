import {
    BaseElement,
    html,
    registerComponent,
    repeat
} from '../../../lit/index.js';
import { assetUrl } from '../../../../utils/asset-url.js';
import { FILTER_ICON } from '../../filter/button-icons.js';
import {
    formatFilterResultsCountLine
} from './filter-results-utils.js';
import './filter-results-plan-card.js';

class FilterResultsMobView extends BaseElement {
    static properties = {
        totalCount: { type: Number, attribute: 'total-count' },
        groups: { type: Array }
    };

    constructor() {
        super();
        this.totalCount = 0;
        this.groups = [];
    }

    _onOffersClick() {
        this.dispatchEvent(new CustomEvent('filter-results-offers', {
            bubbles: true
        }));
    }

    _onCloseClick() {
        this.dispatchEvent(new CustomEvent('filter-results-close', {
            bubbles: true
        }));
    }

    render() {
        const groups = Array.isArray(this.groups) ? this.groups : [];
        const shareIconSrc = assetUrl('./assets/icons/buttons/share.svg');
        const backIconSrc = assetUrl(FILTER_ICON.back);

        return html`
            <div class="filterResultsMobView" part="root">
                <header class="filterResultsMobHeader">
                    

                    <h2 class="filterResultsMobTitle">
                        <span class="filterResultsMobTitleLabel">Доступно</span>
                        <span class="filterResultsMobTitleCount">
                            ${formatFilterResultsCountLine(this.totalCount)}
                        </span>
                    </h2>

                    <button
                        type="button"
                        class="filterResultsMobOffersBtn"
                        @click=${this._onOffersClick}
                    >
                        <span class="filterResultsMobOffersBtnText">
                            Получить предложения
                        </span>
                        <img
                            class="filterResultsMobOffersBtnIcon"
                            src=${shareIconSrc}
                            alt=""
                            aria-hidden="true"
                        />
                    </button>

                    <button
                        type="button"
                        class="filterResultsMobClose"
                        aria-label="Закрыть"
                        @click=${this._onCloseClick}
                    >
                        <img
                            class="filterResultsMobCloseIcon"
                            src=${backIconSrc}
                            alt=""
                            aria-hidden="true"
                        />
                    </button>
                </header>

                <div class="filterResultsMobList" role="list">
                    ${repeat(
                        groups,
                        (group) => group.id,
                        (group) => html`
                            <filter-results-plan-card
                                group-id=${group.id}
                                title=${group.title}
                                plan-src=${group.planSrc}
                                floor-plan-src=${group.floorPlanSrc}
                                .tags=${group.tags}
                                price-from=${group.priceFrom}
                                variant-count=${group.variantCount}
                            ></filter-results-plan-card>
                        `
                    )}
                </div>
            </div>
        `;
    }
}

registerComponent('filter-results-mob-view', FilterResultsMobView);

export { FilterResultsMobView };
