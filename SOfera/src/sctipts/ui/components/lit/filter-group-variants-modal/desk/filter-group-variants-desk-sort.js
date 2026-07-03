import {
    BaseElement,
    html,
    nothing,
    registerComponent
} from '../../../../lit/index.js';
import { assetUrl } from '../../../../../utils/asset-url.js';
/** @typedef {'price' | 'area' | 'floor' | 'pricePerSqm'} FilterGroupVariantsSortField */
/** @typedef {'asc' | 'desc'} FilterGroupVariantsSortDirection */

const SORT_OPTIONS = Object.freeze([
    { field: 'floor', label: 'Этаж' },
    { field: 'area', label: 'Площадь' },
    { field: 'price', label: 'Общая стоимость' },
    { field: 'pricePerSqm', label: 'Стоимость м²' }
]);

const RESET_ICON_SRC = assetUrl('./assets/icons/buttons/reset.svg');

class FilterGroupVariantsDeskSort extends BaseElement {
    static properties = {
        field: { type: String },
        direction: { type: String },
        open: { type: Boolean, state: true }
    };

    constructor() {
        super();
        /** @type {FilterGroupVariantsSortField | ''} */
        this.field = '';
        /** @type {FilterGroupVariantsSortDirection} */
        this.direction = 'asc';
        this.open = false;
    }

    /** @param {FilterGroupVariantsSortField} field */
    _onFieldSelect(field) {
        this.dispatchEvent(new CustomEvent('filter-group-variants-sort-field', {
            bubbles: true,
            detail: { field }
        }));
    }

    /** @param {FilterGroupVariantsSortDirection} direction */
    _onDirectionSelect(direction) {
        if (!this.field)
            return;

        this.dispatchEvent(new CustomEvent('filter-group-variants-sort-direction', {
            bubbles: true,
            detail: { direction }
        }));
    }

    _onToggleOpen() {
        this.open = !this.open;
    }

    _onClosePopover() {
        this.open = false;
    }

    _onResetClick() {
        this.open = false;
        this.dispatchEvent(new CustomEvent('filter-group-variants-sort-reset', {
            bubbles: true
        }));
    }

    /** @param {Event} event */
    _stop(event) {
        event.stopPropagation();
    }

    render() {
        const activeOption = SORT_OPTIONS.find(({ field }) => field === this.field);
        const triggerLabel = activeOption?.label ?? 'Сортировать';

        return html`
            <div
                class="filterGroupVariantsDeskSort${this.open ? ' filterGroupVariantsDeskSort--open' : ''}"
                part="sort"
            >
                <button
                    type="button"
                    class="filterGroupVariantsDeskSortReset"
                    aria-label="Сбросить сортировку"
                    @click=${this._onResetClick}
                >
                    <img
                        class="filterGroupVariantsDeskSortResetIcon"
                        src=${RESET_ICON_SRC}
                        alt=""
                        aria-hidden="true"
                    />
                </button>

                <span class="filterGroupVariantsDeskSortLabel">Сортировать по</span>

                <div class="filterGroupVariantsDeskSortTriggerWrap">
                    <button
                        type="button"
                        class="filterGroupVariantsDeskSortTrigger"
                        aria-haspopup="dialog"
                        aria-expanded=${this.open ? 'true' : 'false'}
                        @click=${this._onToggleOpen}
                    >
                        <span>${triggerLabel}</span>
                        <img
                            class="filterGroupVariantsDeskSortTriggerIcon"
                            src=${assetUrl('./assets/icons/buttons/schevron_down.svg')}
                            alt=""
                            aria-hidden="true"
                        />
                    </button>

                    ${this.open
                        ? html`
                            <div
                                class="filterGroupVariantsDeskSortPopover"
                                role="dialog"
                                aria-label="Сортировка"
                                @click=${this._stop}
                            >
                                <button
                                    type="button"
                                    class="filterGroupVariantsDeskSortPopoverClose"
                                    aria-label="Закрыть"
                                    @click=${this._onClosePopover}
                                >
                                    ×
                                </button>

                                <div
                                    class="filterGroupVariantsDeskSortOptions"
                                    role="radiogroup"
                                    aria-label="Поле сортировки"
                                >
                                    ${SORT_OPTIONS.map(({ field, label }) => html`
                                        <button
                                            type="button"
                                            class="filterGroupVariantsDeskSortOption${this.field === field ? ' filterGroupVariantsDeskSortOption--active' : ''}"
                                            role="radio"
                                            aria-checked=${this.field === field ? 'true' : 'false'}
                                            @click=${() => this._onFieldSelect(/** @type {FilterGroupVariantsSortField} */ (field))}
                                        >
                                            <span class="filterGroupVariantsDeskSortOptionRadio"></span>
                                            <span>${label}</span>
                                        </button>
                                    `)}
                                </div>

                                <div class="filterGroupVariantsDeskSortDirections">
                                    <button
                                        type="button"
                                        class="filterGroupVariantsDeskSortDirectionBtn${this.direction === 'desc' ? ' filterGroupVariantsDeskSortDirectionBtn--active' : ''}"
                                        ?disabled=${!this.field}
                                        @click=${() => this._onDirectionSelect('desc')}
                                    >
                                        Сортировать по убыванию
                                    </button>
                                    <button
                                        type="button"
                                        class="filterGroupVariantsDeskSortDirectionBtn${this.direction === 'asc' ? ' filterGroupVariantsDeskSortDirectionBtn--active' : ''}"
                                        ?disabled=${!this.field}
                                        @click=${() => this._onDirectionSelect('asc')}
                                    >
                                        Сортировать по возрастанию
                                    </button>
                                </div>
                            </div>
                        `
                        : nothing}
                </div>

                ${this.open
                    ? html`
                        <button
                            type="button"
                            class="filterGroupVariantsDeskSortBackdrop"
                            aria-label="Закрыть сортировку"
                            @click=${this._onClosePopover}
                        ></button>
                    `
                    : nothing}
            </div>
        `;
    }
}

registerComponent('filter-group-variants-desk-sort', FilterGroupVariantsDeskSort);

export { FilterGroupVariantsDeskSort };
