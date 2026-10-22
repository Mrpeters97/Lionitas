"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { ArrowUpRight, ChevronDown, ChevronLeft, ChevronRight, Menu, X } from "lucide-react";
import PillLink from "@/components/PillLink";
import MegaMenu, { ACTIVE_LINK, MORPH, MorphPanel, NavAnchor } from "@/components/MegaMenu";
import { HEADER_CTA, isItemActive, type NavItem } from "@/lib/navigation";
import { useTouchLayout } from "@/lib/useTouchLayout";

// Verticale positie (in px vanaf de viewport-top) waarop we peilen welke sectie
// achter de pill zit — komt overeen met het midden van de pill (top-4 = 16px +
// ~helft van de pillhoogte).
const PROBE_Y = 40;

// De pill z'n eigen achtergrond-rol. Zodra de sectie erachter dezelfde rol heeft
// (de pill "camoufleert" ertegen, zoals nu in de hero), krijgt de pill een
// subtiele schaduw i.p.v. te vertrouwen op kleurcontrast.
const PILL_BG = "brand";

// Radius van de shell: dicht = pill (≥ halve balkhoogte, de browser kapt 'm af op
// een volle halve cirkel), open = `--radius-media`. Numeriek zodat de spring kan
// interpoleren — 999px → 32px zou pas op het allerlaatst zichtbaar veranderen.
const RADIUS_CLOSED = 44;
const RADIUS_OPEN = 32;

// Kleine vertraging bij het verlaten van de shell met de muis, zodat een korte
// "uitglijder" over de rand het paneel niet meteen dichtklapt.
const CLOSE_DELAY = 140;

