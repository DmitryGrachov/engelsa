import {
    BaseElement,
    html,
    registerComponent,
    repeat
} from '../../../lit/index.js';

const VISIBLE_TAG_COUNT = 3;

const TAG_CHEVRON = html`
    <svg
        class="filterMobCardTagMoreIcon"
        width="7"
        height="4"
        viewBox="0 0 7 4"
        aria-hidden="true"
    >
        <path
            d="M1 1L3.5 3L6 1"
            fill="none"
            stroke="currentColor"
            stroke-width="1"
            stroke-linecap="round"
            stroke-linejoin="round"
        />
    </svg>
`;

class FilterMobCardTags extends BaseElement {
    static properties = {
        tags: { type: Array },
        itemId: { type: String, attribute: 'item-id' },
        expanded: { type: Boolean, state: true }
    };

    constructor() {
        super();
        this.tags = [];
        this.itemId = '';
        this.expanded = false;
    }

    _onMoreClick() {
        this.expanded = true;
    }

    render() {
        const tags = Array.isArray(this.tags) ? this.tags : [];

        if (!tags.length)
            return null;

        const visibleTags = this.expanded ? tags : tags.slice(0, VISIBLE_TAG_COUNT);
        const hiddenCount = tags.length - VISIBLE_TAG_COUNT;

        return html`
            <div
                class="filterMobCardTags${this.expanded ? ' filterMobCardTags--expanded' : ''}"
                aria-label="Особенности"
            >
                <div class="filterMobCardTagsList">
                    ${repeat(
                        visibleTags,
                        (tag, index) => `${this.itemId}-tag-${index}`,
                        (tag) => html`
                            <span class="filterMobCardTag">${tag}</span>
                        `
                    )}
                </div>
                ${!this.expanded && hiddenCount > 0
                    ? html`
                        <button
                            type="button"
                            class="filterMobCardTagMore"
                            @click=${this._onMoreClick}
                        >
                            +${hiddenCount}
                            ${TAG_CHEVRON}
                        </button>
                    `
                    : null}
            </div>
        `;
    }
}

registerComponent('filter-mob-card-tags', FilterMobCardTags);

export { FilterMobCardTags };
