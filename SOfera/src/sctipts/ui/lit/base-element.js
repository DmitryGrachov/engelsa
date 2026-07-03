import { LitElement } from 'lit';

/**
 * Базовый класс для Lit-компонентов.
 *
 * Light DOM — стили из `src/styles/*.css` применяются как к обычной разметке.
 * Shadow DOM не используем, чтобы не дублировать CSS.
 *
 * @example
 * // ui/components/lit/<group>/my-widget.js
 * import { html, BaseElement, registerComponent } from '../../lit/index.js';
 *
 * class MyWidget extends BaseElement {
 *   static properties = { label: { type: String } };
 *
 *   constructor() {
 *     super();
 *     this.label = '';
 *   }
 *
 *   render() {
 *     return html`<button class="panelButton">${this.label}</button>`;
 *   }
 * }
 *
 * registerComponent('my-widget', MyWidget);
 */
export class BaseElement extends LitElement {
    createRenderRoot() {
        return this;
    }
}
