import {
    BaseElement,
    html,
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

    /** @returns {HTMLIFrameElement | null} */
    _getIframe() {
        const iframe = this.renderRoot?.querySelector('iframe.interestPoiTourModalIframe');

        return iframe instanceof HTMLIFrameElement ? iframe : null;
    }

    /** Выгрузка документа iframe (WebGL сфера) — до скрытия/remove. */
    unloadTourIframe() {
        const iframe = this._getIframe();

        if (!iframe)
            return;

        try {
            iframe.src = 'about:blank';
        } catch {
            /* ignore */
        }

        iframe.removeAttribute('src');
    }

    /** @param {Map<string, unknown>} changed */
    willUpdate(changed) {
        if (changed.has('open') && changed.get('open') === true && !this.open)
            this.unloadTourIframe();
    }

    /** @param {Map<string, unknown>} changed */
    updated(changed) {
        if (!changed.has('open'))
            return;

        const iframe = this._getIframe();

        if (!iframe)
            return;

        if (this.open) {
            if (iframe.getAttribute('src') !== INTEREST_POI_TOUR_URL)
                iframe.src = INTEREST_POI_TOUR_URL;

            return;
        }

        this.unloadTourIframe();
    }

    _onCloseClick() {
        this.unloadTourIframe();
        this.open = false;
        this.dispatchEvent(new CustomEvent('interest-poi-tour-close', { bubbles: true }));
    }

    render() {
        return html`
            <div
                class="interestPoiTourModalShell${this.open ? ' interestPoiTourModalShell--open' : ''}"
                role="dialog"
                aria-modal="true"
                aria-label="Прогулка по двору"
                aria-hidden=${this.open ? 'false' : 'true'}
                @pointerdown=${this._stop}
            >
                <iframe
                    class="interestPoiTourModalIframe"
                    title="Прогулка по двору"
                    allowfullscreen
                    referrerpolicy="strict-origin-when-cross-origin"
                    allow="xr-spatial-tracking *; fullscreen *; accelerometer *; gyroscope *; magnetometer *"
                ></iframe>

                <div class="interestPoiTourModalBar">
                    <img
                        class="interestPoiTourModalLogo"
                        src=${assetUrl('./assets/icons/small_logo.svg')}
                        alt="OCT"
                        width="101"
                        height="16"
                        draggable="false"
                    />
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
