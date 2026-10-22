"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, type Transition, type Variants } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { NavItem } from "@/lib/navigation";

// Gedeelde "morph"-beweging voor de header: de blauwe pill vouwt open tot paneel.
// Dezelfde spring stuurt de hoogte (MorphPanel) en de radius (Header), zodat ze
// als één vorm bewegen.
export const MORPH: Transition = { type: "spring", stiffness: 380, damping: 38, mass: 0.9 };

// Richtingbewust: naar een sectie rechts van de huidige → inhoud schuift van rechts
// in (en de oude naar links uit), en andersom. `0` = eerste keer openen.
const SLIDE: Variants = {
  enter: (direction: number) => ({ opacity: 0, x: direction * 48, y: direction === 0 ? -6 : 0 }),
  center: { opacity: 1, x: 0, y: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction * -48 }),
};

/**
 * Paneel dat in hoogte "morpht" naar z'n inhoud. Wisselt `panelKey`, dan schuift
 * de oude inhoud weg terwijl de nieuwe binnenkomt (popLayout: de uitgaande laag gaat
 * absolute, dus de gemeten hoogte is direct die van de nieuwe inhoud).
 */
export function MorphPanel({
  open,
  panelKey,
  direction,
  className = "",
  innerClassName = "",
  children,
}: {
  open: boolean;
  panelKey: string;
  direction: number;
  className?: string;
  innerClassName?: string;
  children: React.ReactNode;
}) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setHeight(entry.borderBoxSize[0]?.blockSize ?? el.offsetHeight));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      className={`overflow-hidden ${className}`}
      initial={false}
      animate={{ height: open ? height : 0 }}
      transition={MORPH}
    >
      <div ref={innerRef} className={`relative ${innerClassName}`}>
        <AnimatePresence initial={false} mode="popLayout" custom={direction}>
          {open && (
            <motion.div
              key={panelKey}
              custom={direction}
              variants={SLIDE}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ ...MORPH, opacity: { duration: 0.2 } }}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// Contrast op blauw (#0a71b4, zie WCAG-notitie in CLAUDE.md): alle tekst is wit
// (5.2:1) — wit 75% (3.6:1) en geel (4.3:1) halen de 4.5:1 voor normale tekst niet.
// Hover-tegels worden dónkerder (blue-hover: wit 6.7:1), niet lichter. Actief = wit
// met gele onderstreping; die streep is geen tekst, dus 3:1 volstaat.
export const ACTIVE_LINK = "underline decoration-yellow decoration-2 underline-offset-[6px]";

/** Desktop-inhoud van één hoofditem: titel + omschrijving links, subpagina's in twee kolommen rechts. */
export default function MegaMenu({ section, pathname }: { section: NavItem; pathname: string }) {
  return (
    <div data-panel={section.id} className="grid grid-cols-[minmax(0,17rem)_1fr] gap-10 pb-8 pt-6">
      <div>
        {section.href ? (
          <Link
            href={section.href}
            className="group inline-flex items-center gap-2 rounded-sm text-on-dark transition-colors hover:text-yellow focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow"
          >
            <span className="h4 text-current">{section.label}</span>
            <ArrowRight
              aria-hidden
              size={20}
              strokeWidth={2.25}
              className="shrink-0 text-yellow transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
            />
          </Link>
        ) : (
          <p className="h4 text-on-dark">{section.label}</p>
        )}
        {section.description && <p className="mt-3 text-body text-on-dark">{section.description}</p>}
      </div>
      <ul className="grid grid-cols-2 content-start gap-1">
        {section.children.map((child) => (
          <li key={child.id}>
            <MegaLink link={child} active={pathname === child.href} />
            {child.children.length > 0 && (
              <ul className="-mt-1 mb-2 flex flex-col pl-4">
                {child.children.map((grandchild) => (
                  <li key={grandchild.id}>
                    <NavAnchor
                      link={grandchild}
                      active={pathname === grandchild.href}
                      className={`block rounded-sm px-4 py-1.5 text-meta text-on-dark underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-yellow ${
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
        ))}
      </ul>
    </div>
  );
}

/**
 * Link naar een menu-item: `next/link` intern, `<a target=_blank>` extern, en een
 * gewone `<span>` als het item in WordPress niet klikbaar is ("#").
 */
export function NavAnchor({
  link,
  className,
  active = false,
  onNavigate,
  children,
}: {
  link: NavItem;
  className: string;
  active?: boolean;
  onNavigate?: () => void;
  children: React.ReactNode;
}) {
  if (!link.href) return <span className={className}>{children}</span>;
  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
        <span className="sr-only">(opent in een nieuw tabblad)</span>
      </a>
    );
  }
  return (
    <Link href={link.href} onClick={onNavigate} aria-current={active ? "page" : undefined} className={className}>
      {children}
    </Link>
  );
}

function MegaLink({ link, active }: { link: NavItem; active: boolean }) {
  return (
    <NavAnchor
      link={link}
      active={active}
      className={`group flex items-start gap-3 rounded-panel px-4 py-3 transition-colors focus-visible:bg-blue-hover focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-yellow ${
        link.href ? "hover:bg-blue-hover" : ""
      }`}
    >
      <span className="flex-1">
        <span className={`flex items-center gap-1.5 text-label text-on-dark ${active ? ACTIVE_LINK : ""}`}>
          {link.label}
          {link.external && <ArrowUpRight aria-hidden size={15} strokeWidth={2} className="text-on-dark" />}
        </span>
        {link.description && <span className="mt-0.5 block text-meta text-on-dark">{link.description}</span>}
      </span>
      {link.href && !link.external && (
        <ArrowRight
          aria-hidden
          size={16}
          strokeWidth={2}
          className="mt-1 shrink-0 -translate-x-1 text-yellow opacity-0 transition duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 motion-reduce:transition-none"
        />
      )}
    </NavAnchor>
  );
}
