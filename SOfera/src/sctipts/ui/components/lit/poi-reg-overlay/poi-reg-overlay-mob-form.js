import {
    BaseElement,
    html,
    registerComponent
} from '../../../lit/index.js';
import { PoiRegOverlayFormMixin } from './poi-reg-overlay-form-base.js';

class PoiRegOverlayMobForm extends PoiRegOverlayFormMixin(BaseElement) {

    render() {
        return html`
            <div class="poiRegOverlayMobForm" part="form">
                <button
                    type="button"
                    class="poiRegOverlayMobFormClose"
                    aria-label="Закрыть"
                    @click=${this._onCloseClick}
                    @pointerdown=${this._stop}
                >
                    <span class="poiRegOverlayMobFormCloseIcon" aria-hidden="true">×</span>
                </button>

                <h2 class="poiRegOverlayMobFormTitle" id="poiRegOverlayMobTitle">Оставить заявку</h2>

                <form
                    class="poiRegOverlayMobFormBody"
                    @submit=${this._onSubmit}
                    @keydown=${this._onFormKeyDown}
                    @keyup=${this._onFormKeyUp}
                >
                    <label class="poiRegOverlayMobFormField">
                        <span class="poiRegOverlayMobFormLabel">Введите имя</span>
                        <input
                            class="poiRegOverlayMobFormInput"
                            type="text"
                            name="name"
                            placeholder="Имя"
                            autocomplete="name"
                            .value=${this.name}
                            @input=${this._onNameInput}
                        />
                    </label>

                    <label class="poiRegOverlayMobFormField">
                        <span class="poiRegOverlayMobFormLabel">Введите телефон</span>
                        <input
                            class="poiRegOverlayMobFormInput poiRegOverlayMobFormInput--phone${this.phoneError ? ' poiRegOverlayMobFormInput--invalid' : ''}"
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

                    <label class="poiRegOverlayMobFormField">
                        <span class="poiRegOverlayMobFormLabel">Комментарий</span>
                        <textarea
                            class="poiRegOverlayMobFormTextarea"
                            name="comment"
                            placeholder="Комментарий"
                            rows="4"
                            .value=${this.comment}
                            @input=${this._onCommentInput}
                        ></textarea>
                    </label>

                    <label class="poiRegOverlayMobFormConsent">
                        <input
                            class="poiRegOverlayMobFormCheckbox"
                            type="checkbox"
                            name="consent"
                            .checked=${this.consent}
                            @change=${this._onConsentChange}
                        />
                        <span class="poiRegOverlayMobFormConsentText">
                            Я принимаю условия
                            <a class="poiRegOverlayMobFormLink" href="#" @click=${this._preventLink}>Политики конфиденциальности</a>,
                            даю
                            <a class="poiRegOverlayMobFormLink" href="#" @click=${this._preventLink}>Согласие на обработку персональных данных</a>
                            и
                            <a class="poiRegOverlayMobFormLink" href="#" @click=${this._preventLink}>получение информационных и рекламных рассылок</a>
                        </span>
                    </label>

                    <button
                        type="submit"
                        class="poiRegOverlayMobFormSubmit"
                        ?disabled=${!this.consent}
                    >
                        Отправить
                    </button>
                </form>
            </div>
        `;
    }
}

registerComponent('poi-reg-overlay-mob-form', PoiRegOverlayMobForm);

export { PoiRegOverlayMobForm };
