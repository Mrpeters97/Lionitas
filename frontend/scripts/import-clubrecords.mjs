#!/usr/bin/env node
// Haalt alle clubrecords op van de huidige site (lionitas.nl/clubrecords) en schrijft
// ze genormaliseerd naar src/data/clubrecords.json. De oude site toont de records
// alleen na het versturen van een zoekformulier (POST) — we zoeken dus op "Alles",
// één keer outdoor en één keer indoor.
//
// Gebruik: `node scripts/import-clubrecords.mjs` (vanuit frontend/). Draai opnieuw
// zolang de oude site de bron is; daarna is het JSON-bestand (of WordPress) leidend.

import { writeFile } from "node:fs/promises";

const SOURCE_URL = "https://www.lionitas.nl/clubrecords/";
const OUT_FILE = new URL("../src/data/clubrecords.json", import.meta.url);

const decode = (s) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));

const clean = (s) => decode(s.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();

// De oude database is met de hand gevuld en heeft varianten van hetzelfde
// onderdeel ("4x100 m estafette" vs "4 x 100 m estafette", "15 km  weg") —
// die trekken we gelijk zodat het filter geen dubbele opties toont.
function normalizeEvent(raw) {
  return raw
    .replace(/\s+/g, " ")
    .replace(/(\d)x(\d)/g, "$1 x $2")
    .replace(/(\d)m snelwandelen/, "$1 m snelwandelen")
    .trim();
}

// "electronisch" (sic) en "handmatig" zijn varianten van dezelfde twee
// tijdwaarneming-opmerkingen.
function normalizeNote(raw) {
  const note = raw.trim();
  if (/^ele[ck]tronisch$/i.test(note)) return "elektronisch";
  if (/^handmatig$/i.test(note)) return "handtijd";
  return note || null;
}

function normalizeCategory(raw) {
  return raw.replace(/\bmasters\b/, "Masters").replace(/\s+/g, " ").trim();
}

async function fetchTable(inoutdoor) {
  const body = new URLSearchParams({
    onderdeel: "Alles",
    categorie: "Alles",
    inoutdoor,
    clubrecord: "Zoeken",
  });
  const res = await fetch(SOURCE_URL, {
    method: "POST",
    body,
    headers: { "User-Agent": "Mozilla/5.0 (Lionitas clubrecords import)" },
  });
  if (!res.ok) throw new Error(`${inoutdoor}: HTTP ${res.status}`);
  const html = await res.text();

  const start = html.indexOf("Lionitas clubrecords");
  if (start === -1) throw new Error(`${inoutdoor}: resultaattabel niet gevonden`);
  const table = html.slice(start, html.indexOf("</table>", start));

  const rows = [...table.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map((m) =>
    [...m[1].matchAll(/<td>([\s\S]*?)<\/td>/g)].map((c) => c[1]),
  );

  return rows
    .filter((cells) => cells.length === 8)
    .map(([event, category, names, performance, note, venue, date, place]) => ({
      event: normalizeEvent(clean(event)),
      category: normalizeCategory(clean(category)),
      // Estafettes: namen staan onder elkaar met <br>.
      athletes: names
        .split(/<br\s*\/?>/i)
        .map(clean)
        .filter(Boolean),
      performance: clean(performance),
      note: normalizeNote(clean(note)),
      venue: clean(venue).toLowerCase() === "indoor" ? "indoor" : "outdoor",
      date: /^\d{4}-\d{2}-\d{2}$/.test(clean(date)) && clean(date) !== "0000-00-00" ? clean(date) : null,
      place: clean(place) || null,
    }));
}

// Grote estafettes (bv. 10 x 10 km) staan op de oude site verspreid over meerdere
// rijen met verder identieke gegevens — die voegen we samen tot één record.
const isRelay = (event) => /estafette|ekiden|\d x \d/.test(event);
const sameRecord = (a, b) =>
  ["event", "category", "performance", "venue", "date", "place"].every((key) => a[key] === b[key]);

const merged = [];
for (const record of [...(await fetchTable("outdoor")), ...(await fetchTable("indoor"))]) {
  const previous = merged.at(-1);
  if (previous && isRelay(record.event) && sameRecord(previous, record)) {
    previous.athletes.push(...record.athletes);
  } else {
    merged.push(record);
  }
}

const records = merged.map((record, index) => ({ id: index + 1, ...record }));

await writeFile(OUT_FILE, JSON.stringify(records, null, 2) + "\n");
console.log(`${records.length} clubrecords geschreven naar ${OUT_FILE.pathname}`);
