import {
    BaseElement,
    html,
    registerComponent
} from '../../../lit/index.js';
import { assetUrl } from '../../../../utils/asset-url.js';
import { FILTER_ICON } from '../../filter/button-icons.js';
import './object-select-panel.js';

class ObjectSelectView extends BaseElement {
    _onCloseClick() {
        this.dispatchEvent(new CustomEvent('object-select-close', {
            bubbles: true
        }));
    }

    render() {
        const backIconSrc = assetUrl(FILTER_ICON.back);

        return html`
            <div class="objectSelectView" part="root">
                <object-select-panel></object-select-panel>

                <button
                    type="button"
                    class="objectSelectClose"
                    aria-label="Закрыть"
                    @click=${this._onCloseClick}
                >
                    <img
                        class="objectSelectCloseIcon"
                        src=${backIconSrc}
                        alt=""
                        aria-hidden="true"
                    />
                </button>
            </div>
        `;
    }
}

registerComponent('object-select-view', ObjectSelectView);

export { ObjectSelectView };
