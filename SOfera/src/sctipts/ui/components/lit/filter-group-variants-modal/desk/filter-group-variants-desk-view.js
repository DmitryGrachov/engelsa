import {
    BaseElement,
    html,
    registerComponent,
    repeat
} from '../../../../lit/index.js';
import { assetUrl } from '../../../../../utils/asset-url.js';
import { FILTER_ICON } from '../../../filter/button-icons.js';
import { FILTER_RESULTS_DESK_PROJECT_TITLE, formatFilterResultsCountLine } from '../../filter-results-modal/filter-results-utils.js';
import { formatFilterGroupVariantsDeskTitle } from '../filter-group-variants-utils.js';
import { sortFilterGroupVariants } from '../filter-group-variants-sort/index.js';
import './filter-group-variants-desk-variant-card.js';
import './filter-group-variants-desk-list-row.js';
import './filter-group-variants-desk-sort.js';

const GRID_VIEW_ICON = html`
    <svg
        class="filterGroupVariantsDeskViewToggleIcon"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        aria-hidden="true"
    >
        <rect x="1.5" y="1.5" width="5" height="5" rx="1" fill="currentColor" />
        <rect x="9.5" y="1.5" width="5" height="5" rx="1" fill="currentColor" />
        <rect x="1.5" y="9.5" width="5" height="5" rx="1" fill="currentColor" />
        <rect x="9.5" y="9.5" width="5" height="5" rx="1" fill="currentColor" />
    </svg>
`;

const LIST_VIEW_ICON = html`
    <svg
        class="filterGroupVariantsDeskViewToggleIcon"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        aria-hidden="true"
    >
        <rect x="1.5" y="2.5" width="13" height="2.2" rx="1.1" fill="currentColor" />
        <rect x="1.5" y="7" width="13" height="2.2" rx="1.1" fill="currentColor" />
        <rect x="1.5" y="11.5" width="13" height="2.2" rx="1.1" fill="currentColor" />
    </svg>
`;

/** @typedef {import('../filter-group-variants-data.js').FilterGroupVariantItem} FilterGroupVariantItem */
/** @typedef {import('../filter-group-variants-sort/filter-group-variants-sort.js').FilterGroupVariantsSortField} FilterGroupVariantsSortField */
/** @typedef {import('../filter-group-variants-sort/filter-group-variants-sort.js').FilterGroupVariantsSortDirection} FilterGroupVariantsSortDirection */

class FilterGroupVariantsDeskView extends BaseElement {
    static properties = {
        groupTitle: { type: String, attribute: 'group-title' },
        totalCount: { type: Number, attribute: 'total-count' },
        variants: { type: Array },
        sortField: { type: String, state: true },
        sortDirection: { type: String, state: true },
        viewMode: { type: String, state: true }
    };

    constructor() {
        super();
        this.groupTitle = '';
        this.totalCount = 0;
        this.variants = [];
        /** @type {FilterGroupVariantsSortField | ''} */
        this.sortField = '';
        /** @type {FilterGroupVariantsSortDirection} */
        this.sortDirection = 'asc';
        /** @type {'grid' | 'list'} */
        this.viewMode = 'grid';
    }

    willUpdate(changed) {
        if (changed.has('variants')) {
            this.sortField = '';
            this.sortDirection = 'asc';
            this.viewMode = 'grid';
        }
    }

    _onCloseClick() {
        this.dispatchEvent(new CustomEvent('filter-group-variants-close', {
            bubbles: true
        }));
    }

    /** @param {CustomEvent<{ field: FilterGroupVariantsSortField }>} event */
    _onSortField(event) {
        const field = event.detail?.field;

        if (!field)
            return;

        if (this.sortField === field)
            return;

        this.sortField = field;
        this.sortDirection = 'asc';
    }

    /** @param {CustomEvent<{ direction: FilterGroupVariantsSortDirection }>} event */
    _onSortDirection(event) {
        const direction = event.detail?.direction;

        if (direction !== 'asc' && direction !== 'desc')
            return;

        if (!this.sortField)
            return;

        this.sortDirection = direction;
    }

    _onSortReset() {
        this.sortField = '';
        this.sortDirection = 'asc';
    }

    /** @param {'grid' | 'list'} mode */
    _onViewModeChange(mode) {
        this.viewMode = mode;
    }

