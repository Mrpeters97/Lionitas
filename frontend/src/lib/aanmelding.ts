// Aanmeldformulier "Lid worden" — gedeelde logica voor client (stappen, validatie,
// samenvatting) én server action (hervalidatie, payload). Inhoud overgenomen uit de
// papieren aanmeldformulieren (Nijntje, Pupillen, algemeen/junioren & senioren) en
// het overzicht "Contributies AV Lionitas per 1 januari 2026".
//
// Let op: zichtbare teksten zonder gedachtestreepjes (—/–), zie CLAUDE.md.

export type CategoryId = "nijntje" | "pupillen" | "senioren";
export type YesNo = "ja" | "nee" | "";
export type MembershipType = "lid" | "gast-training" | "gast-licentie" | "";

export interface AanmeldData {
  category: CategoryId | "";
  // Persoonsgegevens
  lastName: string;
  firstNames: string;
  initials: string;
  callName: string;
  birthDate: string; // yyyy-mm-dd
  gender: "m" | "v" | "";
  notes: string;
  // Adres & contact
  guardianName: string;
  street: string;
  houseNumber: string;
  houseNumberAddition: string;
  postcode: string;
  city: string;
  phone1: string;
  phone2: string;
  email1: string;
  email2: string;
  // Lidmaatschap
  membershipType: MembershipType;
  /** Een TRAINING_GROUPS-waarde, of leeg (optioneel). */
  trainingGroup: string;
  trainer: string;
  competitionLicense: YesNo;
  threeTrainings: YesNo;
  studentDiscount: YesNo;
  coffee: "geen" | "1x" | "2x" | "";
  athleticsChamps: YesNo;
  athleticsChampsReason: string;
  transfer: YesNo;
  familyDiscount: YesNo;
  volunteer: "taken" | "afkopen" | "";
  // Betaling (SEPA-machtiging)
  accountHolder: string;
  holderSameAddress: boolean;
  holderStreet: string;
  holderHouseNumber: string;
  holderHouseNumberAddition: string;
  holderPostcode: string;
  holderCity: string;
  holderCountry: string;
  iban: string;
  bic: string;
  mandate: boolean;
  // Akkoord
  photoConsent: YesNo;
  cancellationTerms: boolean;
  privacy: boolean;
}

export type Field = keyof AanmeldData;
export type Errors = Partial<Record<Field, string>>;

export const EMPTY_AANMELDING: AanmeldData = {
  category: "",
  lastName: "",
  firstNames: "",
  initials: "",
  callName: "",
  birthDate: "",
  gender: "",
  notes: "",
  guardianName: "",
  street: "",
  houseNumber: "",
  houseNumberAddition: "",
  postcode: "",
  city: "",
  phone1: "",
  phone2: "",
  email1: "",
  email2: "",
  membershipType: "",
  trainingGroup: "",
  trainer: "",
  competitionLicense: "",
  threeTrainings: "",
  studentDiscount: "",
  coffee: "",
  athleticsChamps: "",
  athleticsChampsReason: "",
  transfer: "",
  familyDiscount: "",
  volunteer: "",
  accountHolder: "",
  holderSameAddress: true,
  holderStreet: "",
  holderHouseNumber: "",
  holderHouseNumberAddition: "",
  holderPostcode: "",
  holderCity: "",
  holderCountry: "Nederland",
  iban: "",
  bic: "",
  mandate: false,
  photoConsent: "",
  cancellationTerms: false,
  privacy: false,
};

// ---------------------------------------------------------------------------
// Club- en tariefgegevens (per 1 januari 2026 — jaarlijks bijwerken)
// ---------------------------------------------------------------------------

export const LEDENADMINISTRATIE = "ledenadministratie@lionitas.nl";

export const INCASSANT = {
  name: "Atletiekvereniging Lionitas",
  address: "Middelzeelaan 20, 8931 AK Leeuwarden",
  id: "NL84 ZZZ 4000017060000",
  reference: "Contributiebetaling",
};

export interface Fee {
  label: string;
  amount: number;
  per: "Per kwartaal" | "Per jaar" | "Eenmalig";
}

type AgeGroup = "pupillen" | "junioren" | "senioren";

