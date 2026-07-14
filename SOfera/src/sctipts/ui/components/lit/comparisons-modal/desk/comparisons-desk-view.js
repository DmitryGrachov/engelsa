import {
    BaseElement,
    html,
    registerComponent,
    repeat
} from '../../../../lit/index.js';
import { assetUrl } from '../../../../../utils/asset-url.js';
import { sortFilterGroupVariants } from '../../filter-group-variants-modal/filter-group-variants-sort/index.js';
import { formatComparisonsInCountLine } from '../comparisons-modal-utils.js';
import './comparisons-desk-card.js';
import './comparisons-desk-sort.js';
import './comparisons-desk-user-menu.js';

/** @typedef {import('../filter-group-variants-modal/filter-group-variants-data.js').FilterGroupVariantItem} FilterGroupVariantItem */
/** @typedef {import('../filter-group-variants-modal/filter-group-variants-sort/filter-group-variants-sort.js').FilterGroupVariantsSortField} FilterGroupVariantsSortField */
/** @typedef {import('../filter-group-variants-modal/filter-group-variants-sort/filter-group-variants-sort.js').FilterGroupVariantsSortDirection} FilterGroupVariantsSortDirection */
/** @typedef {'all' | 'apartments'} ComparisonsDeskTab */

class ComparisonsDeskView extends BaseElement {
    static properties = {
        userId: { type: String, attribute: 'user-id' },
        apartmentsCount: { type: Number, attribute: 'apartments-count' },
        parkingCount: { type: Number, attribute: 'parking-count' },
        totalCount: { type: Number, attribute: 'total-count' },
        variants: { type: Array },
        sortField: { type: String, state: true },
        sortDirection: { type: String, state: true },
        activeTab: { type: String, state: true },
        userMenuOpen: { type: Boolean, state: true }
    };

    constructor() {
        super();
        this.userId = '';
        this.apartmentsCount = 0;
        this.parkingCount = 0;
        this.totalCount = 0;
        this.variants = [];
        /** @type {FilterGroupVariantsSortField | ''} */
        this.sortField = '';
        /** @type {FilterGroupVariantsSortDirection} */
        this.sortDirection = 'asc';
        /** @type {ComparisonsDeskTab} */
        this.activeTab = 'all';
        this.userMenuOpen = false;
        /** @type {((event: KeyboardEvent) => void) | null} */
        this._userMenuKeyDown = null;
    }

    connectedCallback() {
        super.connectedCallback();
        this._userMenuKeyDown = (event) => {
            if (event.key === 'Escape' && this.userMenuOpen)
                this._closeUserMenu();
        };
        window.addEventListener('keydown', this._userMenuKeyDown);
    }

    disconnectedCallback() {
        if (this._userMenuKeyDown) {
            window.removeEventListener('keydown', this._userMenuKeyDown);
            this._userMenuKeyDown = null;
        }

        super.disconnectedCallback();
    }

    _emit(name) {
        this.dispatchEvent(new CustomEvent(name, { bubbles: true }));
    }

    _onCloseClick() {
        this._closeUserMenu();
        this._emit('comparisons-close');
    }

    _closeUserMenu() {
        this.userMenuOpen = false;
    }

    _toggleUserMenu() {
        this.userMenuOpen = !this.userMenuOpen;
    }

    _onMortgageClick() {
        this._emit('comparisons-mortgage-calculator');
    }

    _onOffersClick() {
        this._emit('comparisons-desk-offers');
    }

    _onClearClick() {
        this._emit('comparisons-desk-clear');
    }

