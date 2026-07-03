import { FILTER_ICON, mountLabeledIconButton } from './button-icons.js';
import { countMatchingVariants } from './count-variants.js';

export const FILTER_SUMMARY_V_GAP = {
    beforeActions: 34.2
};

/** @typedef {{ onShow3d?: () => void; onShowList?: () => void }} FilterSummaryHandlers */

export const createFilterSummaryBlock = () => {
    const block = document.createElement('div');
    block.className = 'filterModalSummaryBlock';

    const label = document.createElement('div');
    label.className = 'filterModalSummaryLabel';
    label.setAttribute('aria-live', 'polite');

    const buttonRow = document.createElement('div');
    buttonRow.className = 'filterModalSummaryButtonRow';

    const btn3d = document.createElement('button');
    btn3d.type = 'button';
    btn3d.className = 'filterModalSummaryBtn filterModalSummaryBtn3d';
    btn3d.setAttribute('aria-label', 'Показать на 3D');
    mountLabeledIconButton(btn3d, FILTER_ICON.roomLight, 'на 3D');

    const btnList = document.createElement('button');
    btnList.type = 'button';
    btnList.className = 'filterModalSummaryBtn filterModalSummaryBtnList';
    btnList.setAttribute('aria-label', 'Показать списком');
    mountLabeledIconButton(btnList, FILTER_ICON.listLight, 'Списком');

    buttonRow.append(btn3d, btnList);
    block.append(label, buttonRow);

    /** @type {FilterSummaryHandlers} */
    let handlers = {};

    btn3d.addEventListener('click', () => {
        handlers.onShow3d?.();
    });

    btnList.addEventListener('click', () => {
        handlers.onShowList?.();
    });

    const updateSummaryCount = () => {
        const n = countMatchingVariants();

        label.textContent = `Показать: ${n} вариантов`;
    };

    /** @param {FilterSummaryHandlers} next */
    const bindHandlers = (next) => {
        handlers = { ...handlers, ...next };
    };

    return { summaryBlock: block, updateSummaryCount, bindHandlers };
};
