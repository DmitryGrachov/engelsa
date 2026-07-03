import { assetUrl } from '../utils/asset-url.js';

const cardFallbackSrc = assetUrl('./assets/account/apartment.png');

/** @param {string | null | undefined} src */
export const loadImageAsDataUrl = async (src) => {
    if (!src)
        return null;

    try {
        const response = await fetch(src);

        if (!response.ok)
            return null;

        const blob = await response.blob();

        return await new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => {
                resolve(typeof reader.result === 'string' ? reader.result : null);
            };
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(blob);
        });
    } catch {
        return null;
    }
};

/** @param {string | null | undefined} planSrc */
export const resolveOfferPlanDataUrl = async (planSrc) => {
    const primary = await loadImageAsDataUrl(planSrc);

    if (primary)
        return primary;

    return loadImageAsDataUrl(cardFallbackSrc);
};
