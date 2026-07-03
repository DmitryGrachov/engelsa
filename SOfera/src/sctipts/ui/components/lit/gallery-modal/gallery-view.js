import {
    BaseElement,
    html,
    registerComponent
} from '../../../lit/index.js';
import './gallery-carousel.js';
import { getDefaultGalleryImages, DEFAULT_GALLERY_CONTENT } from './gallery-data.js';

class GalleryView extends BaseElement {
    static properties = {
        sectionLabel: { type: String, attribute: 'section-label' },
        title: { type: String },
        projectTitle: { type: String, attribute: 'project-title' },
        description: { type: String },
        images: { type: Array },
        initialIndex: { type: Number, attribute: 'initial-index' }
    };

    constructor() {
        super();
        this.sectionLabel = DEFAULT_GALLERY_CONTENT.sectionLabel;
        this.title = DEFAULT_GALLERY_CONTENT.title;
        this.projectTitle = DEFAULT_GALLERY_CONTENT.projectTitle;
        this.description = DEFAULT_GALLERY_CONTENT.description;
        this.images = getDefaultGalleryImages();
        this.initialIndex = 0;
    }

    render() {
        return html`
            <article class="galleryView" part="view">
                <p class="galleryViewSectionLabel">${this.sectionLabel}</p>
                <h2 class="galleryViewTitle">${this.title}</h2>

                <gallery-carousel
                    .images=${this.images}
                ></gallery-carousel>

                <h3 class="galleryViewProjectTitle">${this.projectTitle}</h3>
                <p class="galleryViewDescription">${this.description}</p>
            </article>
        `;
    }
}

registerComponent('gallery-view', GalleryView);

export { GalleryView };
