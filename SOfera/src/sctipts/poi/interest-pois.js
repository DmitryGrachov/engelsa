import { getMainCamera } from '../scene/camera.js';
import { assetUrl } from '../utils/asset-url.js';
import { getFilterModal, setFilterSection } from '../ui/components/filter/index.js';
import { activateSearchPanelMode } from '../ui/panel-mode.js';
import { isPoiNarrowViewport } from './poi-viewport.js';
import { getInterestPoiWideCardSpec } from '../ui/components/lit/interest-poi-card/index.js';
import { getInterestPoiTourModal } from '../ui/components/lit/interest-poi-tour-modal/index.js';
import '../ui/components/lit/interest-poi-card/interest-poi-card.js';

const INTERESTS_ICON = './assets/interests/icons';
const FALLBACK_INTEREST_ICON = `${INTERESTS_ICON}/squer.svg`;
const SECTION_HOME_ICON = './assets/icons/pois/home.svg';

/** @param {number} sectionNumber */
const sectionCardImagePath = sectionNumber =>
    `./assets/sections/s${sectionNumber}.svg`;

/** Иконка слева: vector — CSS mask + background; raster — img (двор) */
const POI_MARKER_ICONS = {
    Двор: { type: 'raster', src: './assets/icons/pois/yard.svg' },
    парк: { type: 'mask', src: FALLBACK_INTEREST_ICON },
    музей: { type: 'mask', src: `${INTERESTS_ICON}/museum.svg` },
    аквапарк: { type: 'mask', src: FALLBACK_INTEREST_ICON },
    сквер: { type: 'mask', src: `${INTERESTS_ICON}/squer.svg` },
    ТЦ: { type: 'mask', src: `${INTERESTS_ICON}/mall.svg` },
    больница: { type: 'mask', src: `${INTERESTS_ICON}/hospital.svg` },
    'Секция №1': { type: 'mask', src: SECTION_HOME_ICON },
    'Секция №2': { type: 'mask', src: SECTION_HOME_ICON },
    'Секция №3': { type: 'mask', src: SECTION_HOME_ICON },
    'Секция №4': { type: 'mask', src: SECTION_HOME_ICON },
    'Секция №5': { type: 'mask', src: SECTION_HOME_ICON }
};

const isInterestSectionTitle = title => /^Секция №\d+$/.test(String(title ?? ''));

const parseInterestSectionNumber = title => {
    const match = /^Секция №(\d+)$/.exec(String(title ?? ''));

    return match ? Number(match[1]) : null;
};

const getMarkerIconSpec = title => {
    if (isInterestSectionTitle(title))
        return { type: 'mask', src: SECTION_HOME_ICON };

    return POI_MARKER_ICONS[title] ?? POI_MARKER_ICONS['Секция №1'];
};

/** Карточка под маркером (остальные interest POI — над маркером с тем же зазором). */
const isCardBelowMarkerTitle = title =>
    title === 'Двор' || isInterestSectionTitle(title);
const INTEREST_CARD_GAP_PX = 5;

const openFilterFromInterestCard = (sectionNumber) => {
    if (typeof sectionNumber === 'number' && sectionNumber >= 1)
        setFilterSection(sectionNumber);

    activateSearchPanelMode({ skipCameraNudge: true });

    if (isPoiNarrowViewport())
        return;

    getFilterModal()?.open?.();
};

/** Размеры и картинки карточек секций (wide — Lit-компонент interest-poi-card). */
const INTEREST_SECTION_CARD_BY_TITLE = {
    'Секция №1': {
        width: 200,
        height: 222,
        image: sectionCardImagePath(1),
        withHelloBtn: true
    },
    'Секция №2': {
        width: 200,
        height: 186,
        image: sectionCardImagePath(2),
        withHelloBtn: true
    },
    'Секция №3': {
        width: 200,
        height: 222,
        image: sectionCardImagePath(3),
        withHelloBtn: true
    },
    'Секция №4': {
        width: 200,
        height: 186,
        image: sectionCardImagePath(4),
        withHelloBtn: true
    },
    'Секция №5': {
        width: 200,
        height: 186,
        image: sectionCardImagePath(5),
        withHelloBtn: true
    }
};

const buildInterestSectionCard = spec => {
    const card = document.createElement('div');

    card.className = 'interestPoiCard interestPoiCard--section';
    card.style.setProperty('--interest-section-card-w', String(spec.width));
    card.style.setProperty('--interest-section-card-h', String(spec.height));

    const media = document.createElement('div');

    media.className = 'interestPoiCardMedia';
    const img = document.createElement('img');

    img.className = 'interestPoiCardImg';
    img.src = assetUrl(spec.image);
    img.alt = '';
    img.decoding = 'async';
    img.draggable = false;
    media.appendChild(img);
    card.appendChild(media);

    if (spec.withHelloBtn) {
        const btn = document.createElement('button');

        btn.type = 'button';
        btn.className = 'interestPoiCardBtn';
        btn.textContent = 'привет';
        card.appendChild(btn);
    }

    return card;
};

