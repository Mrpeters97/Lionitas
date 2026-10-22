"use client";

import { Check, ChevronDown, Info } from "lucide-react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { formatEuro, type AanmeldData, type Errors, type Fee, type Field } from "@/lib/aanmelding";

export interface FormApi {
  data: AanmeldData;
  errors: Errors;
  set: <K extends Field>(field: K, value: AanmeldData[K]) => void;
}

// Elk focusbaar element krijgt `data-field`, zodat het formulier bij "Volgende" naar
// het eerste ongeldige veld kan springen (ook bij radiogroepen).
const fieldId = (name: Field) => `veld-${name}`;

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue";

// ---------------------------------------------------------------------------
// Tooltip
// ---------------------------------------------------------------------------

/**
 * "i"-knopje met uitleg — alle toelichting bij velden staat hierachter, zodat het
 * formulier rustig blijft en velden in een rij op één lijn staan.
 *
 * De tooltip zelf wordt via een portal in <body> gerenderd met `position: fixed`:
 * zo zweeft 'ie boven alle content, wordt 'ie nergens afgeknipt en blijft 'ie binnen
 * het scherm (en onder de vaste header: anders klapt 'ie naar onder het knopje).
 *
 * Toegankelijkheid (WCAG 1.4.13): opent op hover (muis), tik, of toetsenbordfocus;
 * blijft open zolang de muis op knop óf tooltip staat; sluit met Escape, klik buiten
 * of focus weg. De tekst staat ook `hidden` in de DOM voor `aria-describedby` (die
 * leest verborgen tekst gewoon voor), dus schermlezers horen 'm altijd.
 */
