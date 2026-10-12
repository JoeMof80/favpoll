// UK BANK DETAILS, NORMALISED (2026-10-12)
//
// favpoll collects as agent for a charity and remits directly, so a charity
// is not payable until someone has typed its account in. This is the layer
// that decides what counts as typed in correctly.
//
// IT DOES NOT MODULUS-CHECK. The real check needs Vocalink's published
// weight table (valacdos), which is a third-party data file, and a wrong
// implementation fails in the worst direction: telling a real charity that
// its real account number is invalid. Confirmation of Payee at the first
// payment catches everything a modulus check would and more — it tests the
// account NAME, which is what defeats impersonation — so the only thing a
// modulus check buys is learning about a typo at entry rather than at
// payee setup. Revisit if the volume ever justifies the dependency.
//
// WHAT IT DOES CATCH is the failure that would otherwise bite immediately:
// NOT EVERY UK ACCOUNT NUMBER HAS EIGHT DIGITS. Several banks issue six or
// seven (the Co-operative Bank most commonly), and the convention is to
// zero-pad on the left to eight. A naive eight-digit rule rejects a real
// charity's real account — which is why the database stores eight and this
// module is what gets it there.

export type BankAccountInput = {
  accountName: string;
  sortCode: string;
  accountNumber: string;
};

export type BankAccount = {
  accountName: string;
  /** Six digits, no separators — the form the database stores. */
  sortCode: string;
  /** Eight digits, zero-padded from six or seven. */
  accountNumber: string;
};

const digits = (s: string) => s.replace(/\D/g, "");

/** Six digits, however it was typed: "11-22-33", "11 22 33", "112233". */
export function normaliseSortCode(input: string): string | null {
  const d = digits(input);
  if (d.length !== 6) return null;
  // 00-00-00 is not issued and is the shape a half-filled form leaves.
  if (d === "000000") return null;
  return d;
}

/** Eight digits, zero-padded from six or seven (see the note above). */
export function normaliseAccountNumber(input: string): string | null {
  const d = digits(input);
  if (d.length < 6 || d.length > 8) return null;
  const padded = d.padStart(8, "0");
  if (padded === "00000000") return null;
  return padded;
}

/** "11-22-33" — for reading back, never for storing. */
export function formatSortCode(sortCode: string): string {
  const d = digits(sortCode);
  return d.length === 6 ? `${d.slice(0, 2)}-${d.slice(2, 4)}-${d.slice(4)}` : d;
}

/** The last four only. Enough to confirm the right account over the phone,
 *  without putting the whole number on a screen somebody is sharing. */
export function maskAccountNumber(accountNumber: string): string {
  const d = digits(accountNumber);
  return d.length <= 4 ? d : `••••${d.slice(-4)}`;
}

export type BankAccountProblem =
  | "account_name_missing"
  | "sort_code_invalid"
  | "account_number_invalid";

/** The whole account, or every problem with it — all of them at once, so a
 *  correction is one round trip rather than three. */
export function parseBankAccount(
  input: BankAccountInput,
):
  | { account: BankAccount; problems: [] }
  | { account: null; problems: BankAccountProblem[] } {
  const problems: BankAccountProblem[] = [];

  const accountName = input.accountName.trim();
  if (!accountName) problems.push("account_name_missing");

  const sortCode = normaliseSortCode(input.sortCode);
  if (!sortCode) problems.push("sort_code_invalid");

  const accountNumber = normaliseAccountNumber(input.accountNumber);
  if (!accountNumber) problems.push("account_number_invalid");

  if (problems.length > 0 || !sortCode || !accountNumber) {
    return { account: null, problems };
  }
  return { account: { accountName, sortCode, accountNumber }, problems: [] };
}

export const BANK_ACCOUNT_PROBLEM_LABELS: Record<BankAccountProblem, string> = {
  account_name_missing:
    "The name on the account is needed — it is what Confirmation of Payee checks, and it is often not the charity's display name.",
  sort_code_invalid: "A sort code is six digits.",
  account_number_invalid:
    "An account number is six to eight digits; shorter ones are padded to eight.",
};
