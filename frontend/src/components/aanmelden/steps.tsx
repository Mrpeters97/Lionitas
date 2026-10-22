"use client";

import Link from "next/link";
import { useRef } from "react";
import { Check, ChevronDown, PencilLine } from "lucide-react";
import {
  ATHLETICS_CHAMPS,
  CATEGORIES,
  COFFEE_OPTIONS,
  INCASSANT,
  LEDENADMINISTRATIE,
  MEMBERSHIP_OPTIONS,
  TRAINING_GROUPS,
  asksTransfer,
  athleticsChampsRemaining,
  categoryById,
  feesFor,
  formatDate,
  formatEuro,
  formatStreet,
  isJunior,
  isMinor,
  normalizeIban,
  suggestCategory,
  summarize,
  toIsoDate,
  trainsAtLionitas,
  trainsInMorning,
  volunteerDayparts,
  type StepId,
} from "@/lib/aanmelding";
import {
  CheckboxField,
  ChoiceGroup,
  FeeTable,
  FieldError,
  FormGroup,
  Note,
  SelectField,
  TextArea,
  TextField,
  YesNoField,
  type FormApi,
} from "./fields";

export interface StepProps {
  form: FormApi;
  today: Date;
}

const isKid = (form: FormApi) => form.data.category === "nijntje" || form.data.category === "pupillen";

const LINK = "font-semibold text-blue underline underline-offset-4 hover:text-blue-hover";

// ---------------------------------------------------------------------------

export function StepCategorie({
  form,
  onPick,
}: StepProps & {
  /** Gekozen via muis/tik ("pointer"), spatie/pijltjes ("keyboard") of Enter ("enter"). */
  onPick?: (via: "pointer" | "keyboard" | "enter") => void;
}) {
  const error = form.errors.category;
  // Muis/tik herkennen aan een recente pointerdown: de click die een <label> doorstuurt
  // naar de radio is anders niet te onderscheiden van een toetsenbord-klik.
  const lastPointerDown = useRef(0);
  return (
    <div className="flex flex-col gap-6">
      <fieldset aria-describedby={error ? "veld-category-error" : undefined}>
        <legend className="sr-only">Categorie</legend>
        <div className="grid gap-4 lg:grid-cols-3">
          {CATEGORIES.map((category) => (
            <label
              key={category.id}
              onPointerDown={() => (lastPointerDown.current = performance.now())}
              onClick={() => onPick?.(performance.now() - lastPointerDown.current < 1000 ? "pointer" : "keyboard")}
              className={`group relative flex cursor-pointer flex-col rounded-card bg-page p-6 ring-1 ring-inset transition-[background-color,box-shadow] duration-300 has-[:checked]:bg-surface-dark has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blue sm:p-7 ${
                error ? "ring-danger" : "ring-transparent hover:ring-navy"
              }`}
            >
              <input
                type="radio"
                name="category"
                data-field="category"
                value={category.id}
                checked={form.data.category === category.id}
                onChange={() => form.set("category", category.id)}
                onKeyDown={(event) => {
                  if (event.key !== "Enter") return;
                  event.preventDefault();
                  form.set("category", category.id);
                  onPick?.("enter");
                }}
                className="sr-only"
              />
              <span className="flex items-start justify-between gap-4">
                <span className="rounded-pill bg-surface px-3 py-1 text-meta text-heading transition-colors group-has-[:checked]:bg-accent group-has-[:checked]:text-navy">
                  {category.ages}
                </span>
                <span
                  aria-hidden
                  className="flex h-7 w-7 items-center justify-center rounded-full ring-2 ring-inset ring-ink/50 transition-colors group-has-[:checked]:bg-accent group-has-[:checked]:ring-accent"
                >
                  <Check size={16} strokeWidth={3} className="text-navy opacity-0 transition-opacity group-has-[:checked]:opacity-100" />
                </span>
              </span>
              <span className="h4 mt-4 block transition-colors group-has-[:checked]:text-on-dark">{category.label}</span>
              <span className="mt-2 block text-meta text-on-light-muted transition-colors group-has-[:checked]:text-on-dark-muted">
                {category.description}
              </span>
              <span className="mt-auto block pt-5 text-meta text-on-light-muted transition-colors group-has-[:checked]:text-on-dark-muted">
                {category.priceHint}
              </span>
            </label>
          ))}
        </div>
        <FieldError id="veld-category-error" error={error} />
      </fieldset>

      <Note tone="outline">
        Twijfel je nog? Kom eerst{" "}
        <Link href="/lid-worden/proeftraining" className={LINK}>
          vrijblijvend meetrainen
        </Link>
        . Je kunt je daarna altijd nog aanmelden.
      </Note>
    </div>
  );
}

