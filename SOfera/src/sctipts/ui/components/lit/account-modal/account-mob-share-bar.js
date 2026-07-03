import {
    BaseElement,
    html,
    registerComponent
} from '../../../lit/index.js';
import { assetUrl } from '../../../../utils/asset-url.js';
import {
    attachTouchFriendlyButtons,
    detachTouchFriendlyButtons
} from '../../../../utils/touch-friendly-buttons.js';

class AccountMobShareBar extends BaseElement {
    connectedCallback() {
        super.connectedCallback();
        attachTouchFriendlyButtons(this);
    }

    disconnectedCallback() {
        detachTouchFriendlyButtons(this);
        super.disconnectedCallback();
    }

    _onShareClick() {
        this.dispatchEvent(new CustomEvent('account-share', {
            bubbles: true
        }));
    }

    render() {
        const shareIconSrc = assetUrl('./assets/icons/buttons/share.svg');

        return html`
            <div class="accountMobShareBar" part="share-bar">
                <button
                    type="button"
                    class="accountMobShareBtn"
                    @click=${this._onShareClick}
                >
                    <span class="accountMobShareBtnText">Поделиться подборкой</span>
                    <img
                        class="accountMobShareBtnIcon"
                        src=${shareIconSrc}
                        alt=""
                        aria-hidden="true"
                    />
                </button>
            </div>
        `;
    }
}

registerComponent('account-mob-share-bar', AccountMobShareBar);

export { AccountMobShareBar };
