/**
 * Двойной диапазон.
 * @returns {{ root: HTMLElement, update: () => void }}
 */
export function createDualRangeMount(
    state,
    fromKey,
    toKey,
    min,
    max,
    format,
    snap,
    keyDelta,
    notify
) {
    const areaWrap = document.createElement('div');
    areaWrap.className = 'filterModalArea';

    const areaLegend = document.createElement('div');
    areaLegend.className = 'filterModalAreaLegend';

    const areaFromLabel = document.createElement('span');
    areaFromLabel.className = 'filterModalAreaLegendFrom';
    const areaToLabel = document.createElement('span');
    areaToLabel.className = 'filterModalAreaLegendTo';

    const updateLegendText = () => {
        const lo = state[fromKey];
        const hi = state[toKey];

        areaFromLabel.innerHTML = `от <strong>${format(lo)}</strong>`;
        areaToLabel.innerHTML = `до <strong>${format(hi)}</strong>`;
    };

    areaLegend.append(areaFromLabel, areaToLabel);

    const rangeShell = document.createElement('div');
    rangeShell.className = 'filterRangeShell';

    const rangeTrack = document.createElement('div');
    rangeTrack.className = 'filterRangeTrack';

    const rangeRail = document.createElement('div');
    rangeRail.className = 'filterRangeRail';

    const rangeFill = document.createElement('div');
    rangeFill.className = 'filterRangeFill';

    const clampRaw = (v) => Math.min(max, Math.max(min, v));

    const valueFromTrackClientX = (clientX) => {
        const rect = rangeTrack.getBoundingClientRect();
        const w = rect.width;

        if (w <= 0) return state[fromKey];

        const t = Math.max(0, Math.min(1, (clientX - rect.left) / w));
        const raw = min + t * (max - min);

        return snap(clampRaw(raw));
    };

    const thumbMin = document.createElement('button');
    thumbMin.type = 'button';
    thumbMin.className = 'filterRangeThumb filterRangeThumbMin';
    thumbMin.tabIndex = 0;
    thumbMin.setAttribute('role', 'slider');
    thumbMin.setAttribute('aria-valuemin', String(min));
    thumbMin.setAttribute('aria-valuemax', String(max));

    const thumbMax = document.createElement('button');
    thumbMax.type = 'button';
    thumbMax.className = 'filterRangeThumb filterRangeThumbMax';
    thumbMax.tabIndex = 0;
    thumbMax.setAttribute('role', 'slider');
    thumbMax.setAttribute('aria-valuemin', String(min));
    thumbMax.setAttribute('aria-valuemax', String(max));

    let dragTarget = null;
    let activePointerId = null;

    /** @param {{ emit?: boolean }} [opts] */
    const updateRangeVisual = (opts = {}) => {
        const emit = opts.emit !== false;

        let lo = snap(clampRaw(state[fromKey]));
        let hi = snap(clampRaw(state[toKey]));

        if (lo > hi) {
            const s = lo;
            lo = hi;
            hi = s;
        }

        state[fromKey] = lo;
        state[toKey] = hi;

        const span = max - min || 1;
        const leftPct = ((lo - min) / span) * 100;
        const rightPct = ((hi - min) / span) * 100;

        rangeFill.style.left = `${leftPct}%`;
        rangeFill.style.width = `${Math.max(0, rightPct - leftPct)}%`;

        thumbMin.style.left = `${leftPct}%`;
        thumbMax.style.left = `${rightPct}%`;

        thumbMin.setAttribute('aria-valuenow', String(lo));
        thumbMax.setAttribute('aria-valuenow', String(hi));

        if (lo >= hi) {
            thumbMin.style.zIndex = '4';
            thumbMax.style.zIndex = '3';
        } else {
            thumbMin.style.zIndex = '3';
            thumbMax.style.zIndex = '4';
        }

        updateLegendText();

        if (emit)
            notify?.();
    };

    const applyDragClientX = (clientX) => {
        const v = valueFromTrackClientX(clientX);

        if (dragTarget === 'min') {
            state[fromKey] = snap(Math.min(v, state[toKey]));
        } else if (dragTarget === 'max') {
            state[toKey] = snap(Math.max(v, state[fromKey]));
        }

        updateRangeVisual();
    };

    const chooseThumbNear = (clientX) => {
        const rect = rangeTrack.getBoundingClientRect();

        const w = rect.width;
        const px = clientX - rect.left;
        const span = max - min || 1;
        const pxLo = ((state[fromKey] - min) / span) * w;
        const pxHi = ((state[toKey] - min) / span) * w;
        const dLo = Math.abs(px - pxLo);
        const dHi = Math.abs(px - pxHi);

        return dLo <= dHi ? 'min' : 'max';
    };

    const endDrag = (event) => {
        if (activePointerId === null || event.pointerId !== activePointerId)
            return;

        try {
            rangeTrack.releasePointerCapture(event.pointerId);
        } catch {
            //
        }

        activePointerId = null;
        dragTarget = null;
    };

    const startThumbDrag = (event, thumb) => {
        event.preventDefault();
        event.stopPropagation();
        dragTarget = thumb;

        activePointerId = event.pointerId;
        rangeTrack.setPointerCapture(event.pointerId);
        applyDragClientX(event.clientX);
    };

    thumbMin.addEventListener('pointerdown', (event) =>
        startThumbDrag(event, 'min')
    );

    thumbMax.addEventListener('pointerdown', (event) =>
        startThumbDrag(event, 'max')
    );

    rangeRail.addEventListener('pointerdown', (event) => {
        event.preventDefault();

        dragTarget = chooseThumbNear(event.clientX);
        activePointerId = event.pointerId;

        rangeTrack.setPointerCapture(event.pointerId);

        applyDragClientX(event.clientX);
    });

    rangeFill.addEventListener('pointerdown', (event) => {
        event.preventDefault();

        dragTarget = chooseThumbNear(event.clientX);
        activePointerId = event.pointerId;

        rangeTrack.setPointerCapture(event.pointerId);

        applyDragClientX(event.clientX);
    });

    rangeTrack.addEventListener('pointermove', (event) => {
        if (
            dragTarget &&
            activePointerId !== null &&

            event.pointerId === activePointerId
        )
            applyDragClientX(event.clientX);
    });

    rangeTrack.addEventListener('pointerup', endDrag);
    rangeTrack.addEventListener('pointercancel', endDrag);

    const keyStep = (event, thumb) => {
        if (
            event.key !== 'ArrowLeft' &&
            event.key !== 'ArrowRight' &&
            event.key !== 'ArrowDown' &&
            event.key !== 'ArrowUp'
        )
            return;

        event.preventDefault();
        const dir =
            event.key === 'ArrowLeft' || event.key === 'ArrowDown' ? -1 : 1;
        const delta = dir * keyDelta;

        if (thumb === 'min') {
            state[fromKey] = snap(clampRaw(state[fromKey] + delta));

            if (state[fromKey] > state[toKey])
                state[fromKey] = state[toKey];
        } else {
            state[toKey] = snap(clampRaw(state[toKey] + delta));
            
            if (state[toKey] < state[fromKey])
                state[toKey] = state[fromKey];
        }

        updateRangeVisual();
    };

    thumbMin.addEventListener('keydown', (e) => keyStep(e, 'min'));
    thumbMax.addEventListener('keydown', (e) => keyStep(e, 'max'));

    rangeTrack.append(rangeRail, rangeFill, thumbMin, thumbMax);
    rangeShell.append(rangeTrack);
    areaWrap.append(areaLegend, rangeShell);

    return { root: areaWrap, update: () => updateRangeVisual({ emit: false }) };
}