export default function Header({ navigation }: { navigation: NavItem[] }) {
  const pathname = usePathname();
  const isTouch = useTouchLayout();
  const [surface, setSurface] = useState<string | null>(PILL_BG);

  // Desktop: `openId` = sectie waarvan het mega-paneel open is, `hoverId` = waar de
  // cream nav-pill staat (volgt de muis, ook over items zonder submenu).
  const [openId, setOpenId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [direction, setDirection] = useState(0);

  // Mobiel/tablet (< xl): drill-down. `mobileLevel` = geopende sectie of null (hoofdlijst).
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileLevel, setMobileLevel] = useState<string | null>(null);
  const [mobileDirection, setMobileDirection] = useState(0);

  const shellRef = useRef<HTMLDivElement>(null);
  const triggerRefs = useRef<Record<string, HTMLElement | null>>({});
  const ctaRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);

  // Alles is gekeyed op `id` (WordPress menu-item-ID): `href` kan null zijn ("#").
  const sectionIndex = (id: string) => navigation.findIndex((s) => s.id === id);
  const openSection = navigation.find((s) => s.id === openId && s.children.length > 0) ?? null;
  const mobileSection = navigation.find((s) => s.id === mobileLevel) ?? null;
  const expanded = Boolean(openSection) || menuOpen;

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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- na navigatie alles dicht
    setMenuOpen(false);
    setMobileLevel(null);
    setOpenId(null);
    setHoverId(null);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!expanded) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (openId) triggerRefs.current[openId]?.focus();
      closeAll();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  function closeAll() {
    window.clearTimeout(closeTimer.current);
    setOpenId(null);
    setHoverId(null);
    setMenuOpen(false);
    setMobileLevel(null);
  }

  function openPanel(id: string | null) {
    window.clearTimeout(closeTimer.current);
    if (id && openId && id !== openId) setDirection(sectionIndex(id) > sectionIndex(openId) ? 1 : -1);
    else if (!openId) setDirection(0);
    setOpenId(id);
  }

  function scheduleClose() {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => {
      setOpenId(null);
      setHoverId(null);
    }, CLOSE_DELAY);
  }

  function focusFirstPanelLink(id: string) {
    // Eén frame wachten tot het paneel gerenderd is. Is het intussen weer gesloten
    // (snelle Escape), dan niet focussen — anders landt de focus op een link in het
    // wegfadende paneel en valt daarna terug op <body>.
    requestAnimationFrame(() => {
      if (triggerRefs.current[id]?.getAttribute("aria-expanded") !== "true") return;
      shellRef.current?.querySelector<HTMLElement>(`[data-panel="${id}"] a`)?.focus();
    });
  }

  // Toetsenbord: Tab/↓ vanaf een geopende trigger springt het paneel in (dat staat in
  // de DOM ná de hele balk); Tab voorbij de laatste link gaat door naar de volgende
  // trigger, Shift+Tab vóór de eerste terug naar de eigen trigger.
  function onTriggerKeyDown(event: React.KeyboardEvent, section: NavItem) {
    const isOpen = openId === section.id;
    if (event.key === "ArrowDown" || (event.key === "Tab" && !event.shiftKey && isOpen)) {
      event.preventDefault();
      if (!isOpen) openPanel(section.id);
      focusFirstPanelLink(section.id);
    }
  }

  function onPanelKeyDown(event: React.KeyboardEvent) {
    if (event.key !== "Tab" || !openId) return;
    const links = [...(shellRef.current?.querySelectorAll<HTMLElement>(`[data-panel="${openId}"] a`) ?? [])];
    const atStart = document.activeElement === links[0];
    const atEnd = document.activeElement === links[links.length - 1];
    if (event.shiftKey && atStart) {
      event.preventDefault();
      triggerRefs.current[openId]?.focus();
    } else if (!event.shiftKey && atEnd) {
      event.preventDefault();
      const next = navigation[sectionIndex(openId) + 1];
      const target = next ? triggerRefs.current[next.id] : ctaRef.current?.querySelector("a");
      setOpenId(null);
      target?.focus();
    }
  }

  function drillTo(level: string | null) {
    setMobileDirection(level ? 1 : -1);
    setMobileLevel(level);
  }

  const activeSectionId = navigation.find((s) => isItemActive(pathname, s))?.id ?? null;
  const pillId = hoverId ?? openId ?? activeSectionId;

  return (
    <MotionConfig reducedMotion="user">
      <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4 xl:px-6">
        {/* Dimlaag achter het geopende paneel — klik erop = sluiten. Binnen de header z'n
            stacking context (z-50), dus boven de pagina maar onder de shell. */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={closeAll}
              className="fixed inset-0 -z-10 bg-navy/30"
            />
          )}
        </AnimatePresence>

        <motion.div
          ref={shellRef}
          initial={false}
          animate={{ borderRadius: expanded ? RADIUS_OPEN : RADIUS_CLOSED }}
          transition={MORPH}
          onMouseEnter={() => window.clearTimeout(closeTimer.current)}
          onMouseLeave={() => !isTouch && scheduleClose()}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
              setOpenId(null);
              setHoverId(null);
            }
          }}
          className={`w-full overflow-hidden border bg-surface-brand transition-[border-color,box-shadow] duration-300 ease-out xl:max-w-6xl ${
            expanded
              ? "border-blue-hover shadow-[0_24px_60px_rgba(0,14,53,0.28)]"
              : surface === PILL_BG
                ? "border-blue-hover shadow-[0_8px_30px_rgba(0,14,53,0.16)]"
                : "border-transparent"
          }`}
        >
          <div className="flex items-center justify-between gap-4 py-3 pl-5 pr-4 xl:py-5 xl:pl-[30px] xl:pr-5">
            <Link
              href="/"
              onMouseEnter={() => !isTouch && (openPanel(null), setHoverId(null))}
              className="shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logos/lionitas-logo-header.svg" alt="Lionitas" className="h-[19px] w-auto xl:h-[26px]" />
            </Link>

            <nav aria-label="Hoofdmenu" className="hidden flex-1 items-center justify-center gap-1 xl:flex">
              {navigation.map((section) => {
                const hasChildren = section.children.length > 0;
                const isOpen = openId === section.id && hasChildren;
                const showPill = pillId === section.id;
                const className = `relative flex items-center gap-1 rounded-pill px-4 py-2 text-meta whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow ${
                  showPill ? "text-navy" : "text-on-dark"
                }`;
                const setRef = (el: HTMLElement | null) => {
                  triggerRefs.current[section.id] = el;
                };
                const onMouseEnter = () => {
                  if (isTouch) return;
                  setHoverId(section.id);
                  openPanel(hasChildren ? section.id : null);
                };
                const content = (
                  <>
                    {showPill && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-pill bg-cream"
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                      />
                    )}
                    <span className="relative z-10">{section.label}</span>
                    {hasChildren && (
                      <ChevronDown
                        aria-hidden
                        size={14}
                        strokeWidth={2}
                        className={`relative z-10 transition-transform duration-200 ease-out ${isOpen ? "rotate-180" : ""}`}
                      />
                    )}
                  </>
                );

                // Zonder submenu: gewone link (of, als het in WordPress "#" is, alleen tekst).
                if (!hasChildren) {
                  return section.href ? (
                    <Link
                      key={section.id}
                      ref={setRef}
                      href={section.href}
                      aria-current={pathname === section.href ? "page" : undefined}
                      onMouseEnter={onMouseEnter}
                      className={className}
                    >
                      {content}
                    </Link>
                  ) : (
                    <span key={section.id} onMouseEnter={onMouseEnter} className={className}>
                      {content}
                    </span>
                  );
                }

                // Met submenu én een eigen pagina (in WordPress een echte URL): de trigger is
                // een link. Muis: hover opent, klik navigeert. Touch: eerste tik opent het
                // paneel, tweede tik navigeert. Toetsenbord: Enter navigeert, ↓ opent.
                if (section.href) {
                  return (
                    <Link
                      key={section.id}
                      ref={setRef}
                      href={section.href}
                      aria-expanded={isOpen}
                      aria-controls="mega-panel"
                      aria-current={pathname === section.href ? "page" : undefined}
                      onMouseEnter={onMouseEnter}
                      onKeyDown={(event) => onTriggerKeyDown(event, section)}
                      onClick={(event) => {
                        if (isTouch && !isOpen) {
                          event.preventDefault();
                          openPanel(section.id);
                        }
                      }}
                      className={className}
                    >
                      {content}
                    </Link>
                  );
                }

                // Met submenu, niet klikbaar ("#"): disclosure-knop.
                return (
                  <button
                    key={section.id}
                    ref={setRef}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls="mega-panel"
                    onMouseEnter={onMouseEnter}
                    onKeyDown={(event) => onTriggerKeyDown(event, section)}
                    onClick={(event) => {
                      // Muisklik terwijl hover 'm al opende → open laten (anders klapt een
                      // klik het paneel dat net verscheen meteen dicht). Toetsenbord
                      // (detail 0) en touch togglen gewoon.
                      if (isOpen && !isTouch && event.detail > 0) return;
                      openPanel(isOpen ? null : section.id);
                    }}
                    className={className}
                  >
                    {content}
                  </button>
                );
              })}
            </nav>

            <div className="flex shrink-0 items-center gap-2">
              {/* Op mobiel/tablet staat de CTA onderin het uitgeklapte menu — naast de
                  hamburger in de balk zelf werd het te krap. */}
              <div
                ref={ctaRef}
                className="hidden xl:block"
                onMouseEnter={() => !isTouch && (openPanel(null), setHoverId(null))}
              >
                <PillLink href={HEADER_CTA.href} variant="yellow">
                  {HEADER_CTA.label}
                </PillLink>
              </div>

              <button
                type="button"
                onClick={() => (menuOpen ? closeAll() : (setMobileDirection(0), setMenuOpen(true)))}
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

          {/* Desktop mega-paneel — groeit uit de pill zelf. */}
          <div
            id="mega-panel"
            className="hidden xl:block"
            onKeyDown={onPanelKeyDown}
            onClick={(event) => (event.target as HTMLElement).closest("a") && closeAll()}
          >
            <MorphPanel
              open={Boolean(openSection)}
              panelKey={openSection?.id ?? "none"}
              direction={direction}
              innerClassName="mx-[30px] border-t border-white/15"
            >
              {openSection && <MegaMenu section={openSection} pathname={pathname} />}
            </MorphPanel>
          </div>

          {/* Mobiel/tablet — zelfde morph, met drill-down i.p.v. geneste lijsten. */}
          <div id="mobile-menu" className="xl:hidden">
            <MorphPanel
              open={menuOpen}
              panelKey={mobileLevel ?? "root"}
              direction={mobileDirection}
              innerClassName="mx-5 max-h-[calc(100dvh-7rem)] overflow-y-auto overscroll-contain border-t border-white/15"
            >
              <div data-lenis-prevent className="pb-5 pt-3">
                {mobileSection ? (
                  <MobileSection
                    section={mobileSection}
                    pathname={pathname}
                    onBack={() => drillTo(null)}
                    onNavigate={closeAll}
                  />
                ) : (
                  <MobileRoot navigation={navigation} pathname={pathname} onDrill={drillTo} onNavigate={closeAll} />
                )}
              </div>
            </MorphPanel>
          </div>
        </motion.div>
      </header>
    </MotionConfig>
  );
}

