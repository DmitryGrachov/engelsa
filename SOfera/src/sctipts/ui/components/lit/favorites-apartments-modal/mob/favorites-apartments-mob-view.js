import {
    BaseElement,
    html,
    registerComponent,
    repeat
} from '../../../../lit/index.js';
import './favorites-apartments-mob-header.js';
import './favorites-apartments-mob-card.js';
import '../../filter-group-variants-modal/mob/filter-group-variants-mob-sort.js';
import { sortFilterGroupVariants } from '../../filter-group-variants-modal/filter-group-variants-sort/index.js';

/** @typedef {import('../../filter-group-variants-modal/filter-group-variants-data.js').FilterGroupVariantItem} FilterGroupVariantItem */
/** @typedef {import('../../filter-group-variants-modal/filter-group-variants-sort/filter-group-variants-sort.js').FilterGroupVariantsSortField} FilterGroupVariantsSortField */
/** @typedef {import('../../filter-group-variants-modal/filter-group-variants-sort/filter-group-variants-sort.js').FilterGroupVariantsSortDirection} FilterGroupVariantsSortDirection */

class FavoritesApartmentsMobView extends BaseElement {
    static properties = {
        totalCount: { type: Number, attribute: 'total-count' },
        compareCount: { type: Number, attribute: 'compare-count' },
        variants: { type: Array },
        sortField: { type: String, state: true },
        sortDirection: { type: String, state: true }
    };

    constructor() {
        super();
        this.totalCount = 0;
        this.compareCount = 0;
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
            <div class="favoritesApartmentsMobView" part="root">
                <favorites-apartments-mob-header
                    compare-count=${this.compareCount}
                    total-count=${this.totalCount}
                ></favorites-apartments-mob-header>

                <filter-group-variants-mob-sort
                    .field=${this.sortField}
                    .direction=${this.sortDirection}
                    @filter-group-variants-sort-field=${this._onSortField}
                    @filter-group-variants-sort-reset=${this._onSortReset}
                ></filter-group-variants-mob-sort>

                <div class="favoritesApartmentsMobScrollArea">
                    <div class="favoritesApartmentsMobList" role="list">
                        ${sortedVariants.length
                            ? repeat(
                                sortedVariants,
                                (variant) => variant.id,
                                (variant) => html`
                                    <favorites-apartments-mob-card
                                        .variant=${/** @type {FilterGroupVariantItem} */ (variant)}
                                    ></favorites-apartments-mob-card>
                                `
                            )
                            : html`
                                <p class="favoritesApartmentsMobEmpty">
                                    В избранном пока нет квартир
                                </p>
                            `}
                    </div>
                </div>
            </div>
        `;
    }
}

registerComponent('favorites-apartments-mob-view', FavoritesApartmentsMobView);

export { FavoritesApartmentsMobView };
