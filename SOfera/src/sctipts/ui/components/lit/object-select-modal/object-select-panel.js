import {
    BaseElement,
    html,
    registerComponent
} from '../../../lit/index.js';

const PRIM_SOFERA_URL = 'http://5.129.249.206:5570/';

const OBJECT_OPTIONS = Object.freeze([
    {
        id: 'prim-sofera',
        label: 'Прайм Сойфера',
        redirectUrl: PRIM_SOFERA_URL
    },
    {
        id: 'prim-engelsa',
        label: 'Прайм Энгельса'
    }
]);

class ObjectSelectPanel extends BaseElement {
    _onSoferaClick() {
        window.location.href = PRIM_SOFERA_URL;
    }

    render() {
        const [sofera, engelsa] = OBJECT_OPTIONS;

        return html`
            <div class="objectSelectPanel" part="panel">
                <div class="objectSelectPanelHead">
                    <p class="objectSelectPanelTitle">Выбор объекта</p>
                    <p class="objectSelectPanelBrand">ОСТ</p>
                </div>

                <div class="objectSelectPanelOptions" role="listbox" aria-label="Выбор объекта">
                    <button
                        type="button"
                        class="objectSelectPanelOption objectSelectPanelOption--active"
                        role="option"
                        aria-selected="false"
                        @click=${this._onSoferaClick}
                    >
                        ${sofera.label}
                    </button>

                    <div
                        class="objectSelectPanelOption"
                        role="option"
                        aria-selected="true"
                        aria-current="true"
                    >
                        ${engelsa.label}
                    </div>
                </div>
            </div>
        `;
    }
}

registerComponent('object-select-panel', ObjectSelectPanel);

export { ObjectSelectPanel, OBJECT_OPTIONS, PRIM_SOFERA_URL };
