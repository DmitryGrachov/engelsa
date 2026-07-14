import { isPoiNarrowViewport } from '../poi/poi-viewport.js';

/** Сколько больших PNG-планов держим как blob URL (мобила жёстче). */
const PLAN_IMAGE_CACHE_MAX_MOBILE = 3;
const PLAN_IMAGE_CACHE_MAX_DESKTOP = 8;

/**
 * @typedef {{ blobUrl: string }} PlanImageCacheEntry
 */

/** LRU по порядку вставки. @type {Map<string, PlanImageCacheEntry>} */
const cache = new Map();
/** @type {Map<string, Promise<string>>} */
const inflight = new Map();
let cacheEpoch = 0;

const getCacheMax = () =>
    (isPoiNarrowViewport() ? PLAN_IMAGE_CACHE_MAX_MOBILE : PLAN_IMAGE_CACHE_MAX_DESKTOP);

/**
 * Только тяжёлые растровые планы — иконки/svg не трогаем.
 * @param {string} src
 */
const shouldManageSrc = src => {
    if (!src || typeof src !== 'string')
        return false;

    if (src.startsWith('blob:'))
        return true;

    return /\/assets\/(?:main|plans)\//i.test(src);
};

/**
 * @param {string} key
 * @param {PlanImageCacheEntry} entry
 */
const revokeEntry = (key, entry) => {
    cache.delete(key);

    try {
        URL.revokeObjectURL(entry.blobUrl);
    } catch {
        /* ignore */
    }
};

/** @param {string} key */
const touch = key => {
    const entry = cache.get(key);

    if (!entry)
        return null;

    cache.delete(key);
    cache.set(key, entry);

    return entry;
};

/** @param {string | null} keepKey */
const evictIfNeeded = keepKey => {
    const max = getCacheMax();

    while (cache.size > max) {
        let evicted = false;

        for (const [key, entry] of cache) {
            if (key === keepKey)
                continue;

            revokeEntry(key, entry);
            evicted = true;
            break;
        }

        if (!evicted)
            break;
    }
};

/**
 * Возвращает blob: URL (или исходный src при ошибке / если не нужно кэшировать).
 * @param {string} src
 * @returns {Promise<string>}
 */
export const acquirePlanImageUrl = src => {
    const trimmed = typeof src === 'string' ? src.trim() : '';

    if (!trimmed)
        return Promise.resolve('');

    if (!shouldManageSrc(trimmed))
        return Promise.resolve(trimmed);

    const cached = touch(trimmed);

    if (cached)
        return Promise.resolve(cached.blobUrl);

    const pending = inflight.get(trimmed);

    if (pending)
        return pending;

    const epoch = cacheEpoch;
    const loadPromise = fetch(trimmed)
        .then(response => {
            if (!response.ok)
                throw new Error(`plan image fetch failed: ${response.status}`);

            return response.blob();
        })
        .then(blob => {
            inflight.delete(trimmed);

            if (epoch !== cacheEpoch)
                return trimmed;

            const existing = touch(trimmed);

            if (existing)
                return existing.blobUrl;

            const blobUrl = URL.createObjectURL(blob);

            cache.set(trimmed, { blobUrl });
            evictIfNeeded(trimmed);

            return blobUrl;
        })
        .catch(err => {
            inflight.delete(trimmed);
            console.warn('[plan-image] acquire failed', trimmed, err);

            return trimmed;
        });

    inflight.set(trimmed, loadPromise);

    return loadPromise;
};

/** Полный сброс кэша (закрытие POI / среза). */
export const clearPlanImageCache = () => {
    cacheEpoch += 1;
    inflight.clear();

    for (const [key, entry] of [...cache.entries()])
        revokeEntry(key, entry);
};

/**
 * Снимает src у больших plan-img (в т.ч. в shadow root), чтобы отпустить decode в DOM.
 * @param {Element | DocumentFragment | ShadowRoot | null | undefined} root
 */
export const releaseHtmlPlanImages = root => {
    if (!root)
        return;

    /** @param {Element | DocumentFragment | ShadowRoot} node */
    const visit = node => {
        if (node instanceof Element && node.tagName === 'IMG') {
            const img = /** @type {HTMLImageElement} */ (node);
            const src = img.currentSrc || img.getAttribute('src') || '';

            if (shouldManageSrc(src)) {
                img.removeAttribute('src');
                img.src = '';
            }
        }

        if (node instanceof Element && node.shadowRoot)
            visit(node.shadowRoot);

        const children = 'children' in node ? node.children : null;

        if (children) {
            for (let i = 0; i < children.length; i++)
                visit(children[i]);
        }
    };

    visit(root);
};

/**
 * Очистить props + DOM-decode + revoke blob-кэша после updateComplete lit-элементов.
 * @param {Iterable<Element | null | undefined>} hosts
 */
export const releasePlanImagesAfterClose = hosts => {
    const list = [...hosts].filter(Boolean);

    for (const host of list) {
        releaseHtmlPlanImages(host);
    }

    const done = Promise.all(
        list.map(host =>
            host && 'updateComplete' in host && host.updateComplete
                ? host.updateComplete
                : Promise.resolve()
        )
    );

    return done.then(() => {
        for (const host of list)
            releaseHtmlPlanImages(host);

        clearPlanImageCache();
    });
};
