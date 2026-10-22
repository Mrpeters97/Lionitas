# Lionitas

Website voor atletiekvereniging Lionitas (Leeuwarden). Headless WordPress als CMS, Next.js als frontend.

## Stack

- **Frontend**: Next.js 16 (App Router, TypeScript, Tailwind CSS) in `frontend/`
- **CMS**: WordPress op InstaWP (`lionitas.instawp.site`), headless via WPGraphQL
- **Content**: ACF (gratis versie — geen Repeater/Flexible Content/Gallery/Options Pages) op vaste pagina's:
  - "Home" (front page) — homepage content, veldgroep `homeContent`
  - "Site-instellingen" — contact/social, veldgroep `siteSettings`
  - Export: `wordpress/acf-lionitas-fields.json` (importeren via ACF → Tools → Import)
- Client mag alleen **content bewerken**, niet de layout/structuur — vandaar vaste velden i.p.v. flexibele page-builder.

## Design bron

- Figma: https://www.figma.com/design/mLH5E83qKoNcPvQXoueMOl (file key `mLH5E83qKoNcPvQXoueMOl`), Home-pagina = node `39:181`.
- **Vervangt** het oude bestand `EYnY2uviXEo12King3OsnY/Webdesign` (node `4:782`) — dat niet meer gebruiken.
- Alleen de Home-pagina is ontworpen. Nav verwijst ook naar Over Lionitas, Actueel, Trainingen, Contact — nog te ontwerpen; bouw die op ditzelfde tokensysteem.

## Design tokens

Alle tokens staan in **`frontend/src/app/globals.css`** als Tailwind v4 `@theme`-variabelen — dat bestand is de bron van waarheid. Gebruik ze via de gegenereerde utilities (`bg-surface-dark`, `text-h1`, `rounded-card`, `max-w-page`) en de kop-classes (`.h1`–`.h3`, `.display`, `.eyebrow`). Geen losse hex-waarden of `text-3xl sm:… lg:…`-ladders in componenten.

Twee lagen:
- **Primitieven** = ruwe merkwaarden (`--color-navy`, `--color-yellow`, …).
- **Semantische aliassen** = rol-tokens die naar primitieven verwijzen (`--color-surface-dark` → navy). **Gebruik in de UI bij voorkeur de semantische tokens**, zodat herkleuren op één plek gebeurt.

### Kleuren

**Primitieven** (exacte hex uit Figma-variabelen):

| Token | Hex | | Token | Hex |
|---|---|---|---|---|
| `--color-navy` | `#000e35` | | `--color-cream` | `#faf0e0` |
| `--color-blue` | `#0a71b4` | | `--color-ink` | `#101010` |
| `--color-yellow` | `#ffed00` | | `--color-page` | `#f6f6f6` |
| `--color-navy-hover` | `#263253` | | `--color-blue-hover` | `#096099` |
| `--color-yellow-hover` | `#d9c900` | | (wit) | Tailwind `white` = `#ffffff` |

De `-hover`-tinten zijn **solide** varianten (geen opacity) voor knop-hover, zie `PillLink.tsx`.

**Semantische aliassen** (dit gebruik je in markup):

| Token | → | Rol |
|---|---|---|
| `--color-background` | page | Basis pagina-achtergrond (= `body`) |
| `--color-foreground` | ink | Body-tekst op lichte achtergrond |
| `--color-surface` | `#ffffff` | Verhoogd kaart/paneel op licht (Actueel-tekstpaneel, FAQ-kaart) |
| `--color-surface-dark` | navy | Hero, header, footer |
| `--color-surface-brand` | blue | "Atletiek en hardlopen"-sectie, blauwe pills |
| `--color-surface-soft` | cream | Cream secties (Trainingen → bovenkant Actueel) |
| `--color-accent` | yellow | Primaire knoppen, pijl-glyph |
| `--color-heading` | navy | Koppen op lichte achtergrond |
| `--color-on-dark` | `#ffffff` | Tekst op donkere surfaces |
| `--color-on-dark-muted` | wit @ 75% | Gedimde tekst op donker (vervangt de oude `text-white/60–85`) |
| `--color-on-light-muted` | ink @ 65% | Gedimde tekst op licht |
| `--color-danger` | red `#c42b1c` | Foutmeldingen + rand van ongeldige formuliervelden |

