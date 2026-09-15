"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { ContentCard } from "@/lib/wordpress";
import { ArrowIcon, PILL_STYLES } from "@/components/PillLink";
import { useTouchLayout } from "@/lib/useTouchLayout";

const spring = { type: "spring" as const, stiffness: 280, damping: 28 };

// `revealed` = de statische eindstaat voor touch-apparaten (geen hover): de pill en
// titel staan meteen in beeld, maar de afbeelding zoomt niet permanent in.
const imageVariants = {
  rest: { scale: 1 },
  revealed: { scale: 1 },
  hover: { scale: 1.06 },
};

const captionVariants = {
  rest: { y: 0 },
  revealed: { y: 0 },
  hover: { y: -4 },
};

// Invisible — only reserves layout space so the title shifts up correctly, without constraining the pill's travel distance.
// `revealed` snapt zonder animatie in beeld: op touch is er geen intro nodig en een
// height-animatie binnen de horizontale slider zou verticale overflow geven.
const ctaSpacerVariants = {
  rest: { height: 0, marginTop: 0 },
  revealed: { height: 44, marginTop: 8, transition: { duration: 0 } },
  hover: { height: 44, marginTop: 8 },
};

// The pill itself lives outside that spacer, positioned against the card's true edge, so it can travel in from
// below the card entirely instead of being capped by the spacer's own (small) clipped height.
const ctaPillVariants = {
  rest: { y: 100, opacity: 0, transition: { duration: 0.15 } },
  revealed: { y: 0, opacity: 1, transition: { duration: 0 } },
  hover: { y: 0, opacity: 1, transition: { duration: 0.3, delay: 0.08 } },
};

const MotionLink = motion.create(Link);

export default function HomeCard({ card }: { card: ContentCard }) {
  const touchLayout = useTouchLayout();
  const restState = touchLayout ? "revealed" : "rest";
  const wrapperClass =
    "group relative block aspect-[485/521] overflow-hidden rounded-panel bg-navy/20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow";

  const content = (
    <>
      {card.image?.node && (
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
      <motion.div
        variants={captionVariants}
        transition={spring}
        className="absolute inset-x-0 bottom-0 flex flex-col items-center p-8 text-center"
      >
        <h3 className="h4 text-on-dark">{card.title}</h3>
        {card.link?.url && <motion.div variants={ctaSpacerVariants} transition={spring} aria-hidden className="w-px" />}
      </motion.div>
      {card.link?.url && (
        <motion.div variants={ctaPillVariants} className="absolute inset-x-0 bottom-8 flex justify-center">
          <span
            className={`inline-flex items-center gap-2.5 rounded-pill py-2.5 pl-5 pr-2.5 text-label ${PILL_STYLES.blue}`}
          >
            <span>{card.link.title || "Meer informatie"}</span>
            <ArrowIcon variant="blue" />
          </span>
        </motion.div>
      )}
    </>
  );

  if (card.link?.url) {
    return (
      <MotionLink
        href={card.link.url}
        target={card.link.target ?? undefined}
        initial={restState}
        animate={restState}
        whileHover="hover"
        whileFocus="hover"
        className={wrapperClass}
      >
        {content}
      </MotionLink>
    );
  }

  return (
    <motion.div initial={restState} animate={restState} whileHover="hover" whileFocus="hover" className={wrapperClass}>
      {content}
    </motion.div>
  );
}
