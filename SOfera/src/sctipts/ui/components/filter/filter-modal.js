// Панель фильтра: на мобиле — шторка на весь экран; на десктопе (≥820px) — карточка справа (media.css).

import {
    AREA_MIN,
    AREA_MAX,
    COST_MIN,
    COST_MAX,
    COST_STEP,
    FLOOR_MIN,
    FLOOR_MAX,
    SECTION_COUNT,
    STATUS_DEFINITIONS
} from './constants.js';
import { formatMoneyRu } from './format.js';
import {
    syncSectionButtons,
    syncRoomButtons,
    syncStatusButtons
} from './sync-buttons.js';
import { createDualRangeMount } from './dual-range.js';
import {
    getFilterState,
    getFilterWritableState,
    notifyFilterStateChanged,
    resetFilterState,
    clearFilterSections,
    subscribeFilterState,
    toggleFilterRoom,
    toggleFilterSection,
    toggleFilterStatus
} from './filter-store.js';
import { FILTER_ICON, mountLabeledIconButton } from './button-icons.js';
import { assetUrl } from '../../../utils/asset-url.js';
import { getFilterResultsModal } from '../lit/filter-results-modal/index.js';
import { activateSearchPanelMode } from '../../panel-mode.js';
import { mountFilterAdvancedPanel } from './filter-advanced-panel.js';
import {
    createFilterSummaryBlock,
    FILTER_SUMMARY_V_GAP
} from './filter-summary-block.js';

const FILTER_V_GAP = {
    labelToRow: 12,
    rowToNextSection: 20,
    rangeToNextLabel: 16,
    summaryTop: 64,
    summaryToView: 23,
    viewToActions: 34.2
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

function createSectionButtonsRow() {
    const sectionRow = document.createElement('div');
    sectionRow.className = 'filterModalHeaderTypes';
    /** @type {HTMLButtonElement[]} */
    const sectionButtons = [];

    const typeAll = document.createElement('button');
    typeAll.type = 'button';
    typeAll.className = 'filterModalTypeBtn';
    typeAll.dataset.section = 'all';
    typeAll.textContent = 'Все';
    sectionRow.appendChild(typeAll);
    sectionButtons.push(typeAll);

    for (let n = 1; n <= SECTION_COUNT; n++) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'filterModalTypeBtn';
        b.dataset.section = String(n);
        b.textContent = `${n}`;
        sectionRow.appendChild(b);
        sectionButtons.push(b);
    }

    return { sectionRow, sectionButtons };
}

function createRoomButtonsRow() {
    const roomsRow = document.createElement('div');
    roomsRow.className = 'filterModalRoomsRow';
    /** @type {HTMLButtonElement[]} */
    const roomButtons = [];

    for (let n = 1; n <= 4; n++) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'filterRoomBtn';
        b.dataset.rooms = String(n);
        b.textContent = String(n);
        roomsRow.appendChild(b);
        roomButtons.push(b);
    }

    return { roomsRow, roomButtons };
}

function createStatusButtonsRow() {
    const statusRow = document.createElement('div');
    statusRow.className = 'filterModalStatusRow';
    /** @type {HTMLButtonElement[]} */
    const statusButtons = [];

    for (const [key, label] of STATUS_DEFINITIONS) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'filterStatusBtn';
        b.dataset.status = key;
        b.textContent = label;
        statusRow.appendChild(b);
        statusButtons.push(b);
    }

    return { statusRow, statusButtons };
}