const buildInterestWideCard = wideSpec => {
    const card = document.createElement('interest-poi-card');

    card.className = 'interestPoiCard interestPoiCard--wide';
    card.cardTitle = wideSpec.title;
    card.location = wideSpec.location;
    card.bgSrc = wideSpec.bg;
    card.iconType = wideSpec.iconType ?? 'none';

    if (wideSpec.icon)
        card.iconSrc = wideSpec.icon;

    if (wideSpec.withTourBtn)
        card.withTourBtn = true;

    return card;
};

const buildInterestPoiCard = poiTitle => {
    const wideSpec = getInterestPoiWideCardSpec(poiTitle);

    if (wideSpec)
        return buildInterestWideCard(wideSpec);

    const sectionSpec =
        INTEREST_SECTION_CARD_BY_TITLE[poiTitle]
        ?? INTEREST_SECTION_CARD_BY_TITLE['Секция №1'];

    return buildInterestSectionCard(sectionSpec);
};

/** Клик по сцене / UI вне маркера и карточки interest POI */
const isInterestPoiHit = target =>
    typeof target?.closest === 'function' && !!target.closest('.interestPoiMarker, .interestPoiCard');

const buildMarkerIconNodes = title => {
    const spec = getMarkerIconSpec(title);

    if (spec.type === 'none')
        return null;

    if (spec.type === 'raster') {
        const wrap = document.createElement('span');

        wrap.className = 'interestPoiMarkerIconRaster';
        const img = document.createElement('img');

        img.src = assetUrl(spec.src);
        img.alt = '';
        img.decoding = 'async';
        img.draggable = false;
        wrap.appendChild(img);

        return wrap;
    }

    const mask = document.createElement('span');

    mask.className = 'interestPoiMarkerIconMask';
    const iconUrl = assetUrl(spec.src);

    mask.style.webkitMaskImage = `url('${iconUrl}')`;
    mask.style.maskImage = `url('${iconUrl}')`;

    return mask;
};

