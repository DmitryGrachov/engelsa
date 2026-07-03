/** @param {HTMLButtonElement[]} buttons
 * @param {Set<number>} selected */
export const syncSectionButtons = (buttons, selected) => {
    buttons.forEach((btn) => {
        const value = btn.dataset.section;
        const on =
            value === 'all'
                ? selected.size === 0
                : selected.has(Number(value));
        btn.classList.toggle('filterModalTypeBtnActive', on);
    });
};

export const syncRoomButtons = (buttons, selected) => {
    buttons.forEach((btn) => {
        const v = Number(btn.dataset.rooms);
        btn.classList.toggle('filterRoomBtnActive', selected.has(v));
    });
};

export const syncStatusButtons = (buttons, selected) => {
    buttons.forEach((btn) => {
        const s = btn.dataset.status;
        btn.classList.toggle('filterStatusBtnActive', selected.has(s));
    });
};

/** @param {HTMLButtonElement[]} buttons
 * @param {Set<string>} selected
 * @param {string} datasetKey */
export const syncTagButtons = (buttons, selected, datasetKey) => {
    buttons.forEach((btn) => {
        const value = btn.dataset[datasetKey];
        btn.classList.toggle('filterStatusBtnActive', Boolean(value && selected.has(value)));
    });
};

/** @param {HTMLButtonElement} btn3d
 * @param {HTMLButtonElement} btnList */
export const syncViewModeButtons = (btn3d, btnList, viewMode) => {
    btn3d.classList.toggle('filterModalViewBtnActive', viewMode === '3d');
    btnList.classList.toggle('filterModalViewBtnActive', viewMode === 'list');
};
