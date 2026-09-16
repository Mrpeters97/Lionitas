import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface PillLinkProps {
  href: string;
  target?: string | null;
  children: React.ReactNode;
  variant?: "yellow" | "blue" | "navy" | "outline-white" | "outline-cream";
  className?: string;
  onClick?: () => void;
  /** Krappere padding/gap/tekstgrootte — voor plekken met weinig ruimte (bv. naast de hamburger op mobiel). */
  compact?: boolean;
}

// Outline-varianten gebruiken `ring` (box-shadow) i.p.v. `border`: een border telt mee
// in de auto-hoogte van de pill (+1px boven, +1px onder), waardoor 'm net iets hoger
// rendert dan de solid varianten. Een ring tekent buiten het box-model om, dus alle
// varianten blijven exact even hoog.
export const PILL_STYLES = {
  yellow: "bg-accent text-navy hover:bg-yellow-hover-strong focus-visible:outline-navy",
  blue: "bg-blue text-cream hover:bg-blue-hover-strong focus-visible:outline-yellow",
  navy: "bg-navy text-on-dark hover:bg-navy-hover focus-visible:outline-yellow",
  "outline-white":
    "ring-1 ring-inset ring-white/30 text-on-dark hover:ring-white focus-visible:outline-yellow",
  "outline-cream":
    "ring-1 ring-inset ring-cream text-cream hover:bg-cream hover:text-navy focus-visible:outline-yellow",
};

const ARROW_STYLES = {
  yellow: { circle: "bg-navy", arrow: "text-yellow" },
  blue: { circle: "bg-yellow", arrow: "text-blue" },
  navy: { circle: "bg-yellow", arrow: "text-navy" },
  "outline-white": { circle: "bg-yellow", arrow: "text-navy" },
  "outline-cream": { circle: "bg-yellow", arrow: "text-navy" },
};

export function ArrowIcon({
  variant,
  showCircle = true,
}: {
  variant: keyof typeof ARROW_STYLES;
  showCircle?: boolean;
}) {
  const { circle, arrow } = ARROW_STYLES[variant];
  return (
    <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
      {showCircle && <span aria-hidden className={`absolute inset-0 rounded-full ${circle}`} />}
      {/* Rust: pijl naar rechts. Op hover/focus (via de `group` op de knop) draait 'm
          -45° naar rechtsboven. motion-reduce: geen animatie, wel de eindstand. */}
      <ArrowRight
        aria-hidden
        size={12}
        strokeWidth={1.75}
        className={`relative origin-center transition-transform duration-300 ease-out group-hover:-rotate-45 group-focus-visible:-rotate-45 motion-reduce:transition-none ${arrow}`}
      />
    </span>
  );
}

export default function PillLink({
  href,
  target,
  children,
  variant = "blue",
  className = "",
  onClick,
  compact = false,
}: PillLinkProps) {
  const isExternal = /^https?:\/\//.test(href);
  // Compact bespaart horizontale ruimte (padding/gap) én gebruikt een iets kleinere
  // tekst (14px i.p.v. 17px) — voor de mobiele navbar-cta naast de hamburger, waar de
  // standaardmaat net te fors oogde. Gewicht blijft 600 (font-semibold), net als
  // text-label, zodat 'm niet dunner aanvoelt.
  const sizing = compact
    ? "gap-1.5 py-2.5 pl-4 pr-2 text-sm font-semibold"
    : "gap-2.5 py-2.5 pl-5 pr-2.5 text-label";
  const classes = `group inline-flex items-center rounded-pill transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-2 focus-visible:outline-offset-2 ${sizing} ${PILL_STYLES[variant]} ${className}`;

  const content = (
    <>
      <span className="whitespace-nowrap">{children}</span>
      <ArrowIcon variant={variant} />
    </>
  );

  if (isExternal) {
    return (
      <a href={href} target={target ?? undefined} className={classes} onClick={onClick}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} onClick={onClick}>
      {content}
    </Link>
  );
}