// ---------------------------------------------------------------------------

export function StepPersoon({ form, today }: StepProps) {
  const kid = isKid(form);
  const suggested = suggestCategory(form.data.birthDate, today);
  const mismatch = suggested && form.data.category && suggested !== form.data.category ? categoryById(suggested) : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <TextField form={form} name="callName" label="Roepnaam" autoComplete={kid ? "off" : "nickname"} />
        <TextField form={form} name="lastName" label="Achternaam" autoComplete={kid ? "off" : "family-name"} />
        <TextField
          form={form}
          name="firstNames"
          label="Voornamen"
          info="Alle voornamen, zoals in het paspoort."
          autoComplete={kid ? "off" : "given-name"}
        />
        <TextField form={form} name="initials" label="Voorletters" placeholder="Bijv. J.P." autoCapitalize="characters" />
        <TextField
          form={form}
          name="birthDate"
          label="Geboortedatum"
          type="date"
          max={toIsoDate(today)}
          autoComplete={kid ? "off" : "bday"}
        />
        <ChoiceGroup
          form={form}
          name="gender"
          legend={kid ? "Jongen of meisje" : "Geslacht"}
          info="Nodig voor de indeling bij wedstrijden."
          compact
          options={
            kid
              ? [
                  { value: "m", label: "Jongen" },
                  { value: "v", label: "Meisje" },
                ]
              : [
                  { value: "m", label: "Man" },
                  { value: "v", label: "Vrouw" },
                ]
          }
        />
      </div>

      {mismatch && (
        <Note>
          <p>
            Met deze geboortedatum hoor je waarschijnlijk bij{" "}
            <strong className="font-semibold">
              {mismatch.label} ({mismatch.ages})
            </strong>
            .
          </p>
          <button
            type="button"
            onClick={() => form.set("category", mismatch.id)}
            className={`mt-2 rounded-sm ${LINK} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue`}
          >
            Wijzig naar {mismatch.label}
          </button>
        </Note>
      )}

      <TextArea
        form={form}
        name="notes"
        label="Handig om te weten"
        optional
        info={
          kid
            ? "Bijzonderheden over je kind waar de trainers rekening mee kunnen houden, zoals een allergie of medicatie."
            : "Iets waar de trainer rekening mee kan houden, zoals een blessure of medicatie."
        }
      />
    </div>
  );
}

// ---------------------------------------------------------------------------

/**
 * Straat | huisnummer | toevoeging, daaronder postcode | woonplaats. Mobiel: straat
 * over de volle breedte, de rest twee aan twee. `holder` = adres van de rekeninghouder
 * (machtiging), mét land.
 */
