import {
    BaseElement,
    html,
    nothing,
    registerComponent
} from '../../../lit/index.js';
import { assetUrl } from '../../../../utils/asset-url.js';
import { INTEREST_POI_TOUR_URL } from './interest-poi-tour-data.js';

class InterestPoiTourView extends BaseElement {
    static properties = {
        open: { type: Boolean, reflect: true }
    };

    constructor() {
        super();
        this.open = false;
    }

    /** @param {Event} event */
    _stop(event) {
        event.stopPropagation();
    }

    _onCloseClick() {
        this.open = false;
        this.dispatchEvent(new CustomEvent('interest-poi-tour-close', { bubbles: true }));
    }

    render() {
        if (!this.open)
            return nothing;

        return html`
            <div
                class="interestPoiTourModalShell interestPoiTourModalShell--open"
                role="dialog"
                aria-modal="true"
                aria-label="Прогулка по двору"
                aria-hidden="false"
                @pointerdown=${this._stop}
            >
                <iframe
                    class="interestPoiTourModalIframe"
                    src=${INTEREST_POI_TOUR_URL}
                    title="Прогулка по двору"
                    allowfullscreen
                    referrerpolicy="strict-origin-when-cross-origin"
                    allow="xr-spatial-tracking *; fullscreen *; accelerometer *; gyroscope *; magnetometer *"
                ></iframe>

                <div class="interestPoiTourModalBar">
                    <button
                        type="button"
                        class="interestPoiTourModalClose"
                        aria-label="Завершить тур"
                        @click=${this._onCloseClick}
                    >
                        <span class="interestPoiTourModalCloseLabel">Завершить тур</span>
                        <img
                            class="interestPoiTourModalCloseIcon"
                            src=${assetUrl('./assets/icons/close.svg')}
                            alt=""
                            width="30"
                            height="30"
                            draggable="false"
                        />
                    </button>
                </div>
            </div>
        `;
    }
}

registerComponent('interest-poi-tour-view', InterestPoiTourView);

export { InterestPoiTourView };