/** @returns {{ rangeArea: ReturnType<typeof createDualRangeMount>, rangeCost: ReturnType<typeof createDualRangeMount>, rangeFloor: ReturnType<typeof createDualRangeMount> }} */
function mountFilterRanges(state, bumpSummary) {
    const snapArea = (v) =>
        Math.round(Math.min(AREA_MAX, Math.max(AREA_MIN, v)));

    const rangeArea = createDualRangeMount(
        state,
        'areaFrom',
        'areaTo',
        AREA_MIN,
        AREA_MAX,
        (n) => String(n),
        snapArea,
        1,
        bumpSummary
    );

    const snapCost = (v) => {
        const x = Math.round(v / COST_STEP) * COST_STEP;
        return Math.min(COST_MAX, Math.max(COST_MIN, x));
    };

    const rangeCost = createDualRangeMount(
        state,
        'costFrom',
        'costTo',
        COST_MIN,
        COST_MAX,
        formatMoneyRu,
        snapCost,
        COST_STEP,
        bumpSummary
    );

    const snapFloor = (v) =>
        Math.round(Math.min(FLOOR_MAX, Math.max(FLOOR_MIN, v)));

    const rangeFloor = createDualRangeMount(
        state,
        'floorFrom',
        'floorTo',
        FLOOR_MIN,
        FLOOR_MAX,
        (n) => String(n),
        snapFloor,
        1,
        bumpSummary
    );

    return { rangeArea, rangeCost, rangeFloor };
}

