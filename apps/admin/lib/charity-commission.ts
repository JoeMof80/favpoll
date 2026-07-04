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

/**
 * Search the Register of Charities by name. Never throws — returns []
 * on upstream failure; the caller falls back to manual entry. Only
 * currently-registered main charities (suffix 0) are returned.
 */
export async function searchRegister(
  query: string,
): Promise<RegisterSearchResult[]> {
  const apiKey = process.env.CHARITY_COMMISSION_API_KEY;
  const trimmed = query.trim();
  if (!apiKey || trimmed.length < 3) return [];

  try {
    const res = await fetch(
      `${API_BASE}/searchCharityName/${encodeURIComponent(trimmed)}`,
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

    const rows = (await res.json()) as RegisterSearchRow[];
    return rows
      .filter((r) => r.reg_status === "R" && r.group_subsid_suffix === 0)
      .slice(0, 8)
      .map((r) => ({
        registeredNumber: String(r.reg_charity_number),
        registeredName: r.charity_name,
        displayName: titleCaseCharityName(r.charity_name),
      }));
  } catch (err) {
    console.error("[charity-commission] search error:", err);
    return [];
  }
}
