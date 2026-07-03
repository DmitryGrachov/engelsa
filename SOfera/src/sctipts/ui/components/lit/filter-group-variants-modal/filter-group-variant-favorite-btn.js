import {
    BaseElement,
    html,
    registerComponent
} from '../../../lit/index.js';
import {
    bindVariantFavoritesListener,
    FAVORITE_HEART_ICON,
    isVariantFavorite,
    toggleVariantFavorite
} from './filter-group-variant-favorite.js';

/** @typedef {import('./filter-group-variants-data.js').FilterGroupVariantItem} FilterGroupVariantItem */
/** @typedef {'card' | 'list' | 'mob-card'} FilterGroupVariantFavoriteAppearance */

class FilterGroupVariantFavoriteBtn extends BaseElement {
    static properties = {
        variant: { type: Object },
        appearance: { type: String }
    };

    constructor() {
        super();
        /** @type {FilterGroupVariantItem | null} */
        this.variant = null;
        /** @type {FilterGroupVariantFavoriteAppearance} */
        this.appearance = 'card';
        /** @type {(() => void) | null} */
        this._unbindFavoritesListener = null;
    }

    connectedCallback() {
        super.connectedCallback();
        this._unbindFavoritesListener = bindVariantFavoritesListener(this, () => {
            this.requestUpdate();
        });
    }

    disconnectedCallback() {
        this._unbindFavoritesListener?.();
        this._unbindFavoritesListener = null;
        super.disconnectedCallback();
    }

    /** @param {Event} event */
    _onClick(event) {
        event.stopPropagation();
        toggleVariantFavorite(this.variant);
    }

    render() {
        const favorite = isVariantFavorite(this.variant);
        const className = this.appearance === 'list'
            ? 'filterGroupVariantsDeskListFavorite'
            : this.appearance === 'mob-card'
                ? 'filterGroupVariantCardFavorite'
                : 'filterGroupVariantsDeskCardFavorite';

        return html`
            <button
                type="button"
                class="${className}${favorite ? ` ${className}--active` : ''}"
                aria-label=${favorite ? 'Убрать из избранного' : 'Добавить в избранное'}
                aria-pressed=${favorite ? 'true' : 'false'}
                @click=${this._onClick}
            >
                ${FAVORITE_HEART_ICON}
            </button>
        `;
    }
}

registerComponent('filter-group-variant-favorite-btn', FilterGroupVariantFavoriteBtn);

export { FilterGroupVariantFavoriteBtn };
