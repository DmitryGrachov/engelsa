import { assetUrl } from '../../utils/asset-url.js';
import { getObjectSelectModal } from './lit/object-select-modal/index.js';

/**
 * Курс по `camera.forward` в плоскости XZ — как `vecToAngles` в lib (`atan2(-x,-z)`), без зеркала В/З.
 * `getLocalEulerAngles().y` на наклонённой орбите даёт gimbal: «залипание» на востоке/западе.
 * Накопление дельты между кадрами убирает скачок ±180° у `atan2` при проходе через юг.
 *
 * @param {{ global?: { app: { on: (ev: string, fn: () => void) => unknown }; camera: { forward: { x: number; y: number; z: number } } } }} [viewer]
 */
function bindCompassToCamera(viewer, compassRoseEl) {
    const app = viewer?.global?.app;
    const camera = viewer?.global?.camera;

    if (!app || !camera || !compassRoseEl)
        return;

    /** Накопленный азимут (град.), непрерывный при обходе через ±180 у atan2 */
    let displayHeading = 0;
    /** @type {number | null} */
    let lastRawHeading = null;

    const onUpdate = () => {
        const f = camera.forward;
        const fx = f.x;
        const fz = f.z;
        const hLenSq = fx * fx + fz * fz;

        if (hLenSq < 1e-12) {
            compassRoseEl.style.transform = `rotate(${displayHeading}deg)`;
            return;
        }

        const rawDeg = (Math.atan2(-fx, -fz) * 180) / Math.PI;

        if (lastRawHeading !== null) {
            let d = rawDeg - lastRawHeading;
            if (d > 180)
                d -= 360;
            if (d < -180)
                d += 360;
            displayHeading += d;
        } else {
            displayHeading = rawDeg;
        }
        lastRawHeading = rawDeg;
        /* Без минуса: иначе поворот камеры налево визуально уводил шкалу на восток. */
        compassRoseEl.style.transform = `rotate(${displayHeading}deg)`;
    };

    app.on('update', onUpdate);
}

// Создает хедер.
export const header = (viewer) => {
    const uiRoot = document.getElementById('ui');

    if (!uiRoot) return null;

    const header = document.createElement('div');
    header.id = 'header';

    const leftColumn = document.createElement('div');
    leftColumn.className = 'headerLeft';

    const leftLogo = document.createElement('img');

    leftLogo.src = assetUrl('./assets/main_logo.svg');
    leftLogo.className = 'headerLogo leftLogo';

    const compassWrap = document.createElement('div');
    compassWrap.className = 'headerCompassWrap';
    compassWrap.setAttribute('aria-hidden', 'true');
    compassWrap.title = 'Курс камеры';

    const compassNeedle = document.createElement('div');
    compassNeedle.className = 'headerCompassNeedle';

    const compassRose = document.createElement('div');
    compassRose.className = 'headerCompassRose';
    compassRose.innerHTML = `
        <svg class="headerCompassSvg" viewBox="-32 -32 64 64" width="51" height="51">
            <circle r="30" cx="0" cy="0" fill="rgba(0,0,0,0.28)" stroke="rgba(255,255,255,0.45)" stroke-width="1.25"/>
            <text x="0" y="-19" text-anchor="middle" fill="#ffffff" font-size="13" font-weight="700" font-family="Onest, system-ui, sans-serif">С</text>
            <text x="20" y="5" text-anchor="middle" fill="rgba(255,255,255,0.88)" font-size="11" font-family="Onest, system-ui, sans-serif">В</text>
            <text x="0" y="26" text-anchor="middle" fill="rgba(255,255,255,0.75)" font-size="10" font-family="Onest, system-ui, sans-serif">Ю</text>
            <text x="-20" y="5" text-anchor="middle" fill="rgba(255,255,255,0.88)" font-size="11" font-family="Onest, system-ui, sans-serif">З</text>
        </svg>`;

    compassWrap.appendChild(compassRose);
    compassWrap.appendChild(compassNeedle);

    const compassRow = document.createElement('div');
    compassRow.className = 'headerCompassRow';

    const sliceYQuick = document.createElement('div');
    sliceYQuick.className = 'headerSliceYQuick';
    sliceYQuick.setAttribute('aria-label', 'Верх коробки среза по локальному Y (max Y)');

    const btnSliceYUp = document.createElement('button');
    btnSliceYUp.type = 'button';
    btnSliceYUp.className = 'headerSliceYQuickBtn';
    btnSliceYUp.textContent = '▲';
    btnSliceYUp.title = 'Уменьшить max Y (на 4 пункта)';

    const btnSliceYDown = document.createElement('button');
    btnSliceYDown.type = 'button';
    btnSliceYDown.className = 'headerSliceYQuickBtn';
    btnSliceYDown.textContent = '▼';
    btnSliceYDown.title = 'Увеличить max Y (на 4 пункта)';

    sliceYQuick.appendChild(btnSliceYUp);
    sliceYQuick.appendChild(btnSliceYDown);

    compassRow.appendChild(compassWrap);
    compassRow.appendChild(sliceYQuick);

    const stepSliceY = () => (viewer?.getFloorSliceRegionQuickStep?.() ?? 0.04);

    btnSliceYUp.addEventListener('click', () => {
        viewer?.shiftFloorSliceRegionMaxLocalY?.(-stepSliceY());
    });
    btnSliceYDown.addEventListener('click', () => {
        viewer?.shiftFloorSliceRegionMaxLocalY?.(stepSliceY());
    });

    leftColumn.appendChild(leftLogo);
    leftColumn.appendChild(compassRow);

    const rightLogo = document.createElement('img');

    rightLogo.src = assetUrl('./assets/second_logo.svg');
    rightLogo.className = 'headerLogo rightLogo';
    rightLogo.alt = '';
    rightLogo.draggable = false;

    const rightLogoBtn = document.createElement('button');
    rightLogoBtn.type = 'button';
    rightLogoBtn.className = 'headerRightLogoBtn';
    rightLogoBtn.setAttribute('aria-label', 'Выбор объекта');
    rightLogoBtn.appendChild(rightLogo);
    rightLogoBtn.addEventListener('click', () => {
        getObjectSelectModal()?.open?.();
    });

    header.appendChild(leftColumn);
    header.appendChild(rightLogoBtn);

    uiRoot.appendChild(header);

    bindCompassToCamera(viewer, compassRose);

    return {
        root: header,
        leftColumn,
        leftLogo,
        compassRow,
        compassWrap,
        compassRose,
        sliceYQuick,
        btnSliceYUp,
        btnSliceYDown
    };
};
