import { createAdminClient } from "@/lib/supabase/admin";
import { verifyCharityNumber } from "@/lib/charity-commission";

const REVERIFY_AFTER_DAYS = 30;
const BATCH_SIZE = 25;

// Vercel cron (see vercel.json) — re-verifies charities against the Charity
// Commission register when their last check is stale, errored, or missing.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const cutoff = new Date(
    Date.now() - REVERIFY_AFTER_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { data: charities, error } = await supabase
    .from("charities")
    .select("id, name, registered_number")
    .not("registered_number", "is", null)
    .or(
      `verified_at.is.null,verified_at.lt.${cutoff},verification_status.eq.error`,
    )
    .limit(BATCH_SIZE);

  if (error) {
    console.error("[verify-charities] fetch error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }

  let checked = 0;
  const errors: string[] = [];

  for (const charity of charities ?? []) {
    const result = await verifyCharityNumber(
      charity.registered_number as string,
      charity.name as string,
    );

    const { error: updateErr } = await supabase
      .from("charities")
      .update({
        verification_status: result.status,
        verified_name: result.registeredName,
        verified_at: new Date().toISOString(),
      })
      .eq("id", charity.id);

    if (updateErr) {
      errors.push(`${charity.id}: ${updateErr.message}`);
      continue;
    }
    checked++;
  }

  return Response.json({ checked, errors: errors.length ? errors : undefined });
}
