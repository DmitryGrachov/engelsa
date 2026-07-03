/**
 * Срез сплата по **локальной оси Y** центра сплата (координаты .sog / customAabb узла).
 *
 * Как подобрать границы:
 * - После загрузки полоса ставится по локальному AABB (~20% высоты по центру).
 * - «Выше / Ниже» сдвигают полосу по локальному Y на значение «Шаг».
 * - «Толщина» — высота полосы (yMax − yMin), центр полосы не меняется.
 * - «Включить срез» / «Показать всё» — включает/выключает отсечение.
 * - «Только в коробке» — полоса по Y только внутри коробки (OBB): центр и полуразмеры из min/max, поворот ° по осям как у узла в PlayCanvas.
 *   min/max после поворота — ось-выровненная оболочка (AABB) для подсказки. Редактирование min/max сбрасывает поворот в 0.
 *   «Коробка по центру» — коробка от центра customAabb с долей полуразмера, поворот 0.
 * - Если узел splat повёрнут в мире, локальный Y может не совпадать с «высотой здания» в мирe —
 *   подбирайте числа по сцене или через код.
 *
 * Из кода: viewer.setFloorSliceEnabled(true), viewer.shiftFloorSliceWorld(0.5),
 * viewer.setFloorSliceThickness(3), viewer.setFloorSliceStep(0.2),
 * viewer.setFloorSliceRegionOnly(true), viewer.resetFloorSliceRegionAroundCenter(0.22),
 * viewer.setFloorSliceRegionBounds(minX, minY, minZ, maxX, maxY, maxZ),
 * viewer.setFloorSliceRegionEuler(rx, ry, rz) — градусы,
 * viewer.setFloorSliceDebugWireVisible(false) — отладочная рамка коробки.
 * viewer.resetFloorSliceToInitial() — как после загрузки (полоса Y из AABB, дефолт региона).
 *
 * @param {Awaited<ReturnType<typeof import('../../lib/index.js').main>>} viewer
 */
