import { buildFavoritesApartments } from '../ui/components/lit/favorites-apartments-modal/favorites-apartments-data.js';
import { buildOfferPdfDefinition } from './offer-pdf-template.js';
import { resolveOfferPlanDataUrl } from './offer-pdf-images.js';
import { OFFER_PDF_COVER_TITLE } from './offer-pdf-format.js';
import { poiInfoToOfferVariant } from './offer-pdf-data.js';

/** @typedef {import('../ui/components/lit/filter-group-variants-modal/filter-group-variants-data.js').FilterGroupVariantItem} FilterGroupVariantItem */
/** @typedef {import('../ui/components/lit/poi-modal/poi-modal-utils.js').PoiInfo} PoiInfo */

/** @typedef {{
 *   variants: FilterGroupVariantItem[];
 *   coverTitle?: string;
 *   emptyMessage?: string;
 *   filename?: string;
 * }} DownloadOfferPdfOptions */

let pdfMakePromise = null;

const getPdfMake = async () => {
    if (!pdfMakePromise) {
        pdfMakePromise = Promise.all([
            import('pdfmake/build/pdfmake.js'),
            import('pdfmake/build/vfs_fonts.js')
        ]).then(([pdfMakeModule, vfsModule]) => {
            const pdfMake = pdfMakeModule.default;

            pdfMake.addVirtualFileSystem(vfsModule.default);

            return pdfMake;
        });
    }

    return pdfMakePromise;
};

const buildOfferFilename = (suffix = 'praim-engelsa') => {
    const date = new Date();
    const stamp = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0')
    ].join('-');

    return `podbor-${suffix}-${stamp}.pdf`;
};

/** @param {string} value */
const slugifyFilenamePart = (value) =>
    String(value ?? '')
        .trim()
        .toLowerCase()
        .replace(/[«»"']/g, '')
        .replace(/[^a-z0-9а-яё]+/gi, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 48) || 'praim-engelsa';

/** @param {FilterGroupVariantItem[]} variants */
const prepareApartmentsWithPlans = async (variants) =>
    Promise.all(
        variants.map(async (variant) => ({
            ...variant,
            planDataUrl: await resolveOfferPlanDataUrl(variant.planSrc)
        }))
    );

/** @param {DownloadOfferPdfOptions} options */
export const downloadOfferPdf = async ({
    variants,
    coverTitle = OFFER_PDF_COVER_TITLE,
    emptyMessage = 'Нет квартир для подборки.',
    filename
} = {}) => {
    const list = Array.isArray(variants) ? variants : [];

    if (!list.length) {
        window.alert(emptyMessage);
        return false;
    }

    const pdfMake = await getPdfMake();
    const apartments = await prepareApartmentsWithPlans(list);
    const docDefinition = buildOfferPdfDefinition(apartments, { coverTitle });

    await pdfMake.createPdf(docDefinition).download(
        filename ?? buildOfferFilename()
    );

    return true;
};

export const downloadFavoritesOfferPdf = async () =>
    downloadOfferPdf({
        variants: buildFavoritesApartments(),
        emptyMessage: 'В избранном пока нет квартир для подборки.'
    });

/** @param {FilterGroupVariantItem[]} variants @param {string} [groupTitle] */
export const downloadFilterGroupVariantsOfferPdf = async (
    variants,
    groupTitle = ''
) => {
    const suffix = slugifyFilenamePart(groupTitle);

    return downloadOfferPdf({
        variants,
        emptyMessage: 'Нет квартир для формирования предложения.',
        filename: buildOfferFilename(suffix)
    });
};

/** @param {PoiInfo | null | undefined} info
 * @param {{ planSrc?: string, floorPlanSrc?: string }} [sources] */
export const downloadPoiOfferPdf = async (info, sources = {}) => {
    const variant = poiInfoToOfferVariant(info, sources);

    if (!variant) {
        window.alert('Не удалось сформировать предложение для этой квартиры.');
        return false;
    }

    const numberPart =
        variant.number != null ? `kv-${variant.number}` : 'kv';

    return downloadOfferPdf({
        variants: [variant],
        emptyMessage: 'Не удалось сформировать предложение для этой квартиры.',
        filename: buildOfferFilename(numberPart)
    });
};