export function InfoTip({ id, children }: { id: string; children: ReactNode }) {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  // Blijft true tot de uit-animatie klaar is, zodat de portal pas daarna verdwijnt.
  const [rendered, setRendered] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number; below: boolean } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const openTimer = useRef<number | undefined>(undefined);
  const closeTimer = useRef<number | undefined>(undefined);
  const lastPointer = useRef("");

  const clearTimers = () => {
    window.clearTimeout(openTimer.current);
    window.clearTimeout(closeTimer.current);
  };
  const show = () => {
    clearTimers();
    setRendered(true);
    setOpen(true);
  };
  // Hover: korte vertraging, zodat de tooltip niet abrupt opflitst als je er
  // alleen langs beweegt. Tik, klik en toetsenbord openen direct.
  const showSoon = () => {
    clearTimers();
    openTimer.current = window.setTimeout(show, 200);
  };
  // Kleine vertraging bij sluiten: de muis kan zo over het gaatje van knop naar tooltip.
  const hideSoon = () => {
    clearTimers();
    closeTimer.current = window.setTimeout(() => setOpen(false), 120);
  };
  const hide = () => {
    clearTimers();
    setOpen(false);
  };

  // Timers opruimen bij unmount (bv. stapwissel terwijl een tooltip op het punt staat te openen).
  useEffect(
    () => () => {
      window.clearTimeout(openTimer.current);
      window.clearTimeout(closeTimer.current);
    },
    [],
  );

  const place = useCallback(() => {
    const button = buttonRef.current;
    const tip = tipRef.current;
    if (!button || !tip) return;
    const anchor = button.getBoundingClientRect();
    // offsetWidth/-Height = maat zonder de schaal van de in-animatie.
    const width = tip.offsetWidth;
    const height = tip.offsetHeight;
    const margin = 12;
    const gap = 8;
    const headerSpace = Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    const left = Math.min(
      Math.max(anchor.left + anchor.width / 2 - width / 2, margin),
      window.innerWidth - width - margin,
    );
    const above = anchor.top - gap - height;
    const below = above < headerSpace;
    setPosition({ top: below ? anchor.bottom + gap : above, left, below });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    place();
    const close = () => {
      window.clearTimeout(openTimer.current);
      window.clearTimeout(closeTimer.current);
      setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && close();
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!buttonRef.current?.contains(target) && !tipRef.current?.contains(target)) close();
    };
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open, place]);

  // In-/uit-animatie: fade + klein stukje schuiven vanaf het knopje. Reduced motion: alleen fade.
  const offset = reduceMotion ? 0 : position?.below ? -4 : 4;
  const hidden = { opacity: 0, y: offset, scale: reduceMotion ? 1 : 0.97 };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label="Meer informatie"
        aria-describedby={id}
        aria-expanded={open}
        onPointerEnter={(event) => event.pointerType === "mouse" && showSoon()}
        onPointerLeave={(event) => event.pointerType === "mouse" && hideSoon()}
        onPointerDown={(event) => (lastPointer.current = event.pointerType)}
        // Muis: klik opent direct (en houdt 'm open). Touch: tik wisselt.
        onClick={() => (lastPointer.current === "mouse" || !open ? show() : hide())}
        onFocus={(event) => event.currentTarget.matches(":focus-visible") && show()}
        onBlur={hide}
        className={`-my-0.5 ml-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full align-middle text-on-light-muted transition-colors hover:bg-page hover:text-blue aria-expanded:bg-page aria-expanded:text-blue ${FOCUS}`}
      >
        <Info aria-hidden size={15} strokeWidth={2} />
      </button>
      <span id={id} hidden>
        {children}
      </span>
      {rendered &&
        createPortal(
          <AnimatePresence onExitComplete={() => setRendered(false)}>
            {open && (
              <motion.div
                ref={tipRef}
                aria-hidden
                onPointerEnter={() => clearTimers()}
                onPointerLeave={hideSoon}
                initial={hidden}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ ...hidden, transition: { duration: 0.12, ease: "easeIn" } }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  top: position?.top ?? 0,
                  left: position?.left ?? 0,
                  visibility: position ? "visible" : "hidden",
                  transformOrigin: position?.below ? "top center" : "bottom center",
                }}
                className="fixed z-40 w-max max-w-[min(20rem,calc(100vw-1.5rem))] rounded-panel bg-surface px-4 py-3 text-meta text-foreground shadow-[0_4px_16px_rgba(0,14,53,0.08)] ring-1 ring-ink/10"
              >
                {children}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Labels & velden
// ---------------------------------------------------------------------------

/** Label (met `htmlFor`) of legend (zonder), met optioneel "(optioneel)" en een info-tooltip. */
export function FieldLabel({
  htmlFor,
  label,
  optional,
  info,
}: {
  htmlFor?: string;
  label: ReactNode;
  /** "compact" = "(optioneel)" pas vanaf md zichtbaar (smalle velden); schermlezers horen het altijd. */
  optional?: boolean | "compact";
  info?: { id: string; text: ReactNode };
}) {
  const content = (
    <>
      {label}
      {optional && (
        <span className={`font-normal text-on-light-muted ${optional === "compact" ? "sr-only md:not-sr-only" : ""}`}>
          {" "}
          (optioneel)
        </span>
      )}
    </>
  );
  const tip = info ? <InfoTip id={info.id}>{info.text}</InfoTip> : null;
  // De knop staat náást het <label> (niet erin), anders focust een klik erop het veld.
  return htmlFor ? (
    <div className="flex items-center">
      <label htmlFor={htmlFor} className="block text-label text-heading">
        {content}
      </label>
      {tip}
    </div>
  ) : (
    <legend className="block text-label text-heading">
      {content}
      {tip}
    </legend>
  );
}

export function FieldError({ id, error }: { id: string; error?: string }) {
  return error ? (
    <p id={id} className="mt-2 text-meta text-danger">
      {error}
    </p>
  ) : null;
}

const describedBy = (id: string, info: unknown, error: unknown) =>
  [info ? `${id}-info` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;

const infoFor = (id: string, info: ReactNode) => (info ? { id: `${id}-info`, text: info } : undefined);

const inputClasses = (error?: string) =>
  `mt-2 w-full bg-page px-5 py-3 text-body text-foreground ring-1 ring-inset transition-shadow placeholder:text-on-light-muted ${FOCUS} ${
    error ? "ring-danger" : "ring-transparent hover:ring-ink/15"
  }`;

type TextFieldProps = {
  form: FormApi;
  name: Field;
  label: ReactNode;
  /** Toelichting achter een "i"-knopje. */
  info?: ReactNode;
  optional?: boolean | "compact";
  className?: string;
} & Pick<InputHTMLAttributes<HTMLInputElement>, "type" | "autoComplete" | "inputMode" | "placeholder" | "max" | "autoCapitalize">;

export function TextField({ form, name, label, info, optional, className = "", type = "text", ...input }: TextFieldProps) {
  const id = fieldId(name);
  const error = form.errors[name];
  return (
    <div className={className}>
      <FieldLabel htmlFor={id} label={label} optional={optional} info={infoFor(id, info)} />
      <input
        id={id}
        data-field={name}
        type={type}
        value={String(form.data[name] ?? "")}
        onChange={(event) => form.set(name, event.target.value as never)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, info, error)}
        className={`${inputClasses(error)} rounded-pill`}
        {...input}
      />
      <FieldError id={`${id}-error`} error={error} />
    </div>
  );
}

export function TextArea({
  form,
  name,
  label,
  info,
  optional,
  className = "",
}: {
  form: FormApi;
  name: Field;
  label: ReactNode;
  info?: ReactNode;
  optional?: boolean;
  className?: string;
}) {
  const id = fieldId(name);
  const error = form.errors[name];
  return (
    <div className={className}>
      <FieldLabel htmlFor={id} label={label} optional={optional} info={infoFor(id, info)} />
      <textarea
        id={id}
        data-field={name}
        rows={3}
        value={String(form.data[name] ?? "")}
        onChange={(event) => form.set(name, event.target.value as never)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, info, error)}
        className={`${inputClasses(error)} min-h-28 resize-y rounded-panel`}
      />
      <FieldError id={`${id}-error`} error={error} />
    </div>
  );
}

