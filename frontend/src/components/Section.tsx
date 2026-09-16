"use client";

import { useRef, type CSSProperties } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Container from "@/components/Container";

type Bg = "page" | "dark" | "brand" | "soft";

const BG_CLASS: Record<Bg, string> = {
  page: "",
  dark: "bg-surface-dark text-on-dark",
  brand: "bg-surface-brand text-on-dark",
  soft: "bg-surface-soft",
};

// Framer Motion kan geen CSS custom properties interpoleren (het moet de kanalen
// zelf kunnen mixen) — voor de live scroll-kleurovergang zijn resolved hex-waarden
// nodig. Moet in sync blijven met de primitieven in globals.css.
const BG_COLOR_HEX: Record<Bg, string> = {
  page: "#f6f6f6",
  dark: "#000e35",
  brand: "#0a71b4",
  soft: "#faf0e0",
};

interface SectionProps {
  children: React.ReactNode;
  /** Achtergrond-rol. `page` = geen eigen achtergrond (basis pagina-kleur). */
  bg?: Bg;
  /**
   * Laat deze sectie de vorige overlappen: trekt omhoog over de ronde onderrand
   * (`--radius-section`) en zet de top-padding op ritme + die overlap.
   */
  connect?: boolean;
  /**
   * Extra top-ruimte bovenop de connect-offset, als CSS-lengte — voor content dat
   * uit de vorige sectie steekt. Bijv. `"var(--spacing-bleed)"`.
   */
  connectExtra?: string;
  /** Ronde onderhoeken, zodat de vólgende sectie hier overheen kan lopen. */
  roundBottom?: boolean;
  /**
   * Rol van de vórige sectie. Als gezet, animeert de achtergrondkleur van déze
   * sectie ECHT mee op scroll — van die kleur naar de eigen `bg`-kleur — terwijl
   * de sectie de viewport in scrolt. Geen statische gradient op de naad, een live
   * `backgroundColor`-interpolatie (via Framer Motion's scroll-progress).
   */
  colorFrom?: Bg;
  /** Top-padding op ritme (genegeerd bij `connect`, die regelt z'n eigen pt). Default true. */
  padTop?: boolean;
  /** Bottom-padding op ritme. Zet op false als de volgende sectie de tussenruimte al levert. Default true. */
  padBottom?: boolean;
  /** Stapelvolgorde. Eerdere secties horen bovenop te liggen (hoger getal). */
  z?: number;
  /** Sla de standaard <Container> over (voor secties die zelf hun breedte bepalen). */
  bare?: boolean;
  /** Volle-breedte decoratie (bijv. een achtergrondpatroon) — gerenderd vóór de Container. */
  decoration?: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

export default function Section({
  children,
  bg = "page",
  connect = false,
  connectExtra,
  roundBottom = false,
  colorFrom,
  padTop = true,
  padBottom = true,
  z,
  bare = false,
  decoration,
  className = "",
  containerClassName = "",
}: SectionProps) {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  // Kleurovergang loopt terwijl de sectie de viewport in scrolt: van "raakt de
  // onderkant van het scherm" tot "top van de sectie bereikt het scherm-midden".
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start center"],
  });
  const animatedBg = useTransform(
    scrollYProgress,
    [0, 1],
    [BG_COLOR_HEX[colorFrom ?? bg], BG_COLOR_HEX[bg]],
  );

  // De connect-offsets gaan via inline-style: `calc()` met theme-variabelen is
  // niet betrouwbaar als arbitrary Tailwind-class (de scanner ziet 'm niet).
  const style: CSSProperties = {};
  if (z != null) style.zIndex = z;
  if (connect) {
    style.marginTop = "calc(var(--radius-section) * -1)";
    style.paddingTop = connectExtra
      ? `calc(var(--spacing-section) + var(--radius-section) + ${connectExtra})`
      : "calc(var(--spacing-section) + var(--radius-section))";
  }

  const classes = [
    "relative",
    BG_CLASS[bg],
    roundBottom ? "rounded-b-section" : "",
    !connect && padTop ? "pt-section" : "",
    padBottom ? "pb-section" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <motion.section
      ref={ref}
      className={classes}
      style={{
        ...style,
        backgroundColor: colorFrom && !reduceMotion ? animatedBg : undefined,
      }}
      data-surface={bg}
    >
      {decoration}
      {bare ? children : <Container className={containerClassName}>{children}</Container>}
    </motion.section>
  );
}
