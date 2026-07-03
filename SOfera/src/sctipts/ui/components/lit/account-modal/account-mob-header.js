import {
    BaseElement,
    html,
    registerComponent
} from '../../../lit/index.js';
import { assetUrl } from '../../../../utils/asset-url.js';

const MENU_ICON = html`
    <svg
        class="accountMobModalMenuIcon"
        width="23"
        height="14"
        viewBox="0 0 18 12"
        aria-hidden="true"
    >
        <path d="M0 1H18M0 6H18M0 11H18" stroke="currentColor" stroke-width="1.5" />
    </svg>
`;

class AccountMobHeader extends BaseElement {
    _onMenuClick() {
        this.dispatchEvent(new CustomEvent('account-menu', {
            bubbles: true
        }));
    }

    render() {
        const logoSrc = assetUrl('./assets/small_logo.svg');
        const praimSrc = assetUrl('./assets/praim.svg');

        return html`
            <header class="accountMobModalHeader" part="header">
                <div class="accountMobModalTopNav">
                    <img
                        class="accountMobModalLogo"
                        src=${logoSrc}
                        alt="OCT"
                        draggable="false"
                    />

                    <img
                        class="accountMobModalPraim"
                        src=${praimSrc}
                        alt=""
                        draggable="false"
                        aria-hidden="true"
                    />

                    <button
                        type="button"
                        class="accountMobModalMenu"
                        aria-label="Меню"
                        data-native-touch=""
                        @click=${this._onMenuClick}
                    >
                        ${MENU_ICON}
                    </button>
                </div>
            </header>
        `;
    }
}

registerComponent('account-mob-header', AccountMobHeader);

export { AccountMobHeader };
