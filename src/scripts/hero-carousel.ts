import { selectSlides, swipeDirection } from '../lib/carousel';
interface Slide {
  src: string;
  srcset: string;
  alt: string;
}

class HeroCarousel extends HTMLElement {
  connectedCallback() {
    if (this.dataset.ready || !this.dataset.slides) return;
    const pool: Slide[] = JSON.parse(this.dataset.slides);
    const slides = selectSlides(pool[0], pool.slice(1));
    const image = this.querySelector('img');
    const slide = this.querySelector<HTMLElement>('[data-slide]');
    const controls = this.querySelector<HTMLElement>('[data-controls]');
    const counter = this.querySelector<HTMLElement>('[data-counter]');
    const announcement = this.querySelector<HTMLElement>('[data-announcement]');
    const previous = this.querySelector('[data-previous]');
    const nextButton = this.querySelector('[data-next]');
    if (
      !image ||
      !slide ||
      !controls ||
      !counter ||
      !announcement ||
      !previous ||
      !nextButton ||
      !pool.length
    )
      return;
    let index = 0;
    let request = 0;
    const updatePosition = () => {
      counter.textContent = `${index + 1} / ${slides.length}`;
      slide.setAttribute('aria-label', `${index + 1} of ${slides.length}`);
    };
    const navigate = async (direction: number) => {
      index = (index + direction + slides.length) % slides.length;
      const target = slides[index];
      const currentRequest = ++request;
      // Keep the current photo visible while the next responsive image downloads.
      const next = new Image();
      next.sizes = image.sizes;
      next.srcset = target.srcset;
      next.src = target.src;
      try {
        await next.decode();
      } catch {
        if (currentRequest === request) {
          index = slides.findIndex(
            (item) => item.src === image.getAttribute('src'),
          );
          announcement.textContent =
            'This photo could not load. Try another photo.';
        }
        return;
      }
      if (currentRequest !== request) return;
      image.alt = target.alt;
      image.srcset = target.srcset;
      image.src = target.src;
      updatePosition();
      announcement.textContent = `Photo ${index + 1} of ${slides.length}: ${target.alt}`;
    };
    previous.addEventListener('click', async () => {
      await navigate(-1);
    });
    nextButton.addEventListener('click', async () => {
      await navigate(1);
    });
    controls.addEventListener('keydown', async (event) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        await navigate(event.key === 'ArrowLeft' ? -1 : 1);
      }
    });
    let start: { x: number; y: number; id: number } | undefined;
    slide.addEventListener('pointerdown', (event) => {
      if (!event.isPrimary || event.button !== 0) return;
      start = { x: event.clientX, y: event.clientY, id: event.pointerId };
      slide.setPointerCapture(event.pointerId);
    });
    slide.addEventListener('pointerup', async (event) => {
      if (start?.id !== event.pointerId) return;
      const direction = swipeDirection(
        event.clientX - start.x,
        event.clientY - start.y,
      );
      start = undefined;
      if (direction) await navigate(direction);
    });
    slide.addEventListener('pointercancel', () => {
      start = undefined;
    });
    updatePosition();
    controls.hidden = slides.length < 2;
    this.dataset.ready = 'true';
  }
}
customElements.define('hero-carousel', HeroCarousel);
