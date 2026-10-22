"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLenis } from "lenis/react";
import { AlertCircle, Check, ChevronLeft, Loader2 } from "lucide-react";
import { submitAanmelding } from "@/app/lid-worden/actions";
import {
  EMPTY_AANMELDING,
  LEDENADMINISTRATIE,
  STEPS,
  categoryById,
  firstInvalidStep,
  isMinor,
  validateStep,
  type AanmeldData,
  type Errors,
  type Field,
  type StepId,
} from "@/lib/aanmelding";
import { PillButton } from "@/components/PillLink";
import Section from "@/components/Section";
import Bevestiging from "./Bevestiging";
import type { FormApi } from "./fields";
import { StepBetaling, StepCategorie, StepContact, StepControle, StepLidmaatschap, StepPersoon } from "./steps";

// Concept blijft bewaard bij per ongeluk herladen/wegklikken — alleen in deze tab
// (sessionStorage) en zonder IBAN.
const DRAFT_KEY = "lionitas-aanmelding";

const STEP_COMPONENTS = {
  categorie: StepCategorie,
  persoon: StepPersoon,
  contact: StepContact,
  lidmaatschap: StepLidmaatschap,
  betaling: StepBetaling,
} as const;

// Stapwissel: oude inhoud vervaagt, nieuwe vervaagt in en komt een klein stukje omhoog.
// Bewust geen zijwaartse beweging. `custom` = afstand (0 bij reduced motion: alleen fade).
const STEP_VARIANTS = {
  enter: (distance: number) => ({ opacity: 0, y: distance }),
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0 },
};

/** Ruimte voor de vaste header = `scroll-padding-top` op <html> (globals.css). Lenis en
 *  scrollIntoView houden daar zelf al rekening mee, dus geen extra offset meegeven. */
const headerSpace = () => Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;

function stepTitle(step: StepId, data: AanmeldData) {
  const kid = data.category === "nijntje" || data.category === "pupillen";
  switch (step) {
    case "categorie":
      return "Waar meld je je voor aan?";
    case "persoon":
      return kid ? "Over je kind" : "Over jou";
    case "contact":
      return "Adres & contact";
    case "lidmaatschap":
      return "Lidmaatschap";
    case "betaling":
      return "Machtiging";
    case "controle":
      return "Controleren & versturen";
  }
}

// Geen PageHero: het formulier begint direct onder de vaste header (pt = ruimte voor
// die header, zelfde waarden als PageHero). Ook de bevestiging staat daar.
const TOP_SPACE = "pt-28 sm:pt-32 xl:pt-40";

interface AanmeldFormulierProps {
  /** Inhoud onder het formulier (bv. links naar de subpagina's). */
  children?: ReactNode;
}

