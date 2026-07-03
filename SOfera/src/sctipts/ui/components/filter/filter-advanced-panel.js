import { FILTER_ICON, mountLabeledIconButton } from './button-icons.js';
import { assetUrl } from '../../../utils/asset-url.js';
import {
    LAYOUT_TAG_OPTIONS,
    WINDOW_VIEW_TAG_OPTIONS
} from './filter-tag-options.js';
import { syncTagButtons } from './sync-buttons.js';
import {
    getFilterWritableState,
    resetFilterAdvancedState,
    subscribeFilterState,
    toggleFilterLayoutTag,
    toggleFilterWindowViewTag
} from './filter-store.js';
import {
    createFilterSummaryBlock,
    FILTER_SUMMARY_V_GAP
} from './filter-summary-block.js';

const ADVANCED_V_GAP = {
    labelToRow: 12,
    rowToNextSection: 20
};

function appendVGap(body, px) {
    const el = document.createElement('div');
    el.className = 'filterModalVGap';
    el.setAttribute('aria-hidden', 'true');
    el.style.setProperty('--filter-modal-gap', `${px}px`);
    body.appendChild(el);
}

function appendVGapElastic(body) {
    const el = document.createElement('div');
    el.className = 'filterModalVGapElastic';
    el.setAttribute('aria-hidden', 'true');
    body.appendChild(el);
}

function appendSectionLabel(body, text) {
    const el = document.createElement('div');
    el.className = 'filterModalSectionLabel';
    el.textContent = text;
    body.appendChild(el);
    return el;
}

/** @param {string} field @param {readonly string[]} options */
function createTagButtonsRow(field, options) {
    const row = document.createElement('div');
    row.className = 'filterModalStatusRow';
    /** @type {HTMLButtonElement[]} */
    const buttons = [];

    for (const label of options) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'filterStatusBtn';
        b.dataset[field] = label;
        b.textContent = label;
        row.appendChild(b);
        buttons.push(b);
    }

    return { row, buttons };
}

/** @param {HTMLElement} shell */
export const mountFilterAdvancedPanel = (shell) => {
    const root = document.createElement('div');
    root.className = 'filterModalAdvancedPane';
    root.setAttribute('aria-hidden', 'true');

    const header = document.createElement('div');
    header.className = 'filterModalAdvancedHeader';

    const headerIcon = document.createElement('img');
    headerIcon.className = 'filterModalAdvancedHeaderIcon';
    headerIcon.src = assetUrl(FILTER_ICON.settingsLight);
    headerIcon.alt = '';
    headerIcon.draggable = false;

    const title = document.createElement('h2');
    title.className = 'filterModalAdvancedTitle';
    title.textContent = 'Расширенный поиск';

    const backButton = document.createElement('button');
    backButton.type = 'button';
    backButton.className = 'filterModalAdvancedBack';
    backButton.setAttribute('aria-label', 'Вернуться к фильтру');

    const backIcon = document.createElement('img');
    backIcon.className = 'filterModalAdvancedBackIcon';
    backIcon.src = assetUrl(FILTER_ICON.back);
    backIcon.alt = '';
    backIcon.draggable = false;
    backButton.appendChild(backIcon);

    header.append(headerIcon, title, backButton);

    const body = document.createElement('div');
    body.className = 'filterModalAdvancedBody';

    appendSectionLabel(body, 'Особенности планировок');
    appendVGap(body, ADVANCED_V_GAP.labelToRow);
    const { row: layoutTagsRow, buttons: layoutTagButtons } =
        createTagButtonsRow('layoutTag', LAYOUT_TAG_OPTIONS);
    body.appendChild(layoutTagsRow);

    appendVGap(body, ADVANCED_V_GAP.rowToNextSection);
    appendSectionLabel(body, 'Вид на');
    appendVGap(body, ADVANCED_V_GAP.labelToRow);
    const { row: windowViewRow, buttons: windowViewButtons } =
        createTagButtonsRow('windowViewTag', WINDOW_VIEW_TAG_OPTIONS);
    body.appendChild(windowViewRow);

    appendVGapElastic(body);

    const {
        summaryBlock,
        updateSummaryCount,
        bindHandlers: bindSummaryHandlers
    } = createFilterSummaryBlock();

    appendVGap(body, FILTER_SUMMARY_V_GAP.beforeActions);
    body.appendChild(summaryBlock);

    const actionsRow = document.createElement('div');
    actionsRow.className = 'filterModalActionsRow';

    const btnBack = document.createElement('button');
    btnBack.type = 'button';
    btnBack.className = 'filterModalActionBtn filterModalActionBtnGhost';
    mountLabeledIconButton(
        btnBack,
        FILTER_ICON.settingsLight,
        'Вернуться к фильтру'
    );

    const btnReset = document.createElement('button');
    btnReset.type = 'button';
    btnReset.className = 'filterModalActionBtn';
    mountLabeledIconButton(btnReset, FILTER_ICON.reset, 'Сбросить');

    actionsRow.append(btnBack, btnReset);
    body.appendChild(actionsRow);

    root.append(header, body);
    shell.appendChild(root);

    let open = false;

    const syncUiFromStore = () => {
        const current = getFilterWritableState();
        syncTagButtons(layoutTagButtons, current.layoutTags, 'layoutTag');
        syncTagButtons(windowViewButtons, current.windowViewTags, 'windowViewTag');
        updateSummaryCount();
    };

    const setOpen = (next) => {
        open = next;
        shell.classList.toggle('filterModalAdvancedOpen', open);
        root.setAttribute('aria-hidden', open ? 'false' : 'true');
        root.dispatchEvent(
            new CustomEvent('filteradvanced:change', { detail: { open } })
        );
    };

    const close = () => setOpen(false);
    const openPanel = () => setOpen(true);

    const goBack = () => close();

    backButton.addEventListener('click', goBack);
    btnBack.addEventListener('click', goBack);

    btnReset.addEventListener('click', () => {
        resetFilterAdvancedState();
    });

    for (const b of layoutTagButtons) {
        b.addEventListener('click', () => {
            const value = b.dataset.layoutTag;

            if (value)
                toggleFilterLayoutTag(value);
        });
    }

    for (const b of windowViewButtons) {
        b.addEventListener('click', () => {
            const value = b.dataset.windowViewTag;

            if (value)
                toggleFilterWindowViewTag(value);
        });
    }

    const unsubscribeStore = subscribeFilterState(syncUiFromStore);
    syncUiFromStore();

    return {
        root,
        open: openPanel,
        close,
        isOpen: () => open,
        updateSummaryCount,
        bindSummaryHandlers,
        destroy() {
            unsubscribeStore();
            root.remove();
        }
    };
};
