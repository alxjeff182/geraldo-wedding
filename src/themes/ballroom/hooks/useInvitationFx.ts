import { useEffect, type RefObject } from "react";

/**
 * Ports Geraldo-Wedding-5 observeFades / bindEventPanels / bindParallax.
 * Runs once the invitation is revealed.
 */
export function useInvitationFx(
  inviteRef: RefObject<HTMLElement | null>,
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled) return;
    const invitation = inviteRef.current;
    if (!invitation) return;

    const cleanups: Array<() => void> = [];

    // observeFades (GW5 main.js 1197-1224)
    {
      // Include section.fade-up (Wishes/Story/Guide) — not only nested .fade-up.
      const els = invitation.querySelectorAll(
        ".fade-up, .section__head, .quote__card, .gift-hub",
      );
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target as HTMLElement;
            el.classList.add("is-in");
            el.style.opacity = "1";
            el.style.transform = "none";
            io.unobserve(el);
          });
        },
        { root: invitation, threshold: 0.12, rootMargin: "0px 0px -24px 0px" },
      );

      els.forEach((node) => {
        const el = node as HTMLElement;
        // Parent .fade-up already hides the whole section — don't double-hide heads inside it.
        if (
          !el.classList.contains("fade-up") &&
          el.closest(".fade-up") &&
          (el.classList.contains("section__head") || el.classList.contains("gift-hub"))
        ) {
          return;
        }
        if (!el.classList.contains("fade-up")) {
          el.style.opacity = "0";
          el.style.transform = "translateY(24px)";
          el.style.transition =
            "opacity 0.9s cubic-bezier(0.22,1,0.36,1), transform 0.9s cubic-bezier(0.22,1,0.36,1)";
        }
        io.observe(el);
      });
      cleanups.push(() => io.disconnect());
    }

    // bindEventPanels (GW5 main.js 577-605)
    {
      const panels = invitation.querySelectorAll("[data-event]");
      if (panels.length) {
        const io = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add("is-in");
                io.unobserve(entry.target);
              }
            });
          },
          { root: invitation, threshold: 0.2 },
        );

        panels.forEach((panel) => {
          const el = panel as HTMLElement;
          io.observe(el);
          const onDown = () => el.classList.add("is-pressed");
          const onUp = () => el.classList.remove("is-pressed");
          el.addEventListener("pointerdown", onDown);
          el.addEventListener("pointerup", onUp);
          el.addEventListener("pointerleave", onUp);
          cleanups.push(() => {
            el.removeEventListener("pointerdown", onDown);
            el.removeEventListener("pointerup", onUp);
            el.removeEventListener("pointerleave", onUp);
          });
        });
        cleanups.push(() => io.disconnect());
      }
    }

    // bindParallax (GW5 main.js 1226-1245)
    {
      const cards = invitation.querySelectorAll(".parallax-card");
      if (cards.length) {
        const onScroll = () => {
          requestAnimationFrame(() => {
            const viewH = invitation.clientHeight;
            const stageRect = invitation.getBoundingClientRect();
            cards.forEach((card) => {
              const el = card as HTMLElement;
              const rect = el.getBoundingClientRect();
              const mid =
                rect.top + rect.height / 2 - (stageRect.top + viewH / 2);
              const offset = mid * -0.04;
              el.style.transform = `translate3d(0, ${offset}px, 0)`;
            });
          });
        };
        invitation.addEventListener("scroll", onScroll, { passive: true });
        cleanups.push(() => invitation.removeEventListener("scroll", onScroll));
      }
    }

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, [inviteRef, enabled]);
}
