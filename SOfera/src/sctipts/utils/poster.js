// Показывает постер вместо canvas, если он передан в конфиге.
export const applyPosterIfNeeded = (poster) => {
    if (!poster) return;

    const element = document.getElementById('poster');

    if (!element) return;

    element.style.setProperty('--poster-url', `url(${poster.src})`);
    element.style.display = 'block';
    element.style.filter = 'blur(40px)';

    document.documentElement.style.setProperty('--canvas-opacity', '0');
};
