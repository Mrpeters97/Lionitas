"use client";

import { useRef, type RefObject } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import type { ContentCard } from "@/lib/wordpress";
import { useCardSliderInView } from "@/components/CardSlider";
import { useTouchLayout } from "@/lib/useTouchLayout";

const spring = { type: "spring" as const, stiffness: 280, damping: 28 };

const imageVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.06 },
};

// Op de hele kaart (blok + foto samen) — niet los op de afbeelding — zodat er nooit
// een leeg/donker blok te zien is voordat de foto er is. Pas als de kaart écht in
// beeld scrolt (`inView`) wordt 'm gemount én tegelijk ingefade + ingeschoven.
const cardEntranceVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

const MotionLink = motion.create(Link);

export default function HomeCard({ card, index = 0 }: { card: ContentCard; index?: number }) {
  const touchLayout = useTouchLayout();
  // Kleinere radius zolang de kaarten in de mobiele/tablet-slider staan (smaller,
  // dus 20px oogt daar te fors) — volle rounded-panel pas vanaf xl, waar de kaarten
  // in het grid ook echt groter worden.
  const wrapperClass =
    "group relative block aspect-[485/521] overflow-hidden rounded-[12px] bg-navy/20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow sm:rounded-[16px] xl:rounded-panel";

  // Iets ruimer dan ScrollReveal's eigen -80px/0.2, zodat de foto pas laadt als de
  // kaart echt (en niet nog maar net) in beeld is. Op touch staan de kaarten in een
  // horizontaal scrollbare track — een IntersectionObserver op de kaart zelf houdt
  // óók rekening met de clipping van die track, dus een (nog) niet-geswipete kaart
  // telt nooit als "in view", ongeacht rootMargin. Vandaar op touch de gedeelde
  // `inView` van CardSlider (gemeten op de niet-geclipte buitenste wrapper) — laat
  // alle drie kaarten tegelijk zien i.p.v. pas losjes bij het swipen.
  const cardRef = useRef<HTMLAnchorElement | HTMLDivElement>(null);
  const individualInView = useInView(cardRef, { once: true, margin: "-100px", amount: 0.3 });
  const sharedInView = useCardSliderInView();
  const inView = touchLayout ? sharedInView : individualInView;
  const reduceMotion = useReducedMotion();

  // Stagger alleen op desktop (grid) — op touch (horizontale slider) juist alle drie
  // tegelijk, zoals gevraagd.
  const staggerDelay = touchLayout ? 0.15 : 0.15 + index * 0.15;
  const entranceTransition = {
    opacity: { duration: 0.7, delay: staggerDelay, ease: [0.22, 1, 0.36, 1] as const },
    y: { duration: 0.7, delay: staggerDelay, ease: [0.22, 1, 0.36, 1] as const },
  };

  const content = (
    <>
      {inView && card.image?.node && (
        <motion.div variants={imageVariants} transition={spring} className="absolute inset-0">
          <Image
            src={card.image.node.sourceUrl}
            alt={card.image.node.altText || card.title}
            fill
            className="object-cover"
          />
        </motion.div>
      )}
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent from-[37.5%] to-navy" />

      {/* Titel links, cirkel-pijl altijd zichtbaar rechts — i.p.v. een CTA-pill die
          pas bij hover verscheen. De hele kaart is toch al de link, dus die pill voegde
          geen functie toe, alleen een extra stap. Bij hover/focus vult de cirkel geel
          in en draait de pijl mee (via de `group`-klasse op de kaart zelf) — puur een
          CSS-kleurovergang, geen layout-animatie, dus geen sprongetjes meer. */}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 p-8">
        <h3 className="h4 min-w-0 flex-1 text-left text-on-dark">{card.title}</h3>
        {card.link?.url && (
          <span
            aria-hidden
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-inset ring-white/30 backdrop-blur-sm transition-colors duration-300 ease-out group-hover:bg-accent group-hover:ring-accent group-focus-visible:bg-accent group-focus-visible:ring-accent"
          >
            <ArrowRight
              size={16}
              strokeWidth={1.75}
              className="origin-center text-on-dark transition-transform duration-300 ease-out group-hover:-rotate-45 group-hover:text-navy group-focus-visible:-rotate-45 group-focus-visible:text-navy motion-reduce:transition-none"
            />
          </span>
        )}
      </div>
    </>
  );

  if (card.link?.url) {
    return (
      <MotionLink
        ref={cardRef as RefObject<HTMLAnchorElement | null>}
        href={card.link.url}
        target={card.link.target ?? undefined}
        variants={cardEntranceVariants}
        initial={reduceMotion ? false : "hidden"}
        animate={inView ? "visible" : "hidden"}
        whileHover="hover"
        whileFocus="hover"
        transition={entranceTransition}
        className={wrapperClass}
      >
        {content}
      </MotionLink>
    );
  }

  return (
    <motion.div
      ref={cardRef as RefObject<HTMLDivElement | null>}
      variants={cardEntranceVariants}
      initial={reduceMotion ? false : "hidden"}
      animate={inView ? "visible" : "hidden"}
      whileHover="hover"
      whileFocus="hover"
      transition={entranceTransition}
      className={wrapperClass}
    >
      {content}
    </motion.div>
  );
}
