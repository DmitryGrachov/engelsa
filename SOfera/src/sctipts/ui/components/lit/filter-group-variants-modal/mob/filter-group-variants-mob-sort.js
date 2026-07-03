import {
    BaseElement,
    html,
    nothing,
    registerComponent
} from '../../../../lit/index.js';
import { assetUrl } from '../../../../../utils/asset-url.js';

/** @typedef {'price' | 'area' | 'floor'} FilterGroupVariantsSortField */
/** @typedef {'asc' | 'desc'} FilterGroupVariantsSortDirection */

const SORT_OPTIONS = Object.freeze([
    { field: 'price', label: 'Цена' },
    { field: 'area', label: 'Площадь' },
    { field: 'floor', label: 'Этаж' }
]);

const SORT_TRIANGLE_ICON = html`
    <svg
        class="filterGroupVariantsMobSortBtnIcon"
        width="8"
        height="6"
        viewBox="0 0 8 6"
        aria-hidden="true"
    >
        <path d="M4 0L8 6H0L4 0Z" fill="currentColor" />
    </svg>
`;

const shareIconSrc = assetUrl('./assets/icons/buttons/reset.svg');

class FilterGroupVariantsMobSort extends BaseElement {
    static properties = {
        field: { type: String },
        direction: { type: String }
    };

    constructor() {
        super();
        /** @type {FilterGroupVariantsSortField | ''} */
        this.field = '';
        /** @type {FilterGroupVariantsSortDirection} */
        this.direction = 'asc';
    }

    /** @param {FilterGroupVariantsSortField} field */
    _onFieldClick(field) {
        this.dispatchEvent(new CustomEvent('filter-group-variants-sort-field', {
            bubbles: true,
            detail: { field }
        }));
    }

    _onResetClick() {
        this.dispatchEvent(new CustomEvent('filter-group-variants-sort-reset', {
            bubbles: true
        }));
    }

    render() {
        return html`
            <div class="filterGroupVariantsMobSort" part="sort">
                <div class="filterGroupVariantsMobSortLead">
                    <span class="filterGroupVariantsMobSortLabel">Сортировать</span>
                    <button
                        type="button"
                        class="filterGroupVariantsMobSortReset"
                        aria-label="Сбросить сортировку"
                        @click=${this._onResetClick}
                    >
                        <img
                            class="filterResultsMobOffersBtnIcon"
                            src=${shareIconSrc}
                            alt=""
                            aria-hidden="true"
                        />
                    </button>
                </div>

                <div class="filterGroupVariantsMobSortOptions" role="group" aria-label="Сортировка">
                    ${SORT_OPTIONS.map(({ field, label }) => {
                        const active = this.field === field;

                        return html`
                            <button
                                type="button"
                                class="filterGroupVariantsMobSortBtn${active ? ' filterGroupVariantsMobSortBtn--active' : ''}"
                                aria-pressed=${active ? 'true' : 'false'}
                                data-direction=${active ? this.direction : nothing}
                                @click=${() => this._onFieldClick(/** @type {FilterGroupVariantsSortField} */ (field))}
                            >
                                ${active ? SORT_TRIANGLE_ICON : null}
                                <span>${label}</span>
                            </button>
                        `;
                    })}
                </div>
            </div>
        `;
    }
}

registerComponent('filter-group-variants-mob-sort', FilterGroupVariantsMobSort);

export { FilterGroupVariantsMobSort };
