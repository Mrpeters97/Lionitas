"use client";

import { useEffect, useState } from "react";

/**
 * True wanneer de kaarten hun "tap-first" uitvoering moeten tonen: onder de
 * gedeelde tablet-drempel (< xl, zie CLAUDE.md) of op een apparaat zonder
 * hover-pointer. In beide gevallen is er geen betrouwbare hover, dus moet een
 * actie/CTA meteen zichtbaar zijn i.p.v. achter hover — anders is 'm op tablet-
 * breedte (met muis/trackpad, dus hover:hover) onbereikbaar zonder te klikken.
 * Start als `false` zodat de server-render en desktop overeenkomen; corrigeert na mount.
 */
export function useTouchLayout() {
  const [touch, setTouch] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1279px), (hover: none)");
    const update = () => setTouch(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return touch;
}