> **Let op:** het Figma-bestand heeft dubbele/inconsistente kleurvariabelen — Engelse namen ("White" = `#faf0e0` = eigenlijk cream) naast Nederlandse ("Blauw" `#28338c` = ongebruikt, "Zwart " `#1e1e1e` = alleen FAQ-vraagtekst, genormaliseerd naar `#101010`). De hierboven staande zijn de kleuren die echt gebruikt worden — "Blue" (`#0a71b4`) is een echte derde merkkleur, geen duplicaat. Duplicaten opschonen in Figma zou helpen.

### Typografie

- Lettertype: **General Sans Variable** (Fontshare), variabele as 200–700. Gewired via `frontend/src/fonts/general-sans.ts` (`next/font/local`, `--font-general-sans` → Tailwind `font-sans`). Geen 800/900 beschikbaar — "Bold" = 700.
- Kop-tokens zijn **responsief** (`clamp()` mobiel → desktop). Kop-classes `.display/.h1/.h2/.h3/.h4` bevatten `font-bold italic uppercase` + kleur (default = op licht); op een donkere sectie voeg je `text-on-dark` toe. `.eyebrow` = accent-geel.
- De desktop-groottes hieronder liggen bewust **~1 stap onder de Figma-waarden** (Figma: display 60 / h1 80 / h2 56 / h3 42) — op verzoek van de klant iets minder fors. Niet "terugcorrigeren" naar Figma.

| Token / class | clamp (mobiel → desktop) | Gewicht | Stijl | Toepassing |
|---|---|---|---|---|
| `text-display` / `.display` | 36 → **52** px | 700 | italic, UPPER | Grote sectietitel ("Actueel") |
| `text-h1` / `.h1` | 40 → **68** px | 700 | italic, UPPER | Hero-kop |
| `text-h2` / `.h2` | 30 → **48** px | 700 | italic, UPPER | Sectiekop op donkere sectie (intro) |
| `text-h3` / `.h3` | 26 → **36** px | 700 | italic, UPPER | Content-blok kop, FAQ-sectiekop ("Vragen die we vaak krijgen") |
| `text-h4` / `.h4` | 20 → **26** px | 700 | italic, UPPER | Kleine kop / kaart-label (Baan/Weg atletiek, Loopgroepen) |
| `text-card` | 22 → **28** px | 700 | **roman, sentence case** | Kaart-kop (Actueel-item) |
| `text-faq` | 18 → **22** px | 600 | roman | FAQ-vraag |
| `text-eyebrow` / `.eyebrow` | 19 px (WCAG, zie Toegankelijkheid) | 700 | italic, UPPER | Eyebrow/label boven een kop |
| `text-body` | **17** px | 400 | — | Bodytekst + nav-links (op donker oogt Medium via kleur/gewicht van de bron) |
| `text-label` | 17 px | 600 | — | Knoppen, footer-kopjes (grootte = `text-body`) |
| `text-meta` | 14 px | 500 | — | Meta-pills / tags (datum, categorie) |

### Radius & maat

| Token | Waarde | Toepassing |
|---|---|---|
| `rounded-pill` | 999px | Pills, pill-nav (desktop header) |
| `rounded-panel` | 20px | FAQ-kaarten, "Baan/Weg/Loopgroepen"-kaarten |
| `rounded-card` | 30px | Actueel-kaarten |
| `rounded-media` | 32px | Content-blok afbeeldingen, marquee-tegels, mobiel menupaneel |
| `rounded-b-section` | 50px | Sectie-onderhoeken (hero/blue/cream lopen in elkaar over) |
| `max-w-page` | 1520px | Content-breedte (`Container`-component). Gutter loopt op tot ~200px bij ≥1920px door centrering. |

### Verticaal ritme

