/** Путь к файлу из ./assets/ с учётом base Vite (./ в prod). */
export const assetUrl = (path) => {
    const normalized = path.replace(/^\.\//, '');

    return `${import.meta.env.BASE_URL}${normalized}`;
};
