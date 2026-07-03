import {
    BaseElement,
    html,
    registerComponent
} from '../../../lit/index.js';
import { PoiRegOverlayFormMixin } from './poi-reg-overlay-form-base.js';

class PoiRegOverlayDeskForm extends PoiRegOverlayFormMixin(BaseElement) {

    render() {
        return html`
            <div class="poiRegOverlayDeskForm" part="form">
                <button
                    type="button"
                    class="poiRegOverlayDeskFormClose"
                    aria-label="Закрыть"
                    @click=${this._onCloseClick}
                    @pointerdown=${this._stop}
                >
                    <span class="poiRegOverlayDeskFormCloseIcon" aria-hidden="true">×</span>
                </button>

                <h2 class="poiRegOverlayDeskFormTitle" id="poiRegOverlayDeskTitle">Оставить заявку</h2>

                <form
                    class="poiRegOverlayDeskFormBody"
                    @submit=${this._onSubmit}
                    @keydown=${this._onFormKeyDown}
                    @keyup=${this._onFormKeyUp}
                >
                    <div class="poiRegOverlayDeskFormRow">
                        <label class="poiRegOverlayDeskFormField">
                            <span class="poiRegOverlayDeskFormLabel">Введите имя</span>
                            <input
                                class="poiRegOverlayDeskFormInput"
                                type="text"
                                name="name"
                                placeholder="Имя"
                                autocomplete="name"
                                .value=${this.name}
                                @input=${this._onNameInput}
                            />
                        </label>
                        <label class="poiRegOverlayDeskFormField">
                            <span class="poiRegOverlayDeskFormLabel">Введите телефон</span>
                            <input
                                class="poiRegOverlayDeskFormInput poiRegOverlayDeskFormInput--phone${this.phoneError ? ' poiRegOverlayDeskFormInput--invalid' : ''}"
                                type="tel"
                                name="phone"
                                inputmode="numeric"
                                autocomplete="tel"
                                maxlength="18"
                                .value=${this.phone}
                                @focus=${this._onPhoneFocus}
                                @keydown=${this._onPhoneKeyDown}
                                @input=${this._onPhoneInput}
                                @paste=${this._onPhonePaste}
                            />
                        </label>
                    </div>

                    <label class="poiRegOverlayDeskFormField poiRegOverlayDeskFormField--full">
                        <span class="poiRegOverlayDeskFormLabel">Комментарий</span>
                        <textarea
                            class="poiRegOverlayDeskFormTextarea"
                            name="comment"
                            placeholder="Комментарий"
                            rows="4"
                            .value=${this.comment}
                            @input=${this._onCommentInput}
                        ></textarea>
                    </label>

                    <label class="poiRegOverlayDeskFormConsent">
                        <input
                            class="poiRegOverlayDeskFormCheckbox"
                            type="checkbox"
                            name="consent"
                            .checked=${this.consent}
                            @change=${this._onConsentChange}
                        />
                        <span class="poiRegOverlayDeskFormConsentText">
                            Я принимаю условия
                            <a class="poiRegOverlayDeskFormLink" href="#" @click=${this._preventLink}>Политики конфиденциальности</a>,
                            даю
                            <a class="poiRegOverlayDeskFormLink" href="#" @click=${this._preventLink}>Согласие на обработку персональных данных</a>
                            и
                            <a class="poiRegOverlayDeskFormLink" href="#" @click=${this._preventLink}>получение информационных и рекламных рассылок</a>
                        </span>
                    </label>

                    <button
                        type="submit"
                        class="poiRegOverlayDeskFormSubmit"
                        ?disabled=${!this.consent}
                    >
                        Отправить
                    </button>
                </form>
            </div>
        `;
    }
}

registerComponent('poi-reg-overlay-desk-form', PoiRegOverlayDeskForm);

export { PoiRegOverlayDeskForm };
