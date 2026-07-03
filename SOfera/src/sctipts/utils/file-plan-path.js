/**
 * Преобразует путь к изображению из UE-формата в локальный assets/main.
 * Пример: /Game/ArchVizExplorer/Upload/6309662.6309662 -> ./assets/main/6309662.PNG
 * @param {unknown} assetPath
 */
export const normalizeFilePlanPath = assetPath => {
    if (typeof assetPath !== 'string')
        return '';

    const trimmed = assetPath.trim();

    if (!trimmed)
        return '';

    if (/^\.\/assets\/main\//i.test(trimmed))
        return trimmed;

    if (/^assets\/main\//i.test(trimmed))
        return `./${trimmed}`;

    const duplicatedId = trimmed.match(/\/(\d+)\.\1$/);

    if (duplicatedId)
        return `./assets/main/${duplicatedId[1]}.PNG`;

    const lastSegmentId = trimmed.match(/\/(\d+)\.[^/]+$/);

    if (lastSegmentId)
        return `./assets/main/${lastSegmentId[1]}.PNG`;

    return trimmed;
};
