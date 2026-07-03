import { assetUrl } from '../../utils/asset-url.js';
import { createFilterModal, setFilterModalInstance } from './filter/index.js';
import { getAccountModal } from './lit/account-modal/index.js';
import { getFilterResultsModal } from './lit/filter-results-modal/index.js';
import { getFilterGroupVariantsModal } from './lit/filter-group-variants-modal/index.js';
import { getFavorites, FAVORITES_CHANGE_EVENT } from '../../../../lib/favorites.js';
import { getPoiDesktopLayoutMediaQuery } from '../../poi/poi-viewport.js';

const DESKTOP_LAYOUT_MQ = getPoiDesktopLayoutMediaQuery();

// Создает нижнюю полоску с кнопками
export const panel = () => {
    const uiRoot = document.getElementById('ui');

    if (!uiRoot) return null;

    const wrapper = document.createElement('div');
    wrapper.id = 'panelWrapper';

    const panel = document.createElement('div');
    panel.id = 'panel';

    const sidePanel = document.createElement('button');
    sidePanel.id = 'sidePanel';

    const sideIcon = document.createElement('img');

    sideIcon.src = assetUrl('./assets/icons/settings.svg');
    sideIcon.className = 'sidePanelIcon';

    const sideIconWrap = document.createElement('span');
    sideIconWrap.className = 'sidePanelIconWrap';
    sideIconWrap.appendChild(sideIcon);

    sidePanel.appendChild(sideIconWrap);

    const panelModes = [
        { icon: './assets/icons/house.svg', mode: 'house', label: 'Дом' },
        { icon: './assets/icons/search.svg', mode: 'search', label: 'Поиск' },
        { icon: './assets/icons/map.svg', mode: 'map', label: 'Карта' }
    ];

    const buttons = [];

    for (const { icon: iconPath, mode, label } of panelModes) {
        const button = document.createElement('button');
        const icon = document.createElement('img');

        button.className = 'panelButton';
        button.type = 'button';
        button.dataset.panelMode = mode;
        button.setAttribute('aria-label', label);

        icon.src = assetUrl(iconPath);
        icon.className = 'panelButtonIcon';
        icon.alt = '';

        button.appendChild(icon);

        panel.appendChild(button);
        buttons.push(button);
    }

    // Занести like в panelModes если нужна функциональность
    const likeButton = document.createElement('button');

    likeButton.className = 'panelButton';
    likeButton.type = 'button';
    likeButton.dataset.panelMode = 'favorites';
    likeButton.setAttribute('aria-label', 'Избранное');

    const likeIcon = document.createElement('img');

    likeIcon.src = assetUrl('./assets/icons/like.svg');
    likeIcon.className = 'panelButtonIcon';
    likeIcon.alt = '';

    likeButton.appendChild(likeIcon);

    const badge = document.createElement('span');

    badge.className = 'panelButtonBadge';
    badge.setAttribute('aria-hidden', 'true');
    likeButton.appendChild(badge);

    const syncFavoritesBadge = () => {
        const count = getFavorites().length;

        if (count === 0) {
            badge.hidden = true;
            badge.textContent = '';
            return;
        }

        badge.hidden = false;
        badge.textContent = String(count);
    };

    syncFavoritesBadge();
    window.addEventListener(FAVORITES_CHANGE_EVENT, syncFavoritesBadge);

    panel.appendChild(likeButton);
    buttons.push(likeButton);

    wrapper.appendChild(panel);
    wrapper.appendChild(sidePanel);

    uiRoot.appendChild(wrapper);

    const filterModal = createFilterModal();
    setFilterModalInstance(filterModal);
    const accountModal = getAccountModal();

    const syncFilterActive = () => {
        const isMobile = !window.matchMedia(DESKTOP_LAYOUT_MQ).matches;
        const filterOpen = filterModal?.isOpen?.() ?? false;
        const resultsOpen = getFilterResultsModal()?.isOpen?.() ?? false;
        const variantsOpen = getFilterGroupVariantsModal()?.isOpen?.() ?? false;
        const hidePanel = isMobile && (filterOpen || resultsOpen || variantsOpen);

        sidePanel.classList.toggle('sidePanelFilterActive', filterOpen);
        wrapper.classList.toggle('panelWrapper--filterOpen', hidePanel);
        wrapper.setAttribute('aria-hidden', hidePanel ? 'true' : 'false');
    };

    sidePanel.addEventListener('click', () => {
        const willOpenFilter = !(filterModal?.isOpen?.() ?? false);

        if (willOpenFilter)
            accountModal?.close();

        filterModal?.toggle();
        syncFilterActive();
    });

    filterModal?.root?.addEventListener('filtermodal:change', syncFilterActive);
    uiRoot.addEventListener('filterresultsmodal:change', syncFilterActive);
    uiRoot.addEventListener('filtergroupvariantsmodal:change', syncFilterActive);
    syncFilterActive();

    return {
        root: wrapper,
        panel,
        sidePanel,
        buttons,
        buttonsByMode: {
            house: buttons[0],
            search: buttons[1],
            map: buttons[2],
            favorites: likeButton
        },
        favoritesButton: likeButton,
        filterModal,
        accountModal
    };
};