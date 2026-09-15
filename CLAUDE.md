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
| `text-eyebrow` / `.eyebrow` | 18 px | 700 | italic, UPPER | Eyebrow/label boven een kop |
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
- **Overhang / "bleed"**: als content bewust uit de onderrand van een sectie steekt (kaarten die op het volgende blok vallen), zet je dat bedrag als token en gebruik je datzelfde token **op twee plekken**: `-mb-<token>` op de uitstekende content, én `connectExtra="var(--spacing-<token>)"` op de volgende `<Section connect>`. De zichtbare gap tussen de overhang en de volgende kop is dan altijd exact `--spacing-section`. Bestaande tokens: `--spacing-bleed` (240px, Actueel-kaarten), `--spacing-bleed-cards` (128px, intro-kaarten). Secties met overhangende content mogen géén `overflow-hidden` — `roundBottom` klipt de achtergrond ook zonder.
- `page.tsx` is hiermee opgebouwd: hero (`dark`) → intro (`brand`, connect, kaarten steken uit) → Trainingen+Actueel (`soft`, connect + `connectExtra` vangt de intro-kaarten; Actueel-kaarten steken er onderaan uit) → Over Lionitas (connect + `connectExtra` vangt de Actueel-kaarten) → FAQ/galerij.

### Tablet-breakpoint (touch/hover)

- **`xl` (1280px) is dé grens tussen "touch/tablet" en "desktop"** — niet `md`/`lg`. Onder `xl` gedraagt de site zich als touch: geen enkele CTA mag achter een `:hover` schuilgaan, en de header valt terug op het hamburgermenu. Reden: de volledige desktop-nav (logo + 5 links + "Lid worden"-pill) past pas comfortabel vanaf ~1150–1200px breed; bij `lg` (1024px) knalt "Over Lionitas" en "Lid worden" om naar twee regels. Ook op een tablet met muis/trackpad (dus `hover: hover`) moet een CTA zonder hover bereikbaar zijn — anders is 'm onbereikbaar zonder per ongeluk te klikken.
- **`useTouchLayout`** (`frontend/src/lib/useTouchLayout.ts`) is de centrale hook hiervoor: `true` bij `(max-width: 1279px)` **of** `(hover: none)`. Card-componenten (`HomeCard`, `ActueelSection`) gebruiken 'm om hun CTA/hover-animatie meteen in de "revealed" staat te zetten i.p.v. achter `whileHover`.
- **`CardSlider`** (`frontend/src/components/CardSlider.tsx`) — de horizontale scroll-snap slider met puntjes — blijft actief tot `xl` en wordt pas daarboven een grid. Dit moet gelijk lopen met `useTouchLayout`: als de kaarten in slider-vorm staan, moet de CTA ook zichtbaar zijn (en andersom).
- **`Header`** (`frontend/src/components/Header.tsx`) toont de volledige desktop-nav + "Lid worden"-pill pas vanaf `xl:flex`; de hamburger/mobiel-menu is `xl:hidden`. Nav-labels en pill-tekst hebben `whitespace-nowrap` om omklappen op grensbreedtes te voorkomen.
- Nieuwe breakpoint-afhankelijke hover/grid-logica hoort op dit patroon aan te sluiten: gebruik `xl`, niet `md`/`lg`, en zorg dat CTA-zichtbaarheid en layout-vorm (slider/grid, hamburger/volledige nav) samen omslaan.

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
