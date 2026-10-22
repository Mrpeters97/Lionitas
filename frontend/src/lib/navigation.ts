// Navigatie-types + helpers. De structuur zelf komt uit WordPress (Weergave → Menu's,
// locatie "Primary", zie `getNavigation()` in wordpress.ts). `FALLBACK_NAVIGATION`
// wordt alleen gebruikt als daar geen menu hangt of WordPress onbereikbaar is.
//
// Conventies in WordPress:
// - Hoofditem met een echte URL/pagina = klikbaar; met "#" = alleen een uitklapper.
// - De "Beschrijving" van een menu-item (Scherminstellingen → Beschrijving aanvinken)
//   verschijnt als ondertitel in het mega menu en op de overzichtspagina's.
// - "Link openen in nieuw tabblad" of een link naar een ander domein = externe link.

export interface NavItem {
  id: string;
  label: string;
  /** null = niet klikbaar (in WordPress: URL "#"). */
  href: string | null;
  description: string | null;
  external: boolean;
  children: NavItem[];
}

const item = (
  label: string,
  href: string | null,
  description: string | null = null,
  children: NavItem[] = [],
  external = false,
): NavItem => ({ id: href ?? label, label, href, description, external, children });

export const FALLBACK_NAVIGATION: NavItem[] = [
  item("Over Lionitas", "/over-lionitas", "Wie we zijn, hoe de club georganiseerd is en waar we trainen.", [
    item("Wie zijn wij", "/over-lionitas/wie-zijn-wij", "De club, onze geschiedenis en waar we voor staan"),
    item("Veilig sporten", "/over-lionitas/veilig-sporten", "Een veilige en prettige club voor iedereen"),
    item("Clubrecords", "/over-lionitas/clubrecords", "Alle records, van pupil tot master"),
    item("Bestuur & Commissies", "/over-lionitas/bestuur-en-commissies", "Het bestuur en de commissies van de club"),
    item("Vrijwilligers", "/over-lionitas/vrijwilligers", "Zonder vrijwilligers geen club — doe je mee?"),
    item("Ereleden", "/over-lionitas/ereleden", "Leden die veel voor de club hebben betekend"),
    item("Clubtenue webshop", "https://lionitas.clubwereld.nl", "Bestel het Lionitas-clubtenue", [], true),
    item("Atletiekbaan & faciliteiten", "/over-lionitas/atletiekbaan-en-faciliteiten", "Onze baan, de accommodatie en de route"),
  ]),
  item("Actueel", "/actueel", "Nieuws, wedstrijden en uitslagen van de club.", [
    item("Nieuws", "/actueel/nieuws", "Het laatste nieuws van de club"),
    item("Agenda", "/actueel/agenda", "Wedstrijden en clubactiviteiten"),
    item("Uitslagen", "/actueel/uitslagen", "Resultaten van onze atleten"),
    item("Foto's", "/actueel/fotos", "Fotoalbums van wedstrijden en evenementen"),
    item("Nieuwsbrieven", "/actueel/nieuwsbrieven", "Lees de nieuwsbrieven terug"),
  ]),
  item("Trainingen", "/trainingen", "Voor elke leeftijd en elk niveau een groep die bij je past.", [
    item("Jeugdtrainingen", "/trainingen/jeugd", "Voor pupillen en junioren"),
    item("Volwassenen", "/trainingen/volwassenen", "Baan, weg en loopgroepen"),
    item("Frame running", "/trainingen/frame-running", "Hardlopen met een loopframe"),
    item("Clinics", "/trainingen/clinics", "Losse clinics en workshops"),
    item("Trainingsrooster", "/trainingen/trainingsrooster", "Alle trainingstijden op een rij"),
    item("Informatie & Tarieven", "/trainingen/informatie-en-tarieven", "Contributie, inschrijven en wat je kunt verwachten"),
    item("Proeftraining", "/trainingen/proeftraining", "Kom vrijblijvend een keer meetrainen"),
  ]),
  item("Contact", "/contact", "Vragen? Neem contact op met de club."),
];

/** Primaire CTA in de header: direct naar het aanmeldformulier (staat daarom niet nog eens in het menu). */
export const HEADER_CTA = { label: "Lid worden", href: "/lid-worden" };

export function isActivePath(pathname: string, href: string | null) {
  if (!href || href === "/") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Actief als het item zelf of één van z'n (klein)kinderen de huidige pagina is. */
export function isItemActive(pathname: string, navItem: NavItem): boolean {
  return (
    (!navItem.external && isActivePath(pathname, navItem.href)) ||
    navItem.children.some((child) => isItemActive(pathname, child))
  );
}

/** Pad van hoofditem tot de pagina met dit `href` (voor breadcrumbs), of null. */
export function findTrail(navigation: NavItem[], href: string): NavItem[] | null {
  for (const navItem of navigation) {
    if (!navItem.external && navItem.href === href) return [navItem];
    const trail = findTrail(navItem.children, href);
    if (trail) return [navItem, ...trail];
  }
  return null;
}

/** Alle interne, klikbare paden in de navigatie. */
export function allNavPaths(navigation: NavItem[]): string[] {
  return navigation.flatMap((navItem) => [
    ...(navItem.href && !navItem.external && navItem.href !== "/" ? [navItem.href] : []),
    ...allNavPaths(navItem.children),
  ]);
}