- Tokens: `--spacing-section` (`clamp(4.5rem, 8vw, 8rem)` = 72→128px, standaard ruimte tussen blokken). Bruikbaar als spacing-utilities: `py-section`, `mt-section`, …
- **`Section`-component** (`frontend/src/components/Section.tsx`) is de bouwsteen voor elke pagina — stapel `<Section>`-blokken. Props: `bg` (`page`/`dark`/`brand`/`soft`), `connect` (overlapt de vorige sectie: trekt omhoog over `--radius-section` + zet pt op ritme+overlap), `connectExtra` (extra pt als CSS-lengte), `roundBottom`, `padTop`/`padBottom`, `z`, `bare` (sla `Container` over), `decoration` (volle-breedte laag vóór de Container). De connect-offsets gaan via inline-style — `calc()` met theme-vars werkt niet als arbitrary Tailwind-class (scanner ziet 'm niet).
- **Overhang / "bleed"**: als content bewust uit de onderrand van een sectie steekt (kaarten die op het volgende blok vallen), zet je dat bedrag als token en gebruik je datzelfde token **op twee plekken**: `-mb-<token>` op de uitstekende content, én `connectExtra="var(--spacing-<token>)"` op de volgende `<Section connect>`. De zichtbare gap tussen de overhang en de volgende kop is dan altijd exact `--spacing-section`. Bestaande tokens: `--spacing-bleed` (240px, Actueel-kaarten), `--spacing-bleed-cards` (128px, intro-kaarten), `--spacing-bleed-filter` (64→96px, clubrecords-filterpaneel in de blauwe PageHero). Secties met overhangende content mogen géén `overflow-hidden` — `roundBottom` klipt de achtergrond ook zonder.
- `page.tsx` is hiermee opgebouwd: hero (`dark`) → intro (`brand`, connect, kaarten steken uit) → Trainingen+Actueel (`soft`, connect + `connectExtra` vangt de intro-kaarten; Actueel-kaarten steken er onderaan uit) → Over Lionitas (connect + `connectExtra` vangt de Actueel-kaarten) → FAQ/galerij.

### Tablet-breakpoint (touch/hover)

- **`xl` (1280px) is dé grens tussen "touch/tablet" en "desktop"** — niet `md`/`lg`. Onder `xl` gedraagt de site zich als touch: geen enkele CTA mag achter een `:hover` schuilgaan, en de header valt terug op het hamburgermenu. Reden: de volledige desktop-nav (logo + 5 links + "Lid worden"-pill) past pas comfortabel vanaf ~1150–1200px breed; bij `lg` (1024px) knalt "Over Lionitas" en "Lid worden" om naar twee regels. Ook op een tablet met muis/trackpad (dus `hover: hover`) moet een CTA zonder hover bereikbaar zijn — anders is 'm onbereikbaar zonder per ongeluk te klikken.
- **`useTouchLayout`** (`frontend/src/lib/useTouchLayout.ts`) is de centrale hook hiervoor: `true` bij `(max-width: 1279px)` **of** `(hover: none)`. Card-componenten (`HomeCard`, `ActueelSection`) gebruiken 'm om hun CTA/hover-animatie meteen in de "revealed" staat te zetten i.p.v. achter `whileHover`.
- **`CardSlider`** (`frontend/src/components/CardSlider.tsx`) — de horizontale scroll-snap slider met puntjes — blijft actief tot `xl` en wordt pas daarboven een grid. Dit moet gelijk lopen met `useTouchLayout`: als de kaarten in slider-vorm staan, moet de CTA ook zichtbaar zijn (en andersom).
- **`Header`** (`frontend/src/components/Header.tsx`) toont de volledige desktop-nav + "Lid worden"-pill pas vanaf `xl:flex`; de hamburger/mobiel-menu is `xl:hidden`. Nav-labels en pill-tekst hebben `whitespace-nowrap` om omklappen op grensbreedtes te voorkomen.
- Nieuwe breakpoint-afhankelijke hover/grid-logica hoort op dit patroon aan te sluiten: gebruik `xl`, niet `md`/`lg`, en zorg dat CTA-zichtbaarheid en layout-vorm (slider/grid, hamburger/volledige nav) samen omslaan.

### Navigatie & vervolgpagina's

- **Menu komt uit WordPress** (Weergave → Menu's, locatie "Primary"), via `getNavigation()` in `lib/wordpress.ts` (boom, max. 3 niveaus). Conventies: hoofditem met echte URL/pagina = klikbaar, met `#` = alleen uitklapper; de menu-item-"Beschrijving" (Scherminstellingen → Beschrijving) verschijnt in het mega menu; ander domein of "nieuw tabblad" = externe link. `FALLBACK_NAVIGATION` in `lib/navigation.ts` geldt alleen als WP geen menu heeft of onbereikbaar is. **Tijdelijk** staat in Vercel (Production) `NAVIGATION_SOURCE=code`: dan wordt WP overgeslagen en altijd `FALLBACK_NAVIGATION` getoond (demo voor het bestuur; het WP-menu is nog het oude testmenu). Zodra het menu in WordPress is opgebouwd: env-variabele weghalen en redeployen, het menu komt dan weer uit WP. `HEADER_CTA` (gele pill) staat in code.
- **Header / mega menu** (`Header.tsx` + `MegaMenu.tsx`): de blauwe pill is één "shell" die zelf openvouwt tot paneel (morph: hoogte via `MorphPanel` + radius 44→32px, dezelfde `MORPH`-spring). Inhoud schuift richtingbewust tussen secties. Paneel = titel (linkt als het hoofditem klikbaar is) + beschrijving links, subitems in 2 kolommen, 3e niveau als sublijst. Geen "naar overzicht"-knop. Desktop (≥ `xl`): hover opent; klikbaar hoofditem = link (klik navigeert, ↓ opent), anders `<button>`; Escape sluit. Onder `xl`: hamburger met drill-down ("Terug") via hetzelfde `MorphPanel`. Alles is gekeyed op menu-item-`id` (href kan null zijn).
- **`PageHero`** (`frontend/src/components/PageHero.tsx`): ingetogen kop voor vervolgpagina's — géén gekleurd blok, op de pagina-achtergrond: kruimelpad als eyebrow, `.h2` met optionele gedimde tweede regel (`subtitle`, token `--color-heading-soft`), intro rechts ernaast vanaf `lg`. Met `centered` staan kruimelpad en kop gecentreerd; `tone="brand"` maakt er een blauw blok met `rounded-b-section` van (alle tekst wit); `overlap` laat de content eronder erin vallen (`-mt-<token>` op die content, zelfde token). `size="h1"` voor een grotere kop. Clubrecords gebruikt deze opties, met de gewone pagina-achtergrond eronder (witte tabellen erop) en de content op `max-w-6xl` (gelijk aan de header-pill). Content eronder: `<Section bg="page" padTop={false}>`.
- **`app/[...slug]/page.tsx`**: rendert elk intern menu-pad zonder eigen route — item met subitems → overzicht met `NavCard`s, anders "In de maak" + rest van de sectie. Paden die niet in het menu staan → 404. Echte pagina gebouwd (eigen map onder `app/`)? Voeg het pad toe aan `DEDICATED_ROUTES`.

### Clubrecords

- Route: `app/over-lionitas/clubrecords/page.tsx`, explorer in `components/clubrecords/ClubrecordsExplorer.tsx`: één wit filterpaneel met gelabelde velden van gelijke hoogte (h-12: Baan, Geslacht, Zoeken, Categorie, Onderdeel) + samenvattingsregel; standaard alle records per categorie, tabel gegroepeerd per discipline, gedeelde records (zelfde onderdeel + prestatie) als één rij met meerdere houders. Anti-verspringen: keuzes in selects i.p.v. wisselende knoppen, "Filters wissen" altijd gerenderd (`invisible`), resultaatgebied `min-h-[60vh]`. Filters staan in de URL.
- Data: `frontend/src/data/clubrecords.json`, gegenereerd met `node scripts/import-clubrecords.mjs` (vanuit `frontend/`) — scrapet lionitas.nl/clubrecords (POST-zoekformulier) en normaliseert schrijfwijzen. `lib/clubrecords.ts` leidt geslacht, leeftijdsgroep, discipline en sorteervolgorde af. Na livegang is het JSON-bestand de bron (of migreren naar een WP custom post type).

### Lid worden (aanmeldformulier)

- Route: `app/lid-worden/page.tsx`, stappenformulier (`components/aanmelden/`) op basis van de papieren formulieren voor Nijntje (3 t/m 5), Pupillen (6 t/m 11) en Junioren & senioren. Zes stappen: categorie → persoonsgegevens → adres & contact → lidmaatschap (per categorie andere vragen) → SEPA-machtiging → controleren, daarna een bevestigingsscherm met aanmeldnummer. Formulier links, stappenlijst rechts (vanaf `xl`, 16px tussenruimte); daaronder een voortgangsbalk. Breedte = `max-w-6xl`, net als clubrecords en de header-pill.
- Bewust **geen `PageHero`** en geen intro onder de staptitels: het formulier begint direct onder de vaste header (`AanmeldFormulier` rendert zelf de `Section` met dezelfde top-padding als PageHero, plus een `sr-only` h1). Ook de bevestiging staat daar.
- `lib/aanmelding.ts` is de bron voor tarieven (`feesFor`, uit "Contributies AV Lionitas per 1 januari 2026"), de Athletics Champs-wedstrijden (**beide jaarlijks bijwerken**), validatie per stap en de samenvatting. Client én server action gebruiken dezelfde code. Leeftijdsregels: Nijntje op echte leeftijd, daarna kalenderjaar-leeftijd (zoals de Atletiekunie: junior t/m 19); < 18 → ouder/verzorger verplicht.
- Versturen: `app/lid-worden/actions.ts` (Server Action) hervalideert alles en POST de aanmelding naar `AANMELDING_WEBHOOK_URL`. Zonder die variabele werkt het alleen in development (gemaskeerde log-regel); in productie geeft het formulier dan een nette foutmelding i.p.v. aanmeldingen stil te laten verdwijnen. Definitieve bestemming (waarschijnlijk mail naar de ledenadministratie) staat nog open.
- Formuliervelden (`components/aanmelden/fields.tsx`): `TextField`, `TextArea`, `ChoiceGroup` (radio-kaarten / `compact` pills), `YesNoField`, `CheckboxField`. **Alle toelichting bij velden staat achter een "i"** (`InfoTip`, via de `info`-prop; er bestaan geen hints onder labels meer), voorbeelden als `placeholder`. `InfoTip` rendert via een portal met `position: fixed` (wit, schaduw, blijft binnen het scherm en onder de header) en voldoet aan WCAG 1.4.13. `SelectField` = keuzelijst in veldstijl. Trainingsmoment wordt gevraagd als **trainingsgroep** (dropdown naast Train(st)er), niet als dagen/tijden: chips daarvoor vond de klant te rommelig. "Ochtendgroep" toont direct de koffiekeuze. `FormGroup` kan ook een `info` naast de titel krijgen. Elk focusbaar element heeft `data-field`, zodat "Volgende" naar het eerste ongeldige veld springt. Knoppen: `PillButton` uit `PillLink.tsx`.
- Stapwissel scrolt naar de bovenkant van het formulier (niet van de pagina), en alleen als die uit beeld is. De paneelhoogte wordt tijdens de wissel vastgehouden, anders klapt de pagina even in en springt de browser omhoog. Let op: Lenis telt `scroll-padding-top` van `<html>` al mee, dus geen extra `offset` meegeven.
- **Stap 1 heeft geen knoppen**: klik/tik op een categoriekaart gaat na ~0,7 s automatisch naar stap 2. Toetsenbord: pijltjes lopen langs de kaarten zonder door te springen; Enter gaat door, en na een keuze met spatie/pijltjes verschijnt alsnog "Volgende". Kom je later terug naar stap 1, dan gewoon Vorige/Volgende zonder auto-door. Onder de formulierinhoud staat geen scheidingslijn boven de knoppen.
- Concept blijft in `sessionStorage` bewaard (zonder IBAN) zodat herladen niets kost.
- Copy: geen gedachtestreepjes (—, –) in zichtbare teksten; de klant vindt dat het AI-gegenereerd oogt. Schrijf om met punt, komma of dubbele punt.

### Toegankelijkheid (WCAG 2.2 AA)

Alles wordt getoetst aan **WCAG 2.2 niveau AA** (basis onder de European Accessibility Act / EN 301 549). Gemeten contrast van de merkkleuren:

| Combinatie | Contrast | Mag voor |
|---|---|---|
| wit op blauw `#0a71b4` | 5.2:1 | alle tekst |
| wit 75% (`on-dark-muted`) op blauw | 3.6:1 | **niets** (alleen op navy: 10.7:1) |
| geel op blauw | 4.3:1 | alleen grote tekst (≥ 24px, of ≥ 18.66px vet), iconen, randen/onderstrepingen |
| cream op blauw | 4.6:1 | alle tekst |
| blauw op wit / page / cream | 5.2 / 4.8 / 4.6:1 | alle tekst |
| `heading-soft` (navy 50%) op page | 3.5:1 | alleen grote tekst |

Regels die daaruit volgen:
- **Op blauwe vlakken (header, menu's, footer, home-hero) is alle lopende tekst wit.** Hiërarchie via grootte/gewicht, niet via transparantie. Geel alleen voor iconen, onderstrepingen en grote koppen.
- **Hover-tegels op blauw worden dónkerder** (`bg-blue-hover`, wit 6.7:1), nooit lichter (`bg-white/10` zakt wit naar 4.3:1).
- **Actieve menu-items**: wit + gele onderstreping (`ACTIVE_LINK` in `MegaMenu.tsx`). Hover = onderstreping, geen kleurwissel naar geel.
- `.eyebrow` is 19px (niet Figma's 18) zodat geel-op-blauw als grote tekst telt.
- Onderscheid nooit alleen via een flauwe achtergrondtint (cream vs wit = 1.13:1): combineer met typografie/lijnen (zie de discipline-kopjes in de clubrecords-tabel).
- Skiplink "Ga naar de inhoud" in `layout.tsx` (→ `#main`); `html { scroll-padding-top }` houdt focus onder de vaste header (2.4.11).
- Klikdoelen ≥ 24×24px (2.5.8), ook slider-puntjes. Tabellen die op mobiel een grid worden: expliciete `role`s + kolomkoppen `sr-only` i.p.v. `hidden`.
- Controleren: contrast uitrekenen (zie formule WCAG relative luminance) en axe-core draaien (`wcag2a/aa`, `wcag21aa`, `wcag22aa`) op desktop + mobiel, ook met menu's open.

### Overige patronen

- Content-breedte: `Container` (`frontend/src/components/Container.tsx`) — `max-w-page` + responsieve `px`.
- Smooth scroll: [Lenis](https://lenis.dev/) via `lenis/react` (`ReactLenis` in `frontend/src/app/layout.tsx`).
- Links/knoppen met pijl-icoon: `PillLink` (`frontend/src/components/PillLink.tsx`), varianten `yellow`/`blue`/`navy`/`outline-white`; deelt `PILL_STYLES` met o.a. `HomeCard`.
- Scroll-reveal animaties: `ScrollReveal` (`frontend/src/components/ScrollReveal.tsx`), respecteert `prefers-reduced-motion`.
- Footer (`frontend/src/components/Footer.tsx`): 1:1 op Figma-node `39:243` — blauwe achtergrond, `rounded-t-section`, logo-blok + 3 kolommen (Lionitas/contact, Snel naar, Trainingen), gele divider, credits met legal-links + social-icoon-`<svg>`'s (renderen alleen als de URL in Site-instellingen is ingevuld), grote `lionitas-wordmark.svg` als watermerk.
- Fotoslider (`frontend/src/components/ImageMarquee.tsx`): oneindige marquee via 2× dezelfde set + `translateX(-50%)`; elke tegel heeft `mr-[2.5vw]` (geen flex-`gap`) zodat de loop naadloos is. Verticale stagger strikt om-en-om; bij een oneven aantal foto's wordt de basisset eerst verdubbeld zodat de stagger over de naad klopt. Tegelbreedte `sm:w-[24vw]` → ~3 volledig in beeld + randen.

## Conventies

- Data fetching via `frontend/src/lib/wordpress.ts` (graphql-request + Next.js ISR, revalidate 60s)
- ACF-veldnamen: snake_case in WordPress → camelCase in GraphQL (bv. `card_1` → `card1`, `image_position` → `imagePosition`)
- ACF select-velden komen als array terug in GraphQL (ook single-select), bv. `imagePosition: ["rechts"]`
