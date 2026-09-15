"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import PillLink from "@/components/PillLink";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Over Lionitas", href: "/over-lionitas" },
  { label: "Actueel", href: "/actueel" },
  { label: "Trainingen", href: "/trainingen" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  const desktopDark = scrolled;

  const renderNavLink = (link: (typeof NAV_LINKS)[number], mobile = false) => {
    const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
    return (
      <Link
        key={link.href}
        href={link.href}
        aria-current={isActive ? "page" : undefined}
        onClick={mobile ? () => setMenuOpen(false) : undefined}
        className={`rounded-sm transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow ${
          mobile ? "block py-3 text-lg" : "whitespace-nowrap text-body"
        } ${isActive ? "font-semibold text-yellow" : "font-medium text-white hover:text-yellow"}`}
      >
        {link.label}
      </Link>
    );
  };

  return (
    <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-6">
      <div className="w-full xl:w-auto">
        <div
          className={`flex items-center justify-between gap-4 rounded-[40px] bg-navy py-5 pl-[30px] pr-5 shadow-lg shadow-black/25 transition-all duration-300 ease-out xl:gap-[242px] xl:rounded-pill ${
            desktopDark ? "xl:bg-navy xl:shadow-lg xl:shadow-black/25" : "xl:bg-transparent xl:shadow-none"
          }`}
        >
          <Link
            href="/"
            className="shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logos/lionitas-logo-header.svg" alt="Lionitas" className="h-[26px] w-auto" />
          </Link>

          <div className="hidden items-center gap-16 xl:flex">
            <nav className="flex items-center gap-8">{NAV_LINKS.map((link) => renderNavLink(link))}</nav>
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
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-yellow transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy xl:hidden"
          >
            <span className="relative flex h-[14px] w-5 flex-col justify-between">
              <span
                className={`h-0.5 w-full origin-center rounded-full bg-navy transition-transform duration-300 ${
                  menuOpen ? "translate-y-[6px] rotate-45" : ""
                }`}
              />
              <span
                className={`h-0.5 w-full rounded-full bg-navy transition-opacity duration-200 ${
                  menuOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`h-0.5 w-full origin-center rounded-full bg-navy transition-transform duration-300 ${
                  menuOpen ? "-translate-y-[6px] -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>

        <div
          id="mobile-menu"
          className={`overflow-hidden transition-all duration-300 ease-out xl:hidden ${
            menuOpen ? "mt-3 max-h-[80vh] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="rounded-media bg-navy px-6 py-6 shadow-lg shadow-black/25">
            <nav className="flex flex-col divide-y divide-white/10">
              {NAV_LINKS.map((link) => renderNavLink(link, true))}
            </nav>
            <PillLink href="/lid-worden" variant="yellow" className="mt-6 w-full justify-center" onClick={() => setMenuOpen(false)}>
              Lid worden
            </PillLink>
          </div>
        </div>
      </div>
    </header>
  );
}
