/**
 * Переключатель четвертного внутреннего разрешения canvas (initCanvas: s = 0.25 ↔ retina 1 / 0.5).
 * @param {HTMLButtonElement | null} buttonEl
 * @param {{ global?: { state: { lowResCanvasQuarter: boolean }; events: { on: Function } } }} viewer
 */
export const bindCanvasQuarterResButton = (buttonEl, viewer) => {
    if (!buttonEl || !viewer?.global)
        return;

    const { state, events } = viewer.global;

    const refreshUi = () => {
        const on = state.lowResCanvasQuarter;

        buttonEl.classList.toggle('active', on);
        buttonEl.setAttribute('aria-pressed', String(on));
        buttonEl.title = on
            ? 'Рендер ¼ включён. Нажмите — вернуть 1× или 0.5× (как «Высокая детализация»)'
            : 'Снизить разрешение рендера до ¼. Нажмите снова — обычное качество';
    };

    buttonEl.addEventListener('click', () => {
        state.lowResCanvasQuarter = !state.lowResCanvasQuarter;
    });

    events.on('lowResCanvasQuarter:changed', refreshUi);
    events.on('retinaDisplay:changed', refreshUi);

    refreshUi();
};