/** Clubcontributie per kwartaal. Nijntje betaalt het pupillen-tarief. */
const CLUB_FEE: Record<AgeGroup, number> = { pupillen: 45.5, junioren: 50.5, senioren: 55.5 };
/** Atletiekunie per kalenderjaar (altijd het volledige jaarbedrag). */
const AU_FEE: Record<AgeGroup, { base: number; license: number }> = {
  pupillen: { base: 19.4, license: 10.6 },
  junioren: { base: 20.5, license: 18.75 },
  senioren: { base: 22.15, license: 29.9 },
};
const REGISTRATION_FEE = 5;
const TRANSFER_FEE = 13.4;

export interface Category {
  id: CategoryId;
  label: string;
  ages: string;
  description: string;
  priceHint: string;
}

export const CATEGORIES: Category[] = [
  {
    id: "nijntje",
    label: "Nijntje",
    ages: "3 t/m 5 jaar",
    description: "Spelenderwijs leren bewegen, met het Nijntje Beweegdiploma.",
    priceHint: "€ 45,50 per kwartaal",
  },
  {
    id: "pupillen",
    label: "Pupillen",
    ages: "6 t/m 11 jaar",
    description: "Rennen, springen en werpen, met leuke teamwedstrijden.",
    priceHint: "€ 45,50 per kwartaal",
  },
  {
    id: "senioren",
    label: "Junioren & senioren",
    ages: "12 jaar en ouder",
    description: "Baan, weg en loopgroepen, op elk niveau.",
    priceHint: "Vanaf € 50,50 per kwartaal",
  },
];

export const categoryById = (id: CategoryId | "") => CATEGORIES.find((c) => c.id === id) ?? null;

/** Athletics Champs + clubkampioenschappen. Jaarlijks bijwerken (staat ook op het pupillen-formulier). */
export const ATHLETICS_CHAMPS = {
  year: 2026,
  total: 34,
  events: [
    { name: "Indoor Athletics Champs, Drachten", date: "2026-02-07", cost: 6 },
    { name: "1e Athletics Champs, Leeuwarden", date: "2026-04-11", cost: 4 },
    { name: "Trainingswedstrijd, Leeuwarden", date: "2026-04-15", cost: 0 },
    { name: "2e Athletics Champs, Drachten", date: "2026-05-30", cost: 4 },
    { name: "Golden Lion + Clubkampioenschappen, Leeuwarden", date: "2026-06-06", cost: 6 },
    { name: "3e Athletics Champs, Heerenveen", date: "2026-06-20", cost: 4 },
    { name: "4e Athletics Champs, Sneek", date: "2026-09-19", cost: 4 },
    { name: "Indoor Friesland + Clubkampioenschappen, Franeker", date: "2026-11-29", cost: 6 },
  ],
};

/** Wie halverwege het jaar lid wordt, betaalt alleen de wedstrijden die nog komen. */
export function athleticsChampsRemaining(today: Date) {
  const iso = toIsoDate(today);
  if (Number(iso.slice(0, 4)) !== ATHLETICS_CHAMPS.year) return null;
  return ATHLETICS_CHAMPS.events.filter((e) => e.date >= iso).reduce((sum, e) => sum + e.cost, 0);
}

/** Leden die na 1 september lid worden, doen dat jaar één dagdeel vrijwilligerswerk i.p.v. twee. */
export const volunteerDayparts = (today: Date) => (today.getMonth() >= 8 ? 1 : 2);

/** Trainingsgroepen voor junioren & senioren (dagen/tijden staan in het trainingsrooster). */
export const TRAINING_GROUPS = [
  { value: "baan", label: "Baanatletiek" },
  { value: "weg", label: "Wegatletiek" },
  { value: "loopgroep", label: "Loopgroep" },
  { value: "ochtendgroep", label: "Ochtendgroep" },
  { value: "onbekend", label: "Weet ik nog niet" },
];

/** Ochtendgroepen kiezen of ze na de training koffie/thee drinken in de kantine. */
export const trainsInMorning = (data: AanmeldData) => data.trainingGroup === "ochtendgroep";

export const COFFEE_OPTIONS = [
  { value: "geen", label: "Geen koffie of thee", description: "€ 0" },
  { value: "1x", label: "1× per week", description: "€ 25,00 per halfjaar" },
  { value: "2x", label: "2× per week", description: "€ 50,00 per halfjaar" },
] as const;

