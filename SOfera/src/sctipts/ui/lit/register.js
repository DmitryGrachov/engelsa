const defined = new Set();

/**
 * Регистрирует web component один раз (безопасно при HMR и повторных импортах).
 * @param {string} tagName
 * @param {CustomElementConstructor} klass
 */
export function registerComponent(tagName, klass) {
    if (defined.has(tagName) || customElements.get(tagName))
        return;

    customElements.define(tagName, klass);
    defined.add(tagName);
}

/**
 * Монтирует Lit-компонент в контейнер `#ui` или переданный элемент.
 * @param {string} tagName — уже зарегистрированный custom element
 * @param {HTMLElement | string} [container='ui'] — id или элемент
 * @param {Record<string, unknown>} [props]
 * @returns {HTMLElement | null}
 */
export function mountComponent(tagName, container = 'ui', props = {}) {
    const root = typeof container === 'string'
        ? document.getElementById(container)
        : container;

    if (!root)
        return null;

    const el = document.createElement(tagName);

    for (const [key, value] of Object.entries(props)) {
        el[key] = value;
    }

    root.appendChild(el);

    return el;
}
