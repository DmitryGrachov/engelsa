import dataArray from '../../../../res/data.json';

/** @param {string} field */
const collectUniqueStringOptions = (field) => {
    /** @type {Map<string, string>} */
    const canonicalByKey = new Map();

    for (const item of dataArray) {
        const values = item?.[field];

        if (!Array.isArray(values))
            continue;

        for (const value of values) {
            if (typeof value !== 'string')
                continue;

            const trimmed = value.trim();

            if (!trimmed)
                continue;

            const key = trimmed.toLowerCase();

            if (!canonicalByKey.has(key))
                canonicalByKey.set(key, trimmed);
        }
    }

    return [...canonicalByKey.values()].sort((a, b) =>
        a.localeCompare(b, 'ru')
    );
};

export const LAYOUT_TAG_OPTIONS = collectUniqueStringOptions('tags');
export const WINDOW_VIEW_TAG_OPTIONS = collectUniqueStringOptions('windowViewTag');