export function bindFloorSliceUi(viewer) {
    const bar = document.getElementById('floorSliceBar');
    if (!bar || !viewer?.setFloorSliceEnabled)
        return;

    const btnUp = document.getElementById('floorSliceUp');
    const btnDown = document.getElementById('floorSliceDown');
    const btnToggle = document.getElementById('floorSliceToggle');
    const inputThickness = document.getElementById('floorSliceThickness');
    const inputStep = document.getElementById('floorSliceStep');
    const chkRegionOnly = document.getElementById('floorSliceRegionOnly');
    const btnRegionFit = document.getElementById('floorSliceRegionFit');
    const inputRegionFraction = document.getElementById('floorSliceRegionFraction');
    const regionBoundsEl = document.getElementById('floorSliceRegionBounds');
    const frMinX = document.getElementById('frMinX');
    const frMinY = document.getElementById('frMinY');
    const frMinZ = document.getElementById('frMinZ');
    const frMaxX = document.getElementById('frMaxX');
    const frMaxY = document.getElementById('frMaxY');
    const frMaxZ = document.getElementById('frMaxZ');
    const frRotX = document.getElementById('frRotX');
    const frRotY = document.getElementById('frRotY');
    const frRotZ = document.getElementById('frRotZ');
    const chkDebugWire = document.getElementById('floorSliceDebugWire');

    const syncInputs = () => {
        if (inputThickness)
            inputThickness.value = String(viewer.getFloorSliceThickness().toFixed(2));
        if (inputStep)
            inputStep.value = String(viewer.getFloorSliceStep());
    };

    const syncRegionCheckbox = () => {
        if (chkRegionOnly)
            chkRegionOnly.checked = viewer.isFloorSliceRegionOnly();
    };

    const syncRegionBoundsInputs = () => {
        if (!viewer.getFloorSliceRegionBounds)
            return;
        const b = viewer.getFloorSliceRegionBounds();
        const set = (el, v) => {
            if (el)
                el.value = String(Number(v).toFixed(2));
        };
        set(frMinX, b.minX);
        set(frMinY, b.minY);
        set(frMinZ, b.minZ);
        set(frMaxX, b.maxX);
        set(frMaxY, b.maxY);
        set(frMaxZ, b.maxZ);
    };

    const syncRotationInputs = () => {
        if (!viewer.getFloorSliceRegionEuler)
            return;
        const e = viewer.getFloorSliceRegionEuler();
        const set = (el, v) => {
            if (el)
                el.value = String(Number(v).toFixed(1));
        };
        set(frRotX, e.x);
        set(frRotY, e.y);
        set(frRotZ, e.z);
    };

    const syncRegionBoundsVisibility = () => {
        if (!regionBoundsEl)
            return;
        regionBoundsEl.classList.toggle('hidden', !viewer.isFloorSliceRegionOnly());
    };

    const syncDebugWireCheckbox = () => {
        if (chkDebugWire && viewer.isFloorSliceDebugWireVisible)
            chkDebugWire.checked = viewer.isFloorSliceDebugWireVisible();
    };

    const syncToggle = () => {
        if (!btnToggle)
            return;
        const on = viewer.isFloorSliceEnabled();
        btnToggle.textContent = on ? 'Показать всё' : 'Включить срез';
        btnToggle.setAttribute('aria-pressed', on ? 'true' : 'false');
    };

    const syncAllFromViewer = () => {
        syncInputs();
        syncToggle();
        syncRegionCheckbox();
        syncRegionBoundsInputs();
        syncRegionBoundsVisibility();
        syncRotationInputs();
        syncDebugWireCheckbox();
    };

    btnToggle?.addEventListener('click', () => {
        viewer.setFloorSliceEnabled(!viewer.isFloorSliceEnabled());
        syncToggle();
    });

    btnUp?.addEventListener('click', () => {
        viewer.shiftFloorSliceWorld(viewer.getFloorSliceStep());
    });

    btnDown?.addEventListener('click', () => {
        viewer.shiftFloorSliceWorld(-viewer.getFloorSliceStep());
    });

    inputThickness?.addEventListener('change', () => {
        const v = parseFloat(String(inputThickness.value).replace(',', '.'));
        if (Number.isFinite(v) && v > 0)
            viewer.setFloorSliceThickness(v);
        syncInputs();
    });

    inputStep?.addEventListener('change', () => {
        const v = parseFloat(String(inputStep.value).replace(',', '.'));
        if (Number.isFinite(v) && v > 0)
            viewer.setFloorSliceStep(v);
        syncInputs();
    });

    chkRegionOnly?.addEventListener('change', () => {
        viewer.setFloorSliceRegionOnly(!!chkRegionOnly.checked);
        syncRegionCheckbox();
        syncRegionBoundsVisibility();
        syncRegionBoundsInputs();
        syncRotationInputs();
    });

    btnRegionFit?.addEventListener('click', () => {
        let f = 0.22;
        if (inputRegionFraction) {
            const v = parseFloat(String(inputRegionFraction.value).replace(',', '.'));
            if (Number.isFinite(v))
                f = v;
        }
        viewer.resetFloorSliceRegionAroundCenter(f);
        syncRegionBoundsInputs();
        syncRotationInputs();
    });

    const applyBoundsFromInputs = () => {
        const parse = (el) => {
            if (!el)
                return NaN;
            return parseFloat(String(el.value).replace(',', '.'));
        };
        const minX = parse(frMinX);
        const minY = parse(frMinY);
        const minZ = parse(frMinZ);
        const maxX = parse(frMaxX);
        const maxY = parse(frMaxY);
        const maxZ = parse(frMaxZ);
        if ([minX, minY, minZ, maxX, maxY, maxZ].every((n) => Number.isFinite(n)))
            viewer.setFloorSliceRegionBounds(minX, minY, minZ, maxX, maxY, maxZ);
        syncRegionBoundsInputs();
        syncRotationInputs();
    };

    const applyRotFromInputs = () => {
        const parse = (el) => {
            if (!el)
                return NaN;
            return parseFloat(String(el.value).replace(',', '.'));
        };
        const rx = parse(frRotX);
        const ry = parse(frRotY);
        const rz = parse(frRotZ);
        if ([rx, ry, rz].every((n) => Number.isFinite(n)) && viewer.setFloorSliceRegionEuler)
            viewer.setFloorSliceRegionEuler(rx, ry, rz);
        syncRotationInputs();
        syncRegionBoundsInputs();
    };

    for (const el of [frMinX, frMinY, frMinZ, frMaxX, frMaxY, frMaxZ]) {
        el?.addEventListener('change', applyBoundsFromInputs);
    }

    for (const el of [frRotX, frRotY, frRotZ]) {
        el?.addEventListener('change', applyRotFromInputs);
    }

    chkDebugWire?.addEventListener('change', () => {
        if (viewer.setFloorSliceDebugWireVisible)
            viewer.setFloorSliceDebugWireVisible(!!chkDebugWire.checked);
        syncDebugWireCheckbox();
    });

    if (viewer.global?.events) {
        viewer.global.events.on('firstFrame', syncAllFromViewer);
        viewer.global.events.on('floorSlice:resetToInitial', syncAllFromViewer);
        viewer.global.events.on('floorSliceRegion:changed', () => {
            syncRegionBoundsInputs();
            syncRotationInputs();
        });
    }
}
