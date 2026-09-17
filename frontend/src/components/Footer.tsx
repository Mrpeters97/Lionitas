import Link from "next/link";
import Container from "@/components/Container";
import PillLink from "@/components/PillLink";
import WordmarkReveal from "@/components/WordmarkReveal";
import { getSiteSettings } from "@/lib/wordpress";

// Inline (i.p.v. <img src=".../decorative/lionitas-wordmark.svg">) zodat de fill-kleur
// stuurbaar is via een Tailwind-klasse — nodig voor de subtiele "iets lichter dan de
// achtergrond"-tint hieronder. preserveAspectRatio bewust NIET "none": moet z'n eigen
// verhouding behouden, niet uitrekken naar het paneel.
function LionitasWordmark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 1827.57 296.004" fill="none" aria-hidden className={className}>
      <path d="M1750.5 93.9819C1751.35 84.6966 1749.08 77.4278 1743.68 72.1755C1738.29 66.8294 1729.2 64.1564 1716.42 64.1564C1708.27 64.1564 1701.46 65.0943 1695.97 66.9701C1690.57 68.8459 1686.36 71.4252 1683.33 74.7079C1680.39 77.9905 1678.55 81.7891 1677.79 86.1034C1676.94 89.4799 1676.98 92.575 1677.93 95.3887C1678.97 98.1087 1680.91 100.594 1683.75 102.845C1686.69 105.096 1690.52 107.113 1695.26 108.895C1700.09 110.677 1705.81 112.271 1712.44 113.678L1735.16 118.743C1750.69 122.119 1763.71 126.574 1774.22 132.108C1784.82 137.548 1793.15 144.019 1799.21 151.523C1805.27 159.026 1809.25 167.42 1811.14 176.705C1813.13 185.991 1813.17 196.12 1811.28 207.094C1808.06 226.039 1800.63 242.078 1788.99 255.208C1777.34 268.339 1762.14 278.328 1743.4 285.175C1724.65 292.021 1702.97 295.445 1678.36 295.445C1653.17 295.445 1631.78 291.74 1614.17 284.33C1596.65 276.827 1583.97 265.385 1576.11 250.003C1568.34 234.527 1566.45 214.784 1570.43 190.774H1645.41C1644.27 199.59 1645.22 207 1648.25 213.002C1651.28 219.005 1656.16 223.554 1662.88 226.649C1669.6 229.744 1677.98 231.292 1688.01 231.292C1696.53 231.292 1703.82 230.26 1709.88 228.197C1715.94 226.133 1720.72 223.273 1724.23 219.615C1727.73 215.957 1729.86 211.783 1730.62 207.094C1731.38 202.779 1730.62 198.934 1728.35 195.557C1726.07 192.181 1721.95 189.133 1715.99 186.413C1710.03 183.693 1701.84 181.207 1691.42 178.956L1663.59 172.766C1638.88 167.139 1620.23 157.853 1607.63 144.91C1595.04 131.967 1590.59 114.241 1594.29 91.7309C1597.32 73.3479 1604.94 57.3096 1617.15 43.6162C1629.46 29.8289 1645.08 19.1368 1664.01 11.5397C1683.04 3.84885 1704.11 0.00341797 1727.21 0.00341797C1750.69 0.00341797 1770.33 3.89574 1786.14 11.6804C1802.05 19.465 1813.46 30.3917 1820.37 44.4603C1827.38 58.5289 1829.27 75.0361 1826.05 93.9819H1750.5Z" fill="currentColor" />
      <path d="M1337.34 292.067H1252.13L1396.42 3.94092H1504.35L1552.06 292.067H1466.86L1438.45 83.288H1436.18L1337.34 292.067ZM1340.75 178.392H1500.94L1490.71 236.917H1330.52L1340.75 178.392Z" fill="currentColor" />
      <path d="M1061.5 66.9684L1072.29 3.94092H1325.07L1314.28 66.9684H1226.8L1189.31 292.067H1111.49L1148.98 66.9684H1061.5Z" fill="currentColor" />
      <path d="M1047.38 3.94092L999.1 292.067H920.141L968.425 3.94092H1047.38Z" fill="currentColor" />
      <path d="M939.062 3.94092L890.778 292.067H824.884L745.357 140.688H743.653L718.091 292.067H639.131L687.416 3.94092H754.446L832.837 154.757H835.109L860.103 3.94092H939.062Z" fill="currentColor" />
      <path d="M633.896 153.067C628.594 184.393 618.085 210.654 602.369 231.851C586.653 253.048 567.575 269.039 545.137 279.825C522.699 290.611 498.699 296.004 473.137 296.004C445.871 296.004 422.202 290.142 402.131 278.418C382.059 266.694 367.432 249.531 358.249 226.927C349.065 204.323 347.219 176.702 352.71 144.063C357.823 112.737 368.237 86.3814 383.953 64.9971C399.669 43.6128 418.841 27.4338 441.468 16.4603C464.096 5.48677 488.285 0 514.037 0C541.114 0 564.641 5.90882 584.617 17.7265C604.688 29.5441 619.268 46.8485 628.357 69.6397C637.541 92.4309 639.387 120.24 633.896 153.067ZM554.368 144.063C557.019 127.556 557.209 113.675 554.936 102.42C552.664 91.0709 547.883 82.536 540.593 76.8147C533.303 70.9997 523.504 68.0922 511.196 68.0922C497.184 68.0922 484.782 71.4686 473.989 78.2216C463.196 84.9745 454.249 94.6819 447.149 107.344C440.048 120.005 435.078 135.246 432.237 153.067C429.208 169.761 428.924 183.642 431.385 194.71C433.941 205.777 438.959 214.078 446.439 219.611C454.013 225.145 463.859 227.912 475.977 227.912C489.8 227.912 502.013 224.629 512.617 218.064C523.315 211.498 532.167 201.979 539.173 189.504C546.274 177.03 551.339 161.883 554.368 144.063Z" fill="currentColor" />
      <path d="M347.718 3.94092L299.433 292.067H220.474L268.758 3.94092H347.718Z" fill="currentColor" />
      <path d="M0 292.067L48.2843 3.94096H127.243L89.7521 229.039H207.339L196.546 292.067H0Z" fill="currentColor" />
    </svg>
  );
}

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