    /** @param {ComparisonsDeskTab} tab */
    _onTabClick(tab) {
        this.activeTab = tab;
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

    /** @param {FilterGroupVariantItem[]} sortedVariants */
    _renderGrid(sortedVariants) {
        return html`
            <div
                class="accountDeskFavoritesGrid"
                role="list"
            >
                ${repeat(
                    sortedVariants,
                    (variant) => variant.id,
                    (variant) => html`
                        <comparisons-desk-card
                            .variant=${variant}
                        ></comparisons-desk-card>
                    `
                )}
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
        const avatarSrc = assetUrl('./assets/icons/avatar.svg');
        const shareIconSrc = assetUrl('./assets/icons/buttons/share.svg');
        const garbageIconSrc = assetUrl('./assets/icons/buttons/garbage.svg');
        const showApartmentsSection =
            this.activeTab === 'all' || this.activeTab === 'apartments';

        return html`
            <div class="accountDeskView" part="root">
                <header class="accountDeskFavoritesTopBar">
                    <img
                        class="accountDeskFavoritesLogo"
                        src=${logoSrc}
                        alt="OCT"
                        draggable="false"
                    />

                    <button
                        type="button"
                        class="accountDeskFavoritesMortgageBtn"
                        @click=${this._onMortgageClick}
                    >
                        Ипотечный калькулятор
                    </button>

                    <div class="accountDeskFavoritesTopBarRight">
                        <div class="accountDeskFavoritesUserWrap">
                            <button
                                type="button"
                                class="accountDeskFavoritesUser"
                                aria-expanded=${this.userMenuOpen ? 'true' : 'false'}
                                aria-haspopup="dialog"
                                @click=${this._toggleUserMenu}
                            >
                                <img
                                    class="accountDeskFavoritesAvatar"
                                    src=${avatarSrc}
                                    alt=""
                                    aria-hidden="true"
                                />
                                <span class="accountDeskFavoritesUserText">
                                    <span class="accountDeskFavoritesGreeting">Здравствуйте, Пользователь!</span>
                                    <span class="accountDeskFavoritesUserId">id ${this.userId || '—'}</span>
                                </span>
                            </button>

                            ${this.userMenuOpen
                                ? html`
                                    <div class="accountDeskFavoritesUserMenuLayer">
                                        <button
                                            type="button"
                                            class="accountDeskFavoritesUserMenuBackdrop"
                                            aria-label="Закрыть меню"
                                            @click=${this._closeUserMenu}
                                        ></button>
                                        <comparisons-desk-user-menu
                                            class="accountDeskFavoritesUserMenuHost"
                                            user-id=${this.userId}
                                            @comparisons-desk-user-menu-close=${this._closeUserMenu}
                                        ></comparisons-desk-user-menu>
                                    </div>
                                `
                                : null}
                        </div>

                        <button
                            type="button"
                            class="accountDeskFavoritesClose"
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
                    </div>
                </header>

                <div class="accountDeskFavoritesHeadline">
                    <h1 class="accountDeskFavoritesTitle">Сравнение</h1>
                    <p class="accountDeskFavoritesSubtitle">Ваши сравнения:</p>
                </div>

                <div class="accountDeskFavoritesTabs" role="tablist" aria-label="Категории сравнения">
                    <button
                        type="button"
                        class="accountDeskFavoritesTab${this.activeTab === 'all' ? ' accountDeskFavoritesTab--active' : ''}"
                        role="tab"
                        aria-selected=${this.activeTab === 'all' ? 'true' : 'false'}
                        @click=${() => this._onTabClick('all')}
                    >
                        <span class="accountDeskFavoritesTabLabel">Все</span>
                        ${this.totalCount > 0
                            ? html`
                                <span class="accountDeskFavoritesTabBadge">${this.totalCount}</span>
                            `
                            : null}
                    </button>
                    <button
                        type="button"
                        class="accountDeskFavoritesTab${this.activeTab === 'apartments' ? ' accountDeskFavoritesTab--active' : ''}"
                        role="tab"
                        aria-selected=${this.activeTab === 'apartments' ? 'true' : 'false'}
                        @click=${() => this._onTabClick('apartments')}
                    >
                        <span class="accountDeskFavoritesTabLabel">Квартиры</span>
                        ${this.apartmentsCount > 0
                            ? html`
                                <span class="accountDeskFavoritesTabBadge">${this.apartmentsCount}</span>
                            `
                            : null}
                    </button>
                </div>

                ${showApartmentsSection
                    ? html`
                        <div class="accountDeskFavoritesToolbar">
                            <div class="accountDeskFavoritesToolbarLeft">
                                <div class="accountDeskFavoritesSectionHead">
                                    <h2 class="accountDeskFavoritesSectionTitle">Квартиры</h2>
                                    <p class="accountDeskFavoritesSectionCount">
                                        ${formatComparisonsInCountLine(this.apartmentsCount)}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    class="accountDeskFavoritesOffersBtn"
                                    @click=${this._onOffersClick}
                                >
                                    <span>Получить предложение</span>
                                    <img
                                        class="accountDeskFavoritesOffersBtnIcon"
                                        src=${shareIconSrc}
                                        alt=""
                                        aria-hidden="true"
                                    />
                                </button>

                                ${this.apartmentsCount > 0
                                    ? html`
                                        <button
                                            type="button"
                                            class="accountDeskFavoritesClearBtn"
                                            @click=${this._onClearClick}
                                        >
                                            <span>Очистить сравнение</span>
                                            <img
                                                class="accountDeskFavoritesClearBtnIcon"
                                                src=${garbageIconSrc}
                                                alt=""
                                                aria-hidden="true"
                                            />
                                        </button>
                                    `
                                    : null}
                            </div>

                            <div class="accountDeskFavoritesToolbarRight">
                                <comparisons-desk-sort
                                    .field=${this.sortField}
                                    .direction=${this.sortDirection}
                                    @filter-group-variants-sort-field=${this._onSortField}
                                    @filter-group-variants-sort-reset=${this._onSortReset}
                                ></comparisons-desk-sort>
                            </div>
                        </div>

                        ${this._renderGrid(sortedVariants)}
                    `
                    : null}
            </div>
        `;
    }
}

registerComponent('comparisons-desk-view', ComparisonsDeskView);

export { ComparisonsDeskView };
