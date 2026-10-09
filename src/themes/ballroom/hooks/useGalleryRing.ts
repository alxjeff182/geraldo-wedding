import { useEffect, useRef, useState, type RefObject } from "react";

type Options = {
  count: number;
  scrollRootRef?: RefObject<HTMLElement | null>;
  enabled?: boolean;
};

/**
 * Ports Geraldo-Wedding-5 gallery orbit ring (drag, snap, auto-spin, lightbox).
 * Mutates CSS vars on the ring / plane DOM nodes for 60fps transforms.
 */
export function useGalleryRing({ count, scrollRootRef, enabled = true }: Options) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightbox, setLightbox] = useState<{ src: string; alt: string; caption: string } | null>(
    null,
  );
  const apiRef = useRef<{
    stepBy: (dir: number) => void;
    snapTo: (index: number) => void;
    openActive: () => void;
  } | null>(null);

  useEffect(() => {
    if (!enabled || count < 1) return;
    const section = sectionRef.current;
    const stage = stageRef.current;
    const ring = ringRef.current;
    if (!section || !stage || !ring) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const planeEls = [...section.querySelectorAll<HTMLElement>("[data-plane]")];
    const n = planeEls.length;
    if (!n) return;

    const step = 360 / n;
    let angle = 0;
    let velocity = 0;
    let target: number | null = null;
    let tilt = -8;
    let targetTilt = -8;
    let active = 0;
    let raf = 0;
    let running = false;
    let dragging = false;
    let pointerId: number | null = null;
    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let lastT = 0;
    let moved = false;
    let visible = true;
    let idleTimer = 0;
    let autoSpin = false;
    let clickPlane: HTMLElement | null = null;

    const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
    const norm = (deg: number) => ((deg % 360) + 360) % 360;
    const shortest = (from: number, to: number) => {
      const d = ((to - from + 540) % 360) - 180;
      return from + d;
    };

    const layout = () => {
      if (reduceMotion) return;
      const planeW = planeEls[0].offsetWidth || stage.clientWidth * 0.62;
      const radius = planeW / (2 * Math.tan(Math.PI / n)) + planeW * 0.12;
      planeEls.forEach((el, i) => {
        el.style.setProperty("--slot", `${i * step}deg`);
        el.style.setProperty("--radius", `${radius.toFixed(1)}px`);
      });
    };

    const applyFocus = () => {
      const front = norm(-angle);
      let best = 0;
      let bestDist = Infinity;
      planeEls.forEach((el, i) => {
        const slot = i * step;
        let dist = Math.abs(norm(slot - front));
        if (dist > 180) dist = 360 - dist;
        el.classList.toggle("is-focus", dist < step * 0.45);
        el.classList.toggle("is-back", dist > 100);
        el.style.zIndex = String(Math.round(20 - dist / 10));
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });
      if (best !== active) {
        active = best;
        setActiveIndex(best);
      }
    };

    const render = () => {
      ring.style.setProperty("--angle", `${angle.toFixed(3)}deg`);
      ring.style.setProperty("--tilt", `${tilt.toFixed(3)}deg`);
      applyFocus();
    };

    const endDrag = () => {
      dragging = false;
      pointerId = null;
      stage.classList.remove("is-dragging");
    };

    const kick = () => {
      if (reduceMotion || running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };

    const resetIdle = () => {
      autoSpin = false;
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        if (!visible || dragging || lightboxOpen) return;
        autoSpin = true;
        target = null;
        velocity = 0;
        kick();
      }, 1500);
    };

    let lightboxOpen = false;

    const snapTo = (index: number, animate = true) => {
      const desired = -index * step;
      endDrag();
      autoSpin = false;
      if (animate && !reduceMotion) {
        target = shortest(angle, desired);
        velocity = 0;
        kick();
      } else {
        angle = desired;
        target = null;
        velocity = 0;
        render();
        setActiveIndex(index);
      }
      resetIdle();
    };

    const stepBy = (dir: number) => snapTo((active + dir + n) % n);

    const openLightboxFor = (index: number) => {
      const el = planeEls[index];
      if (!el) return;
      const img = el.querySelector("img");
      const title =
        el.querySelector(".gallery-plane__title")?.textContent?.trim() || "";
      const num =
        el.querySelector(".gallery-plane__num")?.textContent?.trim() ||
        String(index + 1).padStart(2, "0");
      if (!img) return;
      lightboxOpen = true;
      autoSpin = false;
      window.clearTimeout(idleTimer);
      setLightbox({
        src: img.currentSrc || img.src,
        alt: img.alt || title,
        caption: `${num} · ${title}`,
      });
    };

    const tick = () => {
      if (reduceMotion) {
        running = false;
        raf = 0;
        return;
      }
      if (dragging) {
        // angle updated in pointer move
      } else if (target !== null) {
        const diff = target - angle;
        if (Math.abs(diff) < 0.15) {
          angle = target;
          target = null;
          velocity = 0;
        } else {
          angle += diff * 0.14;
        }
      } else if (Math.abs(velocity) > 0.02) {
        angle += velocity;
        velocity *= 0.92;
        if (Math.abs(velocity) < 0.08) {
          velocity = 0;
          const nearest = ((Math.round(norm(-angle) / step) % n) + n) % n;
          target = shortest(angle, -nearest * step);
        }
      } else if (autoSpin && visible) {
        angle -= 0.08;
      }

      tilt += (targetTilt - tilt) * 0.12;
      render();

      const settled =
        !dragging &&
        target === null &&
        Math.abs(velocity) < 0.02 &&
        Math.abs(tilt - targetTilt) < 0.05 &&
        !autoSpin;

      if (settled) {
        running = false;
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    const finishGesture = () => {
      const planeEl = clickPlane;
      const wasMoved = moved;
      clickPlane = null;
      endDrag();
      targetTilt = -8;

      if (!wasMoved && planeEl) {
        const idx = Number(planeEl.dataset.index);
        if (Number.isFinite(idx)) {
          if (idx === active) openLightboxFor(idx);
          else snapTo(idx);
          resetIdle();
          kick();
          return;
        }
      }

      if (Math.abs(velocity) < 0.35) {
        const nearest = ((Math.round(norm(-angle) / step) % n) + n) % n;
        target = shortest(angle, -nearest * step);
        velocity = 0;
      }
      resetIdle();
      kick();
    };

    const onPointerDown = (e: PointerEvent) => {
      if (reduceMotion) return;
      if ((e.target as HTMLElement).closest?.(".gallery-canvas__nav")) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      dragging = true;
      moved = false;
      pointerId = e.pointerId;
      startX = lastX = e.clientX;
      startY = e.clientY;
      lastT = performance.now();
      velocity = 0;
      target = null;
      autoSpin = false;
      clickPlane =
        (e.target as HTMLElement).closest?.("[data-plane]") ||
        document.elementFromPoint(e.clientX, e.clientY)?.closest?.("[data-plane]") ||
        null;
      stage.classList.add("is-dragging");
      try {
        stage.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      kick();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragging || e.pointerId !== pointerId) return;
      const now = performance.now();
      const dx = e.clientX - lastX;
      const dt = Math.max(16, now - lastT);
      if (Math.abs(e.clientX - startX) > 6 || Math.abs(e.clientY - startY) > 6) {
        moved = true;
      }
      angle += dx * 0.35;
      velocity = dx * 0.35 * (16 / dt);
      targetTilt = clamp(-8 + (startY - e.clientY) * 0.04, -14, 2);
      lastX = e.clientX;
      lastT = now;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!dragging) return;
      if (pointerId !== null && e.pointerId !== pointerId) return;
      try {
        stage.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      finishGesture();
    };

    const onKey = (e: KeyboardEvent) => {
      if (!visible) return;
      if (lightboxOpen) {
        if (e.key === "Escape") {
          lightboxOpen = false;
          setLightbox(null);
          resetIdle();
        }
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        stepBy(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        stepBy(1);
      }
    };

    stage.addEventListener("pointerdown", onPointerDown);
    stage.addEventListener("pointermove", onPointerMove);
    stage.addEventListener("pointerup", onPointerUp);
    stage.addEventListener("pointercancel", onPointerUp);
    window.addEventListener("keydown", onKey);

    const onResize = () => {
      layout();
      render();
    };
    window.addEventListener("resize", onResize);

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) resetIdle();
        else {
          autoSpin = false;
          window.clearTimeout(idleTimer);
        }
      },
      { root: scrollRootRef?.current ?? null, threshold: 0.35 },
    );
    io.observe(section);

    apiRef.current = {
      stepBy,
      snapTo,
      openActive: () => openLightboxFor(active),
    };

    layout();
    render();
    setActiveIndex(0);
    if (!reduceMotion) resetIdle();

    return () => {
      window.clearTimeout(idleTimer);
      cancelAnimationFrame(raf);
      stage.removeEventListener("pointerdown", onPointerDown);
      stage.removeEventListener("pointermove", onPointerMove);
      stage.removeEventListener("pointerup", onPointerUp);
      stage.removeEventListener("pointercancel", onPointerUp);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      io.disconnect();
      apiRef.current = null;
    };
  }, [count, scrollRootRef, enabled]);

  const closeLightbox = () => setLightbox(null);

  return {
    sectionRef,
    stageRef,
    ringRef,
    activeIndex,
    lightbox,
    closeLightbox,
    stepBy: (dir: number) => apiRef.current?.stepBy(dir),
    snapTo: (index: number) => apiRef.current?.snapTo(index),
  };
}
