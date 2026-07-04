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
