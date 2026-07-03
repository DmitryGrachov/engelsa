/**
 * Шаблон для новых Lit-компонентов. Скопировать в lit/<group>/ и подключить в app-shell или index.js.
 * В прод-сборку не попадает, пока файл нигде не импортирован.
 */
import {
    BaseElement,
    html,
    registerComponent
} from '../../../lit/index.js';

class ExampleWidget extends BaseElement {
    static properties = {
        label: { type: String }
    };

    constructor() {
        super();
        this.label = '';
    }

    render() {
        return html`
            <div class="exampleWidget" part="root">
                <span>${this.label}</span>
            </div>
        `;
    }
}

registerComponent('example-widget', ExampleWidget);

export { ExampleWidget };
