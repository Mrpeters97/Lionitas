"use client";

import { useDeferredValue, useEffect, useId, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Search, X } from "lucide-react";
import {
  AGE_GROUPS,
  DISCIPLINES,
  type ClubRecord,
  type Discipline,
  type Gender,
  type Venue,
} from "@/lib/clubrecords";

type GenderFilter = "all" | Gender;

interface Filters {
  venue: Venue;
  gender: GenderFilter;
  /** "all", "group:<AgeGroup>" of "cat:<categorie>" — één select dekt leeftijdsgroep én losse categorie. */
  category: string;
  discipline: "all" | Discipline;
  query: string;
}

const DEFAULT_FILTERS: Filters = { venue: "outdoor", gender: "all", category: "all", discipline: "all", query: "" };

// Filters staan in de URL (?venue=indoor&cat=…), zodat een gefilterde lijst te delen is.
const PARAM_KEYS: Record<keyof Filters, string> = {
  venue: "venue",
  gender: "geslacht",
  category: "cat",
  discipline: "onderdeel",
  query: "q",
};

function readFiltersFromUrl(): Filters {
  const params = new URLSearchParams(window.location.search);
  const get = (key: keyof Filters) => params.get(PARAM_KEYS[key]);
  return {
    venue: get("venue") === "indoor" ? "indoor" : "outdoor",
    gender: get("gender") === "v" || get("gender") === "m" ? (get("gender") as Gender) : "all",
    category: get("category") ?? "all",
    discipline: DISCIPLINES.some((d) => d.value === get("discipline")) ? (get("discipline") as Discipline) : "all",
    query: get("query") ?? "",
  };
}

function writeFiltersToUrl(filters: Filters) {
  const params = new URLSearchParams();
  (Object.keys(PARAM_KEYS) as (keyof Filters)[]).forEach((key) => {
    const value = filters[key].trim();
    if (value && value !== DEFAULT_FILTERS[key]) params.set(PARAM_KEYS[key], value);
  });
  const search = params.toString();
  window.history.replaceState(null, "", search ? `?${search}` : window.location.pathname);
}

const dateFormat = new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const formatDate = (date: string | null) => (date ? dateFormat.format(new Date(`${date}T00:00:00Z`)) : null);

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

function matchesCategory(record: ClubRecord, category: string) {
  if (category === "all") return true;
  if (category.startsWith("group:")) return record.ageGroup === category.slice(6);
  return record.category === category.slice(4);
}

function matchesQuery(record: ClubRecord, query: string) {
  if (!query) return true;
  const haystack = normalize([record.event, record.category, record.place ?? "", ...record.athletes].join(" "));
  return normalize(query)
    .split(/\s+/)
    .every((term) => haystack.includes(term));
}

/** Gedeelde records (zelfde onderdeel + prestatie + waarneming) worden één rij met meerdere houders. */
interface RecordRow {
  key: string;
  event: string;
  performance: string;
  note: string | null;
  discipline: Discipline;
  eventOrder: number;
  holders: ClubRecord[];
}

function toRows(records: ClubRecord[]): RecordRow[] {
  const rows = new Map<string, RecordRow>();
  records.forEach((record) => {
    const key = `${record.event}|${record.performance}|${record.note ?? ""}`;
    const row = rows.get(key);
    if (row) row.holders.push(record);
    else rows.set(key, { ...record, key, holders: [record] });
  });
  return [...rows.values()]
    .map((row) => ({ ...row, holders: [...row.holders].sort((a, b) => (a.date ?? "").localeCompare(b.date ?? "")) }))
    .sort((a, b) => a.eventOrder - b.eventOrder || Number(a.note === "handtijd") - Number(b.note === "handtijd"));
}

