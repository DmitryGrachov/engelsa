import {
    BaseElement,
    html,
    nothing,
    registerComponent
} from '../../../lit/index.js';
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
                        aria-label="Закрыть"
                        @click=${this._onCloseClick}
                    >
                        <span class="interestPoiTourModalCloseIcon" aria-hidden="true">×</span>
                    </button>
                </div>
            </div>
        `;
    }
}

registerComponent('interest-poi-tour-view', InterestPoiTourView);

export { InterestPoiTourView };
