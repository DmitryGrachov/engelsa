import {
    BaseElement,
    html,
    nothing,
    registerComponent
} from '../../../lit/index.js';
import { assetUrl } from '../../../../utils/asset-url.js';
import { formatSavedCountLine } from './account-modal-utils.js';
import '../account-mob-recommendations/account-mob-recommendations.js';

class AccountMobView extends BaseElement {
    static properties = {
        userId: { type: String, attribute: 'user-id' },
        apartmentsCount: { type: Number, attribute: 'apartments-count' },
        parkingCount: { type: Number, attribute: 'parking-count' },
        totalCount: { type: Number, attribute: 'total-count' },
        recommendations: { type: Array }
    };

    constructor() {
        super();
        this.userId = '';
        this.apartmentsCount = 0;
        this.parkingCount = 0;
        this.totalCount = 0;
        this.recommendations = [];
    }

    _emit(name) {
        this.dispatchEvent(new CustomEvent(name, { bubbles: true }));
    }

    _onSearchApartmentsClick() {
        this._emit('account-search-apartments');
    }

    _onFavoriteApartmentsClick() {
        this._emit('account-open-favorites-apartments');
    }

    _onParkingClick() {
        if (this._isParkingLocked())
            return;

        console.log('parking');
    }

    _onAllClick() {
        console.log('all');
    }

    _isParkingLocked() {
        return true;
    }

    /** @param {Event} event */
    _onApartmentsCardClick(event) {
        event.stopPropagation();

        if (this.apartmentsCount === 0) {
            this._onSearchApartmentsClick();
            return;
        }

        this._onFavoriteApartmentsClick();
    }

    render() {
        const likeIconSrc = assetUrl('./assets/icons/fav_like.svg');
        const lockIconSrc = assetUrl('./assets/icons/lock.svg');
        const avatarIconSrc = assetUrl('./assets/icons/avatar.svg');
        const apartmentPreviewSrc = assetUrl('./assets/account/apartment.png');
        const parkingPreviewSrc = assetUrl('./assets/account/parking.png');
        const parkingLocked = this._isParkingLocked();

        return html`
            <div class="accountMobView" part="root">
                <div class="accountMobScroll">
                <header class="accountMobHeader">
                    <div class="accountMobHeaderInner">
                        <div class="accountMobUser">
                            <div class="accountMobAvatarSvg" aria-hidden="true">
                                <img
                                    class="accountMobSectionIcon"
                                    src=${avatarIconSrc}
                                    alt=""
                                    aria-hidden="true"
                                />
                            </div>
                            <div class="accountMobUserText">
                                <h1 class="accountMobGreeting">Здравствуйте, Пользователь!</h1>
                                <p class="accountMobUserId">id ${this.userId || '—'}</p>
                            </div>
                        </div>
                    </div>
                </header>

                <p class="accountMobLead">Ваши последние действия и настройки:</p>

                <div class="accountMobSectionHead">
                    <h2 class="accountMobSectionTitle">Добавленное Избранное</h2>
                    <img
                        class="accountMobSectionIcon like-icon"
                        src=${likeIconSrc}
                        alt=""
                        aria-hidden="true"
                    />
                </div>

                <div class="accountMobCards">
                    <button
                        type="button"
                        class="accountMobCard accountMobCard--apartments ${this.apartmentsCount > 0 ? 'accountMobCard--apartments-has-saved' : ''}"
                        aria-label=${this.apartmentsCount === 0
                            ? 'Поиск квартир'
                            : 'Открыть избранные квартиры'}
                        @click=${this._onApartmentsCardClick}
                    >
                        <div class="accountMobCardBody">
                            <div class="accountMobCardText">
                                <h3 class="accountMobCardTitle">Квартиры</h3>
                                <p class="accountMobCardCount">
                                    ${formatSavedCountLine(this.apartmentsCount)}
                                </p>
                            </div>
                            <div class="accountMobCardMedia">
                                <img
                                    class="accountMobCardMediaImg"
                                    src=${apartmentPreviewSrc}
                                    alt=""
                                    draggable="false"
                                />
                                ${this.apartmentsCount === 0 ? html`
                                    <span class="accountMobCardAction">Поиск квартир</span>
                                ` : nothing}
                            </div>
                        </div>
                    </button>

                    <button
                        type="button"
                        class="accountMobCard accountMobCard--parking ${parkingLocked ? 'accountMobCard--locked' : ''}"
                        aria-label="Паркинг"
                        ?disabled=${parkingLocked}
                        @click=${this._onParkingClick}
                    >
                        <div class="accountMobCardBody">
                            <div class="accountMobCardText">
                                <h3 class="accountMobCardTitle">Паркинг</h3>
                                <p class="accountMobCardCount">
                                    ${formatSavedCountLine(this.parkingCount)}
                                </p>
                            </div>
                            <div class="accountMobCardMedia accountMobCardMedia--parking">
                                <img
                                    class="accountMobCardMediaImg"
                                    src=${parkingPreviewSrc}
                                    alt=""
                                    draggable="false"
                                />
                            </div>
                        </div>
                        ${parkingLocked ? html`
                            <div class="accountMobCardSoon" aria-hidden="true">
                                <img
                                    class="accountMobCardSoonIcon"
                                    src=${lockIconSrc}
                                    alt=""
                                    draggable="false"
                                />
                                <span>Скоро</span>
                            </div>
                        ` : nothing}
                    </button>

                    <button
                        type="button"
                        class="accountMobCard accountMobCard--all"
                        aria-label="Все сохраненные"
                        @click=${this._onAllClick}
                    >
                        <div class="accountMobCardBody">
                            <div class="accountMobCardText">
                                <h3 class="accountMobCardTitle">Все</h3>
                                <p class="accountMobCardCount">
                                    ${formatSavedCountLine(this.totalCount)}
                                </p>
                            </div>
                            <div class="accountMobCardThumbs" aria-hidden="true">
                                <img
                                    class="accountMobCardThumb"
                                    src=${apartmentPreviewSrc}
                                    alt=""
                                    draggable="false"
                                />
                                <img
                                    class="accountMobCardThumb accountMobCardThumb--parking"
                                    src=${parkingPreviewSrc}
                                    alt=""
                                    draggable="false"
                                />
                            </div>
                        </div>
                    </button>
                </div>

                <account-mob-recommendations
                    .groups=${this.recommendations}
                ></account-mob-recommendations>
                </div>
            </div>
        `;
    }
}

registerComponent('account-mob-view', AccountMobView);

export { AccountMobView };
