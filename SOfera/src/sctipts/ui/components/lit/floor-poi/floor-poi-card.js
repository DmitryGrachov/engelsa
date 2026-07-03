import {
    BaseElement,
    classMap,
    html,
    registerComponent
} from '../../../lit/index.js';
import { assetUrl } from '../../../../utils/asset-url.js';
import { resolveRooms } from '../poi-modal/poi-modal-utils.js';
import {
    formatFloorPoiRoomsLabel,
    formatFloorPoiSquareValue,
    normalizeFloorPoiStatus
} from './floor-poi-utils.js';

const FLOOR_POI_LOCK_ICON = './assets/icons/buttons/lock.svg';

class FloorPoiCard extends BaseElement {
    static properties = {
        rooms: { type: Number },
        square: { type: Number },
        status: { type: String },
        selected: { type: Boolean, reflect: true }
    };

    constructor() {
        super();
        this.rooms = 1;
        this.square = undefined;
        this.status = 'active';
        this.selected = false;
    }

    /** @param {import('../poi-modal/poi-modal-utils.js').PoiInfo} info */
    setFromPoiInfo(info) {
        this.rooms = resolveRooms(info);
        this.square = info?.square;
        this.status = typeof info?.status === 'string' ? info.status : 'active';
    }

    /** @param {'active' | 'reserved' | 'sold'} poiStatus @param {string} roomsLabel */
    _renderPill(poiStatus, roomsLabel) {
        if (poiStatus === 'active')
            return html`<div class="floorPoiCardPill" part="pill">${roomsLabel}</div>`;

        return html`
            <div class="floorPoiCardPill" part="pill">
                <span
                    class="floorPoiCardPillLock"
                    style=${`mask-image: url('${assetUrl(FLOOR_POI_LOCK_ICON)}'); -webkit-mask-image: url('${assetUrl(FLOOR_POI_LOCK_ICON)}')`}
                    aria-hidden="true"
                ></span>
            </div>
        `;
    }

    render() {
        const poiStatus = normalizeFloorPoiStatus(this.status);
        const roomsLabel = formatFloorPoiRoomsLabel(this.rooms);
        const squareValue = formatFloorPoiSquareValue(this.square);

        return html`
            <div
                class=${classMap({
                    floorPoiCard: true,
                    'floorPoiCard--selected': this.selected,
                    [`floorPoiCard--status-${poiStatus}`]: true
                })}
                part="card"
            >
                ${this._renderPill(poiStatus, roomsLabel)}
                <p class="floorPoiCardArea" part="area">
                    <span class="floorPoiCardAreaValue">${squareValue}</span>
                    <span class="floorPoiCardAreaUnit">м2</span>
                </p>
            </div>
        `;
    }
}

registerComponent('floor-poi-card', FloorPoiCard);

export { FloorPoiCard };
