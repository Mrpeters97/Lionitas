import type { CSSProperties } from "react";
import Container from "@/components/Container";

type Bg = "page" | "dark" | "brand" | "soft";

const BG_CLASS: Record<Bg, string> = {
  page: "",
  dark: "bg-surface-dark text-on-dark",
  brand: "bg-surface-brand text-on-dark",
  soft: "bg-surface-soft",
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
  padTop = true,
  padBottom = true,
  z,
  bare = false,
  decoration,
  className = "",
  containerClassName = "",
}: SectionProps) {
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
    <section className={classes} style={Object.keys(style).length ? style : undefined}>
      {decoration}
      {bare ? children : <Container className={containerClassName}>{children}</Container>}
    </section>
  );
}
