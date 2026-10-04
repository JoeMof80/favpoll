import type { SignatureEvent } from "@favpoll/types"
import { createAdminClient } from "@/lib/supabase/admin"
import { titleCaseCharityName } from "@/lib/charity-commission"
import { placeFromAddress } from "@/lib/register-mirror"

// THE PAGE EVERY REGISTERED CHARITY ALREADY HAS (step 3 of
// references/charity-profiles-2026-09-27.md).
//
// `/charities/<number>` renders from the MIRROR row plus the PROFILE if
// one exists, and from the mirror row alone if not — so a charity that has
// never heard of favpoll still has a page that can render, in its own
// words, with the topic we would suggest for it.
//
// Visibility follows the consent doctrine exactly: PRIVATE until an
// account's consent is approved, because a public page implies an
// endorsement we have not got. The route serves it to staff only and
// tells the crawlers to stay away; the charity's own link into it carries
// a token, which belongs with onboarding and is not built here.
//
// This loader is the whole data story in one place, so the route stays a
// composition and this stays testable.

/** The profile key, or null when the segment is not a registered number —
 *  which is how the route tells a number from an account's uuid.
 *
 *  Deliberately narrow about hyphens: a linked charity is "1089464-1", so
 *  stripping every hyphen would turn it into the wrong charity entirely.
 *  Only the standard-identifier prefixes come off (GB-CHC-, GB-SC-,
 *  GB-NIC-), and a doubled regulator prefix collapses. */
export function profileKeyFromParam(param: string): string | null {
  const key = param
    .trim()
    .toUpperCase()
    .replace(/[\s.]/g, "")
    // GB-CHC-1089464 → 1089464; GB-SC-SC003558 → SCSC003558 → SC003558
    .replace(/^GB-?CHC-?/, "")
    .replace(/^GB-?(SC|NIC)-?/, "$1")
    .replace(/^SC(SC)/, "$1")
    .replace(/^NIC(NIC)/, "$1")
    // SC-003558 → SC003558, but 1089464-1 keeps its hyphen
    .replace(/^(SC|NIC)-/, "$1")
  return /^([0-9]{6,10}(-[0-9]+)?|SC[0-9]{3,6}|NIC[0-9]{3,6})$/.test(key)
    ? key
    : null
}

export type PrivateCharityPage = {
  registeredNumber: string
  /** Title-cased for reading; the register SHOUTS. */
  name: string
  registerName: string | null
  /** Registered | Removed, from the mirror. */
  registerStatus: string | null
  removedOn: string | null
  place: string | null
  website: string | null
  activities: string | null
  objects: string | null
  latestIncome: number | null
  financialYearEnd: string | null
  registeredOn: string | null
  /** The rule floor: a catalogue category, or null where the codes name
   *  nothing honest (a hospice gets nothing, deliberately). */
  topicFamily: string | null
  suggestedTopic: string | null
  suggestedSubset: string | null
  suggestionReason: string | null
  signatureEvents: SignatureEvent[]
  imageUrl: string | null
  imageSource: string | null
  /** null when no profile row exists at all — the register-only page. */
  profileStatus: string | null
  account: {
    id: string
    isActive: boolean
    consentStatus: string | null
  } | null
}

type MirrorRow = {
  registered_number: number
  name: string
  status: string
  removed_on: string | null
  address: string | null
  website: string | null
  activities: string | null
  objects: string | null
  latest_income: number | null
  financial_year_end: string | null
  registered_on: string | null
}

type ProfileRow = {
  topic_family: string | null
  perfect_topic_suggested_id: string | null
  perfect_subset_suggested_id: string | null
  perfect_topic_reason: string | null
  signature_events: SignatureEvent[] | null
  image_url: string | null
  image_source: string | null
  status: string
}

/** Everything the private page shows, or null when there is nothing to
 *  show: no mirror row and no profile means no page. */
export async function loadPrivateCharityPage(
  key: string
): Promise<PrivateCharityPage | null> {
  const supabase = createAdminClient()
  const digits = /^[0-9]+$/.test(key) ? Number(key) : null

  const [mirror, profile, account] = await Promise.all([
    digits === null
      ? Promise.resolve({ data: null })
      : supabase
          .from("register_charities")
          .select(
            "registered_number, name, status, removed_on, address, website, activities, objects, latest_income, financial_year_end, registered_on"
          )
          .eq("registered_number", digits)
          .maybeSingle(),
    supabase
      .from("charity_profiles")
      .select(
        "topic_family, perfect_topic_suggested_id, perfect_subset_suggested_id, perfect_topic_reason, signature_events, image_url, image_source, status"
      )
      .eq("registered_number", key)
      .maybeSingle(),
    // An account may exist for an off-register number too (a hand-written
    // Scottish charity), which is why this is not keyed off the mirror.
    supabase
      .from("charities")
      .select("id, name, is_active, consent_status, registered_number")
      .eq("registered_number", key)
      .maybeSingle(),
  ])

  const row = (mirror.data as MirrorRow | null) ?? null
  const prof = (profile.data as ProfileRow | null) ?? null
  const acc =
    (account.data as {
      id: string
      name: string
      is_active: boolean
      consent_status: string | null
    } | null) ?? null

  if (!row && !prof && !acc) return null

  // The suggested topic and subset are ids on the profile; the page wants
  // their names.
  let suggestedTopic: string | null = null
  let suggestedSubset: string | null = null
  if (prof?.perfect_topic_suggested_id) {
    const { data } = await supabase
      .from("topics")
      .select("title")
      .eq("id", prof.perfect_topic_suggested_id)
      .maybeSingle()
    suggestedTopic = (data as { title: string } | null)?.title ?? null
  }
  if (prof?.perfect_subset_suggested_id) {
    const { data } = await supabase
      .from("topic_subsets")
      .select("title")
      .eq("id", prof.perfect_subset_suggested_id)
      .maybeSingle()
    suggestedSubset = (data as { title: string } | null)?.title ?? null
  }

  const registerName = row?.name ?? null
  return {
    registeredNumber: key,
    name: titleCaseCharityName(registerName ?? acc?.name ?? key),
    registerName,
    registerStatus: row?.status ?? null,
    removedOn: row?.removed_on ?? null,
    place: placeFromAddress(row?.address ?? null),
    website: row?.website ?? null,
    activities: row?.activities ?? null,
    objects: row?.objects ?? null,
    latestIncome: row?.latest_income ?? null,
    financialYearEnd: row?.financial_year_end ?? null,
    registeredOn: row?.registered_on ?? null,
    topicFamily: prof?.topic_family ?? null,
    suggestedTopic,
    suggestedSubset,
    suggestionReason: prof?.perfect_topic_reason ?? null,
    signatureEvents: prof?.signature_events ?? [],
    imageUrl: prof?.image_url ?? null,
    imageSource: prof?.image_source ?? null,
    profileStatus: prof?.status ?? null,
    account: acc
      ? {
          id: acc.id,
          isActive: acc.is_active,
          consentStatus: acc.consent_status,
        }
      : null,
  }
}
