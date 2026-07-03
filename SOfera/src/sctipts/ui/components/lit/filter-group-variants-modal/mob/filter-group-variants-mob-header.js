import {
    BaseElement,
    html,
    registerComponent
} from '../../../../lit/index.js';
import { assetUrl } from '../../../../../utils/asset-url.js';
import { FILTER_ICON } from '../../../filter/button-icons.js';
import { formatFilterResultsCountLine } from '../../filter-results-modal/filter-results-utils.js';
import { formatFilterGroupVariantsDeskTitle } from '../filter-group-variants-utils.js';

class FilterGroupVariantsMobHeader extends BaseElement {
    static properties = {
        groupTitle: { type: String, attribute: 'group-title' },
        totalCount: { type: Number, attribute: 'total-count' }
    };

    constructor() {
        super();
        this.groupTitle = '';
        this.totalCount = 0;
    }

    _onCloseClick() {
        this.dispatchEvent(new CustomEvent('filter-group-variants-close', {
            bubbles: true
        }));
    }

    render() {
        const title = formatFilterGroupVariantsDeskTitle(this.groupTitle);
        const backIconSrc = assetUrl(FILTER_ICON.back);

        return html`
            <header class="filterGroupVariantsMobHeader" part="header">
                <h2 class="filterGroupVariantsMobTitle">
                    <span class="filterGroupVariantsMobTitleLabel">${title}</span>
                    <span class="filterGroupVariantsMobTitleCount">
                        ${formatFilterResultsCountLine(this.totalCount)}
                    </span>
                </h2>

                <button
                    type="button"
                    class="filterGroupVariantsMobClose"
                    aria-label="Закрыть"
                    @click=${this._onCloseClick}
                >
                    <img
                        class="filterGroupVariantsMobCloseIcon"
                        src=${backIconSrc}
                        alt=""
                        aria-hidden="true"
                    />
                </button>
            </header>
        `;
    }
}

registerComponent('filter-group-variants-mob-header', FilterGroupVariantsMobHeader);

export { FilterGroupVariantsMobHeader };