export const MEMBERSHIP_OPTIONS = [
  { value: "lid", label: "Lid", description: "Je traint bij Lionitas en doet mee aan alles." },
  {
    value: "gast-training",
    label: "Gastlid met trainingsfaciliteiten",
    description: "Je traint bij Lionitas, je wedstrijdlicentie blijft bij je eigen vereniging.",
  },
  {
    value: "gast-licentie",
    label: "Gastlid zonder trainingsfaciliteiten",
    description: "Je komt op wedstrijden uit voor Lionitas, maar traint bij een andere vereniging of zelfstandig.",
  },
] as const;

// ---------------------------------------------------------------------------
// Datum & leeftijd
// ---------------------------------------------------------------------------

export const toIsoDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

function parseDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [y, m, d] = match.slice(1).map(Number);
  const date = new Date(y, m - 1, d);
  return date.getMonth() === m - 1 ? date : null;
}

/** Werkelijke leeftijd op `today`. */
export function ageOn(birthDate: string, today: Date) {
  const birth = parseDate(birthDate);
  if (!birth) return null;
  let age = today.getFullYear() - birth.getFullYear();
  if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

/** Leeftijd die je dit kalenderjaar bereikt — zo deelt de Atletiekunie categorieën in. */
const calendarAge = (birthDate: string, today: Date) => {
  const birth = parseDate(birthDate);
  return birth ? today.getFullYear() - birth.getFullYear() : null;
};

/** Categorie die bij de geboortedatum past (Nijntje: echte leeftijd, daarna kalenderjaar). */
export function suggestCategory(birthDate: string, today: Date): CategoryId | null {
  const age = ageOn(birthDate, today);
  const yearAge = calendarAge(birthDate, today);
  if (age == null || yearAge == null || age < 3) return null;
  if (age <= 5) return "nijntje";
  if (yearAge <= 11) return "pupillen";
  return "senioren";
}

export const isMinor = (data: AanmeldData, today: Date) => {
  if (data.category === "nijntje" || data.category === "pupillen") return true;
  const age = ageOn(data.birthDate, today);
  return age != null && age < 18;
};

/** Junioren (t/m 19 in het kalenderjaar) hebben automatisch een wedstrijdlicentie. */
export const isJunior = (data: AanmeldData, today: Date) => {
  const yearAge = calendarAge(data.birthDate, today);
  return yearAge != null && yearAge <= 19;
};

// ---------------------------------------------------------------------------
// Contributie
// ---------------------------------------------------------------------------

/** Contributie-regels voor deze aanmelding, of null als de soort lidmaatschap nog niet gekozen is. */
export function feesFor(data: AanmeldData, today: Date): Fee[] | null {
  const transfer: Fee[] =
    data.transfer === "ja" ? [{ label: "Overschrijving van andere vereniging", amount: TRANSFER_FEE, per: "Eenmalig" }] : [];

  if (data.category === "nijntje") {
    return [
      { label: "Clubcontributie", amount: CLUB_FEE.pupillen, per: "Per kwartaal" },
      { label: "Basiscontributie Atletiekunie", amount: AU_FEE.pupillen.base, per: "Per jaar" },
      { label: "Inschrijvingskosten", amount: REGISTRATION_FEE, per: "Eenmalig" },
      { label: "Nijntje Beweegdiploma", amount: 10, per: "Eenmalig" },
    ];
  }

  if (data.category === "pupillen") {
    return [
      { label: "Clubcontributie", amount: CLUB_FEE.pupillen, per: "Per kwartaal" },
      { label: "Basiscontributie Atletiekunie", amount: AU_FEE.pupillen.base, per: "Per jaar" },
      { label: "Wedstrijdlicentie Atletiekunie", amount: AU_FEE.pupillen.license, per: "Per jaar" },
      { label: "Inschrijvingskosten", amount: REGISTRATION_FEE, per: "Eenmalig" },
      ...(data.athleticsChamps === "nee"
        ? []
        : [{ label: "Athletics Champs wedstrijden", amount: ATHLETICS_CHAMPS.total, per: "Per jaar" } as Fee]),
      ...transfer,
    ];
  }

  if (data.category !== "senioren" || !data.membershipType) return null;

  const group: AgeGroup = isJunior(data, today) ? "junioren" : "senioren";
  const groupLabel = group === "junioren" ? "junioren" : "senioren & masters";
  const club: Fee =
    data.threeTrainings === "ja"
      ? { label: `Clubcontributie ${groupLabel}, 3× per week`, amount: CLUB_FEE[group] * 1.5, per: "Per kwartaal" }
      : { label: `Clubcontributie ${groupLabel}`, amount: CLUB_FEE[group], per: "Per kwartaal" };
  const base: Fee = { label: "Basiscontributie Atletiekunie", amount: AU_FEE[group].base, per: "Per jaar" };
  const license: Fee = { label: "Wedstrijdlicentie Atletiekunie", amount: AU_FEE[group].license, per: "Per jaar" };
  const registration: Fee = { label: "Inschrijvingskosten", amount: REGISTRATION_FEE, per: "Eenmalig" };

  switch (data.membershipType) {
    case "lid":
      return [
        club,
        base,
        ...(group === "junioren" || data.competitionLicense === "ja" ? [license] : []),
        registration,
        ...transfer,
      ];
    case "gast-training":
      return [club, base, registration];
    case "gast-licentie":
      return [base, license];
  }
}

// ---------------------------------------------------------------------------
// IBAN
// ---------------------------------------------------------------------------

export const normalizeIban = (value: string) => value.replace(/\s+/g, "").toUpperCase();
export const formatIban = (value: string) => normalizeIban(value).replace(/(.{4})/g, "$1 ").trim();

export function isValidIban(value: string) {
  const iban = normalizeIban(value);
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(iban)) return false;
  if (iban.startsWith("NL") && iban.length !== 18) return false;
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  let remainder = 0;
  for (const char of rearranged) {
    const digits = /\d/.test(char) ? char : String(char.charCodeAt(0) - 55);
    for (const digit of digits) remainder = (remainder * 10 + Number(digit)) % 97;
  }
  return remainder === 1;
}

