"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView, useReducedMotion } from "framer-motion";
import type { WordPressPost } from "@/lib/wordpress";
import { ArrowIcon } from "@/components/PillLink";
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

// The color wash still blooms from the corner badge via transform: scale, same as the
// original design — this part never had a blur on it, so scaling it is fine.
const floodVariants = {
  rest: { scale: 1 },
  hover: { scale: 30 },
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

      <motion.span
        aria-hidden
        variants={floodVariants}
        transition={spring}
        style={{ transformOrigin: "center" }}
        className="absolute bottom-6 right-6 h-11 w-11 rounded-full bg-navy/80"
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
        <div className="max-w-[85%]">
          <h3 className="text-card text-on-dark">{post.title}</h3>
          <motion.div variants={excerptVariants} transition={spring} className="overflow-hidden">
            <div
              className="mt-2 text-meta text-on-dark-muted line-clamp-3 [&_a]:underline"
              dangerouslySetInnerHTML={{ __html: post.excerpt }}
            />
          </motion.div>
        </div>
      </div>

      <span className="absolute bottom-6 right-6 flex h-11 w-11 items-center justify-center">
        <ArrowIcon variant="yellow" showCircle={false} />
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
