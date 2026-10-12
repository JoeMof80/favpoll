"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  parseBankAccount,
  formatSortCode,
  maskAccountNumber,
  type BankAccountProblem,
} from "@/lib/bank-account";

// BANK DETAILS — the most sensitive thing in the admin app.
//
// Three rules, from the Next 16 Server Actions guide (an action is a POST
// endpoint that anyone who can reach the route can call):
//
//   AUTHORISE INSIDE THE ACTION. proxy.ts already requires an admin role on
//   every route, and that covers this POST — but render-time gating is not
//   a security boundary, and a second check costs one await.
//
//   TREAT INPUT AS UNTRUSTED. Everything goes through parseBankAccount.
//
//   CONSTRAIN RETURN VALUES. Returns are serialised to the client, so the
//   full account number is NEVER in a list payload. Reads come back masked;
//   the whole number requires a separate, deliberate call.
//
// The table is APPEND-ONLY: a change inserts a new row and the current
// account is the latest by `seq`. Nothing here updates or deletes, which is
// what makes a substituted account visible afterwards.

async function requireAdmin(): Promise<
  { userId: string; error: null } | { userId: null; error: string }
> {
  const { userId, sessionClaims } = await auth();
  if (!userId) return { userId: null, error: "Not signed in." };
  const role = (sessionClaims?.publicMetadata as { role?: string } | undefined)
    ?.role;
  if (role !== "admin") return { userId: null, error: "Not an admin." };
  return { userId, error: null };
}

export type CharityBankAccountView = {
  charityId: string;
  accountName: string;
  /** "11-22-33" */
  sortCode: string;
  /** "••••5678" — the whole number never rides in a list payload. */
  accountNumberMasked: string;
  enteredBy: string;
  source: string | null;
  verifiedAt: string | null;
  verifiedMethod: string | null;
  createdAt: string;
};

/** The current account for each charity, masked. */
export async function getCharityBankAccounts(): Promise<{
  data: Record<string, CharityBankAccountView> | null;
  error: string | null;
}> {
  const gate = await requireAdmin();
  if (gate.error) return { data: null, error: gate.error };

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("charity_bank_account_current")
    .select(
      "charity_id, account_name, sort_code, account_number, entered_by, source, verified_at, verified_method, created_at",
    );
  if (error) return { data: null, error: error.message };

  const byCharity: Record<string, CharityBankAccountView> = {};
  for (const row of (data ?? []) as {
    charity_id: string;
    account_name: string;
    sort_code: string;
    account_number: string;
    entered_by: string;
    source: string | null;
    verified_at: string | null;
    verified_method: string | null;
    created_at: string;
  }[]) {
    byCharity[row.charity_id] = {
      charityId: row.charity_id,
      accountName: row.account_name,
      sortCode: formatSortCode(row.sort_code),
      accountNumberMasked: maskAccountNumber(row.account_number),
      enteredBy: row.entered_by,
      source: row.source,
      verifiedAt: row.verified_at,
      verifiedMethod: row.verified_method,
      createdAt: row.created_at,
    };
  }
  return { data: byCharity, error: null };
}

/** The whole account number, for making the payment. A separate call so it
 *  is only ever serialised when somebody deliberately asked. */
export async function revealCharityBankAccount(charityId: string): Promise<{
  accountNumber: string | null;
  error: string | null;
}> {
  const gate = await requireAdmin();
  if (gate.error) return { accountNumber: null, error: gate.error };

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("charity_bank_account_current")
    .select("account_number")
    .eq("charity_id", charityId)
    .maybeSingle();
  if (error) return { accountNumber: null, error: error.message };
  const row = data as { account_number: string } | null;
  if (!row) return { accountNumber: null, error: "No account on file." };
  return { accountNumber: row.account_number, error: null };
}

/** Record an account. Never an update — a new row, every time, so the
 *  previous details stay readable and a substitution is visible. */
export async function setCharityBankAccount(
  charityId: string,
  input: { accountName: string; sortCode: string; accountNumber: string },
  provenance: { source: string; note?: string },
): Promise<{ error: string | null; problems: BankAccountProblem[] }> {
  const gate = await requireAdmin();
  if (gate.error) return { error: gate.error, problems: [] };

  const parsed = parseBankAccount(input);
  if (!parsed.account) return { error: null, problems: parsed.problems };

  // WHERE IT CAME FROM IS NOT OPTIONAL. Payment diversion fraud arrives as
  // a plausible email saying the details have changed; the defence is that
  // every row can be traced back to a message and a person.
  const source = provenance.source.trim();
  if (!source) {
    return {
      error:
        "Say where these details came from — which message, from which address.",
      problems: [],
    };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("charity_bank_accounts").insert({
    charity_id: charityId,
    account_name: parsed.account.accountName,
    sort_code: parsed.account.sortCode,
    account_number: parsed.account.accountNumber,
    entered_by: gate.userId,
    source,
    note: provenance.note?.trim() || null,
    // verified_at stays NULL. It is set by a Confirmation of Payee result
    // at the first payment, never by having typed the details in.
  });
  if (error) return { error: error.message, problems: [] };

  revalidatePath("/charities");
  return { error: null, problems: [] };
}
