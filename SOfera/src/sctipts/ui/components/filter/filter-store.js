import {
    createDefaultFilterState,
    assignFilterState,
    serializeFilterState
} from './filter-state.js';

export const FILTER_CHANGE_EVENT = 'filter:change';

/** @type {ReturnType<typeof createDefaultFilterState>} */
let state = createDefaultFilterState();

/** @type {Set<(snapshot: ReturnType<typeof serializeFilterState>) => void>} */
const listeners = new Set();

const notify = () => {
    const snapshot = getFilterState();

    listeners.forEach((listener) => listener(snapshot));
    document.dispatchEvent(
        new CustomEvent(FILTER_CHANGE_EVENT, { detail: snapshot })
    );
};

/** @returns {ReturnType<typeof serializeFilterState>} */
export const getFilterState = () => serializeFilterState(state);

/** Ссылка на живое состояние — только для UI-слайдеров внутри filter-модуля. */
export const getFilterWritableState = () => state;

/** @param {ReturnType<typeof createDefaultFilterState> | ReturnType<typeof serializeFilterState>} next */
export const applyFilterState = (next) => {
    assignFilterState(state, next);
    notify();
};

/** Сбросить выбор секций (пустой набор = все секции). */
export const clearFilterSections = () => {
    state.sections.clear();
    notify();
};

/** @param {number} section */
export const toggleFilterSection = (section) => {
    if (state.sections.has(section))
        state.sections.delete(section);
    else
        state.sections.add(section);

    notify();
};

/** Оставить в фильтре только одну секцию (карточки interest POI). @param {number} section */
export const setFilterSection = (section) => {
    state.sections.clear();

    if (typeof section === 'number' && Number.isFinite(section))
        state.sections.add(section);

    notify();
};

/** @param {number} room */
export const toggleFilterRoom = (room) => {
    if (state.rooms.has(room))
        state.rooms.delete(room);
    else
        state.rooms.add(room);

    notify();
};

/** @param {string} status */
export const toggleFilterStatus = (status) => {
    if (state.status.has(status))
        state.status.delete(status);
    else
        state.status.add(status);

    notify();
};

/** @param {string} tag */
export const toggleFilterLayoutTag = (tag) => {
    if (state.layoutTags.has(tag))
        state.layoutTags.delete(tag);
    else
        state.layoutTags.add(tag);

    notify();
};

/** @param {string} tag */
export const toggleFilterWindowViewTag = (tag) => {
    if (state.windowViewTags.has(tag))
        state.windowViewTags.delete(tag);
    else
        state.windowViewTags.add(tag);

    notify();
};

/** @param {'3d' | 'list'} viewMode */
export const setFilterViewMode = (viewMode) => {
    state.viewMode = viewMode;
    notify();
};

export const resetFilterState = () => {
    applyFilterState(createDefaultFilterState());
};

export const resetFilterAdvancedState = () => {
    state.layoutTags = new Set();
    state.windowViewTags = new Set();
    notify();
};

/** После прямой мутации writable state (слайдеры). */
export const notifyFilterStateChanged = () => {
    notify();
};

/** @param {(snapshot: ReturnType<typeof serializeFilterState>) => void} listener */
export const subscribeFilterState = (listener) => {
    listeners.add(listener);

    return () => {
        listeners.delete(listener);
    };
};
