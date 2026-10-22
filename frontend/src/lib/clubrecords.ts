import rawRecords from "@/data/clubrecords.json";

// Bron: src/data/clubrecords.json, gegenereerd door scripts/import-clubrecords.mjs
// (scrapet de oude site). Hier verrijken we elk record met afgeleide velden voor
// de filters: geslacht, leeftijdsgroep en discipline — die staan niet in de bron.

export type Venue = "outdoor" | "indoor";
export type Gender = "v" | "m";
export type AgeGroup = "pupillen" | "junioren" | "senioren" | "masters";
export type Discipline =
  | "sprint"
  | "afstand"
  | "horden"
  | "estafette"
  | "springen"
  | "werpen"
  | "meerkamp"
  | "weg"
  | "snelwandelen";

export interface ClubRecord {
  id: number;
  event: string;
  category: string;
  athletes: string[];
  performance: string;
  note: string | null;
  venue: Venue;
  date: string | null;
  place: string | null;
  gender: Gender;
  ageGroup: AgeGroup;
  discipline: Discipline;
  /** Sorteersleutels: categorie-volgorde (pupil → master) en onderdeel-volgorde (kort → lang). */
  categoryOrder: number;
  eventOrder: number;
}

export const AGE_GROUPS: { value: AgeGroup; label: string }[] = [
  { value: "pupillen", label: "Pupillen" },
  { value: "junioren", label: "Junioren" },
  { value: "senioren", label: "Senioren" },
  { value: "masters", label: "Masters" },
];

export const DISCIPLINES: { value: Discipline; label: string }[] = [
  { value: "sprint", label: "Sprint" },
  { value: "afstand", label: "Midden & lang" },
  { value: "horden", label: "Horden & steeple" },
  { value: "estafette", label: "Estafette" },
  { value: "springen", label: "Springen" },
  { value: "werpen", label: "Werpen" },
  { value: "meerkamp", label: "Meerkamp" },
  { value: "weg", label: "Weg" },
  { value: "snelwandelen", label: "Snelwandelen" },
];

const FIELD_ORDER = [
  "hoogspringen",
  "polsstokhoog",
  "verspringen",
  "hinkstapsprong",
  "kogelstoten",
  "kogelstoten 1 kg",
  "kogelstoten 2 kg",
  "discuswerpen",
  "kogelslingeren",
  "speerwerpen",
  "gewichtwerpen",
  "balwerpen",
  "werp 5-kamp",
  "master 5-kamp",
];

/** Afstand in meters uit de onderdeelnaam ("10.000 meter", "4 x 100 m", "15 km weg", "1 e.m."). */
function distanceOf(event: string): number {
  if (/^1\/2 marathon/.test(event)) return 21097;
  if (/^marathon/.test(event)) return 42195;
  if (/uur/.test(event)) return 100000 + parseInt(event, 10); // tijdloop: na de afstanden
  const relay = event.match(/^(\d+) x (\d+) (k?m)/);
  if (relay) return Number(relay[1]) * Number(relay[2]) * (relay[3] === "km" ? 1000 : 1);
  const plain = event.match(/^([\d.]+)\s*(meter|m|km|e\.m\.)/);
  if (!plain) return 0;
  const value = Number(plain[1].replace(/\.(?=\d{3}\b)/g, ""));
  if (plain[2] === "km") return value * 1000;
  if (plain[2] === "e.m.") return value * 1609;
  return value;
}

function disciplineOf(event: string): Discipline {
  if (/snelwandelen/.test(event)) return "snelwandelen";
  if (/estafette/.test(event)) return "estafette";
  if (/weg|ekiden/.test(event)) return "weg";
  if (/kamp/.test(event)) return "meerkamp";
  if (/horden|steeple/.test(event)) return "horden";
  if (/springen|sprong|polsstok/.test(event)) return "springen";
  if (/werpen|stoten|slingeren/.test(event)) return "werpen";
  if (/uurloop/.test(event)) return "afstand";
  return distanceOf(event) <= 400 ? "sprint" : "afstand";
}

function eventOrderOf(event: string, discipline: Discipline): number {
  const base = DISCIPLINES.findIndex((d) => d.value === discipline) * 1_000_000;
  const fieldIndex = FIELD_ORDER.indexOf(event);
  if (fieldIndex !== -1) return base + fieldIndex;
  if (discipline === "meerkamp") return base + parseInt(event, 10);
  return base + distanceOf(event);
}

const SUB_ORDER: Record<string, number> = { mini: 0, C: 1, B: 2, A: 3 };
const JUNIOR_ORDER: Record<string, number> = { D: 0, C: 1, B: 2, A: 3 };

function classifyCategory(category: string): Pick<ClubRecord, "gender" | "ageGroup" | "categoryOrder"> {
  const [prefix, ...rest] = category.split(" ");
  const suffix = rest.join(" ");
  const gender: Gender = prefix === "Meisjes" || prefix === "Dames" ? "v" : "m";
  const genderOrder = gender === "v" ? 0 : 50;

  let ageGroup: AgeGroup;
  let sub = 0;
  if (/^pup/.test(suffix)) {
    ageGroup = "pupillen";
    sub = SUB_ORDER[suffix.replace("pup ", "")] ?? 0;
  } else if (/^[A-D]$/.test(suffix)) {
    ageGroup = "junioren";
    sub = JUNIOR_ORDER[suffix];
  } else if (/senioren/.test(suffix)) {
    ageGroup = "senioren";
  } else {
    ageGroup = "masters";
    sub = parseInt(suffix.replace(/\D/g, ""), 10) || 0;
  }

  const groupIndex = AGE_GROUPS.findIndex((g) => g.value === ageGroup);
  return { gender, ageGroup, categoryOrder: groupIndex * 1000 + genderOrder + sub / 10 };
}

type RawRecord = Omit<ClubRecord, "gender" | "ageGroup" | "discipline" | "categoryOrder" | "eventOrder">;

export function getClubRecords(): ClubRecord[] {
  return (rawRecords as RawRecord[])
    .map((record) => {
      const discipline = disciplineOf(record.event);
      return {
        ...record,
        ...classifyCategory(record.category),
        discipline,
        eventOrder: eventOrderOf(record.event, discipline),
      };
    })
    .sort((a, b) => a.categoryOrder - b.categoryOrder || a.eventOrder - b.eventOrder || a.id - b.id);
}
