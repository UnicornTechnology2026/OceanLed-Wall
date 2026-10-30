import { dbInsert } from "./supabase";

/** Change this whenever the Privacy Policy or the consent wording changes. */
export const POLICY_VERSION = "2026-10-30";

export type ConsentPurpose = "service" | "marketing_email" | "whatsapp";
export type ConsentAction = "granted" | "withdrawn";

/** What the user ticked on a form. Every value starts as false (no pre-ticked boxes). */
export interface ConsentChoices {
  service: boolean;
  marketing: boolean;
  whatsapp: boolean;
}

export const EMPTY_CONSENT: ConsentChoices = {
  service: false,
  marketing: false,
  whatsapp: false,
};

export const PURPOSE_LABEL: Record<ConsentPurpose, string> = {
  service: "Service (process my request)",
  marketing_email: "Marketing emails",
  whatsapp: "WhatsApp updates",
};

/** The exact wording shown next to each checkbox – stored with every record. */
export const CONSENT_TEXT: Record<ConsentPurpose, string> = {
  service:
    "I agree to OCEAN LED collecting and using my name, phone and email to respond to this request and provide the quote or service I ask for, as described in the Privacy Policy.",
  marketing_email:
    "Yes, email me offers, news and product updates. This is optional and not needed for my quote.",
  whatsapp:
    "Yes, send me updates and offers on WhatsApp at the phone number above. This is optional and not needed for my quote.",
};

export const WITHDRAW_TEXT =
  "Consent withdrawn by the person on the Manage consent page.";

export interface ConsentSubject {
  name?: string;
  email?: string;
  phone?: string;
}

export interface ConsentEvent {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  purpose: ConsentPurpose;
  action: ConsentAction;
  source: string;
  policyVersion: string;
  consentText: string;
}

export interface ConsentRow {
  id: string;
  created_at: string;
  subject_name: string | null;
  subject_email: string | null;
  subject_phone: string | null;
  purpose: ConsentPurpose;
  action: ConsentAction;
  source: string;
  policy_version: string;
  consent_text: string;
}

export const rowToConsentEvent = (r: ConsentRow): ConsentEvent => ({
  id: r.id,
  createdAt: r.created_at,
  name: r.subject_name ?? "",
  email: r.subject_email ?? "",
  phone: r.subject_phone ?? "",
  purpose: r.purpose,
  action: r.action,
  source: r.source,
  policyVersion: r.policy_version,
  consentText: r.consent_text,
});

/** Returns an error message, or "" when the consent choices are valid. */
export function validateConsent(
  c: ConsentChoices,
  email: string,
  phone: string,
): string {
  if (!c.service)
    return "Please tick the first box to agree to us using your details for this request.";
  if (c.marketing && !email.trim())
    return "Enter your email address to receive marketing emails, or untick that box.";
  if (c.whatsapp && phone.replace(/\D/g, "").length < 10)
    return "Enter a valid phone number to receive WhatsApp updates, or untick that box.";
  return "";
}

/**
 * Appends one row per consent decision to the consent_events table.
 * The table is append-only: withdrawing consent adds a new "withdrawn" row,
 * it never edits or deletes the earlier "granted" row.
 */
export async function recordConsent(
  subject: ConsentSubject,
  events: { purpose: ConsentPurpose; action: ConsentAction; text: string }[],
  source: string,
): Promise<void> {
  if (events.length === 0) return;
  await dbInsert(
    "consent_events",
    events.map((e) => ({
      subject_name: subject.name?.trim() || null,
      subject_email: subject.email?.trim().toLowerCase() || null,
      subject_phone: subject.phone?.trim() || null,
      purpose: e.purpose,
      action: e.action,
      source,
      policy_version: POLICY_VERSION,
      consent_text: e.text,
    })),
  );
}

/** Turns the ticked boxes into "granted" events (unticked optional boxes are not recorded). */
export function grantedEvents(c: ConsentChoices) {
  const out: {
    purpose: ConsentPurpose;
    action: ConsentAction;
    text: string;
  }[] = [];
  if (c.service)
    out.push({
      purpose: "service",
      action: "granted",
      text: CONSENT_TEXT.service,
    });
  if (c.marketing)
    out.push({
      purpose: "marketing_email",
      action: "granted",
      text: CONSENT_TEXT.marketing_email,
    });
  if (c.whatsapp)
    out.push({
      purpose: "whatsapp",
      action: "granted",
      text: CONSENT_TEXT.whatsapp,
    });
  return out;
}

const digits = (s: string) => s.replace(/\D/g, "").slice(-10);

/** Current yes/no per purpose for one person: the newest matching record wins. */
export function currentConsent(
  events: ConsentEvent[],
  email: string,
  phone: string,
): Record<ConsentPurpose, boolean> {
  const e = email.trim().toLowerCase();
  const p = digits(phone);
  const result: Record<ConsentPurpose, boolean> = {
    service: false,
    marketing_email: false,
    whatsapp: false,
  };
  const seen = new Set<ConsentPurpose>();
  // events arrive newest-first
  for (const ev of events) {
    if (seen.has(ev.purpose)) continue;
    const match =
      (e && ev.email.toLowerCase() === e) ||
      (p.length === 10 && digits(ev.phone) === p);
    if (!match) continue;
    seen.add(ev.purpose);
    result[ev.purpose] = ev.action === "granted";
  }
  return result;
}
