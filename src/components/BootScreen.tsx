import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

type Props = {
  logoSrc?: string;
  label?: string;
  children?: ReactNode;
};

const DEFAULT_LOGO = "/assets/ballroom/logo.webp";

export function BootScreen({
  logoSrc = DEFAULT_LOGO,
  label = "Memuat undangan…",
  children,
}: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const targetRef = useRef({ x: 0, y: 0 });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [burstKey, setBurstKey] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;

    const tick = () => {
      setTilt((prev) => {
        const nx = prev.x + (targetRef.current.x - prev.x) * 0.12;
        const ny = prev.y + (targetRef.current.y - prev.y) * 0.12;
        if (Math.abs(nx - prev.x) < 0.001 && Math.abs(ny - prev.y) < 0.001) {
          return prev;
        }
        return { x: nx, y: ny };
      });
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [reduceMotion]);

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (reduceMotion) return;
      const el = stageRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      targetRef.current = {
        x: ((e.clientX - r.left) / r.width - 0.5) * 2,
        y: ((e.clientY - r.top) / r.height - 0.5) * 2,
      };
    },
    [reduceMotion],
  );

  const onPointerLeave = useCallback(() => {
    targetRef.current = { x: 0, y: 0 };
  }, []);

  const onLogoActivate = useCallback(() => {
    if (reduceMotion) return;
    setBurstKey((n) => n + 1);
  }, [reduceMotion]);

  const logoTransform = reduceMotion
    ? undefined
    : `rotateY(${tilt.x * 10}deg) rotateX(${-tilt.y * 10}deg) translate3d(${tilt.x * 8}px, ${tilt.y * 8}px, 0)`;

  return (
    <div className="boot-screen" role="status" aria-live="polite" aria-busy="true">
      <div
        ref={stageRef}
        className="boot-screen__stage"
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
      >
        <div className="boot-screen__atmosphere" aria-hidden="true" />
        <div className="boot-screen__vignette" aria-hidden="true" />

        <button
          type="button"
          className={`boot-screen__mark${burstKey ? " is-burst" : ""}`}
          onClick={onLogoActivate}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onLogoActivate();
            }
          }}
          aria-label={label}
        >
          <span className="boot-screen__orbit" aria-hidden="true" />
          <span className="boot-screen__orbit boot-screen__orbit--soft" aria-hidden="true" />
          <span className="boot-screen__pulse" aria-hidden="true" />
          {burstKey > 0 ? (
            <span key={burstKey} className="boot-screen__spark" aria-hidden="true" />
          ) : null}
          <img
            className="boot-screen__logo"
            src={logoSrc}
            alt=""
            width={562}
            height={562}
            draggable={false}
            style={logoTransform ? { transform: logoTransform } : undefined}
          />
        </button>

        <p className="boot-screen__label">
          <span className="boot-screen__label-text">{label}</span>
          <span className="boot-screen__bar" aria-hidden="true">
            <span className="boot-screen__bar-fill" />
          </span>
        </p>
      </div>
      {children}
    </div>
  );
}
