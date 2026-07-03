import {
    BaseElement,
    html,
    registerComponent,
    repeat
} from '../../../lit/index.js';
import { assetUrl } from '../../../../utils/asset-url.js';
import { FILTER_ICON } from '../../filter/button-icons.js';
import { formatFilterResultsDeskCountLine, FILTER_RESULTS_DESK_PROJECT_TITLE } from './filter-results-utils.js';
import './filter-results-desk-plan-card.js';

class FilterResultsDeskView extends BaseElement {
    static properties = {
        totalCount: { type: Number, attribute: 'total-count' },
        groups: { type: Array }
    };

    constructor() {
        super();
        this.totalCount = 0;
        this.groups = [];
    }

    _onCloseClick() {
        this.dispatchEvent(new CustomEvent('filter-results-close', {
            bubbles: true
        }));
    }

    _onFilterClick() {
        this.dispatchEvent(new CustomEvent('filter-results-filter', {
            bubbles: true
        }));
    }

    render() {
        const groups = Array.isArray(this.groups) ? this.groups : [];
        const logoSrc = assetUrl('./assets/main_logo_black.svg');
        const filterIconSrc = assetUrl(FILTER_ICON.listLight);

        return html`
            <div class="filterResultsDeskView" part="root">
                <header class="filterResultsDeskTopBar">
                    <div class="filterResultsDeskTopBarBrand">
                        <img
                            class="filterResultsDeskLogo"
                            src=${logoSrc}
                            alt="OCT"
                            draggable="false"
                        />
                        <span class="filterResultsDeskProjectName">
                            ${FILTER_RESULTS_DESK_PROJECT_TITLE}
                        </span>
                        <button
                            type="button"
                            class="filterResultsDeskFilterBtn"
                            aria-label="Фильтр"
                            @click=${this._onFilterClick}
                        >
                            <img
                                class="filterResultsDeskFilterBtnIcon"
                                src=${filterIconSrc}
                                alt=""
                                aria-hidden="true"
                            />
                        </button>
                    </div>

                    <button
                        type="button"
                        class="filterResultsDeskClose"
                        aria-label="Закрыть"
                        @click=${this._onCloseClick}
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

                <div class="filterResultsDeskHeadline">
                    <h2 class="filterResultsDeskTitle">
                        <span class="filterResultsDeskTitleLine">Мы нашли</span>
                        <span class="filterResultsDeskTitleCount">
                            ${formatFilterResultsDeskCountLine(this.totalCount)}
                        </span>
                    </h2>
                </div>

                <div
                    class="filterResultsDeskScroll"
                    role="list"
                >
                    ${repeat(
                        groups,
                        (group) => group.id,
                        (group) => html`
                            <filter-results-desk-plan-card
                                group-id=${group.id}
                                title=${group.title}
                                plan-src=${group.planSrc}
                                price-from=${group.priceFrom}
                                variant-count=${group.variantCount}
                            ></filter-results-desk-plan-card>
                        `
                    )}
                </div>
            </div>
        `;
    }
}

registerComponent('filter-results-desk-view', FilterResultsDeskView);

export { FilterResultsDeskView };