function AddressFields({ form, holder = false }: { form: FormApi; holder?: boolean }) {
  const f = holder
    ? ({ street: "holderStreet", number: "holderHouseNumber", addition: "holderHouseNumberAddition", postcode: "holderPostcode", city: "holderCity" } as const)
    : ({ street: "street", number: "houseNumber", addition: "houseNumberAddition", postcode: "postcode", city: "city" } as const);
  return (
    // 12 kolommen vanaf sm: straat iets smaller zodat "Toevoeging (optioneel)" op één regel past
    // en alle invoervelden op één lijn staan.
    <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-12 sm:gap-x-6">
      <TextField form={form} name={f.street} label="Straat" autoComplete={holder ? "off" : "address-line1"} className="col-span-2 sm:col-span-5" />
      <TextField form={form} name={f.number} label="Huisnummer" inputMode="numeric" autoComplete="off" className="sm:col-span-3" />
      <TextField form={form} name={f.addition} label="Toevoeging" optional="compact" placeholder="Bijv. A" autoComplete="off" className="sm:col-span-4" />
      <TextField
        form={form}
        name={f.postcode}
        label="Postcode"
        autoComplete={holder ? "off" : "postal-code"}
        autoCapitalize="characters"
        className="sm:col-span-4"
      />
      <TextField
        form={form}
        name={f.city}
        label="Woonplaats"
        autoComplete={holder ? "off" : "address-level2"}
        className={holder ? "sm:col-span-4" : "sm:col-span-8"}
      />
      {holder && (
        <TextField form={form} name="holderCountry" label="Land" autoComplete="off" className="col-span-2 sm:col-span-4" />
      )}
    </div>
  );
}

