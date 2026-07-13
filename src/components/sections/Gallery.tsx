import { useCallback, useEffect, useRef, useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { useWeddingContent } from "../../context/WeddingContentContext";

const CAROUSEL_COUNT = 5;
const AUTOPLAY_MS = 5000;

export function Gallery() {
  const { content } = useWeddingContent();
  const images = content.gallery.images;
  const carouselImages = images.slice(0, CAROUSEL_COUNT);
  const gridImages = images.slice(CAROUSEL_COUNT);

  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const pausedRef = useRef(false);

  const slides = images.map((img) => ({ src: img.src, alt: img.alt }));
  const bgImage = carouselImages[0]?.src ?? images[0]?.src;

  const openLightbox = useCallback((index: number) => setLightboxIndex(index), []);

  useEffect(() => {
    if (carouselImages.length <= 1) return;

    const id = window.setInterval(() => {
      if (pausedRef.current) return;
      setActiveIndex((prev) => (prev + 1) % carouselImages.length);
    }, AUTOPLAY_MS);

    return () => window.clearInterval(id);
  }, [carouselImages.length]);

  return (
    <section
      className="section-gallery-wrap"
      style={bgImage ? { backgroundImage: `url("${bgImage}")` } : undefined}
      aria-labelledby="gallery-heading"
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
    >
      <div className="section-gallery-inner">
        <h2 id="gallery-heading" className="gallery-title">
          {content.gallery.title}
        </h2>
        <p className="gallery-subtitle whitespace-pre-line">{content.gallery.subtitle}</p>

        {carouselImages.length > 0 && (
          <div className="gallery-slideshow">
            <button
              type="button"
              className="gallery-main focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              onClick={() => openLightbox(activeIndex)}
              aria-label={`Buka foto: ${carouselImages[activeIndex]?.alt ?? "Galeri"}`}
            >
              <img
                key={carouselImages[activeIndex]?.src}
                src={carouselImages[activeIndex]?.src}
                alt={carouselImages[activeIndex]?.alt ?? ""}
                loading={activeIndex === 0 ? "eager" : "lazy"}
                fetchPriority={activeIndex === 0 ? "high" : "auto"}
                width={720}
                height={1080}
              />
            </button>

            <div className="gallery-thumbs" role="tablist" aria-label="Pilih foto galeri">
              {carouselImages.map((img, i) => (
                <button
                  key={`${img.src}-${i}`}
                  type="button"
                  role="tab"
                  aria-selected={i === activeIndex}
                  className={`gallery-thumbs__item${i === activeIndex ? " gallery-thumbs__item--active" : ""}`}
                  onClick={() => setActiveIndex(i)}
                  aria-label={`Tampilkan foto: ${img.alt}`}
                >
                  <img src={img.src} alt="" loading="lazy" width={120} height={90} />
                </button>
              ))}
            </div>
          </div>
        )}

        {gridImages.length > 0 && (
          <div className="gallery-grid">
            {gridImages.map((img, i) => {
              const lightboxIdx = CAROUSEL_COUNT + i;
              return (
                <button
                  key={`${img.src}-${lightboxIdx}`}
                  type="button"
                  className="gallery-grid__item focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                  onClick={() => openLightbox(lightboxIdx)}
                  aria-label={`Buka foto: ${img.alt}`}
                >
                  <img src={img.src} alt={img.alt} loading="lazy" width={720} height={1080} />
                </button>
              );
            })}
          </div>
        )}
      </div>

      <Lightbox
        open={lightboxIndex >= 0}
        close={() => setLightboxIndex(-1)}
        index={lightboxIndex}
        slides={slides}
      />
    </section>
  );
}
