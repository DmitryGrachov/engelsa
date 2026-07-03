import {
    BaseElement,
    html,
    registerComponent
} from '../../../../lit/index.js';
import { assetUrl } from '../../../../../utils/asset-url.js';
import { FILTER_ICON } from '../../../filter/button-icons.js';

const COMPARE_SLOT_MAX = 6;

const MENU_ICON = html`
    <svg
        class="favoritesApartmentsMobMenuIcon"
        width="23"
        height="14"
        viewBox="0 0 18 12"
        aria-hidden="true"
    >
        <path d="M0 1H18M0 6H18M0 11H18" stroke="currentColor" stroke-width="1.5" />
    </svg>
`;

class FavoritesApartmentsMobHeader extends BaseElement {
    static properties = {
        compareCount: { type: Number, attribute: 'compare-count' }
    };

    constructor() {
        super();
        this.compareCount = 0;
    }

    _onCloseClick() {
        this.dispatchEvent(new CustomEvent('favorites-apartments-close', {
            bubbles: true
        }));
    }

    _onClearClick() {
        this.dispatchEvent(new CustomEvent('favorites-apartments-clear', {
            bubbles: true
        }));
    }

    _onCompareClick() {
        this.dispatchEvent(new CustomEvent('favorites-apartments-compare-open', {
            bubbles: true
        }));
    }

    _onMenuClick() {
        this.dispatchEvent(new CustomEvent('favorites-apartments-menu', {
            bubbles: true
        }));
    }

    render() {
        const backIconSrc = assetUrl(FILTER_ICON.back);
        const garbageIconSrc = assetUrl('./assets/icons/buttons/garbage.svg');
        const compareCount = Math.max(0, Math.min(this.compareCount, COMPARE_SLOT_MAX));

        return html`
            <header class="favoritesApartmentsMobHeader" part="header">
                <div class="favoritesApartmentsMobTopNav">
                    <button
                        type="button"
                        class="favoritesApartmentsMobBack"
                        aria-label="Закрыть"
                        @click=${this._onCloseClick}
                    >
                        <img
                            class="favoritesApartmentsMobBackIcon"
                            src=${backIconSrc}
                            alt=""
                            aria-hidden="true"
                        />
                    </button>

                    <button
                        type="button"
                        class="favoritesApartmentsMobMenu"
                        aria-label="Меню"
                        @click=${this._onMenuClick}
                    >
                        ${MENU_ICON}
                    </button>
                </div>

                <div class="favoritesApartmentsMobTitles">
                    <h1 class="favoritesApartmentsMobTitleMain">Избранное</h1>
                    <p class="favoritesApartmentsMobTitleSub">Квартиры</p>
                </div>

                <div class="favoritesApartmentsMobHeaderActions">
                    <button
                        type="button"
                        class="favoritesApartmentsMobClearBtn"
                        @click=${this._onClearClick}
                    >
                        <span>Очистить избранное</span>
                        <img
                            class="favoritesApartmentsMobClearBtnIcon"
                            src=${garbageIconSrc}
                            alt=""
                            aria-hidden="true"
                        />
                    </button>

                    <button
                        type="button"
                        class="favoritesApartmentsMobCompareBtn"
                        @click=${this._onCompareClick}
                    >
                        В листе сравнения ${compareCount}/${COMPARE_SLOT_MAX}
                    </button>
                </div>
            </header>
        `;
    }
}

registerComponent('favorites-apartments-mob-header', FavoritesApartmentsMobHeader);

export { FavoritesApartmentsMobHeader, COMPARE_SLOT_MAX };
