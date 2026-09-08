// Client for the Charity Commission Register of Charities API.
// https://api-portal.charitycommission.gov.uk/ — auth via the
// Ocp-Apim-Subscription-Key header (CHARITY_COMMISSION_API_KEY).

const API_BASE = "https://api.charitycommission.gov.uk/register/api";

export type VerificationStatus =
  | "verified"
  | "name_mismatch"
  | "not_found"
  | "removed"
  | "error";

export type CharityVerification = {
  status: VerificationStatus;
  /** The name on the register, when the charity number resolved. */
  registeredName: string | null;
};

type RegisterDetails = {
  charity_name: string;
  reg_status: string; // "R" = registered
  date_of_removal: string | null;
};

function normaliseName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

/**
 * Look up a registered charity number and compare the register's name with
 * ours. Never throws — network/API failures return status "error" so a
 * flaky upstream can't block charity admin.
 */
export async function verifyCharityNumber(
  registeredNumber: string,
  ourName: string,
): Promise<CharityVerification> {
  const apiKey = process.env.CHARITY_COMMISSION_API_KEY;
  if (!apiKey) {
    console.error("[charity-commission] CHARITY_COMMISSION_API_KEY not set");
    return { status: "error", registeredName: null };
  }

  const digits = registeredNumber.replace(/\D/g, "");
  if (!digits) return { status: "not_found", registeredName: null };

  try {
    const res = await fetch(`${API_BASE}/allcharitydetails/${digits}/0`, {
      headers: { "Ocp-Apim-Subscription-Key": apiKey },
      cache: "no-store",
    });

    if (res.status === 404)
      return { status: "not_found", registeredName: null };
    if (!res.ok) {
      console.error(`[charity-commission] lookup failed: HTTP ${res.status}`);
      return { status: "error", registeredName: null };
    }

    const details = (await res.json()) as RegisterDetails;
    const registeredName = details.charity_name ?? null;

    if (details.reg_status !== "R" || details.date_of_removal) {
      return { status: "removed", registeredName };
    }
    if (
      registeredName &&
      normaliseName(registeredName) !== normaliseName(ourName)
    ) {
      return { status: "name_mismatch", registeredName };
    }
    return { status: "verified", registeredName };
  } catch (err) {
    console.error("[charity-commission] lookup error:", err);
    return { status: "error", registeredName: null };
  }
}

// ─── Register search (admin "Add from register" typeahead) ───────────────────

export type RegisterSearchResult = {
  registeredNumber: string;
  /** The register's name, ALL CAPS as stored there. */
  registeredName: string;
  /** Suggested display name for the favpoll charity list. */
  displayName: string;
};

type RegisterSearchRow = {
  reg_charity_number: number;
  charity_name: string;
  reg_status: string;
  group_subsid_suffix: number;
};

/**
 * Title-case a register name (stored ALL CAPS) for use as a display-name
 * suggestion. Tokens of up to 4 letters read as acronyms (RNLI, WWF, UK)
 * unless they are common words (St, Fund, Age...). Only a suggestion --
 * admin can always edit the result.
 */
const COMMON_SHORT_WORDS = new Set([
  "a",
  "age",
  "aid",
  "air",
  "and",
  "art",
  "arts",
  "at",
  "band",
  "bank",
  "blue",
  "boys",
  "care",
  "cats",
  "city",
  "club",
  "de",
  "dogs",
  "du",
  "east",
  "farm",
  "food",
  "for",
  "fund",
  "gift",
  "girl",
  "good",
  "hall",
  "hand",
  "help",
  "home",
  "hope",
  "in",
  "kids",
  "land",
  "life",
  "link",
  "love",
  "mind",
  "new",
  "of",
  "old",
  "on",
  "open",
  "our",
  "park",
  "play",
  "red",
  "road",
  "safe",
  "save",
  "sea",
  "song",
  "sons",
  "st",
  "star",
  "team",
  "the",
  "to",
  "town",
  "tree",
  "west",
  "york",
]);

export function titleCaseCharityName(name: string): string {
  return name.toLowerCase().replace(/[a-z']+/g, (w) => {
    if (!COMMON_SHORT_WORDS.has(w)) {
      const shortAcronym = w.length <= 4;
      const vowelless = !/[aeiou]/.test(w); // NSPCC and friends
      if (shortAcronym || vowelless) return w.toUpperCase();
    }
    return w.charAt(0).toUpperCase() + w.slice(1);
  });
}

/** Query variants covering the register's literal substring match: the
 * Commission API treats "st lukes" and "st luke's" as different strings,
 * so we search both spellings and merge (found the hard way — the founder
 * couldn't find St Luke's Cheshire Hospice, 2026-09-07). */
