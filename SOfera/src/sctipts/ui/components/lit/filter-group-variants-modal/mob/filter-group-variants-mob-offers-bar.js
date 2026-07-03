import {
    BaseElement,
    html,
    registerComponent
} from '../../../../lit/index.js';
import { assetUrl } from '../../../../../utils/asset-url.js';

class FilterGroupVariantsMobOffersBar extends BaseElement {
    _onOffersClick() {
        this.dispatchEvent(new CustomEvent('filter-group-variants-offers', {
            bubbles: true
        }));
    }

    render() {
        const shareIconSrc = assetUrl('./assets/icons/buttons/share.svg');

        return html`
            <div class="filterGroupVariantsMobOffersBar" part="offers-bar">
                <button
                    type="button"
                    class="filterGroupVariantsMobOffersBtn"
                    @click=${this._onOffersClick}
                >
                    <span class="filterGroupVariantsMobOffersBtnText">
                        Получить предложения
                    </span>
                    <img
                        class="filterGroupVariantsMobOffersBtnIcon"
                        src=${shareIconSrc}
                        alt=""
                        aria-hidden="true"
                    />
                </button>
            </div>
        `;
    }
}

registerComponent('filter-group-variants-mob-offers-bar', FilterGroupVariantsMobOffersBar);

export { FilterGroupVariantsMobOffersBar };
