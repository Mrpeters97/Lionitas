"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView, useReducedMotion } from "framer-motion";
import type { WPImage } from "@/lib/wordpress";

export default function ImageMarquee({ images }: { images: WPImage[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Positieve margin (i.p.v. de -100px die de kaarten elders gebruiken): triggert al
  // wanneer de marquee nog een flink stuk onder de viewport zit. Ruim gezet omdat op
  // mobiel (kortere viewport) hetzelfde aantal pixels relatief veel later aanvoelt.
  const inView = useInView(containerRef, { once: true, margin: "500px", amount: 0 });
  const reduceMotion = useReducedMotion();

  if (images.length === 0) return null;

  // De verticale stagger is strikt om-en-om (nooit twee tegels op dezelfde hoogte
  // naast elkaar). Om dat óók over de naad van de oneindige loop te laten kloppen,
  // moet de herhaalde set een even aantal tegels hebben — bij een oneven aantal
  // foto's verdubbelen we de basisset eerst.
  const base = images.length % 2 === 0 ? images : [...images, ...images];

  // Twee identieke sets achter elkaar. Elke tegel draagt zijn eigen rechter-marge
  // (geen flex `gap`), zodat set 2 exact op 50% van de trackbreedte begint en de
  // translateX(-50%)-loop naadloos is.
  const track = [...base, ...base];

  return (
    <div ref={containerRef} className="overflow-hidden">
      <div className="flex w-max items-start animate-marquee motion-reduce:animate-none">
        {track.map((image, index) => (
          <div
            key={index}
            className={`mr-[2.5vw] aspect-[222/215] w-[58vw] max-w-[420px] shrink-0 overflow-hidden rounded-[14px] sm:w-[24vw] sm:rounded-media ${
              index % 2 === 1 ? "mt-[6vw]" : ""
            }`}
          >
            {/* Pas mounten (en dus pas laden) zodra de marquee echt in beeld is, en dan
                één voor één van links naar rechts — niet allemaal tegelijk. */}
            {inView && (
              <motion.div
                className="h-full w-full"
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 0.7,
                  delay: reduceMotion ? 0 : 0.25 + index * 0.06,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <Image
                  src={image.node!.sourceUrl}
                  alt={image.node!.altText || ""}
                  width={222}
                  height={215}
                  className="h-full w-full object-cover"
                />
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
