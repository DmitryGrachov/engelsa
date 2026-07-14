import {
    BaseElement,
    html,
    nothing,
    registerComponent
} from '../../../lit/index.js';
import { assetUrl } from '../../../../utils/asset-url.js';
import { INTEREST_POI_TOUR_URL } from './interest-poi-tour-data.js';
import { destroyHeavyIframe } from '../../../../utils/embed-iframe-dispose.js';

class InterestPoiTourView extends BaseElement {
    static properties = {
        open: { type: Boolean, reflect: true },
        /** Пересоздание iframe после destroy (сброс browsing context). */
        _iframeEpoch: { state: true },
        _iframeMounted: { state: true }
    };

    constructor() {
        super();
        this.open = false;
        this._iframeEpoch = 0;
        this._iframeMounted = false;
        /** @type {Promise<void> | null} */
        this._disposePromise = null;
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

    /**
     * Жёсткая выгрузка WebGL-документа iframe.
     * @returns {Promise<void>}
     */
    disposeTourIframe() {
        if (this._disposePromise)
            return this._disposePromise;

        const iframe = this._getIframe();

        this._disposePromise = destroyHeavyIframe(iframe)
            .then(() => {
                this._iframeMounted = false;
                this._iframeEpoch += 1;
            })
            .finally(() => {
                this._disposePromise = null;
            });

        return this._disposePromise;
    }

    /** @deprecated используйте disposeTourIframe */
    unloadTourIframe() {
        void this.disposeTourIframe();
    }

    /** @param {Map<string, unknown>} changed */
    willUpdate(changed) {
        if (changed.has('open') && this.open && !this._iframeMounted)
            this._iframeMounted = true;
    }

    /** @param {Map<string, unknown>} changed */
    updated(changed) {
        if (!changed.has('open') && !changed.has('_iframeMounted') && !changed.has('_iframeEpoch'))
            return;

        if (!this.open || !this._iframeMounted)
            return;

        const iframe = this._getIframe();

        if (!iframe)
            return;

        if (iframe.getAttribute('src') !== INTEREST_POI_TOUR_URL)
            iframe.src = INTEREST_POI_TOUR_URL;
    }

    _onCloseClick() {
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
                ${this._iframeMounted ? html`
                    <iframe
                        class="interestPoiTourModalIframe"
                        data-epoch=${String(this._iframeEpoch)}
                        title="Прогулка по двору"
                        allowfullscreen
                        referrerpolicy="strict-origin-when-cross-origin"
                        allow="xr-spatial-tracking *; fullscreen *; accelerometer *; gyroscope *; magnetometer *"
                    ></iframe>
                ` : nothing}

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
