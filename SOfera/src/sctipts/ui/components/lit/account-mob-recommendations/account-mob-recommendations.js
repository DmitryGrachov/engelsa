import {
    BaseElement,
    html,
    registerComponent,
    repeat
} from '../../../lit/index.js';
import './account-mob-recommendation-card.js';

class AccountMobRecommendations extends BaseElement {
    static properties = {
        groups: { type: Array }
    };

    constructor() {
        super();
        this.groups = [];
    }

    render() {
        const groups = Array.isArray(this.groups) ? this.groups : [];

        if (groups.length === 0)
            return null;

        return html`
            <section class="accountMobRecommendations" part="section">
                <div class="accountMobSectionHead accountMobRecommendationsHead">
                    <h2 class="accountMobSectionTitle">Ваши рекомендации</h2>
                </div>

                <div class="accountMobRecommendationsList" role="list">
                    ${repeat(
                        groups,
                        (group) => group.id,
                        (group) => html`
                            <account-mob-recommendation-card
                                group-id=${group.id}
                                title=${group.title}
                                plan-src=${group.planSrc}
                                floor-plan-src=${group.floorPlanSrc}
                                .tags=${group.tags}
                                price-from=${group.priceFrom}
                                variant-count=${group.variantCount}
                            ></account-mob-recommendation-card>
                        `
                    )}
                </div>
            </section>
        `;
    }
}

registerComponent('account-mob-recommendations', AccountMobRecommendations);

export { AccountMobRecommendations };
