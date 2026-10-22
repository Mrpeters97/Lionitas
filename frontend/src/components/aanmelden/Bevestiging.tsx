"use client";

import type { RefObject } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import PillLink from "@/components/PillLink";
import { LEDENADMINISTRATIE, categoryById, isMinor, trainsAtLionitas, type AanmeldData } from "@/lib/aanmelding";
import { Note } from "./fields";

interface BevestigingProps {
  reference: string;
  data: AanmeldData;
  today: Date;
  headingRef: RefObject<HTMLHeadingElement | null>;
}

export default function Bevestiging({ reference, data, today, headingRef }: BevestigingProps) {
  const reduceMotion = useReducedMotion();
  const kid = data.category === "nijntje" || data.category === "pupillen";
  const minor = isMinor(data, today);
  const name = data.callName.trim() || data.firstNames.trim();

  const nextSteps = [
    {
      title: "We verwerken je aanmelding",
      text: `De ledenadministratie zet ${kid ? `${name} ` : "je "}in de ledenlijst. Is er nog iets onduidelijk, dan mailen we naar ${data.email1}.`,
    },
    ...(kid
      ? [
          {
            title: "Uitnodiging voor de ClubApp Spond",
            text: "Daarin vind je berichten over trainingen, wedstrijden en activiteiten, en kun je je opgeven voor vrijwilligerstaken.",
          },
        ]
      : []),
    {
      title: "Mail van de Atletiekunie over Volta",
      text: `In de Volta-app zie je facturen, ${minor ? "het bondsnummer van je kind" : "je bondsnummer"} en je vrijwilligerspunten.`,
    },
    {
      title: "De eerste incasso",
      text: "De clubcontributie wordt aan het begin van elk kwartaal afgeschreven. De bijdrage aan de Atletiekunie volgt in het kwartaal waarin je lid wordt.",
    },
  ];

  const appear = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4">
      <motion.div
        {...appear(0)}
        className="flex flex-col gap-5 rounded-card bg-surface-dark p-8 text-on-dark sm:flex-row sm:gap-6 sm:p-12"
      >
        <motion.span
          aria-hidden
          initial={reduceMotion ? false : { scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.15 }}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent sm:mt-1 sm:h-12 sm:w-12"
        >
          <Check size={24} strokeWidth={3} className="text-navy" />
        </motion.span>

        <div className="flex min-w-0 flex-1 flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <div className="min-w-0">
            <p className="eyebrow">Aanmelding ontvangen</p>
            <h2 ref={headingRef} tabIndex={-1} className="h2 mt-2 text-on-dark outline-none" aria-live="polite">
              Welkom bij Lionitas{name ? `, ${name}` : ""}!
            </h2>
            <p className="mt-4 max-w-2xl text-body text-on-dark-muted">
              {kid
                ? `Bedankt voor het aanmelden van ${name || "je kind"} bij ${categoryById(data.category)?.label}. We hebben alles goed ontvangen.`
                : "Bedankt voor je aanmelding. We hebben alles goed ontvangen, leuk dat je erbij komt!"}
            </p>
          </div>

          <dl className="inline-flex shrink-0 flex-col self-start rounded-panel bg-white/10 px-5 py-3 lg:self-end">
            <dt className="text-meta text-on-dark-muted">Aanmeldnummer</dt>
            <dd className="text-label font-bold tracking-wider tabular-nums">{reference}</dd>
          </dl>
        </div>
      </motion.div>

      <motion.div {...appear(0.12)} className="rounded-card bg-surface p-8 sm:p-12">
        <h3 className="h4">Wat gebeurt er nu?</h3>
        <ol className={`mt-6 grid gap-6 lg:gap-x-12 ${nextSteps.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2"}`}>
          {nextSteps.map((item, index) => (
            <li key={item.title} className="flex gap-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-page text-label tabular-nums text-heading">
                {index + 1}
              </span>
              <div className="pt-1">
                <p className="text-label text-heading">{item.title}</p>
                <p className="mt-1 text-body text-on-light-muted">{item.text}</p>
              </div>
            </li>
          ))}
        </ol>

        {data.category === "nijntje" && (
          <Note className="mt-8">
            Na 20 trainingen haalt {name || "je kind"} het Nijntje Beweegdiploma. Ongeveer twee maanden voor de zesde verjaardag
            nemen we contact op over doorstromen naar de pupillen.
          </Note>
        )}
        {data.category === "pupillen" && data.athleticsChamps === "ja" && (
          <Note className="mt-8">We delen {name || "je kind"} in bij een Athletics Champs-team en houden je via de ClubApp op de hoogte.</Note>
        )}
        {data.category === "senioren" && trainsAtLionitas(data) && data.studentDiscount === "ja" && (
          <Note className="mt-8">
            Vergeet niet een bewijs van inschrijving van je studie te mailen naar{" "}
            <a href={`mailto:${LEDENADMINISTRATIE}`} className="font-semibold text-blue underline underline-offset-4">
              {LEDENADMINISTRATIE}
            </a>
            . Dan verwerken we de studentenkorting.
          </Note>
        )}

        <div className="mt-10 flex flex-wrap gap-3 border-t border-ink/10 pt-8">
          <PillLink href="/trainingen/trainingsrooster" variant="blue">
            Bekijk het trainingsrooster
          </PillLink>
          <PillLink href="/" variant="navy">
            Terug naar home
          </PillLink>
        </div>
      </motion.div>
    </div>
  );
}
