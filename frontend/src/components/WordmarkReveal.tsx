"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

/**
 * Het paneel staat `position: fixed` aan de onderkant van het scherm — de hele tijd
 * al, maar verstopt achter de footer erboven (die een ondoorzichtige achtergrond en
 * een hogere z-index heeft). Deze wrapper reserveert precies de hoogte van het paneel
 * als lege scrollruimte ná de footer; in die ruimte ligt niets meer overheen, dus daar
 * komt het paneel — dat al die tijd al op zijn plek stond — van onderaf tevoorschijn
 * terwijl de footer erboven wegscrolt. Geen sticky/overlap-truc: gewoon fixed + een
 * spacer, dat blijkt hier het meest voorspelbare gedrag te geven.
 */
export default function WordmarkReveal({ children }: { children: ReactNode }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    const el = panelRef.current;
    if (!el) return;

    const update = () => setHeight(el.offsetHeight);
    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div aria-hidden style={{ height }} />
      <div ref={panelRef} className="fixed inset-x-0 bottom-0 z-0">
        {children}
      </div>
    </>
  );
}