// ---------------------------------------------------------------------------
// Stappen & validatie
// ---------------------------------------------------------------------------

export const STEPS = [
  { id: "categorie", label: "Categorie" },
  { id: "persoon", label: "Persoonsgegevens" },
  { id: "contact", label: "Adres & contact" },
  { id: "lidmaatschap", label: "Lidmaatschap" },
  { id: "betaling", label: "Machtiging" },
  { id: "controle", label: "Controleren" },
] as const;

export type StepId = (typeof STEPS)[number]["id"];

const HOUSE_NUMBER = /^\d{1,5}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\+?[\d\s\-()]{10,}$/;

/** Vragen die alleen bij lid/gastlid-met-training horen (wie elders traint slaat ze over). */
export const trainsAtLionitas = (data: AanmeldData) => data.membershipType !== "gast-licentie";

/** Overschrijvingsvraag: alleen voor wie echt lid wordt (gastleden blijven lid van hun eigen club). */
export const asksTransfer = (data: AanmeldData) =>
  data.category === "pupillen" || (data.category === "senioren" && data.membershipType === "lid");

export function validateStep(step: StepId, data: AanmeldData, today: Date): Errors {
  const errors: Errors = {};
  const required = (field: Field, message: string) => {
    const value = data[field];
    if (typeof value === "string" ? value.trim() === "" : !value) errors[field] = message;
  };

  switch (step) {
    case "categorie":
      required("category", "Kies een categorie om verder te gaan.");
      break;

    case "persoon": {
      required("lastName", "Vul de achternaam in.");
      required("firstNames", "Vul de voornaam of voornamen in.");
      required("initials", "Vul de voorletters in.");
      required("callName", "Vul de roepnaam in.");
      required("gender", "Maak een keuze.");
      const age = ageOn(data.birthDate, today);
      if (!data.birthDate) errors.birthDate = "Vul de geboortedatum in.";
      else if (age == null || age > 110 || data.birthDate > toIsoDate(today)) errors.birthDate = "Deze datum klopt niet.";
      else if (age < 3) errors.birthDate = "Lid worden kan vanaf 3 jaar.";
      break;
    }

    case "contact":
      if (isMinor(data, today)) required("guardianName", "Vul de naam van een ouder of verzorger in.");
      required("street", "Vul de straat in.");
      if (!HOUSE_NUMBER.test(data.houseNumber.trim())) errors.houseNumber = data.houseNumber.trim() ? "Alleen cijfers. Een letter of toevoeging vul je hiernaast in." : "Vul het huisnummer in.";
      required("postcode", "Vul de postcode in.");
      required("city", "Vul de woonplaats in.");
      if (!PHONE.test(data.phone1.trim())) errors.phone1 = "Vul een geldig telefoonnummer in.";
      if (data.phone2.trim() && !PHONE.test(data.phone2.trim())) errors.phone2 = "Dit telefoonnummer klopt niet.";
      if (!EMAIL.test(data.email1.trim())) errors.email1 = "Vul een geldig e-mailadres in.";
      if (data.email2.trim() && !EMAIL.test(data.email2.trim())) errors.email2 = "Dit e-mailadres klopt niet.";
      break;

    case "lidmaatschap":
      if (data.category === "pupillen") {
        required("athleticsChamps", "Geef aan of je kind meedoet.");
        if (data.athleticsChamps === "nee") required("athleticsChampsReason", "Laat ons kort weten waarom niet.");
      }
      if (data.category === "senioren") {
        required("membershipType", "Kies een soort lidmaatschap.");
        if (data.membershipType === "lid" && !isJunior(data, today)) required("competitionLicense", "Maak een keuze.");
        if (data.membershipType && trainsAtLionitas(data)) {
          required("threeTrainings", "Maak een keuze.");
          required("studentDiscount", "Maak een keuze.");
          if (trainsInMorning(data)) required("coffee", "Maak een keuze.");
        }
      }
      if (asksTransfer(data)) required("transfer", "Maak een keuze.");
      required("familyDiscount", "Maak een keuze.");
      required("volunteer", "Maak een keuze.");
      break;

    case "betaling":
      required("accountHolder", "Vul de naam van de rekeninghouder in.");
      if (!data.holderSameAddress) {
        required("holderStreet", "Vul de straat in.");
        if (!HOUSE_NUMBER.test(data.holderHouseNumber.trim()))
          errors.holderHouseNumber = data.holderHouseNumber.trim() ? "Alleen cijfers. Een letter of toevoeging vul je hiernaast in." : "Vul het huisnummer in.";
        required("holderPostcode", "Vul de postcode in.");
        required("holderCity", "Vul de woonplaats in.");
        required("holderCountry", "Vul het land in.");
      }
      if (!data.iban.trim()) errors.iban = "Vul het IBAN in.";
      else if (!isValidIban(data.iban)) errors.iban = "Dit IBAN klopt niet. Controleer het nummer.";
      if (!data.mandate) errors.mandate = "Zonder machtiging kunnen we de aanmelding niet verwerken.";
      break;

    case "controle":
      required("photoConsent", "Maak een keuze.");
      if (!data.cancellationTerms) errors.cancellationTerms = "Vink aan dat je de opzegtermijnen kent.";
      if (!data.privacy) errors.privacy = "Vink aan om de aanmelding te kunnen versturen.";
      break;
  }

  return errors;
}