export function registerQueryVariants(query: string): string[] {
  const trimmed = query.trim();
  const stripped = trimmed.replace(/['\u2019]/g, "");
  const possessive = stripped.replace(/([a-z])s(\s|$)/gi, "$1's$2");
  return [...new Set([trimmed, stripped, possessive])].filter(
    (v) => v.length >= 3,
  );
}

function normForMatch(s: string): string {
  return s.toLowerCase().replace(/['\u2019]/g, "");
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Relevance over the register's flat order: names starting with the
 * query beat word-boundary matches beat mere substrings; alphabetical
 * within a band. (Shortest-first was tried and retired 2026-09-09 — with
 * 54 St Luke's prefix matches it buried the Cheshire hospice at #23
 * behind every shorter St Luke's.) */
function rankRows(
  rows: RegisterSearchRow[],
  variants: string[],
): RegisterSearchRow[] {
  const norms = variants.map(normForMatch).filter(Boolean);
  const score = (name: string): number => {
    const n = normForMatch(name);
    let best = 3;
    for (const v of norms) {
      if (n.startsWith(v)) return 0;
      if (best > 1 && new RegExp(`\\b${escapeRegex(v)}`).test(n)) best = 1;
      else if (best > 2 && n.includes(v)) best = 2;
    }
    return best;
  };
  return rows
    .map((r) => ({ r, s: score(r.charity_name) }))
    .sort(
      (a, b) => a.s - b.s || a.r.charity_name.localeCompare(b.r.charity_name),
    )
    .map((x) => x.r);
}

export type RegisterSearch = {
  results: RegisterSearchResult[];
  /** Registered main-charity matches before the cap — drives the
   * "N matches — keep typing" hint. */
  total: number;
};

async function fetchRegisterRows(
  apiKey: string,
  variant: string,
): Promise<RegisterSearchRow[]> {
  const res = await fetch(
    `${API_BASE}/searchCharityName/${encodeURIComponent(variant)}`,
    {
      headers: { "Ocp-Apim-Subscription-Key": apiKey },
      cache: "no-store",
    },
  );

  if (res.status === 404) return []; // the API 404s on "no matches"
  if (!res.ok) {
    console.error(`[charity-commission] search failed: HTTP ${res.status}`);
    return [];
  }
  return (await res.json()) as RegisterSearchRow[];
}

/**
 * Search the Register of Charities by name, apostrophe-normalised and
 * relevance-ranked. Never throws — returns empty on upstream failure;
 * the caller falls back to manual entry. Only currently-registered main
 * charities (suffix 0) are returned.
 */
export async function searchRegisterRanked(
  query: string,
): Promise<RegisterSearch> {
  const apiKey = process.env.CHARITY_COMMISSION_API_KEY;
  const variants = registerQueryVariants(query);
  if (!apiKey || variants.length === 0) return { results: [], total: 0 };

  try {
    const lists = await Promise.all(
      variants.map((v) => fetchRegisterRows(apiKey, v)),
    );
    const byNumber = new Map<number, RegisterSearchRow>();
    for (const row of lists.flat()) {
      if (row.reg_status === "R" && row.group_subsid_suffix === 0) {
        byNumber.set(row.reg_charity_number, row);
      }
    }
    const ranked = rankRows([...byNumber.values()], variants);
    return {
      total: ranked.length,
      results: ranked.slice(0, 20).map((r) => ({
        registeredNumber: String(r.reg_charity_number),
        registeredName: r.charity_name,
        displayName: titleCaseCharityName(r.charity_name),
      })),
    };
  } catch (err) {
    console.error("[charity-commission] search error:", err);
    return { results: [], total: 0 };
  }
}

/** Results-only view of searchRegisterRanked (admin typeahead shape). */
export async function searchRegister(
  query: string,
): Promise<RegisterSearchResult[]> {
  return (await searchRegisterRanked(query)).results;
}

// ─── Register contact details (email prefill + picker confirm) ───────────────

export type RegisterContact = {
  email: string | null;
  website: string | null;
  /** The register's (ALL CAPS) name — identity check for the confirm step. */
  registeredName: string | null;
  /** "Town, County" from the registered address — the human disambiguator. */
  place: string | null;
};

const EMPTY_CONTACT: RegisterContact = {
  email: null,
  website: null,
  registeredName: null,
  place: null,
};

function titleCasePlace(s: string): string {
  return s
    .toLowerCase()
    .replace(
      /(^|[\s-])([a-z])/g,
      (_m, a: string, b: string) => a + b.toUpperCase(),
    );
}

/** The register's contact details for a charity number — prefills the
 * consent-invite mailto and identifies the charity on the picker's
 * confirm step. Never throws; any failure returns nulls so contact
 * stays strictly optional. */
export async function fetchRegisterContact(
  registeredNumber: string,
): Promise<RegisterContact> {
  const apiKey = process.env.CHARITY_COMMISSION_API_KEY;
  const digits = registeredNumber.replace(/\D/g, "");
  if (!apiKey || !digits) return EMPTY_CONTACT;

  try {
    const res = await fetch(`${API_BASE}/allcharitydetails/${digits}/0`, {
      headers: { "Ocp-Apim-Subscription-Key": apiKey },
      cache: "no-store",
    });
    if (!res.ok) return EMPTY_CONTACT;
    const details = (await res.json()) as {
      email?: string | null;
      web?: string | null;
      charity_name?: string | null;
      address_line_one?: string | null;
      address_line_two?: string | null;
      address_line_three?: string | null;
      address_line_four?: string | null;
      address_line_five?: string | null;
    };
    const lines = [
      details.address_line_one,
      details.address_line_two,
      details.address_line_three,
      details.address_line_four,
      details.address_line_five,
    ]
      .map((l) => (l ?? "").trim())
      .filter(Boolean);
    return {
      email: details.email?.trim() || null,
      website: details.web?.trim() || null,
      registeredName: details.charity_name?.trim() || null,
      // The last two address lines are typically town + county.
      place: lines.slice(-2).map(titleCasePlace).join(", ") || null,
    };
  } catch {
    return EMPTY_CONTACT;
  }
}
