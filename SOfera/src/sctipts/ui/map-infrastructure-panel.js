/** Макс. шаг слайдера: N минут / N×50 метров (кольцо на сцене — полный радиус на шаге 20). */
export const MAP_WALK_RADIUS_MAX_STEP = 20;
/** Начальное значение слайдера / круга при каждом входе в «Карту». */
export const MAP_WALK_RADIUS_INITIAL_STEP = 1;

const METERS_PER_MINUTE = 50;

/**
 * Панель слайдера «Инфраструктура» (режим «Карта», #mapTopViewDock).
 * @param {{
 *   onStepChange?: (step: number, minutes: number, meters: number) => void;
 *   onClose?: () => void;
 * }} [opts]
 */
export function createMapInfrastructurePanel(opts = {}) {
    const panel = document.createElement('div');

    panel.id = 'mapInfraPanel';
    panel.className = 'mapInfraPanel';
    panel.setAttribute('aria-hidden', 'true');

    const closeBtn = document.createElement('button');

    closeBtn.type = 'button';
    closeBtn.className = 'mapInfraPanelClose';
    closeBtn.setAttribute('aria-label', 'Закрыть');
    closeBtn.innerHTML = '<span class="mapInfraPanelCloseIcon" aria-hidden="true">×</span>';

    const title = document.createElement('div');

    title.className = 'mapInfraPanelTitle';
    title.textContent = 'Инфраструктура';

    const walkLabel = document.createElement('div');

    walkLabel.className = 'mapInfraPanelWalkLabel';
    walkLabel.textContent = 'Дистанция ходьбы';

    const unitLabel = document.createElement('div');

    unitLabel.className = 'mapInfraPanelUnit';
    unitLabel.textContent = 'мин/метров';

    const sliderWrap = document.createElement('div');

    sliderWrap.className = 'mapInfraSlider';

    const sliderTrack = document.createElement('div');

    sliderTrack.className = 'mapInfraSliderTrack';
    sliderTrack.setAttribute('aria-hidden', 'true');

    const sliderThumb = document.createElement('button');

    sliderThumb.type = 'button';
    sliderThumb.className = 'mapInfraSliderThumb';
    sliderThumb.setAttribute('aria-label', 'Дистанция ходьбы');

    const sliderThumbLabel = document.createElement('span');

    sliderThumbLabel.className = 'mapInfraSliderThumbLabel';
    sliderThumbLabel.textContent = '1/50';

    sliderThumb.appendChild(sliderThumbLabel);
    sliderWrap.append(sliderTrack, sliderThumb);

    panel.append(closeBtn, title, walkLabel, unitLabel, sliderWrap);

    let step = MAP_WALK_RADIUS_INITIAL_STEP;
    let open = false;

    const emitStep = () => {
        const minutes = step;
        const meters = step * METERS_PER_MINUTE;

        sliderThumbLabel.textContent = `${minutes}/${meters}`;
        opts.onStepChange?.(step, minutes, meters);
    };

    const layoutThumb = () => {
        const trackW = sliderWrap.clientWidth;
        const thumbW = sliderThumb.offsetWidth || 62;

        if (trackW <= thumbW) {
            sliderThumb.style.left = '0px';

            return;
        }

        const t = (step - 1) / (MAP_WALK_RADIUS_MAX_STEP - 1);
        const left = t * (trackW - thumbW);

        sliderThumb.style.left = `${left}px`;
    };

    const setStep = (/** @type {number} */ v) => {
        step = Math.max(1, Math.min(MAP_WALK_RADIUS_MAX_STEP, Math.round(v)));
        emitStep();
        layoutThumb();
    };

    const stepFromClientX = (/** @type {number} */ clientX) => {
        const rect = sliderWrap.getBoundingClientRect();
        const thumbW = sliderThumb.offsetWidth || 62;
        const usable = Math.max(1, rect.width - thumbW);
        const x = Math.max(0, Math.min(usable, clientX - rect.left - thumbW * 0.5));
        const t = x / usable;
        const next = 1 + Math.round(t * (MAP_WALK_RADIUS_MAX_STEP - 1));

        setStep(next);
    };

    let dragging = false;

    const onPointerDown = (/** @type {PointerEvent} */ e) => {
        e.preventDefault();
        e.stopPropagation();
        dragging = true;
        sliderThumb.setPointerCapture(e.pointerId);
        stepFromClientX(e.clientX);
    };

    const onPointerMove = (/** @type {PointerEvent} */ e) => {
        if (!dragging)
            return;
        e.stopPropagation();
        stepFromClientX(e.clientX);
    };

    const endDrag = (/** @type {PointerEvent} */ e) => {
        if (!dragging)
            return;
        dragging = false;
        try {
            sliderThumb.releasePointerCapture(e.pointerId);
        } catch {
            /* */
        }
    };

    sliderThumb.addEventListener('pointerdown', onPointerDown);
    sliderThumb.addEventListener('pointermove', onPointerMove);
    sliderThumb.addEventListener('pointerup', endDrag);
    sliderThumb.addEventListener('pointercancel', endDrag);

    sliderWrap.addEventListener('pointerdown', e => {
        if (e.target === sliderThumb)
            return;
        e.stopPropagation();
        stepFromClientX(e.clientX);
    });

    const closePanel = (/** @type {{ silent?: boolean }} */ closeOpts = {}) => {
        if (!open)
            return;

        open = false;
        panel.classList.remove('mapInfraPanel--open');
        panel.setAttribute('aria-hidden', 'true');
        if (!closeOpts.silent)
            opts.onClose?.();
    };

    closeBtn.addEventListener('click', e => {
        e.stopPropagation();
        closePanel();
    });

    panel.addEventListener('pointerdown', e => e.stopPropagation());

    const openPanel = () => {
        if (open)
            return;

        open = true;
        panel.classList.add('mapInfraPanel--open');
        panel.setAttribute('aria-hidden', 'false');
        requestAnimationFrame(() => layoutThumb());
    };

    const applyInitialStep = (/** @type {{ notify?: boolean }} */ stepOpts = {}) => {
        step = MAP_WALK_RADIUS_INITIAL_STEP;
        const minutes = step;
        const meters = step * METERS_PER_MINUTE;

        sliderThumbLabel.textContent = `${minutes}/${meters}`;
        layoutThumb();
        if (stepOpts.notify !== false)
            opts.onStepChange?.(step, minutes, meters);
    };

    /** Сброс слайдера (без закрытия панели). */
    const resetSliderToInitial = (/** @type {{ notify?: boolean }} */ stepOpts = {}) => {
        applyInitialStep(stepOpts);
    };

    const resetForMapEnter = () => {
        applyInitialStep({ notify: false });
        closePanel({ silent: true });
    };

    window.addEventListener('resize', () => {
        if (open)
            layoutThumb();
    });

    applyInitialStep({ notify: false });

    return {
        root: panel,
        open: openPanel,
        close: closePanel,
        isOpen: () => open,
        resetForMapEnter,
        resetSliderToInitial,
        getStep: () => step,
        setStep
    };
}
