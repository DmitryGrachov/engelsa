import { assetUrl } from '../utils/asset-url.js';
import { isPoiNarrowViewport } from '../poi/poi-viewport.js';

/** Ключ localStorage: при наличии — стартовая модалка с инструкцией не показывается. */
export const INSTRUCTION_APPROVE_STORAGE_KEY = 'approve_inctruction';

/**
 * Полноэкранная модалка с `assets/frame/instruction.svg` до первого закрытия (запись в localStorage).
 * Только узкая вьюпорт (< 820px). Вызывать при входе в режим «Поиск» панели — не при старте приложения.
 */
export function mountInstructionGateIfNeeded() {
    if (typeof window === 'undefined' || typeof document === 'undefined')
        return;

    if (!isPoiNarrowViewport())
        return;

    if (document.getElementById('instructionGate'))
        return;

    try {
        if (window.localStorage.getItem(INSTRUCTION_APPROVE_STORAGE_KEY))
            return;
    } catch {
        return;
    }

    const root = document.createElement('div');

    root.id = 'instructionGate';
    root.className = 'instructionGate';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-labelledby', 'instructionGateTitle');

    const inner = document.createElement('div');

    inner.className = 'instructionGateInner';

    const figure = document.createElement('div');

    figure.className = 'instructionGateFigure';

    const title = document.createElement('span');

    title.id = 'instructionGateTitle';
    title.className = 'instructionGateSrOnly';
    title.textContent = 'Инструкция';

    const img = document.createElement('img');

    img.className = 'instructionGateImg';
    img.src = assetUrl('./assets/frame/instruction.svg');
    img.alt = '';
    img.decoding = 'async';

    const closeBtn = document.createElement('button');

    closeBtn.type = 'button';
    closeBtn.className = 'instructionGateClose';
    closeBtn.setAttribute('aria-label', 'Закрыть');
    closeBtn.innerHTML = '<span class="instructionGateCloseIcon" aria-hidden="true">×</span>';

    const dismiss = () => {
        try {
            window.localStorage.setItem(INSTRUCTION_APPROVE_STORAGE_KEY, '1');
        } catch {
            /* private mode */
        }
        root.remove();
    };

    figure.append(title, img, closeBtn);
    inner.appendChild(figure);
    root.appendChild(inner);
    document.body.appendChild(root);

    const padX = 24;
    const padY = 56;

    const applyInstructionGateLayout = () => {
        const w = Math.min(window.innerWidth * 0.98, window.innerWidth - padX);
        const h = Math.min(window.innerHeight * 0.9, window.innerHeight - padY);

        inner.style.flex = '0 0 auto';
        inner.style.width = `${w}px`;
        inner.style.maxWidth = '100%';
        figure.style.flexShrink = '0';
        figure.style.width = `${w}px`;
        figure.style.height = `${h}px`;
        figure.style.display = 'flex';
        figure.style.alignItems = 'center';
        figure.style.justifyContent = 'center';
        figure.style.boxSizing = 'border-box';
        img.style.display = 'block';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'contain';
        img.style.objectPosition = 'center';
        img.style.boxSizing = 'border-box';
    };

    const dismissWithCleanup = () => {
        window.removeEventListener('resize', applyInstructionGateLayout);
        dismiss();
    };

    applyInstructionGateLayout();
    window.addEventListener('resize', applyInstructionGateLayout);

    closeBtn.addEventListener('click', dismissWithCleanup);
}