    /** @param {FilterGroupVariantItem[]} sortedVariants */
    _renderGrid(sortedVariants) {
        return html`
            <div
                class="filterGroupVariantsDeskGrid"
                role="list"
            >
                ${repeat(
                    sortedVariants,
                    (variant) => variant.id,
                    (variant) => html`
                        <filter-group-variants-desk-variant-card
                            .variant=${variant}
                        ></filter-group-variants-desk-variant-card>
                    `
                )}
            </div>
        `;
    }

    /** @param {FilterGroupVariantItem[]} sortedVariants */
    _renderList(sortedVariants) {
        return html`
            <div class="filterGroupVariantsDeskListScroll">
                <div class="filterGroupVariantsDeskListHead" aria-hidden="true">
                    <span>Номер</span>
                    <span>Кол-во комнат</span>
                    <span>Площадь, м</span>
                    <span>Стоимость</span>
                    <span>Секция</span>
                    <span>Этаж</span>
                    <span>Статус</span>
                    <span class="filterGroupVariantsDeskListHeadActions"></span>
                </div>

                <div class="filterGroupVariantsDeskListBody" role="list">
                    ${repeat(
                        sortedVariants,
                        (variant) => variant.id,
                        (variant) => html`
                            <filter-group-variants-desk-list-row
                                .variant=${variant}
                            ></filter-group-variants-desk-list-row>
                        `
                    )}
                </div>
            </div>
        `;
    }

    render() {
        const variants = Array.isArray(this.variants) ? this.variants : [];
        const sortedVariants = sortFilterGroupVariants(
            variants,
            this.sortField || null,
            this.sortDirection
        );
        const logoSrc = assetUrl('./assets/main_logo_black.svg');
        const filterIconSrc = assetUrl(FILTER_ICON.listLight);
        const deskTitle = formatFilterGroupVariantsDeskTitle(this.groupTitle);

        return html`
            <div class="filterGroupVariantsDeskView" part="root">
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
                            @click=${this._onCloseClick}
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

                <div class="filterGroupVariantsDeskHeadRow">
                    <div class="filterResultsDeskHeadline">
                        <h2 class="filterResultsDeskTitle filterGroupVariantsDeskTitle">
                            <span class="filterGroupVariantsDeskTitleMain">
                                ${deskTitle}
                            </span>
                            <span class="filterGroupVariantsDeskTitleCount">
                                ${formatFilterResultsCountLine(this.totalCount)}
                            </span>
                        </h2>
                    </div>

                    <div class="filterGroupVariantsDeskViewToggle" role="tablist" aria-label="Вид">
                        <button
                            type="button"
                            class="filterGroupVariantsDeskViewToggleBtn${this.viewMode === 'grid' ? ' filterGroupVariantsDeskViewToggleBtn--active' : ''}"
                            role="tab"
                            aria-selected=${this.viewMode === 'grid' ? 'true' : 'false'}
                            @click=${() => this._onViewModeChange('grid')}
                        >
                            <img
                                src=${assetUrl('./assets/icons/buttons/table.svg')}
                                alt=""
                                aria-hidden="true"
                            />
                            <span>Таблицей</span>
                        </button>
                        <button
                            type="button"
                            class="filterGroupVariantsDeskViewToggleBtn${this.viewMode === 'list' ? ' filterGroupVariantsDeskViewToggleBtn--active' : ''}"
                            role="tab"
                            aria-selected=${this.viewMode === 'list' ? 'true' : 'false'}
                            @click=${() => this._onViewModeChange('list')}
                        >
                            <img
                                src=${assetUrl('./assets/icons/buttons/black_list.svg')}
                                alt=""
                                aria-hidden="true"
                            />
                            <span>Списком</span>
                        </button>
                    </div>

                    <filter-group-variants-desk-sort
                        .field=${this.sortField}
                        .direction=${this.sortDirection}
                        @filter-group-variants-sort-field=${this._onSortField}
                        @filter-group-variants-sort-direction=${this._onSortDirection}
                        @filter-group-variants-sort-reset=${this._onSortReset}
                    ></filter-group-variants-desk-sort>
                </div>

                ${this.viewMode === 'list'
                    ? this._renderList(sortedVariants)
                    : this._renderGrid(sortedVariants)}
            </div>
        `;
    }
}

registerComponent('filter-group-variants-desk-view', FilterGroupVariantsDeskView);

export { FilterGroupVariantsDeskView };
