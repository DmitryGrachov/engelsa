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
        class="accountDeskFavoritesSortBtnIcon"
        width="11"
        height="8"
        viewBox="0 0 8 6"
        aria-hidden="true"
    >
        <path d="M4 0L8 6H0L4 0Z" fill="currentColor" />
    </svg>
`;

const RESET_ICON_SRC = assetUrl('./assets/icons/buttons/reset.svg');

class AccountDeskFavoritesSort extends BaseElement {
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
            <div class="accountDeskFavoritesSort" part="sort">
                <div class="accountDeskFavoritesSortLead">
                    <span class="accountDeskFavoritesSortLabel">Сортировать</span>
                    <button
                        type="button"
                        class="accountDeskFavoritesSortReset"
                        aria-label="Сбросить сортировку"
                        @click=${this._onResetClick}
                    >
                        <img
                            class="accountDeskFavoritesSortResetIcon"
                            src=${RESET_ICON_SRC}
                            alt=""
                            aria-hidden="true"
                        />
                    </button>
                </div>

                <div class="accountDeskFavoritesSortOptions" role="group" aria-label="Сортировка">
                    ${SORT_OPTIONS.map(({ field, label }) => {
                        const active = this.field === field;

                        return html`
                            <button
                                type="button"
                                class="accountDeskFavoritesSortBtn${active ? ' accountDeskFavoritesSortBtn--active' : ''}"
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

registerComponent('account-desk-favorites-sort', AccountDeskFavoritesSort);

export { AccountDeskFavoritesSort };