const mobileRowClass =
  "flex w-full items-center justify-between gap-4 rounded-sm py-3.5 text-left text-lg font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow";

function MobileRoot({
  navigation,
  pathname,
  onDrill,
  onNavigate,
}: {
  navigation: NavItem[];
  pathname: string;
  onDrill: (id: string) => void;
  onNavigate: () => void;
}) {
  return (
    <>
      <ul className="flex flex-col divide-y divide-white/10">
        {navigation.map((section) => {
          const color = `text-on-dark ${isItemActive(pathname, section) ? ACTIVE_LINK : "underline-offset-[6px] hover:underline"}`;
          return (
            <li key={section.id}>
              {section.children.length > 0 ? (
                <button type="button" onClick={() => onDrill(section.id)} className={`${mobileRowClass} ${color}`}>
                  {section.label}
                  <ChevronRight aria-hidden size={20} strokeWidth={2} className="shrink-0" />
                </button>
              ) : (
                <NavAnchor
                  link={section}
                  active={pathname === section.href}
                  onNavigate={onNavigate}
                  className={`${mobileRowClass} ${color}`}
                >
                  {section.label}
                </NavAnchor>
              )}
            </li>
          );
        })}
      </ul>
      <div className="mt-4 border-t border-white/10 pt-5">
        <PillLink href={HEADER_CTA.href} variant="yellow" onClick={onNavigate}>
          {HEADER_CTA.label}
        </PillLink>
      </div>
    </>
  );
}

