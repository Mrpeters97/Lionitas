"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import type { WordPressPost } from "@/lib/wordpress";
import CardSlider, { useCardSliderInView } from "@/components/CardSlider";
import { useTouchLayout } from "@/lib/useTouchLayout";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
}

const spring = { type: "spring" as const, stiffness: 150, damping: 24 };

const imageVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.06 },
};

// Op de hele kaart (blok + foto samen) — niet los op de afbeelding — zodat er nooit
// een leeg/donker blok te zien is voordat de foto er is. Pas als de kaart écht in
// beeld scrolt (`inView`) wordt 'm gemount én tegelijk ingefade + ingeschoven.
const cardEntranceVariants = {
  hidden: { opacity: 0, y: 28 },
  rest: { opacity: 1, y: 0 },
  hover: { opacity: 1, y: 0 },
};

// Blur lives on its own full-card layer that only fades in (no transform), so its blur
// radius stays exactly `blur-md` throughout — scaling a blurred element scales the blur
// radius too, which is what washed the image out completely in an earlier version.
const blurVariants = {
  rest: { opacity: 0 },
  hover: { opacity: 1 },
};

// `backdrop-blur` samples pixels from just outside the card's own rounded corners too,
// which without a color layer on top left a pale halo bleeding in there on hover (the
// soft page background showing through). This solid navy wash sits above the blur and
// covers that edge completely, and gives the white text proper contrast against busy/
// light photos.
const washVariants = {
  rest: { opacity: 0 },
  hover: { opacity: 1 },
};

const excerptVariants = {
  rest: { height: 0, opacity: 0, marginTop: 0 },
  hover: { height: "auto", opacity: 1, marginTop: 8 },
};

const MotionLink = motion.create(Link);

function ActueelCard({ post, index = 0 }: { post: WordPressPost; index?: number }) {
  const category = post.categories.nodes[0]?.name;
  const touchLayout = useTouchLayout();

  // Iets ruimer dan ScrollReveal's eigen -80px/0.2, zodat de foto pas laadt als de
  // kaart echt (en niet nog maar net) in beeld is. Op touch staan de kaarten in een
  // horizontaal scrollbare track — een IntersectionObserver op de kaart zelf houdt
  // óók rekening met de clipping van die track, dus een (nog) niet-geswipete kaart
  // telt nooit als "in view", ongeacht rootMargin. Vandaar op touch de gedeelde
  // `inView` van CardSlider (gemeten op de niet-geclipte buitenste wrapper) — laat
  // alle drie kaarten tegelijk zien i.p.v. pas losjes bij het swipen.
  const cardRef = useRef<HTMLAnchorElement>(null);
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

  return (
    <MotionLink
      ref={cardRef}
      href={`/actueel/${post.slug}`}
      variants={cardEntranceVariants}
      initial={reduceMotion ? false : "hidden"}
      animate={inView ? "rest" : "hidden"}
      whileHover={touchLayout ? undefined : "hover"}
      whileFocus={touchLayout ? undefined : "hover"}
      transition={entranceTransition}
      className="group relative block h-[420px] overflow-hidden rounded-[14px] bg-navy/20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow sm:h-[480px] sm:rounded-[20px] xl:rounded-card"
    >
      {inView && post.featuredImage?.node && (
        <motion.div variants={imageVariants} transition={spring} className="absolute inset-0">
          <Image
            src={post.featuredImage.node.sourceUrl}
            alt={post.featuredImage.node.altText || post.title}
            fill
            className="object-cover"
          />
        </motion.div>
      )}
      <div className="absolute inset-0 bg-black/20" />

      <motion.div
        aria-hidden
        variants={blurVariants}
        transition={spring}
        className="absolute inset-0 rounded-[14px] backdrop-blur-md sm:rounded-[20px] xl:rounded-card"
      />
      <motion.div
        aria-hidden
        variants={washVariants}
        transition={spring}
        className="absolute inset-0 rounded-[14px] bg-navy/80 sm:rounded-[20px] xl:rounded-card"
      />

      <div className="relative flex h-full flex-col justify-between p-6">
        <div className="flex flex-wrap gap-3">
          <span className="rounded-pill bg-white px-3 py-1 text-meta text-navy">
            {formatDate(post.date)}
          </span>
          {category && (
            <span className="rounded-pill bg-white px-3 py-1 text-meta text-navy">{category}</span>
          )}
        </div>
        {/* `pr-14`: ruimte voor de badge, die hieronder los (niet als flex-item) op
            een vaste plek rechtsonder in de kaart staat — zie de toelichting bij
            HomeCard voor waarom (blijft zo op dezelfde plek, ook als de titel wrapt). */}
        <div className="pr-14">
          <h3 className="text-card text-on-dark">{post.title}</h3>
          <motion.div variants={excerptVariants} transition={spring} className="overflow-hidden">
            <div
              className="mt-2 text-meta text-on-dark-muted line-clamp-3 [&_a]:underline"
              dangerouslySetInnerHTML={{ __html: post.excerpt }}
            />
          </motion.div>
        </div>
      </div>

      {/* Cirkel-pijl altijd rechtsonder in de hoek, vast t.o.v. de kaart — zelfde
          plek en styling als bij de eerste-drie-kaarten op de home. Donkere vulling
          i.p.v. het eerdere lichte glas-effect: een bijna-transparant wit vlak gaf de
          witte pijl te weinig contrast om goed leesbaar te zijn. */}
      <span
        aria-hidden
        className="absolute bottom-6 right-6 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy/80 ring-1 ring-inset ring-white/10 backdrop-blur-sm transition-colors duration-300 ease-out group-hover:bg-accent group-hover:ring-accent group-focus-visible:bg-accent group-focus-visible:ring-accent sm:h-9 sm:w-9"
      >
        <ArrowRight
          strokeWidth={1.75}
          className="h-3 w-3 origin-center text-on-dark transition-transform duration-300 ease-out group-hover:-rotate-45 group-hover:text-navy group-focus-visible:-rotate-45 group-focus-visible:text-navy motion-reduce:transition-none sm:h-3.5 sm:w-3.5"
        />
      </span>
    </MotionLink>
  );
}

export default function ActueelSection({ posts }: { posts: WordPressPost[] }) {
  const items = posts.slice(0, 3);

  if (items.length === 0) return null;

  return (
    <CardSlider>
      {items.map((post, index) => (
        <ActueelCard key={post.id} post={post} index={index} />
      ))}
    </CardSlider>
  );
}