export default function AanmeldFormulier({ children }: AanmeldFormulierProps) {
  const today = useMemo(() => new Date(), []);
  const reduceMotion = useReducedMotion();
  const lenis = useLenis();

  const [data, setData] = useState<AanmeldData>(EMPTY_AANMELDING);
  const [errors, setErrors] = useState<Errors>({});
  const [step, setStep] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  const [lockedHeight, setLockedHeight] = useState<number>();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    reference: string;
    data: AanmeldData;
  } | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const navigated = useRef(false);
  const restored = useRef(false);

  // Concept herstellen na mount (de pagina zelf is statisch).
  useEffect(() => {
    try {
      const draft = JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? "null");
      if (draft?.data) {
        /* eslint-disable react-hooks/set-state-in-effect */
        setData({ ...EMPTY_AANMELDING, ...draft.data, iban: "" });
        setStep(Math.min(draft.step ?? 0, STEPS.length - 1));
        setMaxStep(Math.min(draft.maxStep ?? 0, STEPS.length - 1));
        /* eslint-enable react-hooks/set-state-in-effect */
      }
    } catch {
      // geen of kapot concept → gewoon leeg beginnen
    }
    restored.current = true;
  }, []);

  useEffect(() => {
    if (!restored.current || result) return;
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ data: { ...data, iban: "" }, step, maxStep }));
    } catch {
      // opslag geblokkeerd (privévenster) — formulier werkt gewoon door
    }
  }, [data, step, maxStep, result]);

  // Na het versturen wordt de pagina veel korter: direct naar boven, en Lenis eerst
  // de nieuwe hoogte laten meten.
  useEffect(() => {
    if (!result) return;
    lenis?.resize();
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo(0, 0);
    headingRef.current?.focus({ preventScroll: true });
  }, [result, lenis]);

  const set = useCallback<FormApi["set"]>((field, value) => {
    setData((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }, []);

  const form: FormApi = { data, errors, set };

  /** Scrollt naar de bovenkant van het formulier (niet van de pagina), alleen als die uit beeld is. */
  const scrollToFormTop = () => {
    const panel = panelRef.current;
    if (!panel) return;
    const space = headerSpace();
    const top = panel.getBoundingClientRect().top;
    if (top >= space) return;
    // Doel zelf uitrekenen vanaf de échte scrollpositie: Lenis' eigen positie kan net
    // achterlopen als de browser vlak ervoor native scrolde (bv. focus op de knop).
    const target = window.scrollY + top - space;
    if (lenis) {
      if (Math.abs(lenis.animatedScroll - window.scrollY) > 1)
        lenis.scrollTo(window.scrollY, { immediate: true, force: true });
      lenis.scrollTo(target, { duration: reduceMotion ? 0 : 0.7, force: true });
    } else {
      window.scrollTo({
        top: target,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    }
  };

  const focusFirstError = (stepErrors: Errors) => {
    const first = Object.keys(stepErrors)[0] as Field | undefined;
    if (!first) return;
    requestAnimationFrame(() => {
      const element = panelRef.current?.querySelector<HTMLElement>(`[data-field="${first}"]`);
      element?.focus({ preventScroll: true });
      element?.closest("fieldset, div")?.scrollIntoView({
        block: "center",
        behavior: reduceMotion ? "auto" : "smooth",
      });
    });
  };

  const goTo = (index: number) => {
    navigated.current = true;
    // Hoogte vasthouden tijdens de wissel: anders klapt het paneel even in, wordt de
    // pagina korter en springt de browser omhoog.
    if (index !== step) setLockedHeight(panelRef.current?.offsetHeight);
    scrollToFormTop();
    setSubmitError(null);
    setErrors({});
    setStep(index);
    setMaxStep((current) => Math.max(current, index));

    // Rekeninghouder alvast invullen met de ouder/verzorger of het lid zelf.
    if (STEPS[index].id === "betaling" && !data.accountHolder.trim()) {
      const holder = isMinor(data, today)
        ? data.guardianName
        : `${data.firstNames.split(" ")[0] ?? ""} ${data.lastName}`;
      if (holder.trim()) set("accountHolder", holder.trim());
    }
  };

  /** Valideert de huidige stap; geeft true terug als die klopt. */
  const checkCurrentStep = () => {
    const stepErrors = validateStep(STEPS[step].id, data, today);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) {
      focusFirstError(stepErrors);
      return false;
    }
    return true;
  };

  // Stap 1 = alleen kaarten, geen knoppen: een klik/tik op een kaart gaat meteen door.
  // Met het toetsenbord niet (pijltjes lopen langs de kaarten): daar gaat Enter door,
  // of verschijnt na een keuze met spatie/pijltjes alsnog de "Volgende"-knop. Wie later
  // terugkomt naar stap 1 krijgt gewoon de knoppen, zonder automatisch doorgaan.
  const advanceTimer = useRef<number | undefined>(undefined);
  const [keyboardPick, setKeyboardPick] = useState(false);
  useEffect(() => () => window.clearTimeout(advanceTimer.current), []);

  const handleCategoryPick = (via: "pointer" | "keyboard" | "enter") => {
    window.clearTimeout(advanceTimer.current);
    if (via === "enter") return goTo(1);
    if (maxStep > 0) return;
    if (via === "keyboard") return setKeyboardPick(true);
    // Even laten zien dat de kaart gekozen is, dan door.
    advanceTimer.current = window.setTimeout(() => goTo(1), 700);
  };
  const showNav = step > 0 || maxStep > 0 || keyboardPick;

  const goToStepper = (index: number) => {
    if (index === step || index > maxStep) return;
    if (index > step && !checkCurrentStep()) return;
    goTo(index);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting || !checkCurrentStep()) return;

    if (step < STEPS.length - 1) {
      goTo(step + 1);
      return;
    }

    // Laatste stap: alles nog één keer langs (een eerdere stap kan door een gewijzigde
    // categorie of geboortedatum ongeldig zijn geworden).
    const invalid = firstInvalidStep(data, today);
    if (invalid !== -1) {
      goTo(invalid);
      const stepErrors = validateStep(STEPS[invalid].id, data, today);
      setErrors(stepErrors);
      focusFirstError(stepErrors);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const response = await submitAanmelding(data);
      if (response.ok) {
        try {
          sessionStorage.removeItem(DRAFT_KEY);
        } catch {}
        setResult({ reference: response.reference, data });
      } else {
        setSubmitError(response.message);
        if (response.step != null && response.step !== step) goTo(response.step);
      }
    } catch {
      setSubmitError(`Er ging iets mis met de verbinding. Probeer het opnieuw of mail ${LEDENADMINISTRATIE}.`);
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <Section bg="page" padTop={false} className={TOP_SPACE}>
        <Bevestiging reference={result.reference} data={result.data} today={today} headingRef={headingRef} />
      </Section>
    );
  }

  const current = STEPS[step];
  const title = stepTitle(current.id, data);
  const isLast = step === STEPS.length - 1;
  const StepComponent = current.id === "controle" ? null : STEP_COMPONENTS[current.id];

  return (
    <Section bg="page" padTop={false} className={TOP_SPACE}>
      <h1 className="sr-only">Lid worden bij Lionitas</h1>
      {/* Smaller dan de paginabreedte: zelfde breedte als de clubrecords-pagina en de header-pill (max-w-6xl). */}
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_17rem] xl:gap-4">
          <form noValidate onSubmit={handleSubmit} className="min-w-0">
            <div
              ref={panelRef}
              style={{ minHeight: lockedHeight }}
              className="rounded-card bg-surface p-6 shadow-[0_20px_50px_rgba(0,14,53,0.06)] sm:p-10 xl:p-12"
            >
              {/* Voortgang onder xl (daarboven staat de stappenlijst rechts) */}
              <div className="mb-8 xl:hidden">
                <div className="flex items-baseline justify-between gap-4 text-meta">
                  <span className="text-on-light-muted">
                    Stap {step + 1} van {STEPS.length}
                  </span>
                  {step < STEPS.length - 1 && (
                    <span className="text-on-light-muted">Volgende: {STEPS[step + 1].label}</span>
                  )}
                </div>
                <div className="mt-3 flex gap-1.5" aria-hidden>
                  {STEPS.map((entry, index) => (
                    <span
                      key={entry.id}
                      className={`h-1.5 flex-1 rounded-pill transition-colors duration-500 ${index <= step ? "bg-blue" : "bg-ink/10"}`}
                    />
                  ))}
                </div>
              </div>

              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={current.id}
                  custom={reduceMotion ? 0 : 8}
                  variants={STEP_VARIANTS}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  onAnimationComplete={(definition) => {
                    if (definition !== "center") return;
                    setLockedHeight(undefined);
                    if (navigated.current) headingRef.current?.focus({ preventScroll: true });
                  }}
                >
                  <header className="mb-6">
                    <p className="hidden text-meta text-on-light-muted xl:block">
                      Stap {step + 1} van {STEPS.length}
                    </p>
                    <h2 ref={headingRef} tabIndex={-1} className="h3 mt-1 outline-none">
                      {title}
                    </h2>
                  </header>

                  {current.id === "categorie" ? (
                    <StepCategorie form={form} today={today} onPick={handleCategoryPick} />
                  ) : StepComponent ? (
                    <StepComponent form={form} today={today} />
                  ) : (
                    <StepControle
                      form={form}
                      today={today}
                      onEdit={(id) => goTo(STEPS.findIndex((s) => s.id === id))}
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              {Object.keys(errors).length > 0 && (
                <p role="alert" className="mt-8 flex items-center gap-2 text-meta text-danger">
                  <AlertCircle aria-hidden size={16} strokeWidth={2} className="shrink-0" />
                  Nog niet alles is goed ingevuld. Bekijk de gemarkeerde velden.
                </p>
              )}
              {submitError && (
                <div
                  role="alert"
                  className="mt-8 flex gap-3 rounded-panel bg-page p-4 text-body text-danger ring-1 ring-inset ring-danger sm:p-5"
                >
                  <AlertCircle aria-hidden size={20} strokeWidth={2} className="mt-0.5 shrink-0" />
                  {submitError}
                </div>
              )}

              {showNav && (
                <div className="mt-10 flex flex-wrap-reverse items-center justify-between gap-2 sm:gap-4">
                  {step > 0 ? (
                    <button
                      type="button"
                      onClick={() => goTo(step - 1)}
                      className="-ml-2 flex items-center gap-1 rounded-pill py-2.5 pl-2 pr-3 text-label text-heading transition-colors hover:bg-page focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue sm:ml-0 sm:gap-1.5 sm:pl-3 sm:pr-5"
                    >
                      <ChevronLeft aria-hidden size={18} strokeWidth={2} />
                      Vorige
                    </button>
                  ) : (
                    <span />
                  )}
                  <PillButton
                    type="submit"
                    variant="blue"
                    disabled={submitting}
                    icon={submitting ? <Loader2 aria-hidden size={20} className="animate-spin" /> : undefined}
                  >
                    {isLast ? (submitting ? "Versturen…" : "Aanmelding versturen") : "Volgende stap"}
                  </PillButton>
                </div>
              )}
            </div>

            <div className="mt-4 xl:hidden">
              <HelpCard />
            </div>
          </form>

          <aside className="hidden xl:block">
            <div className="sticky top-32 flex flex-col gap-4">
              <nav aria-label="Stappen" className="rounded-card bg-surface p-2">
                <ol className="flex flex-col">
                  {STEPS.map((entry, index) => {
                    const isCurrent = index === step;
                    const done = index < maxStep && !isCurrent;
                    const reachable = index <= maxStep;
                    const detail =
                      entry.id === "categorie" && data.category ? categoryById(data.category)?.label : null;
                    return (
                      <li key={entry.id}>
                        <button
                          type="button"
                          onClick={() => goToStepper(index)}
                          disabled={!reachable}
                          aria-current={isCurrent ? "step" : undefined}
                          className={`flex w-full items-center gap-3 rounded-panel px-3 py-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue disabled:cursor-not-allowed ${
                            isCurrent ? "bg-page" : reachable ? "hover:bg-page" : ""
                          }`}
                        >
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-meta tabular-nums transition-colors ${
                              isCurrent
                                ? "bg-navy text-on-dark"
                                : done
                                  ? "bg-blue text-on-dark"
                                  : "text-on-light-muted ring-1 ring-inset ring-ink/25"
                            }`}
                          >
                            {done ? <Check aria-hidden size={13} strokeWidth={3} /> : index + 1}
                            {done && <span className="sr-only">Afgerond: </span>}
                          </span>
                          <span className="min-w-0">
                            <span
                              className={`block text-meta ${isCurrent ? "font-semibold text-heading" : done ? "text-heading" : "text-on-light-muted"}`}
                            >
                              {entry.label}
                            </span>
                            {detail && <span className="block truncate text-meta text-on-light-muted">{detail}</span>}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </nav>
              <HelpCard />
            </div>
          </aside>
        </div>

        {children}
      </div>
    </Section>
  );
}

function HelpCard() {
  const [user, domain] = LEDENADMINISTRATIE.split("@");
  return (
    <div className="rounded-card bg-surface p-5">
      <p className="text-meta font-semibold text-heading">Vragen over je aanmelding?</p>
      <p className="mt-1 text-meta text-on-light-muted">De ledenadministratie helpt je graag.</p>
      {/* <wbr> na de @: breekt het adres netjes af i.p.v. midden in "lionitas.nl". */}
      <a
        href={`mailto:${LEDENADMINISTRATIE}`}
        className="mt-3 inline-block rounded-sm text-meta font-semibold text-blue underline-offset-4 hover:text-blue-hover hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
      >
        {user}@<wbr />
        {domain}
      </a>
    </div>
  );
}
