import Link from "next/link";
import Container from "@/components/Container";
import PillLink from "@/components/PillLink";
import { getSiteSettings } from "@/lib/wordpress";

const SNEL_NAAR = [
  { label: "Over Lionitas", href: "/over-lionitas" },
  { label: "Actueel", href: "/actueel" },
  { label: "Club klassement", href: "/club-klassement" },
  { label: "Vrijwilligers", href: "/vrijwilligers" },
  { label: "Contact", href: "/contact" },
];

const TRAININGEN = [
  { label: "Atletiek", href: "/trainingen/atletiek" },
  { label: "Jeugd", href: "/trainingen/jeugd" },
  { label: "Loopgroepen", href: "/trainingen/loopgroepen" },
  { label: "Wedstrijdgroepen", href: "/trainingen/wedstrijdgroepen" },
];

const LEGAL = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/voorwaarden" },
  { label: "Cookies Settings", href: "/cookies" },
];

const SOCIAL_ICONS = {
  facebook:
    "M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.628-5.373-12.001-12-12.001S0 5.417 0 12.044c0 5.628 3.874 10.35 9.101 11.647Z",
  instagram:
    "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069ZM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0Zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881Z",
  linkedin:
    "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065Zm1.782 13.019H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0Z",
};

function SocialIcon({ href, label, path }: { href: string; label: string; path: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="text-accent transition hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d={path} />
      </svg>
    </a>
  );
}

export default async function Footer() {
  const settings = await getSiteSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden rounded-t-section bg-surface-brand text-on-dark">
      {/* Grote merknaam als watermerk: staat achter de content, komt tot achter de
          credits-regel en wordt onderaan door de footer afgesneden. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/decorative/lionitas-wordmark.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/2 z-0 w-[94%] max-w-[1820px] -translate-x-1/2 translate-y-[5%] select-none opacity-[0.22]"
      />

      <Container className="relative z-10 pt-16 pb-32 sm:pt-20 sm:pb-40">
        <div className="flex flex-col gap-14 lg:flex-row lg:items-start lg:justify-between lg:gap-24">
          {/* Logo + CTA */}
          <div className="shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logos/lionitas-logo-footer.svg"
              alt="Lionitas"
              className="h-[68px] w-auto sm:h-[84px]"
            />
            <PillLink href="/lid-worden" variant="outline-white" className="mt-6">
              Lid worden
            </PillLink>
          </div>

          {/* Kolommen — rechts uitgelijnd, logo blijft links */}
          <div className="flex flex-col gap-10 min-[560px]:flex-row min-[560px]:gap-x-14 lg:gap-x-20 xl:gap-x-28">
            <div>
              <h2 className="text-label">Lionitas</h2>
              <address className="mt-4 flex flex-col gap-4 not-italic text-body">
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(settings.contact.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-4 hover:text-accent"
                >
                  {settings.contact.address}
                </a>
                <span className="flex flex-col gap-1 text-accent">
                  <a href={`mailto:${settings.contact.email}`} className="hover:underline">
                    {settings.contact.email}
                  </a>
                  <a href={`tel:${settings.contact.phone.replace(/\s/g, "")}`} className="hover:underline">
                    {settings.contact.phone}
                  </a>
                </span>
              </address>
            </div>

            <div>
              <h2 className="text-label">Snel naar</h2>
              <ul className="mt-4 flex flex-col gap-3 text-body">
                {SNEL_NAAR.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="hover:text-accent">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-label">Trainingen</h2>
              <ul className="mt-4 flex flex-col gap-3 text-body">
                {TRAININGEN.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="hover:text-accent">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Divider + credits */}
        <div className="mt-14 border-t border-accent/60 pt-6 sm:mt-16">
          <div className="flex flex-col gap-6 text-meta sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-8">
              <p>© {year} Lionitas. Alle rechten voorbehouden.</p>
              <div className="flex flex-wrap gap-x-8 gap-y-2">
                {LEGAL.map((link) => (
                  <Link key={link.href} href={link.href} className="underline underline-offset-4 hover:text-accent">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex gap-4">
              {settings.social.facebookUrl && (
                <SocialIcon href={settings.social.facebookUrl} label="Facebook" path={SOCIAL_ICONS.facebook} />
              )}
              {settings.social.instagramUrl && (
                <SocialIcon href={settings.social.instagramUrl} label="Instagram" path={SOCIAL_ICONS.instagram} />
              )}
              {settings.social.linkedinUrl && (
                <SocialIcon href={settings.social.linkedinUrl} label="LinkedIn" path={SOCIAL_ICONS.linkedin} />
              )}
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
