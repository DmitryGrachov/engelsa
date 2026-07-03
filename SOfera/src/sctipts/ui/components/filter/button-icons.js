import { assetUrl } from '../../../utils/asset-url.js';

/** Пути как в `panel.js` — относительно страницы. */
export const FILTER_ICON = Object.freeze({
    room: './assets/icons/room.svg',
    roomLight: './assets/icons/room-light.png',
    parking: './assets/icons/parking.png',
    list: './assets/icons/list.png',
    listLight: './assets/icons/list-light.svg',
    settingsLight: './assets/icons/settings_light.png',
    reset: './assets/icons/reset.png',
    back: './assets/icons/back.svg'
});

/**
 * @param {HTMLButtonElement} button
 * @param {string} iconPath
 * @param {string} labelText
 */
export function mountLabeledIconButton(button, iconPath, labelText) {
    button.textContent = '';
    button.classList.add('filterModalBtnWithIcon');

    const icon = document.createElement('img');
    icon.className = 'filterModalBtnIcon';
    icon.src = assetUrl(iconPath);
    icon.alt = '';
    icon.draggable = false;

    const label = document.createElement('span');
    label.className = 'filterModalBtnText';
    label.textContent = labelText;

    button.append(icon, label);
}