// Создает DOM-маркеры POI и привязывает их к 3D-координатам.
export const createInterestPois = (app, pois, { poiBoxController } = {}) => {
    const uiRoot = document.getElementById('ui');

    if (!uiRoot || !Array.isArray(pois))
        return null;

    /** Разрешённые по режиму панели заголовки; пустой Set = ничего не показывать */
    let allowedTitles = new Set();

    /** @type {{ title: string; marker: HTMLElement; card: HTMLElement; worldPosition: object; isOpen: () => boolean; setClosed: () => void; openExclusive: () => void }[]} */
    const poiViews = [];

    const closeAllInterestPois = () => {
        for (const v of poiViews)
            v.setClosed();
    };

    /** Закрытие не по одиночному клику в пустоту — только dblclick / double-tap вне маркера и карточки. */
    document.addEventListener(
        'dblclick',
        event => {
            if (isInterestPoiHit(event.target))
                return;
            closeAllInterestPois();
        },
        true
    );

    const DOUBLE_TAP_MS = 320;
    const DOUBLE_TAP_MAX_PX = 42;
    /** @type {{ t: number; x: number; y: number } | null} */
    let touchTapAnchor = null;

    document.addEventListener(
        'touchend',
        event => {
            if (event.changedTouches.length !== 1)
                return;

            const t = event.changedTouches[0];
            const now = event.timeStamp;

            if (!touchTapAnchor) {
                touchTapAnchor = { t: now, x: t.clientX, y: t.clientY };

                return;
            }

            const dt = now - touchTapAnchor.t;
            const dist = Math.hypot(t.clientX - touchTapAnchor.x, t.clientY - touchTapAnchor.y);

            if (dt > DOUBLE_TAP_MS || dist > DOUBLE_TAP_MAX_PX) {
                touchTapAnchor = { t: now, x: t.clientX, y: t.clientY };

                return;
            }

            touchTapAnchor = null;

            if (isInterestPoiHit(t.target))
                return;

            closeAllInterestPois();
        },
        { passive: true, capture: true }
    );

    for (const poi of pois) {
        const marker = document.createElement('button');

        marker.className = 'interestPoiMarker';
        marker.type = 'button';
        marker.setAttribute('aria-pressed', 'false');
        marker.setAttribute('aria-label', `Точка интереса: ${poi.title}`);

        const pill = document.createElement('span');

        pill.className = 'interestPoiMarkerPill';

        const iconNode = buildMarkerIconNodes(poi.title);

        if (iconNode)
            pill.appendChild(iconNode);

        const label = document.createElement('span');

        label.className = 'interestPoiMarkerLabel';
        label.textContent = poi.title;
        pill.appendChild(label);

        const pin = document.createElement('span');

        pin.className = 'interestPoiMarkerPin';
        pin.setAttribute('aria-hidden', 'true');

        const stem = document.createElement('span');

        stem.className = 'interestPoiMarkerPinStem';

        const dot = document.createElement('span');

        dot.className = 'interestPoiMarkerPinDot';

        pin.append(stem, dot);
        marker.append(pill, pin);

        const card = buildInterestPoiCard(poi.title);

        uiRoot.append(marker, card);

        const worldPosition = {
            x: Number(poi.position.x),
            y: Number(poi.position.y),
            z: Number(poi.position.z)
        };

        let open = false;

        const title = String(poi.title);

        const poiView = {
            title,
            marker,
            card,
            worldPosition,
            isOpen: () => open,
            setClosed() {
                open = false;
                card.classList.remove('open');
                marker.classList.remove('interestPoiMarker--active');
                marker.setAttribute('aria-pressed', 'false');
            },
            openExclusive() {
                closeAllInterestPois();
                open = true;
                card.classList.add('open');
                marker.classList.add('interestPoiMarker--active');
                marker.setAttribute('aria-pressed', 'true');
            }
        };

        poiViews.push(poiView);

        card.querySelector('.interestPoiCardBtn')?.addEventListener('click', event => {
            event.stopPropagation();
            openFilterFromInterestCard(parseInterestSectionNumber(title));
            poiView.setClosed();
        });

        card.addEventListener('interest-poi-tour', event => {
            event.stopPropagation();
            getInterestPoiTourModal()?.open?.();
            poiView.setClosed();
        });

        marker.addEventListener('mousedown', event => event.stopPropagation());
        marker.addEventListener('click', event => {
            event.stopPropagation();

            if (open) {
                poiView.setClosed();
                return;
            }

            poiView.openExclusive();

            if (isInterestSectionTitle(title))
                poiBoxController?.nudgeCameraTowardInterestPoint?.(worldPosition);
        });

        card.addEventListener('mousedown', event => event.stopPropagation());
    }

    // Каждый кадр проецирует 3D-позицию POI в экранные координаты.
    const updateScreenPosition = () => {
        const cameraEntity = getMainCamera(app);
        const graphics = app.graphicsDevice;

        if (!cameraEntity || !graphics) return;

        // worldToScreen считает в clientRect (CSS-пиксели layout), а не в graphics.width/height буфера —
        // при 0.5× / ¼ внутреннем разрешении сравнение с буфером скрывало маркеры на ПК.
        graphics.updateClientRect();
        const { width: viewW, height: viewH } = graphics.clientRect;

        for (const poiView of poiViews) {
            const screenPosition = cameraEntity.camera.worldToScreen(poiView.worldPosition);

            const isInFront = screenPosition.z > 0;
            const isOnScreen = isInFront
                && screenPosition.x >= 0
                && screenPosition.x <= viewW
                && screenPosition.y >= 0
                && screenPosition.y <= viewH;

            const visibleByMode = allowedTitles.has(poiView.title);
            const showUi = visibleByMode && isOnScreen;

            poiView.marker.style.left = `${screenPosition.x}px`;
            poiView.marker.style.top = `${screenPosition.y}px`;

            if (showUi) {
                const mr = poiView.marker.getBoundingClientRect();

                poiView.card.style.left = `${Math.round(mr.left)}px`;
                if (isCardBelowMarkerTitle(poiView.title)) {
                    poiView.card.style.top = `${Math.round(mr.bottom + INTEREST_CARD_GAP_PX)}px`;
                } else {
                    const cardH = poiView.card.offsetHeight || poiView.card.getBoundingClientRect().height;

                    poiView.card.style.top = `${Math.round(mr.top - cardH - INTEREST_CARD_GAP_PX)}px`;
                }
            }

            poiView.marker.classList.toggle('hidden', !showUi);
            poiView.card.classList.toggle('hidden', !showUi);

            if ((!isOnScreen || !visibleByMode) && poiView.isOpen()) {
                poiView.setClosed();
            }
        }
    };

    const setAllowedInterestTitles = titles => {
        allowedTitles = new Set(
            Array.isArray(titles) ? titles.map(t => String(t)) : []
        );
        for (const v of poiViews) {
            if (!allowedTitles.has(v.title))
                v.setClosed();
        }
        updateScreenPosition();
    };

    app.on('update', updateScreenPosition);
    window.addEventListener('resize', updateScreenPosition);
    updateScreenPosition();

    return {
        setAllowedInterestTitles
    };
};
