import {
    OFFER_PDF_COVER_TITLE,
    formatOfferCardArea,
    formatOfferCardPrice,
    formatOfferCardTagsLine,
    formatOfferCardTitle,
    getOfferCardStatus
} from './offer-pdf-format.js';

/** @typedef {import('../ui/components/lit/filter-group-variants-modal/filter-group-variants-data.js').FilterGroupVariantItem} FilterGroupVariantItem */

/** @typedef {FilterGroupVariantItem & { planDataUrl: string | null }} OfferPdfApartment */

const CARD_LAYOUT = {
    hLineWidth: () => 0,
    vLineWidth: () => 0,
    paddingLeft: () => 14,
    paddingRight: () => 14,
    paddingTop: () => 14,
    paddingBottom: () => 14
};

/** @param {OfferPdfApartment} apartment @param {number} index @param {number} total */
const buildApartmentPage = (apartment, index, total) => {
    const status = getOfferCardStatus(apartment);
    const tagsLine = formatOfferCardTagsLine(apartment);
    const sold = apartment.status === 'sold';

    /** @type {import('pdfmake/interfaces').Content[]} */
    const leftStack = [
        {
            columns: [
                {
                    text: formatOfferCardTitle(apartment),
                    fontSize: 11,
                    bold: true,
                    color: '#333333',
                    width: '*'
                },
                {
                    text: status.label,
                    fontSize: 8,
                    color: '#ffffff',
                    fillColor: status.color,
                    alignment: 'center',
                    margin: [0, 1, 0, 0]
                }
            ],
            columnGap: 8
        },
        {
            text: formatOfferCardArea(apartment),
            fontSize: 10,
            color: '#333333',
            margin: [0, 8, 0, 0]
        }
    ];

    if (tagsLine) {
        leftStack.push({
            text: tagsLine,
            fontSize: 8,
            color: '#4E4E4E',
            margin: [0, 8, 0, 0]
        });
    }

    leftStack.push(
        {
            columns: [
                {
                    width: 'auto',
                    stack: [
                        {
                            text: String(apartment.floor ?? '—'),
                            fontSize: 12,
                            bold: true,
                            color: '#333333',
                            alignment: 'center'
                        },
                        {
                            text: 'этаж',
                            fontSize: 8,
                            color: '#9E9D9D',
                            alignment: 'center',
                            margin: [0, 2, 0, 0]
                        }
                    ],
                    margin: [0, 12, 18, 0]
                },
                {
                    width: 'auto',
                    stack: [
                        {
                            text: String(apartment.section ?? '—'),
                            fontSize: 12,
                            bold: true,
                            color: '#333333',
                            alignment: 'center'
                        },
                        {
                            text: 'секция',
                            fontSize: 8,
                            color: '#9E9D9D',
                            alignment: 'center',
                            margin: [0, 2, 0, 0]
                        }
                    ],
                    margin: [0, 12, 0, 0]
                }
            ]
        },
        {
            text: formatOfferCardPrice(apartment),
            fontSize: 16,
            bold: true,
            color: sold ? '#9E9D9D' : '#26BDA9',
            margin: [0, 14, 0, 0]
        }
    );

  /** @type {import('pdfmake/interfaces').Content} */
    const planCell = apartment.planDataUrl
        ? {
            image: apartment.planDataUrl,
            width: 145,
            alignment: 'center',
            margin: [0, 8, 0, 0]
        }
        : { text: '' };

    return {
        stack: [
            {
                table: {
                    widths: ['*'],
                    body: [[
                        {
                            table: {
                                widths: ['*', 155],
                                body: [[
                                    { stack: leftStack },
                                    planCell
                                ]]
                            },
                            layout: CARD_LAYOUT
                        }
                    ]]
                },
                layout: {
                    hLineWidth: () => 1,
                    vLineWidth: () => 1,
                    hLineColor: () => '#EBEBEB',
                    vLineColor: () => '#EBEBEB',
                    paddingLeft: () => 0,
                    paddingRight: () => 0,
                    paddingTop: () => 0,
                    paddingBottom: () => 0
                }
            },
        ],
        pageBreak: index < total - 1 ? 'after' : undefined,
        margin: [28, 28, 28, 28]
    };
};

/** @param {OfferPdfApartment[]} apartments @param {{ coverTitle?: string }} [options] */
export const buildOfferPdfDefinition = (apartments, options = {}) => {
    const coverTitle = options.coverTitle ?? OFFER_PDF_COVER_TITLE;

    /** @type {import('pdfmake/interfaces').TDocumentDefinitions} */
    const docDefinition = {
        pageSize: 'A4',
        pageMargins: [0, 0, 0, 0],
        defaultStyle: {
            font: 'Roboto',
            fontSize: 10,
            color: '#333333'
        },
        content: [
            {
                text: coverTitle,
                alignment: 'center',
                fontSize: 32,
                bold: true,
                color: '#242424',
                margin: [40, 340, 40, 0],
                pageBreak: apartments.length > 0 ? 'after' : undefined
            },
            ...apartments.map((apartment, index) =>
                buildApartmentPage(apartment, index, apartments.length)
            )
        ]
    };

    return docDefinition;
};

/** @deprecated Use buildOfferPdfDefinition */
export const buildFavoritesOfferPdfDefinition = buildOfferPdfDefinition;