export interface Choice {
  value: string;
  label: ReactNode;
  description?: ReactNode;
}

/** Radiogroep als klikbare kaarten (`compact` = pills naast elkaar, voor ja/nee). */
export function ChoiceGroup({
  form,
  name,
  legend,
  info,
  options,
  columns = 1,
  compact = false,
  className = "",
}: {
  form: FormApi;
  name: Field;
  legend: ReactNode;
  info?: ReactNode;
  options: readonly Choice[];
  columns?: 1 | 2 | 3;
  compact?: boolean;
  className?: string;
}) {
  const id = fieldId(name);
  const error = form.errors[name];
  const grid = compact
    ? "flex flex-wrap gap-2"
    : `grid gap-3 ${columns === 2 ? "sm:grid-cols-2" : columns === 3 ? "md:grid-cols-3" : ""}`;

  return (
    <fieldset className={className} aria-describedby={describedBy(id, info, error)}>
      <FieldLabel label={legend} info={infoFor(id, info)} />
      {/* compact = zelfde afstand als een tekstveld (mt-2), zodat ze in een rij gelijk staan */}
      <div className={`${compact ? "mt-2" : "mt-3"} ${grid}`}>
        {options.map((option) => (
          <label
            key={option.value}
            className={`group relative flex cursor-pointer gap-3 bg-page ring-1 ring-inset transition has-[:checked]:bg-surface has-[:checked]:ring-2 has-[:checked]:ring-blue has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blue ${
              error ? "ring-danger" : "ring-transparent hover:ring-ink/20"
            } ${compact ? "items-center rounded-pill py-2.5 pl-3 pr-5" : "items-start rounded-panel p-4 sm:p-5"}`}
          >
            <input
              type="radio"
              name={name}
              data-field={name}
              value={option.value}
              checked={form.data[name] === option.value}
              onChange={() => form.set(name, option.value as never)}
              className="sr-only"
            />
            <span
              aria-hidden
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ring-2 ring-inset ring-ink/50 transition group-has-[:checked]:ring-blue ${compact ? "" : "mt-0.5"}`}
            >
              <span className="h-2.5 w-2.5 scale-0 rounded-full bg-blue transition-transform group-has-[:checked]:scale-100 motion-reduce:transition-none" />
            </span>
            <span className="min-w-0">
              <span className="block text-label text-heading">{option.label}</span>
              {option.description && (
                <span className="mt-0.5 block text-meta text-on-light-muted">{option.description}</span>
              )}
            </span>
          </label>
        ))}
      </div>
      <FieldError id={`${id}-error`} error={error} />
    </fieldset>
  );
}

const YES_NO: Choice[] = [
  { value: "ja", label: "Ja" },
  { value: "nee", label: "Nee" },
];

export function YesNoField(props: { form: FormApi; name: Field; legend: ReactNode; info?: ReactNode; className?: string }) {
  return <ChoiceGroup {...props} options={YES_NO} compact />;
}

/** Keuzelijst in dezelfde stijl als de tekstvelden; `placeholder` = lege eerste optie. */
export function SelectField({
  form,
  name,
  label,
  info,
  optional,
  placeholder,
  options,
  className = "",
}: {
  form: FormApi;
  name: Field;
  label: ReactNode;
  info?: ReactNode;
  optional?: boolean;
  placeholder: string;
  options: { value: string; label: string }[];
  className?: string;
}) {
  const id = fieldId(name);
  const error = form.errors[name];
  const value = String(form.data[name] ?? "");
  return (
    <div className={className}>
      <FieldLabel htmlFor={id} label={label} optional={optional} info={infoFor(id, info)} />
      <div className="relative">
        <select
          id={id}
          data-field={name}
          value={value}
          onChange={(event) => form.set(name, event.target.value as never)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, info, error)}
          // Leeg = grijs zoals een placeholder (kleurklasse vervangen, niet stapelen).
          className={`${inputClasses(error).replace("text-foreground", value ? "text-foreground" : "text-on-light-muted")} cursor-pointer appearance-none rounded-pill pr-12`}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden
          size={18}
          strokeWidth={2}
          className="pointer-events-none absolute right-5 top-1/2 mt-1 -translate-y-1/2 text-heading"
        />
      </div>
      <FieldError id={`${id}-error`} error={error} />
    </div>
  );
}

export function CheckboxField({
  form,
  name,
  children,
  className = "",
}: {
  form: FormApi;
  name: Field;
  children: ReactNode;
  className?: string;
}) {
  const id = fieldId(name);
  const error = form.errors[name];
  return (
    <div className={className}>
      <label htmlFor={id} className="group flex cursor-pointer items-start gap-3">
        <input
          id={id}
          data-field={name}
          type="checkbox"
          checked={Boolean(form.data[name])}
          onChange={(event) => form.set(name, event.target.checked as never)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="sr-only"
        />
        <span
          aria-hidden
          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-page ring-1 ring-inset transition group-has-[:checked]:bg-navy group-has-[:checked]:ring-navy group-has-[:focus-visible]:outline-2 group-has-[:focus-visible]:outline-offset-2 group-has-[:focus-visible]:outline-blue ${
            error ? "ring-danger" : "ring-ink/50 group-hover:ring-blue"
          }`}
        >
          <Check size={15} strokeWidth={3} className="text-yellow opacity-0 transition-opacity group-has-[:checked]:opacity-100" />
        </span>
        <span className="text-body text-foreground">{children}</span>
      </label>
      <FieldError id={`${id}-error`} error={error} />
    </div>
  );
}

const NOTE_TONES = {
  soft: "bg-surface-soft text-foreground",
  brand: "bg-surface-brand text-on-dark",
  /** Alleen een dunne rand: bijzaak die niet harder mag opvallen dan de keuze zelf. */
  outline: "text-foreground ring-1 ring-inset ring-ink/15",
};

export function Note({
  children,
  tone = "soft",
  className = "",
}: {
  children: ReactNode;
  tone?: keyof typeof NOTE_TONES;
  className?: string;
}) {
  return (
    <div className={`flex gap-3 rounded-panel p-4 text-body sm:p-5 ${NOTE_TONES[tone]} ${className}`}>
      <Info aria-hidden size={20} strokeWidth={2} className={`mt-0.5 shrink-0 ${tone === "brand" ? "text-yellow" : "text-blue"}`} />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function FormGroup({
  title,
  info,
  children,
  className = "",
}: {
  title: string;
  /** Toelichting bij de hele groep, achter een "i" naast de titel. */
  info?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const id = `groep-${title.toLowerCase().replace(/[^a-z]+/g, "-")}-info`;
  return (
    <section className={`border-t border-ink/10 pt-8 first:border-t-0 first:pt-0 ${className}`}>
      <h3 className="eyebrow flex items-center text-blue" aria-describedby={info ? id : undefined}>
        {title}
        {info && <InfoTip id={id}>{info}</InfoTip>}
      </h3>
      <div className="mt-2 flex flex-col gap-6">{children}</div>
    </section>
  );
}

export function FeeTable({ fees }: { fees: Fee[] }) {
  return (
    <div className="overflow-hidden rounded-panel bg-page">
      <table className="w-full text-left">
        <caption className="sr-only">Contributie</caption>
        <thead className="border-b border-ink/10">
          <tr>
            <th scope="col" className="px-5 py-3 text-meta font-semibold text-on-light-muted">Onderdeel</th>
            <th scope="col" className="px-5 py-3 text-right text-meta font-semibold text-on-light-muted">Bedrag</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/10">
          {fees.map((fee) => (
            <tr key={fee.label}>
              <th scope="row" className="px-5 py-3 text-body font-normal text-foreground">
                {fee.label}
              </th>
              <td className="whitespace-nowrap px-5 py-3 text-right text-body text-foreground">
                <span className="font-semibold tabular-nums text-heading">{formatEuro(fee.amount)}</span>
                <span className="block text-meta text-on-light-muted">{fee.per.toLowerCase()}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
