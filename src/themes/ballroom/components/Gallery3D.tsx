import { useEffect, useRef, type RefObject } from "react";
import { IconChevronLeft, IconChevronRight } from "../icons";
import { useGalleryRing } from "../hooks/useGalleryRing";

type Image = { src: string; alt: string };

type Props = {
  eyebrow: string;
  title: string;
  images: Image[];
  scrollRootRef?: RefObject<HTMLElement | null>;
  enabled?: boolean;
};

const SWIPE_CLOSE_PX = 88;

export function Gallery3D({
  eyebrow,
  title,
  images,
  scrollRootRef,
  enabled = true,
}: Props) {
  const n = images.length;
  const lightboxRef = useRef<HTMLDivElement | null>(null);
  const {
    sectionRef,
    stageRef,
    ringRef,
    activeIndex,
    lightbox,
    closeLightbox,
    stepBy,
    snapTo,
  } = useGalleryRing({
    count: n,
    scrollRootRef,
    enabled: enabled && n > 0,
  });

  const current = images[activeIndex] ?? images[0];

  useEffect(() => {
    if (!lightbox) return;
    const el = lightboxRef.current;
    if (!el) return;

    let startX = 0;
    let startY = 0;
    let tracking = false;
    let axis: "x" | "y" | null = null;
    let pointerId: number | null = null;

    const clearDrag = () => {
      el.classList.remove("is-dragging");
      el.style.transform = "";
      el.style.opacity = "";
      tracking = false;
      axis = null;
      pointerId = null;
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("button")) return;
      startX = e.clientX;
      startY = e.clientY;
      tracking = true;
      axis = null;
      pointerId = e.pointerId;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!tracking || pointerId !== e.pointerId) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (!axis) {
        if (Math.abs(dx) < 12 && Math.abs(dy) < 12) return;
        if (Math.abs(dx) > Math.abs(dy) && dx < 0) {
          axis = "x";
          el.classList.add("is-dragging");
          try {
            el.setPointerCapture(e.pointerId);
          } catch {
            /* ignore */
          }
        } else {
          tracking = false;
          return;
        }
      }
      if (axis !== "x") return;
      e.preventDefault();
      const tx = Math.min(0, dx);
      el.style.transform = `translate3d(${tx}px, 0, 0)`;
      el.style.opacity = String(Math.max(0.35, 1 + tx / 280));
    };

    const onPointerUp = (e: PointerEvent) => {
      if (pointerId !== e.pointerId) return;
      if (axis === "x" && e.clientX - startX <= -SWIPE_CLOSE_PX) {
        clearDrag();
        closeLightbox();
        return;
      }
      clearDrag();
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove, { passive: false });
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerUp);
    return () => {
      clearDrag();
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerUp);
    };
  }, [lightbox, closeLightbox]);

  if (!n) return null;

  return (
    <section
      ref={sectionRef}
      id="gallery"
      className="gallery-canvas"
      aria-label={title}
    >
      <div className="gallery-canvas__bg" aria-hidden="true">
        <span className="gallery-canvas__orb gallery-canvas__orb--a" />
        <span className="gallery-canvas__orb gallery-canvas__orb--b" />
        <span className="gallery-canvas__orb gallery-canvas__orb--c" />
      </div>
      <div className="gallery-canvas__veil" aria-hidden="true" />

      <header className="gallery-canvas__head">
        <p className="eyebrow">{eyebrow}</p>
        <h3>{title}</h3>
        <div className="ornament" aria-hidden="true" />
      </header>

      <div className="gallery-canvas__stage" ref={stageRef} id="galleryStage">
        <button
          type="button"
          className="gallery-canvas__nav gallery-canvas__nav--prev"
          aria-label="Sebelumnya"
          onClick={(e) => {
            e.stopPropagation();
            stepBy(-1);
          }}
        >
          <IconChevronLeft />
        </button>
        <button
          type="button"
          className="gallery-canvas__nav gallery-canvas__nav--next"
          aria-label="Berikutnya"
          onClick={(e) => {
            e.stopPropagation();
            stepBy(1);
          }}
        >
          <IconChevronRight />
        </button>

        <div className="gallery-ring" ref={ringRef} id="galleryRing">
          {images.map((img, i) => (
            <figure
              key={`${img.src}-${i}`}
              className="gallery-plane"
              data-plane
              data-index={i}
            >
              <div className="gallery-plane__frame">
                {img.src.includes("gallery-placeholder") ? (
                  <div
                    className={`gallery-plane__ph${
                      img.alt === "Selamanya" ? " gallery-plane__ph--b" : ""
                    }`}
                    role="img"
                    aria-label={img.alt}
                  >
                    <span>Foto</span>
                  </div>
                ) : (
                  <img
                    src={img.src}
                    alt={img.alt}
                    width={720}
                    height={960}
                    draggable={false}
                  />
                )}
                <figcaption>
                  <span className="gallery-plane__num">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="gallery-plane__title">{img.alt}</span>
                </figcaption>
              </div>
            </figure>
          ))}
        </div>
      </div>

      <footer className="gallery-canvas__ui">
        <p className="gallery-canvas__caption">
          <span className="gallery-canvas__count">
            {String(activeIndex + 1).padStart(2, "0")}
          </span>
          <span className="gallery-canvas__sep" aria-hidden="true">
            ·
          </span>
          <span>{current?.alt}</span>
        </p>
        <div className="gallery-canvas__dots" role="tablist" aria-label="Navigasi galeri">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`gallery-canvas__dot${i === activeIndex ? " is-active" : ""}`}
              aria-label={`Momen ${i + 1}`}
              onClick={() => snapTo(i)}
            />
          ))}
        </div>
        <p className="gallery-canvas__hint">
          Geser · ketuk samping untuk putar · ketuk depan untuk perbesar
        </p>
      </footer>

      <div
        ref={lightboxRef}
        className="gallery-lightbox"
        hidden={!lightbox}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeLightbox();
        }}
      >
        <button
          type="button"
          className="gallery-lightbox__close"
          aria-label="Tutup"
          onClick={closeLightbox}
        >
          ×
        </button>
        {lightbox ? (
          <figure className="gallery-lightbox__figure">
            <img src={lightbox.src} alt={lightbox.alt} />
            <figcaption>{lightbox.caption}</figcaption>
          </figure>
        ) : null}
      </div>
    </section>
  );
}