export const createFilterModal = () => {
    const uiRoot = document.getElementById('ui');
    if (!uiRoot) return null;

    const state = getFilterWritableState();

    const root = document.createElement('div');
    root.id = 'filterModal';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-hidden', 'true');

    const header = document.createElement('div');
    header.className = 'filterModalHeader';

    const sectionLabel = document.createElement('div');
    sectionLabel.className = 'filterModalSectionLabel';
    sectionLabel.textContent = 'Секции';

    const headerRow = document.createElement('div');
    headerRow.className = 'filterModalHeaderRow';

    const { sectionRow, sectionButtons } = createSectionButtonsRow();

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'filterModalClose';
    closeButton.setAttribute('aria-label', 'Закрыть');

    const closeIcon = document.createElement('img');
    closeIcon.className = 'filterModalCloseIcon';
    closeIcon.src = assetUrl(FILTER_ICON.back);
    closeIcon.alt = '';
    closeIcon.draggable = false;
    closeIcon.setAttribute('aria-hidden', 'true');
    closeButton.appendChild(closeIcon);

    headerRow.append(sectionRow, closeButton);
    header.append(sectionLabel, headerRow);

    const body = document.createElement('div');
    body.className = 'filterModalBody';

    appendSectionLabel(body, 'Кол-во комнат');
    appendVGap(body, FILTER_V_GAP.labelToRow);
    const { roomsRow, roomButtons } = createRoomButtonsRow();
    body.appendChild(roomsRow);

    appendVGap(body, FILTER_V_GAP.rowToNextSection);
    appendSectionLabel(body, 'Статус');
    appendVGap(body, FILTER_V_GAP.labelToRow);
    const { statusRow, statusButtons } = createStatusButtonsRow();
    body.appendChild(statusRow);

    const {
        summaryBlock,
        updateSummaryCount: updateMainSummaryCount,
        bindHandlers: bindMainSummaryHandlers
    } = createFilterSummaryBlock();
    const bumpSummary = notifyFilterStateChanged;

    appendVGap(body, FILTER_V_GAP.rowToNextSection);
    appendSectionLabel(body, 'Площадь м²');
    appendVGap(body, FILTER_V_GAP.labelToRow);
    const { rangeArea, rangeCost, rangeFloor } = mountFilterRanges(
        state,
        bumpSummary
    );
    body.appendChild(rangeArea.root);

    appendVGap(body, FILTER_V_GAP.rangeToNextLabel);
    appendSectionLabel(body, 'Стоимость ₽');
    appendVGap(body, FILTER_V_GAP.labelToRow);
    body.appendChild(rangeCost.root);

    appendVGap(body, FILTER_V_GAP.rangeToNextLabel);
    appendSectionLabel(body, 'Этаж');
    appendVGap(body, FILTER_V_GAP.labelToRow);
    body.appendChild(rangeFloor.root);

    appendVGapElastic(body);

    appendVGap(body, FILTER_SUMMARY_V_GAP.beforeActions);
    body.appendChild(summaryBlock);

    const actionsRow = document.createElement('div');
    actionsRow.className = 'filterModalActionsRow';

    const btnAdvanced = document.createElement('button');
    btnAdvanced.type = 'button';
    btnAdvanced.className = 'filterModalActionBtn filterModalActionBtnGhost';
    mountLabeledIconButton(
        btnAdvanced,
        FILTER_ICON.settingsLight,
        'Расширенный поиск'
    );

    const btnReset = document.createElement('button');
    btnReset.type = 'button';
    btnReset.className = 'filterModalActionBtn';
    mountLabeledIconButton(btnReset, FILTER_ICON.reset, 'Сбросить');

    actionsRow.append(btnAdvanced, btnReset);
    body.appendChild(actionsRow);

    const shell = document.createElement('div');
    shell.className = 'filterModalShell';

    const mainPane = document.createElement('div');
    mainPane.className = 'filterModalMainPane';
    mainPane.append(header, body);
    shell.appendChild(mainPane);

    const advancedPanel = mountFilterAdvancedPanel(shell);

    root.appendChild(shell);
    uiRoot.appendChild(root);

    const syncUiFromStore = () => {
        const current = getFilterWritableState();

        syncSectionButtons(sectionButtons, current.sections);
        syncRoomButtons(roomButtons, current.rooms);
        syncStatusButtons(statusButtons, current.status);
        rangeArea.update();
        rangeCost.update();
        rangeFloor.update();
        updateMainSummaryCount();
        advancedPanel.updateSummaryCount();
    };

    const unsubscribeStore = subscribeFilterState(syncUiFromStore);

    for (const b of sectionButtons) {
        b.addEventListener('click', () => {
            const value = b.dataset.section;

            if (value === 'all')
                clearFilterSections();
            else
                toggleFilterSection(Number(value));
        });
    }

    for (const b of roomButtons) {
        b.addEventListener('click', () => {
            toggleFilterRoom(Number(b.dataset.rooms));
        });
    }

    for (const b of statusButtons) {
        b.addEventListener('click', () => {
            toggleFilterStatus(b.dataset.status);
        });
    }

    btnReset.addEventListener('click', () => {
        resetFilterState();
    });

    btnAdvanced.addEventListener('click', () => {
        advancedPanel.open();
    });

    syncUiFromStore();

    let open = false;

    const setOpen = (next) => {
        if (!next)
            advancedPanel.close();

        open = next;
        root.classList.toggle('filterModalOpen', open);
        root.setAttribute('aria-hidden', open ? 'false' : 'true');
        root.dispatchEvent(
            new CustomEvent('filtermodal:change', { detail: { open } })
        );
    };

    const openModal = () => setOpen(true);
    const closeModal = () => setOpen(false);
    const toggleModal = () => setOpen(!open);

    closeButton.addEventListener('click', closeModal);

    const openFilterResults = () => {
        getFilterResultsModal().open();
    };

    bindMainSummaryHandlers({
        onShow3d: () => {
            activateSearchPanelMode();
            closeModal();
        },
        onShowList: openFilterResults
    });

    advancedPanel.bindSummaryHandlers({
        onShow3d: () => {
            activateSearchPanelMode();
            closeModal();
        },
        onShowList: openFilterResults
    });

    const onKeyDown = (event) => {
        if (event.key !== 'Escape' || !open)
            return;

        if (advancedPanel.isOpen())
            advancedPanel.close();
        else
            closeModal();
    };

    window.addEventListener('keydown', onKeyDown);

    return {
        root,
        body,
        open: openModal,
        close: closeModal,
        toggle: toggleModal,
        isOpen: () => open,
        reset: resetFilterState,
        getState: getFilterState,
        destroy() {
            unsubscribeStore();
            advancedPanel.destroy();
            window.removeEventListener('keydown', onKeyDown);
            root.remove();
        }
    };
};

/** @type {ReturnType<typeof createFilterModal> | null} */
let filterModalInstance = null;

/** @param {ReturnType<typeof createFilterModal> | null} instance */
export const setFilterModalInstance = (instance) => {
    filterModalInstance = instance;
};

export const getFilterModal = () => filterModalInstance;
