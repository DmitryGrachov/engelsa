import {
    BaseElement,
    html,
    registerComponent
} from '../../../lit/index.js';
import { assetUrl } from '../../../../utils/asset-url.js';

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

class UserMenuPanel extends BaseElement {
    static properties = {
        userId: { type: String, attribute: 'user-id' }
    };

    constructor() {
        super();
        this.userId = '';
    }

    _emit(name, detail) {
        this.dispatchEvent(new CustomEvent(name, {
            bubbles: true,
            detail
        }));
    }

    _onCloseClick() {
        this._emit('user-menu-close');
    }

    /** @param {string} itemId */
    _onItemClick(itemId) {
        this._emit('user-menu-item', { itemId });
    }

    _onLoginClick() {
        this._emit('user-menu-login');
    }

    render() {
        const avatarIconSrc = assetUrl('./assets/icons/avatar.svg');
        const loginIconSrc = assetUrl('./assets/icons/menupanel/login.svg');

        return html`
            <div class="userMenuPanel" part="panel">
                <button
                    type="button"
                    class="userMenuPanelClose"
                    aria-label="Закрыть меню"
                    @click=${this._onCloseClick}
                >
                    <span class="userMenuPanelCloseIcon" aria-hidden="true">×</span>
                </button>

                <div class="userMenuPanelProfile">
                    <div class="userMenuPanelAvatar" aria-hidden="true">
                        <img
                            class="userMenuPanelAvatarImg"
                            src=${avatarIconSrc}
                            alt=""
                        />
                    </div>
                    <div class="userMenuPanelUserText">
                        <p class="userMenuPanelUserName">Пользователь</p>
                        <p class="userMenuPanelUserId">id ${this.userId || '—'}</p>
                    </div>
                </div>

                <nav class="userMenuPanelNav" aria-label="Меню пользователя">
                    ${MENU_ITEMS.map(({ id, label, icon }) => html`
                        <button
                            type="button"
                            class="userMenuPanelNavItem"
                            @click=${() => this._onItemClick(id)}
                        >
                            <img
                                class="userMenuPanelNavIcon"
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
                    class="userMenuPanelLogin"
                    @click=${this._onLoginClick}
                >
                    <img
                        class="userMenuPanelLoginIcon"
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

registerComponent('user-menu-panel', UserMenuPanel);

export { UserMenuPanel };
