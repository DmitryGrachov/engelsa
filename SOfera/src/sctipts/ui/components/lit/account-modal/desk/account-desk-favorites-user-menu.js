import {
    BaseElement,
    html,
    registerComponent
} from '../../../../lit/index.js';
import { assetUrl } from '../../../../../utils/asset-url.js';

const MENU_ITEMS = Object.freeze([
    {
        id: 'object',
        label: 'Выбор Объекта',
        icon: './assets/icons/menupanel/home.svg'
    },
    {
        id: 'favorites',
        label: 'Избранное',
        icon: './assets/icons/menupanel/like.svg'
    },
    {
        id: 'compare',
        label: 'Сравнение',
        icon: './assets/icons/menupanel/compare.svg'
    },
    {
        id: 'gallery',
        label: 'Галерея',
        icon: './assets/icons/menupanel/gallery.svg'
    }
]);

class AccountDeskFavoritesUserMenu extends BaseElement {
    static properties = {
        userId: { type: String, attribute: 'user-id' }
    };

    constructor() {
        super();
        this.userId = '';
    }

    _onCloseClick() {
        this.dispatchEvent(new CustomEvent('account-desk-favorites-user-menu-close', {
            bubbles: true
        }));
    }

    /** @param {string} itemId */
    _onItemClick(itemId) {
        this.dispatchEvent(new CustomEvent('account-desk-favorites-user-menu-item', {
            bubbles: true,
            detail: { itemId }
        }));
        this._onCloseClick();
    }

    render() {
        const avatarIconSrc = assetUrl('./assets/icons/avatar.svg');
        const loginIconSrc = assetUrl('./assets/icons/menupanel/login.svg');

        return html`
            <div class="accountDeskFavoritesUserMenu" part="panel">
                <button
                    type="button"
                    class="accountDeskFavoritesUserMenuClose"
                    aria-label="Закрыть меню"
                    @click=${this._onCloseClick}
                >
                    <span class="accountDeskFavoritesUserMenuCloseIcon" aria-hidden="true">×</span>
                </button>

                <div class="accountDeskFavoritesUserMenuProfile">
                    <div class="accountDeskFavoritesUserMenuAvatar" aria-hidden="true">
                        <img
                            class="accountDeskFavoritesUserMenuAvatarImg"
                            src=${avatarIconSrc}
                            alt=""
                        />
                    </div>
                    <div class="accountDeskFavoritesUserMenuUserText">
                        <p class="accountDeskFavoritesUserMenuUserName">Пользователь</p>
                        <p class="accountDeskFavoritesUserMenuUserId">id ${this.userId || '—'}</p>
                    </div>
                </div>

                <nav class="accountDeskFavoritesUserMenuNav" aria-label="Меню пользователя">
                    ${MENU_ITEMS.map(({ id, label, icon }) => html`
                        <button
                            type="button"
                            class="accountDeskFavoritesUserMenuNavItem"
                            data-item-id=${id}
                            @click=${() => this._onItemClick(id)}
                        >
                            <img
                                class="accountDeskFavoritesUserMenuNavIcon"
                                src=${assetUrl(icon)}
                                alt=""
                                aria-hidden="true"
                            />
                            <span>${label}</span>
                        </button>
                    `)}
                </nav>

                <button
                    type="button"
                    class="accountDeskFavoritesUserMenuLogin"
                >
                    <img
                        class="accountDeskFavoritesUserMenuLoginIcon"
                        src=${loginIconSrc}
                        alt=""
                        aria-hidden="true"
                    />
                    <span>Вход</span>
                </button>
            </div>
        `;
    }
}

registerComponent('account-desk-favorites-user-menu', AccountDeskFavoritesUserMenu);

export { AccountDeskFavoritesUserMenu };