export default function ClubrecordsExplorer({
  records,
  recentSince,
}: {
  records: ClubRecord[];
  /** ISO-datum; records vanaf deze datum krijgen een "Nieuw"-label. */
  recentSince: string;
}) {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const deferredQuery = useDeferredValue(filters.query.trim());

  // De URL is pas na mount beschikbaar (de pagina zelf is statisch).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilters(readFiltersFromUrl());
  }, []);

  // URL bijwerken vanuit de handler, niet vanuit een effect: dat zou bij de eerste
  // (Strict Mode-dubbele) run de gedeelde URL met defaults overschrijven.
  const update = (patch: Partial<Filters>) => {
    const next = { ...filters, ...patch };
    setFilters(next);
    writeFiltersToUrl(next);
  };

  // Categorie-opties volgen baan + geslacht, gegroepeerd per leeftijdsgroep. In een
  // select verschuift er niets in de layout als de lijst verandert.
  const categoryGroups = useMemo(() => {
    const pool = records.filter(
      (r) => r.venue === filters.venue && (filters.gender === "all" || r.gender === filters.gender),
    );
    return AGE_GROUPS.map((group) => ({
      ...group,
      categories: [...new Set(pool.filter((r) => r.ageGroup === group.value).map((r) => r.category))],
    })).filter((group) => group.categories.length > 0);
  }, [records, filters.venue, filters.gender]);

  // Valt de gekozen categorie weg door een baan/geslacht-wissel, dan terug naar "alle".
  const category =
    (filters.category.startsWith("cat:") &&
      !categoryGroups.some((g) => g.categories.includes(filters.category.slice(4)))) ||
    (filters.category.startsWith("group:") && !categoryGroups.some((g) => `group:${g.value}` === filters.category))
      ? "all"
      : filters.category;

  const results = useMemo(
    () =>
      records.filter(
        (r) =>
          r.venue === filters.venue &&
          (filters.gender === "all" || r.gender === filters.gender) &&
          matchesCategory(r, category) &&
          (filters.discipline === "all" || r.discipline === filters.discipline) &&
          matchesQuery(r, deferredQuery),
      ),
    [records, filters.venue, filters.gender, category, filters.discipline, deferredQuery],
  );

  const groups = useMemo(() => {
    const byCategory = new Map<string, ClubRecord[]>();
    results.forEach((r) => byCategory.set(r.category, [...(byCategory.get(r.category) ?? []), r]));
    return [...byCategory.entries()].map(([title, hits]) => ({ title, rows: toRows(hits) }));
  }, [results]);

  const recordCount = groups.reduce((sum, group) => sum + group.rows.length, 0);
  const isFiltered =
    filters.gender !== "all" || category !== "all" || filters.discipline !== "all" || filters.query.trim() !== "";
  const resetFilters = () => update({ gender: "all", category: "all", discipline: "all", query: "" });

  return (
    <div>
      {/* Filterpaneel — elk veld met een label, allemaal even hoog (h-12). */}
      <div className="rounded-panel bg-surface shadow-[0_20px_50px_rgba(0,14,53,0.12)]">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-x-4 gap-y-5 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-[auto_auto_minmax(0,1fr)] lg:p-8">
          <Field label="Baan">
            <Segmented
              label="Baan"
              layoutId="seg-venue"
              value={filters.venue}
              onChange={(venue) => update({ venue })}
              options={[
                { value: "outdoor", label: "Outdoor" },
                { value: "indoor", label: "Indoor" },
              ]}
            />
          </Field>
          <Field label="Geslacht">
            <Segmented
              label="Geslacht"
              layoutId="seg-gender"
              value={filters.gender}
              onChange={(gender) => update({ gender })}
              options={[
                { value: "all", label: "Iedereen" },
                { value: "v", label: "Vrouwen" },
                { value: "m", label: "Mannen" },
              ]}
            />
          </Field>
          <Field label="Zoeken" className="sm:col-span-2 lg:col-span-1">
            {(id) => (
              <div className="relative">
                <Search
                  aria-hidden
                  size={18}
                  strokeWidth={2}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-on-light-muted"
                />
                <input
                  id={id}
                  type="search"
                  value={filters.query}
                  onChange={(event) => update({ query: event.target.value })}
                  placeholder="Naam of onderdeel"
                  className={`h-12 w-full rounded-pill bg-page pl-11 text-body ${filters.query ? "pr-11" : "pr-4"} text-foreground placeholder:text-on-light-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue [&::-webkit-search-cancel-button]:hidden`}
                />
                {filters.query && (
                  <button
                    type="button"
                    onClick={() => update({ query: "" })}
                    aria-label="Zoekopdracht wissen"
                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-pill text-on-light-muted transition hover:bg-surface hover:text-heading focus-visible:outline-2 focus-visible:outline-blue"
                  >
                    <X aria-hidden size={16} strokeWidth={2} />
                  </button>
                )}
              </div>
            )}
          </Field>
          <Field label="Categorie" className="lg:col-span-2">
            {(id) => (
              <Select id={id} value={category} onChange={(value) => update({ category: value })}>
                <option value="all">Alle categorieën</option>
                {categoryGroups.map((group) => (
                  <optgroup key={group.value} label={group.label}>
                    {group.categories.length > 1 && (
                      <option value={`group:${group.value}`}>Alle {group.label.toLowerCase()}</option>
                    )}
                    {group.categories.map((name) => (
                      <option key={name} value={`cat:${name}`}>
                        {name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Onderdeel">
            {(id) => (
              <Select
                id={id}
                value={filters.discipline}
                onChange={(value) => update({ discipline: value as Filters["discipline"] })}
              >
                <option value="all">Alle onderdelen</option>
                {DISCIPLINES.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </div>

        {/* Samenvatting — "Filters wissen" houdt altijd z'n plek (invisible), zodat er niets verspringt. */}
        <div className="flex items-center justify-between gap-4 border-t border-ink/10 px-5 py-4 sm:px-6 lg:px-8">
          <p className="whitespace-nowrap text-body text-on-light-muted" aria-live="polite">
            <span className="font-semibold tabular-nums text-heading">{recordCount}</span>{" "}
            {recordCount === 1 ? "record" : "records"} {filters.venue}
          </p>
          <button
            type="button"
            onClick={resetFilters}
            tabIndex={isFiltered ? 0 : -1}
            aria-hidden={!isFiltered}
            className={`shrink-0 rounded-pill px-3 py-1.5 text-meta font-semibold text-blue sm:text-label transition-colors hover:text-blue-hover focus-visible:outline-2 focus-visible:outline-blue ${
              isFiltered ? "" : "invisible"
            }`}
          >
            Filters wissen
          </button>
        </div>
      </div>

      {/* Resultaten — min-hoogte zodat de pagina niet inklapt bij weinig resultaten. */}
      <div className="mt-14 min-h-[60vh]">
        {groups.length === 0 ? (
          <div className="rounded-panel bg-surface px-6 py-16 text-center">
            <p className="h4">Geen records gevonden</p>
            <p className="mt-3 text-body text-on-light-muted">Probeer een andere zoekterm of minder filters.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-14">
            {groups.map((group) => (
              <section key={group.title} aria-labelledby={`group-${group.title}`}>
                <div className="mb-4 flex items-end justify-between gap-4">
                  <h2 id={`group-${group.title}`} className="h4">
                    {group.title}
                  </h2>
                  <span className="shrink-0 text-meta text-on-light-muted">
                    {group.rows.length} {group.rows.length === 1 ? "record" : "records"}
                  </span>
                </div>
                <RecordTable
                  rows={group.rows}
                  groupByDiscipline={filters.discipline === "all"}
                  recentSince={recentSince}
                />
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RecordTable({
  rows,
  groupByDiscipline,
  recentSince,
}: {
  rows: RecordRow[];
  groupByDiscipline: boolean;
  recentSince: string;
}) {
  const th = "px-4 py-3 text-left text-meta font-semibold text-on-light-muted first:pl-6 last:pr-6";
  // Onder md wordt elke rij een compacte "kaart" (grid), vanaf md een echte tabelrij.
  const td = "md:table-cell md:px-4 md:py-4 md:align-top md:first:pl-6 md:last:pr-6";

  const sections = groupByDiscipline
    ? DISCIPLINES.map((d) => ({ key: d.value, label: d.label, rows: rows.filter((r) => r.discipline === d.value) })).filter(
        (d) => d.rows.length > 0,
      )
    : [{ key: "all", label: null, rows }];

  return (
    <div className="overflow-hidden rounded-panel bg-surface">
      {/* table-fixed + vaste kolombreedtes: zo lijnen de kolommen uit tussen de categorieën.
          Expliciete rollen: onder md wordt de tabel een grid (block/grid-display) en dan
          laten sommige browsers (Safari) de tabelsemantiek vallen — WCAG 1.3.1. */}
      <table role="table" className="block w-full md:table md:table-fixed">
        {/* Onder md visueel verborgen maar wél voorgelezen (niet `hidden`). */}
        <thead role="rowgroup" className="sr-only md:not-sr-only md:table-header-group md:border-b md:border-ink/10">
          <tr role="row">
            <th role="columnheader" scope="col" className={`${th} w-[32%]`}>Onderdeel</th>
            <th role="columnheader" scope="col" className={`${th} w-[18%]`}>Prestatie</th>
            <th role="columnheader" scope="col" className={th}>Recordhouder</th>
          </tr>
        </thead>
        {sections.map((section) => (
          <tbody key={section.key} role="rowgroup" className="block divide-y divide-ink/10 md:table-row-group">
            {section.label && (
              // Discipline-kop: bewust ingetogen tussenkopje (klein, kapitalen, gedimd) met
              // witruimte erboven en een dunne lijn tussen groepen; geen band of zware lijn.
              <tr
                role="row"
                className="block border-t border-ink/10 border-b-0 [tbody:first-of-type>&]:border-t-0 md:table-row"
              >
                <th
                  role="rowheader"
                  scope="rowgroup"
                  colSpan={3}
                  className="block px-5 pb-1 pt-6 text-left text-meta font-semibold uppercase tracking-wider text-on-light-muted md:table-cell md:px-6"
                >
                  {section.label}
                </th>
              </tr>
            )}
            {section.rows.map((row) => (
              <tr
                key={row.key}
                role="row"
                className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 px-5 py-4 md:table-row md:p-0"
              >
                <th role="rowheader" scope="row" className={`${td} text-left text-body font-semibold text-heading`}>
                  <span className="inline-block first-letter:uppercase">{row.event}</span>
                </th>
                <td role="cell" className={`${td} text-right md:text-left`}>
                  <span className="text-label font-bold tabular-nums text-heading">{row.performance}</span>
                  {row.note && row.note !== "elektronisch" && (
                    <span className="block text-meta text-on-light-muted">{row.note}</span>
                  )}
                </td>
                <td role="cell" className={`${td} col-span-2`}>
                  <ul className="flex flex-col gap-2.5">
                    {row.holders.map((holder) => {
                      const isNew = holder.date != null && holder.date >= recentSince;
                      const meta = [formatDate(holder.date), holder.place].filter(Boolean).join(" · ");
                      return (
                        <li key={holder.id}>
                          <span className="text-body text-foreground">{holder.athletes.join(", ")}</span>
                          {isNew && (
                            <span className="ml-2 inline-block rounded-pill bg-accent px-2 py-0.5 align-middle text-meta leading-none text-navy">
                              Nieuw
                            </span>
                          )}
                          {meta && <span className="block text-meta text-on-light-muted">{meta}</span>}
                        </li>
                      );
                    })}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        ))}
      </table>
    </div>
  );
}

/** Label boven een filterveld. `children` als functie krijgt een id voor `<label htmlFor>`. */
function Field({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode | ((id: string) => React.ReactNode);
}) {
  const id = useId();
  const isControl = typeof children === "function";
  return (
    <div className={className}>
      {isControl ? (
        <label htmlFor={id} className="mb-2 block text-meta font-semibold text-heading">
          {label}
        </label>
      ) : (
        <span aria-hidden className="mb-2 block text-meta font-semibold text-heading">
          {label}
        </span>
      )}
      {isControl ? children(id) : children}
    </div>
  );
}

function Segmented<T extends string>({
  label,
  layoutId,
  value,
  options,
  onChange,
}: {
  label: string;
  layoutId: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex h-12 rounded-pill bg-page p-1">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={`relative min-w-0 flex-1 rounded-pill px-2 text-meta font-semibold whitespace-nowrap min-[400px]:px-3 min-[400px]:text-label sm:px-5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue ${
              active ? "text-on-dark" : "text-foreground hover:text-blue"
            }`}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-pill bg-navy"
                transition={{ type: "spring", stiffness: 400, damping: 34 }}
              />
            )}
            <span className="relative">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function Select({
  id,
  value,
  onChange,
  children,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full cursor-pointer appearance-none rounded-pill bg-page pl-5 pr-12 text-body text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        size={18}
        strokeWidth={2}
        className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-heading"
      />
    </div>
  );
}