export function StepContact({ form, today }: StepProps) {
  const minor = isMinor(form.data, today);
  return (
    <div className="flex flex-col gap-8">
      {minor && (
        <FormGroup title="Ouder of verzorger">
          <TextField
            form={form}
            name="guardianName"
            label="Naam ouder/verzorger"
            info="Leden onder de 18 melden zich aan met toestemming van een ouder of verzorger."
            autoComplete="name"
          />
        </FormGroup>
      )}

      {/* Geen tussenkopjes "Adres"/"Contact": de staptitel zegt het al. Alleen een lijn
          als de ouder/verzorger-groep erboven staat. */}
      <div className={`flex flex-col gap-6 ${minor ? "border-t border-ink/10 pt-8" : ""}`}>
        <AddressFields form={form} />

        <div className="grid gap-6 sm:grid-cols-2">
          <TextField
            form={form}
            name="phone1"
            label="Telefoonnummer"
            type="tel"
            autoComplete="tel"
            info={minor ? "Van een ouder of verzorger." : undefined}
          />
          <TextField form={form} name="phone2" label="Tweede telefoonnummer" optional type="tel" />
          <TextField
            form={form}
            name="email1"
            label="E-mailadres"
            type="email"
            autoComplete="email"
            info={minor ? "Van een ouder of verzorger. Hier sturen we ook de bevestiging naartoe." : "Hier sturen we de bevestiging naartoe."}
          />
          <TextField form={form} name="email2" label="Tweede e-mailadres" optional type="email" />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

export function StepLidmaatschap({ form, today }: StepProps) {
  const { data } = form;
  const fees = feesFor(data, today);
  const dayparts = volunteerDayparts(today);

  return (
    <div className="flex flex-col gap-8">
      {data.category === "senioren" && <SeniorenOptions form={form} today={today} />}

      {data.category === "pupillen" && <AthleticsChamps form={form} today={today} />}

      <FormGroup
        title="Contributie"
        info="De clubcontributie wordt aan het begin van elk kwartaal geïncasseerd. De bijdrage aan de Atletiekunie is altijd het volledige jaarbedrag en wordt geïncasseerd in het kwartaal waarin je lid wordt."
      >
        {fees ? (
          <FeeTable fees={fees} />
        ) : (
          <p className="rounded-panel bg-page p-5 text-body text-on-light-muted">
            Kies hierboven eerst hoe je lid wordt, dan zie je hier wat je betaalt.
          </p>
        )}
        <p className="text-meta text-on-light-muted">
          Alle tarieven vind je bij{" "}
          <Link href="/lid-worden/informatie-en-tarieven" target="_blank" className={LINK}>
            Informatie & Tarieven
          </Link>
          .
        </p>
        {asksTransfer(data) && (
          <YesNoField
            form={form}
            name="transfer"
            legend={data.category === "pupillen" ? "Is je kind nu lid van een andere atletiekvereniging?" : "Ben je nu lid van een andere atletiekvereniging?"}
            info="Voor het overschrijven rekent de Atletiekunie eenmalig € 13,40."
          />
        )}
        <YesNoField
          form={form}
          name="familyDiscount"
          legend="Is er een ander gezinslid lid van Lionitas?"
          info="Dan krijg je 10% gezinskorting per kwartaal."
        />
      </FormGroup>

      <FormGroup title="Samen Lionitas">
        <p className="text-body text-foreground">
          Bij Lionitas wordt veel georganiseerd, en dat kan alleen samen. Daarom vragen we van alle leden (en van de ouders
          van jeugdleden) om <strong className="font-semibold">twee dagdelen per jaar</strong> mee te helpen, bijvoorbeeld bij
          jeugdactiviteiten, de Grote Clubactie, Lopen in Leeuwarden of het onderhoud van baan en clubhuis.
          {dayparts === 1 && " Omdat je na 1 september lid wordt, is dat dit jaar één dagdeel."}
        </p>
        <ChoiceGroup
          form={form}
          name="volunteer"
          legend="Wat kies je?"
          columns={2}
          options={[
            { value: "taken", label: "Ik help mee", description: "Aanmelden voor taken gaat via de ClubApp (Spond of Volta)." },
            {
              value: "afkopen",
              label: "Ik betaal € 50,00 extra",
              description: "Per kalenderjaar, geïncasseerd aan het eind van het jaar.",
            },
          ]}
        />
      </FormGroup>
    </div>
  );
}

function AthleticsChamps({ form, today }: StepProps) {
  const remaining = athleticsChampsRemaining(today);
  return (
    <FormGroup title="Athletics Champs">
      <p className="text-body text-foreground">
        Bij de Athletics Champs strijden kinderen in teams tegen leeftijdsgenoten van andere verenigingen. Een wedstrijd duurt
        2 à 3 uur met 5 tot 7 onderdelen, 20 minuten per onderdeel: zo vaak proberen als je wilt, weinig wachten en nooit
        &lsquo;af&rsquo;. Geschikt voor alle pupillen, ook als ze net zijn begonnen. Wij melden de teams aan.
      </p>

      <details className="group rounded-panel bg-page">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-panel px-5 py-4 text-label text-heading focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue [&::-webkit-details-marker]:hidden">
          Wedstrijden in {ATHLETICS_CHAMPS.year} ({formatEuro(ATHLETICS_CHAMPS.total)} per jaar)
          <ChevronDown aria-hidden size={18} strokeWidth={2} className="shrink-0 transition-transform group-open:rotate-180" />
        </summary>
        <ul className="divide-y divide-ink/10 border-t border-ink/10">
          {ATHLETICS_CHAMPS.events.map((event) => (
            <li key={event.date + event.name} className="flex items-baseline justify-between gap-4 px-5 py-3">
              <span className="text-body text-foreground">
                {event.name}
                <span className="block text-meta text-on-light-muted">{formatDate(event.date)}</span>
              </span>
              <span className="text-body tabular-nums text-heading">{formatEuro(event.cost)}</span>
            </li>
          ))}
        </ul>
      </details>

      {remaining != null && remaining < ATHLETICS_CHAMPS.total && (
        <p className="text-meta text-on-light-muted">
          Je wordt lid in de loop van het jaar, dus dit jaar betaal je alleen de wedstrijden die nog komen
          {remaining > 0 ? `: ${formatEuro(remaining)}` : ". Die zijn er dit jaar niet meer, dus je betaalt pas vanaf volgend jaar"}.
        </p>
      )}

      <YesNoField form={form} name="athleticsChamps" legend="Doet je kind mee met de Athletics Champs?" />
      {form.data.athleticsChamps === "nee" && (
        <TextArea form={form} name="athleticsChampsReason" label="Waarom niet?" info="Dan kunnen we daar rekening mee houden." />
      )}
    </FormGroup>
  );
}

function SeniorenOptions({ form, today }: StepProps) {
  const { data } = form;
  const junior = isJunior(data, today);

  return (
    <>
      <FormGroup title="Soort lidmaatschap">
        <ChoiceGroup form={form} name="membershipType" legend="Hoe word je lid?" options={MEMBERSHIP_OPTIONS} />
        {data.membershipType === "lid" &&
          (junior ? (
            <Note>Als junior heb je automatisch een wedstrijdlicentie van de Atletiekunie.</Note>
          ) : (
            <YesNoField
              form={form}
              name="competitionLicense"
              legend="Wil je een wedstrijdlicentie?"
              info="Nodig om mee te doen aan officiële baan- en wegwedstrijden van de Atletiekunie."
            />
          ))}
      </FormGroup>

      {data.membershipType && trainsAtLionitas(data) && (
        <FormGroup title="Training">
          <div className="grid gap-6 sm:grid-cols-2">
            <SelectField
              form={form}
              name="trainingGroup"
              label="Trainingsgroep"
              optional
              placeholder="Kies een groep"
              options={TRAINING_GROUPS}
              info="De dagen en tijden per groep vind je in het trainingsrooster. Twijfel je? Kies 'Weet ik nog niet', dan denken we met je mee."
            />
            <TextField form={form} name="trainer" label="Train(st)er" optional placeholder="Bij wie ga je trainen?" />
          </div>
          {trainsInMorning(data) && (
            <ChoiceGroup
              form={form}
              name="coffee"
              legend="Koffie of thee na de training"
              info="Na de ochtendtraining drinken we samen koffie of thee in de kantine. Dit wordt apart geïncasseerd in januari en juli."
              columns={3}
              options={COFFEE_OPTIONS}
            />
          )}
          <YesNoField
            form={form}
            name="threeTrainings"
            legend="Train je 3 keer per week?"
            info="Dan betaal je 1,5× de contributie."
          />
          <YesNoField
            form={form}
            name="studentDiscount"
            legend="Heb je recht op studentenkorting?"
            info={`Alleen als je aantoonbaar uitwonend bent: 10% korting per kwartaal, met een studentensportpas 20%. Stuur na je aanmelding een bewijs van inschrijving naar ${LEDENADMINISTRATIE}.`}
          />
        </FormGroup>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------

export function StepBetaling({ form, today }: StepProps) {
  const { data } = form;
  const minor = isMinor(data, today);
  const iban = normalizeIban(data.iban);
  const foreign = iban.length >= 2 && !iban.startsWith("NL");

  return (
    <div className="flex flex-col gap-8">
      <p className="text-body text-foreground">
        De contributie wordt automatisch afgeschreven. Daarvoor geef je Lionitas een doorlopende machtiging (SEPA). Niet eens
        met een afschrijving? Dan kun je die binnen 8 weken via je bank laten terugboeken.
      </p>

      <dl className="grid gap-x-8 gap-y-3 rounded-panel bg-page p-5 text-body sm:grid-cols-2 sm:p-6">
        {[
          ["Incassant", INCASSANT.name],
          ["Adres", INCASSANT.address],
          ["Incassant ID", INCASSANT.id],
          ["Kenmerk machtiging", INCASSANT.reference],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="text-meta text-on-light-muted">{label}</dt>
            <dd className="text-foreground">{value}</dd>
          </div>
        ))}
      </dl>

      <FormGroup title="Rekeninghouder">
        <div className="grid gap-6 sm:grid-cols-2">
          <TextField
            form={form}
            name="accountHolder"
            label={minor ? "Naam rekeninghouder (ouder/verzorger)" : "Naam rekeninghouder"}
            autoComplete="name"
          />
          <TextField
            form={form}
            name="iban"
            label="IBAN"
            placeholder="NL00 BANK 0123 4567 89"
            autoComplete="off"
            autoCapitalize="characters"
          />
          {foreign && <TextField form={form} name="bic" label="BIC" optional info="Alleen nodig bij een buitenlandse rekening." />}
        </div>
        <CheckboxField form={form} name="holderSameAddress">
          De rekeninghouder woont op{" "}
          {data.street ? (
            <strong className="font-semibold">{formatStreet(data.street, data.houseNumber, data.houseNumberAddition)}</strong>
          ) : (
            "hetzelfde adres"
          )}
        </CheckboxField>
        {!data.holderSameAddress && (
          <AddressFields form={form} holder />
        )}
      </FormGroup>

      <FormGroup title="Machtiging">
        <CheckboxField form={form} name="mandate">
          Ik geef {INCASSANT.name} toestemming om tot wederopzegging doorlopend de clubcontributie, de bijdragen aan de
          Atletiekunie (basiscontributie, eventuele wedstrijdlicentie en eenmalige administratiekosten)
          {data.category === "pupillen" && data.athleticsChamps === "ja" && " en de Athletics Champs wedstrijden"} van deze
          rekening af te schrijven, en mijn bank om dat te doen.
        </CheckboxField>
      </FormGroup>
    </div>
  );
}

// ---------------------------------------------------------------------------

export function StepControle({ form, today, onEdit }: StepProps & { onEdit: (step: StepId) => void }) {
  const { data } = form;
  const minor = isMinor(data, today);
  const sections = summarize(data, today);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        {sections.map((section) => (
          <section key={section.step} className="rounded-panel bg-page p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-label text-heading">{section.title}</h3>
              <button
                type="button"
                onClick={() => onEdit(section.step)}
                className="flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-meta text-blue transition-colors hover:bg-surface hover:text-blue-hover focus-visible:outline-2 focus-visible:outline-blue"
              >
                <PencilLine aria-hidden size={14} strokeWidth={2} />
                Wijzig<span className="sr-only"> {section.title.toLowerCase()}</span>
              </button>
            </div>
            <dl className="mt-3 grid gap-x-8 gap-y-2 sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)]">
              {section.rows.map((row) => (
                <div key={row.label} className="contents">
                  <dt className="text-meta text-on-light-muted sm:text-body">{row.label}</dt>
                  <dd className="mb-2 whitespace-pre-line break-words text-body text-foreground sm:mb-0">{row.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>

      <FormGroup title="Toestemming">
        <ChoiceGroup
          form={form}
          name="photoConsent"
          legend="Foto's"
          info="Tijdens trainingen, wedstrijden en clubactiviteiten worden soms foto's gemaakt voor de website en social media van Lionitas."
          columns={2}
          options={[
            { value: "ja", label: "Ja, dat is goed" },
            { value: "nee", label: "Nee, liever niet" },
          ]}
        />
        <CheckboxField form={form} name="cancellationTerms">
          Ik weet dat opzeggen kan per 31 maart, 30 juni, 30 september of 31 december, minstens één maand van tevoren, per mail
          aan {LEDENADMINISTRATIE}.
        </CheckboxField>
        <CheckboxField form={form} name="privacy">
          {minor ? `Als ouder/verzorger van ${data.callName || "het nieuwe lid"} geef ik` : "Ik geef"} Lionitas toestemming om
          deze gegevens te gebruiken voor de leden- en financiële administratie en door te geven aan de Atletiekunie. Lees meer
          in de{" "}
          <Link href="/privacy" target="_blank" className={LINK}>
            privacyverklaring
          </Link>
          .
        </CheckboxField>
      </FormGroup>

    </div>
  );
}
