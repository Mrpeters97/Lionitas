import Link from "next/link";
import { ChevronRight } from "lucide-react";
import Container from "@/components/Container";
import ScrollReveal from "@/components/ScrollReveal";

export interface Crumb {
  label: string;
  href?: string | null;
}

interface PageHeroProps {
  title: string;
  /** Optionele tweede kopregel in gedimde kleur, bv. "van pupil tot master". */
  subtitle?: string;
  intro?: string | null;
  /** Pad boven de titel; laatste item = huidige pagina. "Home" komt er automatisch voor. */
  breadcrumbs?: Crumb[];
  /** Kruimelpad + kop gecentreerd (intro valt dan onder de kop i.p.v. ernaast). */
  centered?: boolean;
  /** Kopgrootte: `h2` (standaard, ingetogen) of `h1` voor een prominentere kop. */
  size?: "h1" | "h2";
  /**
   * `brand` = blauw blok met ronde onderhoeken i.p.v. op de pagina-achtergrond.
   * Alle tekst is dan wit (WCAG: gedimd wit haalt op blauw geen 4.5:1).
   */
  tone?: "page" | "brand";
  /**
   * Hoeveel de content eronder omhoog in dit blok valt, als CSS-lengte (bv.
   * `"var(--spacing-bleed-filter)"`). Komt bovenop de onder-padding; gebruik
   * hetzelfde token als `-mt-…` op die content.
   */
  overlap?: string;
}

/**
 * Kop voor vervolgpagina's — standaard ingetogen: geen gekleurd blok, gewoon op de
 * pagina-achtergrond. Kruimelpad als eyebrow, `.h2`-kop met optioneel een gedimde
 * tweede regel (`text-heading-soft`), intro rechts ernaast vanaf lg. De content
 * eronder start direct (geen `<Section connect>` nodig).
 */
export default function PageHero({
  title,
  subtitle,
  intro,
  breadcrumbs = [],
  centered = false,
  size = "h2",
  tone = "page",
  overlap,
}: PageHeroProps) {
  const crumbs: Crumb[] = [{ label: "Home", href: "/" }, ...breadcrumbs];
  const brand = tone === "brand";

  return (
    <section
      data-surface={tone}
      className={`pt-28 sm:pt-32 xl:pt-40 ${overlap ? "" : "pb-12 sm:pb-16 xl:pb-20"} ${
        brand ? "rounded-b-section bg-surface-brand text-on-dark" : ""
      }`}
      style={overlap ? { paddingBottom: `calc(clamp(3rem, 5vw, 5rem) + ${overlap})` } : undefined}
    >
      <Container>
        <ScrollReveal trigger="mount" duration={0.8}>
          <nav aria-label="Kruimelpad">
            <ol
              className={`flex flex-wrap items-center gap-x-1.5 gap-y-1 text-meta ${centered ? "justify-center" : ""} ${
                // Op blauw: cream i.p.v. wit (4.6:1, haalt AA) en normaal gewicht, zodat het
                // kruimelpad terugtreedt achter de kop. Gedimd wit mag hier niet (3.6:1).
                brand ? "font-normal text-cream" : "text-on-light-muted"
              }`}
            >
              {crumbs.map((crumb, index) => {
                const isLast = index === crumbs.length - 1;
                return (
                  <li key={`${crumb.label}-${index}`} className="flex items-center gap-1.5">
                    {crumb.href && !isLast ? (
                      <Link
                        href={crumb.href}
                        className={
                          brand
                            ? "rounded-sm transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                            : "rounded-sm transition-colors hover:text-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
                        }
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span
                        aria-current={isLast ? "page" : undefined}
                        className={isLast && !brand ? "text-heading" : ""}
                      >
                        {crumb.label}
                      </span>
                    )}
                    {!isLast && <ChevronRight aria-hidden size={13} strokeWidth={2} className="opacity-60" />}
                  </li>
                );
              })}
            </ol>
          </nav>
        </ScrollReveal>

        <div
          className={
            centered
              ? "mx-auto mt-4 grid max-w-3xl gap-5 text-center"
              : "mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-end lg:gap-16"
          }
        >
          <ScrollReveal trigger="mount" duration={0.8} delay={0.05}>
            <h1 className={`${size} ${brand ? "text-on-dark" : ""}`}>
              {title}
              {subtitle && !brand && <span className="block text-heading-soft">{subtitle}</span>}
            </h1>
          </ScrollReveal>
          {intro && (
            <ScrollReveal trigger="mount" duration={0.8} delay={0.15}>
              <p className={`text-body lg:pb-1 ${brand ? "text-on-dark" : "text-on-light-muted"}`}>{intro}</p>
            </ScrollReveal>
          )}
        </div>
      </Container>
    </section>
  );
}
