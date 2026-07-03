import {
    BaseElement,
    html,
    registerComponent,
    repeat
} from '../../../../lit/index.js';
import './filter-group-variant-card.js';
import './filter-group-variants-mob-header.js';
import './filter-group-variants-mob-sort.js';
import { sortFilterGroupVariants } from '../filter-group-variants-sort/index.js';

/** @typedef {import('../filter-group-variants-data.js').FilterGroupVariantItem} FilterGroupVariantItem */
/** @typedef {import('../filter-group-variants-sort/filter-group-variants-sort.js').FilterGroupVariantsSortField} FilterGroupVariantsSortField */
/** @typedef {import('../filter-group-variants-sort/filter-group-variants-sort.js').FilterGroupVariantsSortDirection} FilterGroupVariantsSortDirection */

class FilterGroupVariantsMobView extends BaseElement {
    static properties = {
        groupTitle: { type: String, attribute: 'group-title' },
        totalCount: { type: Number, attribute: 'total-count' },
        variants: { type: Array },
        sortField: { type: String, state: true },
        sortDirection: { type: String, state: true }
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
    }

    willUpdate(changed) {
        if (changed.has('variants')) {
            this.sortField = '';
            this.sortDirection = 'asc';
        }
    }

    /** @param {CustomEvent<{ field: FilterGroupVariantsSortField }>} event */
    _onSortField(event) {
        const field = event.detail?.field;

        if (!field)
            return;

        if (this.sortField === field) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
            return;
        }

        this.sortField = field;
        this.sortDirection = 'asc';
    }

    _onSortReset() {
        this.sortField = '';
        this.sortDirection = 'asc';
    }

    render() {
        const variants = Array.isArray(this.variants) ? this.variants : [];
        const sortedVariants = sortFilterGroupVariants(
            variants,
            this.sortField || null,
            this.sortDirection
        );

        return html`
            <div class="filterGroupVariantsMobView" part="root">
                <filter-group-variants-mob-header
                    group-title=${this.groupTitle}
                    total-count=${this.totalCount}
                ></filter-group-variants-mob-header>

                <filter-group-variants-mob-sort
                    .field=${this.sortField}
                    .direction=${this.sortDirection}
                    @filter-group-variants-sort-field=${this._onSortField}
                    @filter-group-variants-sort-reset=${this._onSortReset}
                ></filter-group-variants-mob-sort>

                <div class="filterGroupVariantsMobScrollArea">
                    <div class="filterResultsMobList filterGroupVariantsMobList" role="list">
                        ${repeat(
                            sortedVariants,
                            (variant) => variant.id,
                            (variant) => html`
                                <filter-group-variant-card
                                    .variant=${/** @type {FilterGroupVariantItem} */ (variant)}
                                ></filter-group-variant-card>
                            `
                        )}
                    </div>
                </div>
            </div>
        `;
    }
}

registerComponent('filter-group-variants-mob-view', FilterGroupVariantsMobView);

export { FilterGroupVariantsMobView };