function MobileSection({
  section,
  pathname,
  onBack,
  onNavigate,
}: {
  section: NavItem;
  pathname: string;
  onBack: () => void;
  onNavigate: () => void;
}) {
  const linkClass =
    "-mx-3 block rounded-panel px-3 py-2.5 transition-colors focus-visible:outline-2 focus-visible:outline-yellow";

  return (
    <>
      <button
        type="button"
        onClick={onBack}
        className="-ml-1 flex items-center gap-1 rounded-pill py-2 pr-3 text-meta text-on-dark underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-yellow"
      >
        <ChevronLeft aria-hidden size={18} strokeWidth={2} />
        Terug
      </button>
      {/* Klikbaar hoofditem (echte URL in WordPress) → de kop zelf linkt naar die pagina. */}
      <NavAnchor
        link={section}
        active={pathname === section.href}
        onNavigate={onNavigate}
        className="mt-2 block rounded-sm text-on-dark focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow"
      >
        <span className="h4 text-current">{section.label}</span>
      </NavAnchor>
      <ul className="mt-3 flex flex-col">
        {section.children.map((child) => {
          const active = pathname === child.href;
          return (
            <li key={child.id}>
              <NavAnchor
                link={child}
                active={active}
                onNavigate={onNavigate}
                className={`${linkClass} ${child.href ? "hover:bg-blue-hover" : ""}`}
              >
                <span className={`flex items-center gap-1.5 text-label text-on-dark ${active ? ACTIVE_LINK : ""}`}>
                  {child.label}
                  {child.external && (
                    <ArrowUpRight aria-hidden size={15} strokeWidth={2} className="text-on-dark" />
                  )}
                </span>
                {child.description && (
                  <span className="mt-0.5 block text-meta text-on-dark">{child.description}</span>
                )}
              </NavAnchor>
              {child.children.length > 0 && (
                <ul className="mb-1 flex flex-col border-l border-white/15 pl-3">
                  {child.children.map((grandchild) => (
                    <li key={grandchild.id}>
                      <NavAnchor
                        link={grandchild}
                        active={pathname === grandchild.href}
                        onNavigate={onNavigate}
                        className={`block rounded-sm py-1.5 text-meta text-on-dark underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-yellow ${
                          pathname === grandchild.href ? ACTIVE_LINK : ""
                        }`}
                      >
                        {grandchild.label}
                      </NavAnchor>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}
