"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import PillLink from "@/components/PillLink";

// `path` = de echte route, gebruikt om de actieve pill te bepalen en als unieke
// key. Alleen de Home-pagina is al gebouwd — de daadwerkelijke `<Link>`s hieronder
// wijzen daarom tijdelijk allemaal naar "#" i.p.v. `path`, zodat er niet per
// ongeluk naar een niet-bestaande pagina genavigeerd kan worden.
const NAV_LINKS = [
  { label: "Home", path: "/" },
  { label: "Over Lionitas", path: "/over-lionitas" },
  { label: "Actueel", path: "/actueel" },
  { label: "Trainingen", path: "/trainingen" },
  { label: "Contact", path: "/contact" },
];

// Verticale positie (in px vanaf de viewport-top) waarop we peilen welke sectie
// achter de pill zit — komt overeen met het midden van de pill (top-4 = 16px +
// ~helft van de pillhoogte).
const PROBE_Y = 40;

// De pill z'n eigen achtergrond-rol. Zodra de sectie erachter dezelfde rol heeft
// (de pill "camoufleert" ertegen, zoals nu in de hero), krijgt de pill een
// subtiele schaduw i.p.v. te vertrouwen op kleurcontrast.
const PILL_BG = "brand";

export default function Header() {
  const pathname = usePathname();
  const [surface, setSurface] = useState<string | null>(PILL_BG);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);

  useEffect(() => {
    const check = () => {
      const sections = document.querySelectorAll<HTMLElement>("[data-surface]");
      let current: string | null = null;
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= PROBE_Y && rect.bottom >= PROBE_Y) current = section.dataset.surface ?? null;
      });
      setSurface(current);
    };

    check();
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        check();
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const isLinkActive = (path: string) => (path === "/" ? pathname === "/" : pathname.startsWith(path));

  const renderMobileNavLink = (link: (typeof NAV_LINKS)[number]) => {
    const isActive = isLinkActive(link.path);
    return (
      <Link
        key={link.label}
        href="#"
        aria-current={isActive ? "page" : undefined}
        onClick={() => setMenuOpen(false)}
        className={`block rounded-sm py-3 text-lg transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow ${
          isActive ? "font-semibold text-yellow" : "font-medium text-white hover:text-yellow"
        }`}
      >
        {link.label}
      </Link>
    );
  };

  return (
    <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4 xl:px-6">
      <div className="w-full xl:max-w-6xl">
        <div
          className={`flex items-center justify-between gap-4 rounded-pill border bg-surface-brand py-3 pl-5 pr-4 transition-all duration-300 ease-out xl:py-5 xl:pl-[30px] xl:pr-5 ${
            surface === PILL_BG
              ? "border-blue-hover shadow-[0_8px_30px_rgba(0,14,53,0.16)]"
              : "border-transparent"
          }`}
        >
          <Link
            href="/"
            className="shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logos/lionitas-logo-header.svg" alt="Lionitas" className="h-[19px] w-auto xl:h-[26px]" />
          </Link>

          <nav
            className="hidden flex-1 items-center justify-center gap-1 xl:flex"
            onMouseLeave={() => setHoveredHref(null)}
          >
            {NAV_LINKS.map((link) => {
              const isActive = isLinkActive(link.path);
              const showPill = (hoveredHref ?? (isActive ? link.path : null)) === link.path;
              return (
                <Link
                  key={link.label}
                  href="#"
                  aria-current={isActive ? "page" : undefined}
                  onMouseEnter={() => setHoveredHref(link.path)}
                  onFocus={() => setHoveredHref(link.path)}
                  onBlur={() => setHoveredHref(null)}
                  className={`relative rounded-pill px-4 py-2 text-meta whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow ${
                    showPill ? "text-navy" : "text-on-dark"
                  }`}
                >
                  {showPill && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-pill bg-cream"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            {/* Op mobiel/tablet staat de CTA in het uitgeklapte menu (zie hieronder) —
                naast de hamburger in de balk zelf werd het te krap. */}
            <div className="hidden xl:block">
              <PillLink href="/lid-worden" variant="yellow">
                Lid worden
              </PillLink>
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Sluit menu" : "Open menu"}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-pill bg-navy transition hover:bg-navy-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow xl:hidden"
            >
              <span className="relative flex h-4 w-4 items-center justify-center">
                <Menu
                  aria-hidden
                  size={16}
                  strokeWidth={2}
                  className={`absolute text-on-dark transition-all duration-300 ease-out motion-reduce:transition-none ${
                    menuOpen ? "scale-75 opacity-0" : "scale-100 opacity-100"
                  }`}
                />
                <X
                  aria-hidden
                  size={16}
                  strokeWidth={2}
                  className={`absolute text-on-dark transition-all duration-300 ease-out motion-reduce:transition-none ${
                    menuOpen ? "scale-100 opacity-100" : "scale-75 opacity-0"
                  }`}
                />
              </span>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              id="mobile-menu"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="mt-3 xl:hidden"
            >
              <div className="rounded-media border border-blue-hover bg-surface-brand px-6 py-6 shadow-lg shadow-black/25">
                <nav className="flex flex-col divide-y divide-white/10">
                  {NAV_LINKS.map((link) => renderMobileNavLink(link))}
                </nav>
                <div className="mt-6 border-t border-white/10 pt-6">
                  <PillLink href="/lid-worden" variant="yellow" onClick={() => setMenuOpen(false)}>
                    Lid worden
                  </PillLink>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
