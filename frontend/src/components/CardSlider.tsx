"use client";

import { Children, useEffect, useRef, useState, type ReactNode } from "react";
import { useTouchLayout } from "@/lib/useTouchLayout";

/**
 * Mobiel/tablet: horizontale scroll-snap slider die tot de schermrand doorloopt en
 * een stuk van de volgende kaart laat zien (peek), zodat swipen vanzelf voelt. Onder
 * de slider staan puntjes: ze tonen de actieve kaart en snappen er direct naartoe
 * bij een tik. Vanaf `xl` (gedeelde tablet-drempel, zie CLAUDE.md) wordt het een
 * 3-koloms grid en verdwijnen de puntjes — pas daar is er weer betrouwbare hover.
 *
 * De track cancelt de Container-gutter met een negatieve marge en zet 'm als eigen
 * padding terug: de eerste kaart lijnt zo uit op de gutter en rechts blijft ruimte
 * over. De puntjes staan buiten die negatieve marge en blijven dus gecentreerd.
 * Ze zijn navy (`bg-heading`): in beide toepassingen vallen ze door de overhang op
 * een lichte achtergrond (cream / page-grijs).
 */
export default function CardSlider({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const items = Children.toArray(children);
  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);
  // Alleen onder xl is de track de horizontaal scrollbare slider — daar moet Lenis
  // zijn vingers ervan af houden. Vanaf xl is het een statisch grid (overflow-visible),
  // en moet gewoon wiel-scrollen over de kaarten weer normaal smooth verlopen.
  const touchLayout = useTouchLayout();

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let frame = 0;
    const sync = () => {
      const trackLeft = track.getBoundingClientRect().left;
      let nearest = 0;
      let min = Infinity;
      slideRefs.current.forEach((el, i) => {
        if (!el) return;
        const d = Math.abs(el.getBoundingClientRect().left - trackLeft);
        if (d < min) {
          min = d;
          nearest = i;
        }
      });
      setActive(nearest);
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(sync);
    };

    sync();
    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [items.length]);

  const goTo = (i: number) => {
    slideRefs.current[i]?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  };

  return (
    <div className={className || undefined}>
      <div
        ref={trackRef}
        data-lenis-prevent={touchLayout || undefined}
        className="no-scrollbar -mx-6 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-px-6 px-6 py-2 sm:-mx-10 sm:scroll-px-10 sm:px-10 xl:mx-0 xl:grid xl:grid-cols-3 xl:gap-8 xl:overflow-visible xl:p-0"
      >
        {items.map((child, i) => (
          <div
            key={i}
            ref={(el) => {
              slideRefs.current[i] = el;
            }}
            className="w-[80%] shrink-0 snap-start sm:w-[48%] xl:w-auto"
          >
            {child}
          </div>
        ))}
      </div>

      {items.length > 1 && (
        <div className="mt-5 flex justify-center gap-1 xl:hidden">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Ga naar kaart ${i + 1} van ${items.length}`}
              aria-current={i === active}
              className="flex h-8 items-center justify-center px-1.5"
            >
              <span
                className={`h-2 rounded-full bg-heading transition-all duration-300 ${
                  i === active ? "w-6 opacity-100" : "w-2 opacity-25"
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