/** Index van de eerste stap met fouten, of -1 als alles klopt. */
export function firstInvalidStep(data: AanmeldData, today: Date) {
  return STEPS.findIndex((step) => Object.keys(validateStep(step.id, data, today)).length > 0);
}

// ---------------------------------------------------------------------------
// Samenvatting (controle-stap én payload voor de ledenadministratie)
// ---------------------------------------------------------------------------

export interface SummarySection {
  step: StepId;
  title: string;
  rows: { label: string; value: string }[];
}

export const formatEuro = (amount: number) =>
  new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(amount);

export function formatDate(iso: string) {
  const date = parseDate(iso);
  return date
    ? new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long", year: "numeric" }).format(date)
    : iso;
}

const yesNo = (value: YesNo) => (value === "ja" ? "Ja" : value === "nee" ? "Nee" : "");

/** "Middelzeelaan 20 A" — straat, huisnummer en eventuele toevoeging. */
export const formatStreet = (street: string, number: string, addition: string) =>
  [street.trim(), number.trim(), addition.trim()].filter(Boolean).join(" ");

export function summarize(data: AanmeldData, today: Date): SummarySection[] {
  const kid = data.category === "nijntje" || data.category === "pupillen";
  const minor = isMinor(data, today);
  const gender = data.gender === "m" ? (kid ? "Jongen" : "Man") : data.gender === "v" ? (kid ? "Meisje" : "Vrouw") : "";
  // Lege waarden vallen weg, zodat de samenvatting alleen toont wat ingevuld is.
  const row = (label: string, value: string | null | undefined) =>
    value && value.trim() ? [{ label, value: value.trim() }] : [];
  const category = categoryById(data.category);

  const membership: SummarySection["rows"] = [];
  if (data.category === "pupillen") {
    membership.push(
      ...row("Athletics Champs", yesNo(data.athleticsChamps)),
      ...(data.athleticsChamps === "nee" ? row("Reden", data.athleticsChampsReason) : []),
    );
  }
  if (data.category === "senioren") {
    const type = MEMBERSHIP_OPTIONS.find((o) => o.value === data.membershipType);
    membership.push(...row("Soort lidmaatschap", type?.label));
    if (data.membershipType === "lid") {
      membership.push(
        ...row("Wedstrijdlicentie", isJunior(data, today) ? "Ja (automatisch voor junioren)" : yesNo(data.competitionLicense)),
      );
    }
    if (trainsAtLionitas(data)) {
      membership.push(
        ...row("Trainingsgroep", TRAINING_GROUPS.find((g) => g.value === data.trainingGroup)?.label),
        ...row("Train(st)er", data.trainer),
        ...row("3 trainingen per week", yesNo(data.threeTrainings)),
        ...row("Studentenkorting", yesNo(data.studentDiscount)),
        ...(trainsInMorning(data)
          ? row("Koffie/thee", COFFEE_OPTIONS.find((o) => o.value === data.coffee)?.label)
          : []),
      );
    }
  }
  membership.push(
    ...(asksTransfer(data) ? row("Overschrijving van andere vereniging", yesNo(data.transfer)) : []),
    ...row("Gezinskorting", yesNo(data.familyDiscount)),
    ...row(
      "Vrijwilligerswerk",
      data.volunteer === "taken" ? "Ik help mee met vrijwilligerstaken" : data.volunteer === "afkopen" ? "Ik betaal € 50,00 extra per jaar" : "",
    ),
  );

  const holderAddress = data.holderSameAddress
    ? "Zelfde als hierboven"
    : `${formatStreet(data.holderStreet, data.holderHouseNumber, data.holderHouseNumberAddition)}, ${data.holderPostcode.toUpperCase()} ${data.holderCity}, ${data.holderCountry}`;

  return [
    { step: "categorie", title: "Categorie", rows: category ? row("Categorie", `${category.label} (${category.ages})`) : [] },
    {
      step: "persoon",
      title: kid ? "Over je kind" : "Persoonsgegevens",
      rows: [
        ...row("Naam", `${data.firstNames} ${data.lastName}`),
        ...row("Voorletters", data.initials),
        ...row("Roepnaam", data.callName),
        ...row("Geboortedatum", formatDate(data.birthDate)),
        ...row(kid ? "Jongen of meisje" : "Geslacht", gender),
        ...row("Handig om te weten", data.notes),
      ],
    },
    {
      step: "contact",
      title: "Adres & contact",
      rows: [
        ...(minor ? row("Ouder/verzorger", data.guardianName) : []),
        ...row("Adres", `${formatStreet(data.street, data.houseNumber, data.houseNumberAddition)}, ${data.postcode.toUpperCase()} ${data.city}`),
        ...row("Telefoon", [data.phone1, data.phone2].filter((v) => v.trim()).join(" · ")),
        ...row("E-mail", [data.email1, data.email2].filter((v) => v.trim()).join(" · ")),
      ],
    },
    { step: "lidmaatschap", title: "Lidmaatschap", rows: membership },
    {
      step: "betaling",
      title: "Machtiging",
      rows: [
        ...row("Rekeninghouder", data.accountHolder),
        ...row("Adres rekeninghouder", holderAddress),
        ...row("IBAN", formatIban(data.iban)),
        ...row("BIC", data.bic),
        ...row("Doorlopende machtiging", data.mandate ? "Akkoord" : ""),
      ],
    },
  ];
}

/** Ingekort/opgeschoond — de server action vertrouwt niets van de client. */
export function sanitize(input: unknown): AanmeldData {
  const source = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const result = { ...EMPTY_AANMELDING } as Record<string, unknown>;
  for (const [key, fallback] of Object.entries(EMPTY_AANMELDING)) {
    const value = source[key];
    if (typeof fallback === "string" && typeof value === "string") result[key] = value.slice(0, 2000);
    else if (typeof fallback === "boolean" && typeof value === "boolean") result[key] = value;
  }
  return result as unknown as AanmeldData;
}
