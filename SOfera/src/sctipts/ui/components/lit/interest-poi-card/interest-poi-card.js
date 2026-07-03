import {
    BaseElement,
    html,
    registerComponent
} from '../../../lit/index.js';
import { assetUrl } from '../../../../utils/asset-url.js';

class InterestPoiCard extends BaseElement {
    static properties = {
        cardTitle: { type: String, attribute: 'card-title' },
        location: { type: String },
        bgSrc: { type: String, attribute: 'bg-src' },
        iconSrc: { type: String, attribute: 'icon-src' },
        iconType: { type: String, attribute: 'icon-type' }
    };

    constructor() {
        super();
        this.cardTitle = '';
        this.location = '';
        this.bgSrc = '';
        this.iconSrc = '';
        this.iconType = 'mask';
    }

    _renderIcon() {
        const iconType = this.iconType || 'none';

        if (iconType === 'none' || !this.iconSrc)
            return null;

        const iconUrl = assetUrl(this.iconSrc);

        if (iconType === 'raster') {
            return html`
                <span class="interestPoiCardIconRaster" aria-hidden="true">
                    <img
                        src=${iconUrl}
                        alt=""
                        decoding="async"
                        draggable="false"
                    />
                </span>
            `;
        }

        return html`
            <span
                class="interestPoiCardIconMask"
                style=${`mask-image: url('${iconUrl}'); -webkit-mask-image: url('${iconUrl}')`}
                aria-hidden="true"
            ></span>
        `;
    }

    render() {
        const bgUrl = this.bgSrc ? assetUrl(this.bgSrc) : '';
        const hasIcon = this.iconType !== 'none' && !!this.iconSrc;

        return html`
            <div class="interestPoiCardBg" part="bg">
                ${bgUrl
                    ? html`
                        <img
                            class="interestPoiCardBgImg"
                            src=${bgUrl}
                            alt=""
                            decoding="async"
                            draggable="false"
                        />
                    `
                    : null}
                <div class="interestPoiCardOverlay" part="overlay"></div>
            </div>

            <h3
                class=${hasIcon ? 'interestPoiCardTitle' : 'interestPoiCardTitle interestPoiCardTitle--full'}
                part="title"
            >${this.cardTitle}</h3>

            <p class="interestPoiCardLocation" part="location">${this.location}</p>

            ${hasIcon
                ? html`
                    <div class="interestPoiCardIcon" part="icon">
                        ${this._renderIcon()}
                    </div>
                `
                : null}
        `;
    }
}

registerComponent('interest-poi-card', InterestPoiCard);

export { InterestPoiCard };
