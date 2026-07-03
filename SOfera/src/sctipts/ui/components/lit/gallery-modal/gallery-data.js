import { assetUrl } from '../../../../utils/asset-url.js';

/** @typedef {{
 *   sectionLabel?: string;
 *   title?: string;
 *   projectTitle?: string;
 *   description?: string;
 *   images?: string[];
 *   initialIndex?: number;
 * }} GalleryModalOpenOptions */

export const GALLERY_IMAGE_IDS = Object.freeze([
    '6500958',
    '6500964',
    '6500966',
    '6500967',
    '6500974',
    '6500977',
    '6500979',
    '6500982',
    '6500983',
    '6500985',
    '6501071',
    '6501072',
    '6501079',
    '6501080',
    '6501081'
]);

/** @param {string} id */
export const getGalleryImageSrc = (id) => assetUrl(`./assets/main/${id}.PNG`);

export const DEFAULT_GALLERY_CONTENT = Object.freeze({
    sectionLabel: 'Галерея',
    title: 'О проекте',
    projectTitle: 'Прайм Энегельса',
    description:
        'Возможность создать фотоснимки выбранных квартир для отправки на электронную почту клиента. Решение интегрировано с CRM-системой для удобства работы с клиентами.'
});

export const getDefaultGalleryImages = () =>
    GALLERY_IMAGE_IDS.map((id) => getGalleryImageSrc(id));

/** @param {GalleryModalOpenOptions} [options] */
export const resolveGalleryContent = (options = {}) => ({
    sectionLabel: options.sectionLabel ?? DEFAULT_GALLERY_CONTENT.sectionLabel,
    title: options.title ?? DEFAULT_GALLERY_CONTENT.title,
    projectTitle: options.projectTitle ?? DEFAULT_GALLERY_CONTENT.projectTitle,
    description: options.description ?? DEFAULT_GALLERY_CONTENT.description,
    images: Array.isArray(options.images) && options.images.length
        ? options.images
        : getDefaultGalleryImages(),
    initialIndex: Math.max(0, Number(options.initialIndex) || 0)
});
