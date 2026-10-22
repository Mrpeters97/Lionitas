"use server";

import { randomBytes } from "node:crypto";
import {
  LEDENADMINISTRATIE,
  categoryById,
  firstInvalidStep,
  formatIban,
  normalizeIban,
  sanitize,
  summarize,
  type AanmeldData,
} from "@/lib/aanmelding";

export type SubmitResult = { ok: true; reference: string } | { ok: false; message: string; step?: number };

// Publiek bereikbaar (elke Server Action is een POST-endpoint): alles opnieuw opschonen
// en valideren, de client-validatie is alleen voor de UX.
export async function submitAanmelding(input: unknown): Promise<SubmitResult> {
  const data = sanitize(input);
  const today = new Date();

  const invalidStep = firstInvalidStep(data, today);
  if (invalidStep !== -1) {
    return { ok: false, step: invalidStep, message: "Niet alle gegevens zijn goed ingevuld. Controleer de gemarkeerde velden." };
  }

  const reference = `LIO-${randomBytes(3).toString("hex").toUpperCase()}`;

  try {
    await deliver(reference, data, today);
  } catch (error) {
    console.error("[aanmelding] versturen mislukt", error);
    return {
      ok: false,
      message: `Je aanmelding kon niet worden verstuurd. Probeer het later opnieuw of mail ${LEDENADMINISTRATIE}.`,
    };
  }

  return { ok: true, reference };
}

/**
 * Bezorgt de aanmelding bij de ledenadministratie.
 *
 * TODO: definitieve bestemming kiezen (mail via bv. Resend, WordPress custom post type,
 * of direct in de ledenadministratie/Volta). Tot die tijd: zet `AANMELDING_WEBHOOK_URL`
 * (bv. een Make/Zapier-webhook die mailt) — zonder die variabele werkt het alleen in
 * development, zodat er in productie nooit stilletjes aanmeldingen verdwijnen.
 */
async function deliver(reference: string, data: AanmeldData, today: Date) {
  const payload = {
    reference,
    submittedAt: today.toISOString(),
    category: categoryById(data.category)?.label,
    summary: summarize(data, today),
    data: { ...data, iban: formatIban(data.iban) },
  };

  const webhook = process.env.AANMELDING_WEBHOOK_URL;
  if (webhook) {
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`Webhook antwoordde ${response.status}`);
    return;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("AANMELDING_WEBHOOK_URL is niet ingesteld");
  }

  // Development: alleen een gemaskeerde regel loggen — geen volledige IBAN in de logs.
  const iban = normalizeIban(data.iban);
  console.info(
    `[aanmelding] ${reference} · ${payload.category} · ${data.callName} ${data.lastName} · IBAN …${iban.slice(-4)}`,
  );
}