function CreditsRow({
  year,
  social,
  className = "",
}: {
  year: number;
  social: { facebookUrl: string | null; instagramUrl: string | null; linkedinUrl: string | null };
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-6 text-meta sm:flex-row sm:items-center sm:justify-between ${className}`.trim()}>
      <p>© {year} Lionitas. Alle rechten voorbehouden.</p>
      {/* Los van de copyright-tekst, helemaal rechts uitgelijnd. */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
        <div className="flex flex-wrap gap-x-8 gap-y-2 sm:justify-end">
          {LEGAL.map((link) => (
            <Link key={link.href} href={link.href} className="underline underline-offset-4 hover:text-accent">
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex gap-4">
          {social.facebookUrl && (
            <SocialIcon href={social.facebookUrl} label="Facebook" path={SOCIAL_ICONS.facebook} />
          )}
          {social.instagramUrl && (
            <SocialIcon href={social.instagramUrl} label="Instagram" path={SOCIAL_ICONS.instagram} />
          )}
          {social.linkedinUrl && (
            <SocialIcon href={social.linkedinUrl} label="LinkedIn" path={SOCIAL_ICONS.linkedin} />
          )}
        </div>
      </div>
    </div>
  );
}

export default async function Footer() {
  const settings = await getSiteSettings();
  const year = new Date().getFullYear();

  return (
    <>
      {/* Trekt omhoog over de vorige sectie heen (zelfde `connect`-overlap-truc als
          Section.tsx elders op de pagina gebruikt): de afgeronde bovenkant "landt" zo
          over de content erboven i.p.v. dat de content wegschuift om de footer te tonen.
          `data-surface="brand"` laat de Header (die dit overal op de pagina peilt, zie
          Header.tsx) herkennen dat de pill hier op dezelfde blauwe kleur als zichzelf
          staat, en dus weer de camouflage-schaduw/rand krijgt — net als in de hero. */}
      <footer
        data-surface="brand"
        className="relative z-10 overflow-hidden bg-surface-brand text-on-dark"
        style={{
          // Vloeiend kleiner op smalle viewports (50px oogde daar te fors) — dezelfde
          // clamp() stuurt zowel de zichtbare ronding als de overlap-marge, dus die
          // blijven altijd exact gelijk en de naad blijft naadloos.
          borderTopLeftRadius: "clamp(20px, 6vw, 50px)",
          borderTopRightRadius: "clamp(20px, 6vw, 50px)",
          marginTop: "calc(clamp(20px, 6vw, 50px) * -1)",
        }}
      >
        <Container className="relative z-10 pt-16 pb-10 sm:pt-20 sm:pb-16 xl:pb-40">
        <div className="flex flex-col gap-14 lg:flex-row lg:items-start lg:justify-between lg:gap-24">
          {/* Logo + CTA — gecentreerd op mobiel/tablet, links uitgelijnd vanaf lg
              (waar het naast de kolommen komt te staan). */}
          <div className="flex shrink-0 flex-col items-center text-center lg:items-start lg:text-left">
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

          {/* Kolommen — rechts uitgelijnd, logo blijft links. Alleen op mobiel (onder
              de min-[560px]-omslag naar naast-elkaar) een lijntje tussen de rijen,
              zelfde stijl als de divider helemaal onderaan. `divide-y` plaatst de rand
              zelf tegen de bovenkant van het volgende blok — vandaar expliciet pt-6/pb-6
              rondom elke rand (i.p.v. de flex-`gap`, die de rand juist uit het midden
              zou duwen) zodat er evenveel ruimte boven én onder elke lijn staat. */}
          <div className="flex flex-col max-[559px]:divide-y max-[559px]:divide-accent/60 max-[559px]:[&>*+*]:pt-6 max-[559px]:[&>*:not(:last-child)]:pb-6 min-[560px]:flex-row min-[560px]:gap-10 min-[560px]:gap-x-14 lg:gap-x-20 xl:gap-x-28">
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

        {/* Divider + credits — vanaf xl verhuist deze naar onder het woordmerk
            hieronder (zoals het voorbeeld), dus hier alleen op mobiel/tablet. */}
        <div className="mt-14 border-t border-accent/60 pt-6 sm:mt-16 xl:hidden">
          <CreditsRow year={year} social={settings.social} />
        </div>
        </Container>
      </footer>

      {/* Grote, volledig leesbare merknaam. Geen afgeronde hoek — dit paneel staat
          `position: fixed` (zie WordmarkReveal) en komt vanaf onderaf tevoorschijn
          terwijl de footer hierboven wegscrolt, net als het voorbeeld. De letters
          krijgen een navy die net iets lichter is dan de eigen achtergrond (zelfde
          subtiele "tint-op-tint"-aanpak als het voorbeeld met hun achtergrondkleur
          deed) i.p.v. wit. Alleen vanaf xl: op mobiel/tablet is hier geen ruimte voor
          en eindigt de footer hierboven gewoon de pagina (met de credits erin). */}
      <WordmarkReveal>
        <div data-surface="dark" className="relative hidden bg-surface-dark pt-20 pb-6 xl:block xl:pt-28 xl:pb-8">
          <Container className="flex flex-col items-center">
            <LionitasWordmark className="w-full max-w-[1600px] select-none text-navy-hover" />
            <div className="mt-14 w-full border-t border-accent/60 pt-6">
              <CreditsRow year={year} social={settings.social} className="text-on-dark" />
            </div>
          </Container>
        </div>
      </WordmarkReveal>
    </>
  );
}
