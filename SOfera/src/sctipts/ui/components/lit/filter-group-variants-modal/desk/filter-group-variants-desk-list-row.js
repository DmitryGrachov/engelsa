import {
    BaseElement,
    html,
    registerComponent
} from '../../../../lit/index.js';
import { assetUrl } from '../../../../../utils/asset-url.js';
import {
    formatGroupVariantListArea,
    formatGroupVariantListNumber,
    formatGroupVariantListPrice,
    formatGroupVariantListRooms,
    getGroupVariantStatusLabel
} from '../filter-group-variants-utils.js';
import '../filter-group-variant-favorite-btn.js';

/** @typedef {import('../filter-group-variants-data.js').FilterGroupVariantItem} FilterGroupVariantItem */

class FilterGroupVariantsDeskListRow extends BaseElement {
    static properties = {
        variant: { type: Object }
    };

    constructor() {
        super();
        /** @type {FilterGroupVariantItem | null} */
        this.variant = null;
    }

    /** @param {string} action */
    _dispatchAction(action) {
        if (!this.variant)
            return;

        this.dispatchEvent(new CustomEvent(`filter-group-variant-${action}`, {
            bubbles: true,
            detail: { variant: this.variant }
        }));
    }

    render() {
        const variant = this.variant;

        if (!variant)
            return null;

        return html`
            <article class="filterGroupVariantsDeskListRow" part="row">
                <span class="filterGroupVariantsDeskListCell filterGroupVariantsDeskListCell--number">
                    ${formatGroupVariantListNumber(variant)}
                </span>
                <span class="filterGroupVariantsDeskListCell filterGroupVariantsDeskListCell--rooms">
                    ${formatGroupVariantListRooms(variant)}
                </span>
                <span class="filterGroupVariantsDeskListCell filterGroupVariantsDeskListCell--area">
                    ${formatGroupVariantListArea(variant)}
                </span>
                <span class="filterGroupVariantsDeskListCell filterGroupVariantsDeskListCell--price">
                    ${formatGroupVariantListPrice(variant)}
                </span>
                <span class="filterGroupVariantsDeskListCell filterGroupVariantsDeskListCell--section">
                    ${variant.section ?? '—'}
                </span>
                <span class="filterGroupVariantsDeskListCell filterGroupVariantsDeskListCell--floor">
                    ${variant.floor ?? '—'}
                </span>
                <span class="filterGroupVariantsDeskListCell filterGroupVariantsDeskListCell--status">
                    ${getGroupVariantStatusLabel(variant)}
                </span>

                <div class="filterGroupVariantsDeskListActions">
                    <button
                        type="button"
                        class="filterGroupVariantsDeskListActionBtn"
                        @click=${() => this._dispatchAction('details')}
                    >
                        Подробнее
                    </button>
                    <button
                        type="button"
                        class="filterGroupVariantsDeskListActionBtn filterGroupVariantsDeskListActionBtn--icon"
                        @click=${() => this._dispatchAction('slice')}
                    >
                        <span>На срезе</span>
                        <img
                            class="filterGroupVariantsDeskListActionBtnIcon"
                            src=${assetUrl('./assets/icons/buttons/stack.svg')}
                            alt=""
                            aria-hidden="true"
                        />
                    </button>
                    <button
                        type="button"
                        class="filterGroupVariantsDeskListActionBtn"
                        @click=${() => this._dispatchAction('3d')}
                    >
                        3D
                    </button>
                    <filter-group-variant-favorite-btn
                        appearance="list"
                        .variant=${variant}
                    ></filter-group-variant-favorite-btn>
                </div>
            </article>
        `;
    }
}

registerComponent('filter-group-variants-desk-list-row', FilterGroupVariantsDeskListRow);

export { FilterGroupVariantsDeskListRow };
