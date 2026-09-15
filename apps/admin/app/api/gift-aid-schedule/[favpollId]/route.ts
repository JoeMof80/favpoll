import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Gift Aid schedule CSV per favpoll PER CHARITY (founder go, 2026-09-15;
// per-charity split 2026-09-15). The CHARITY claims from HMRC — favpoll
// only captures declarations and hands the charity this schedule at
// settlement. Columns mirror HMRC's claim spreadsheet (Title left blank —
// not captured; the four fields we hold are the schedule's minimum).
//
// A favpoll may name up to three charities, splitting proceeds equally —
// and each charity may only claim on the portion IT received. So each
// row's amount is that charity's penny-even share of the pledge, using
// the same maths as apps/web/lib/disbursement/split.ts (earliest
// charity, ordered by id, gets the spare penny) so the schedule
// reconciles with what is actually disbursed. Multi-charity favpolls
// must name the charity (?charity=<id>); single-charity ones need not.
//
// Withdrawn pledges are excluded; amounts are the PLEDGE only — the tip
// is favpoll's and never Gift-Aidable. Admin-only: the Clerk role gate
// in proxy.ts covers every non-cron route, including this one.

function csvField(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

// HMRC's schedule wants DD/MM/YY
function hmrcDate(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const yy = String(d.getUTCFullYear() % 100).padStart(2, "0");
  return `${dd}/${mm}/${yy}`;
}

// Mirrors splitEqually (apps/web/lib/disbursement/split.ts): penny-even,
// spare pennies to the earliest charities in order.
function shareAtIndex(
  totalPounds: number,
  count: number,
  index: number,
): number {
  const totalPence = Math.round(totalPounds * 100);
  const base = Math.floor(totalPence / count);
  const remainder = totalPence - base * count;
  return (base + (index < remainder ? 1 : 0)) / 100;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ favpollId: string }> },
) {
  const { favpollId } = await params;
  const supabase = createAdminClient();

  // Stable charity order = ascending id, matching the deterministic
  // ordering the split must agree on across surfaces.
  const { data: charityRows, error: charityErr } = await supabase
    .from("favpoll_charities")
    .select("charity_id")
    .eq("favpoll_id", favpollId)
    .order("charity_id", { ascending: true });

  if (charityErr) {
    return NextResponse.json({ error: charityErr.message }, { status: 500 });
  }
  const charityIds = (charityRows ?? []).map((r) => r.charity_id as string);
  if (charityIds.length === 0) {
    return NextResponse.json(
      { error: "This favpoll has no charities." },
      { status: 404 },
    );
  }

  const requested = new URL(req.url).searchParams.get("charity");
  let charityIndex = 0;
  if (charityIds.length > 1) {
    charityIndex = requested ? charityIds.indexOf(requested) : -1;
    if (charityIndex === -1) {
      return NextResponse.json(
        {
          error:
            "This favpoll splits across charities — pass ?charity=<id> so amounts are that charity's share.",
        },
        { status: 400 },
      );
    }
  }

  const { data, error } = await supabase
    .from("gift_aid_declarations")
    .select(
      `first_name, last_name, house_name_or_number, postcode,
       pledges!inner(total_amount, created_at, withdrawn_at,
         favpoll_polls!inner(favpoll_id))`,
    )
    .eq("pledges.favpoll_polls.favpoll_id", favpollId)
    .is("pledges.withdrawn_at", null)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const header = [
    "Title",
    "First name",
    "Last name",
    "House name or number",
    "Postcode",
    "Aggregated donations",
    "Sponsored event",
    "Donation date",
    "Amount",
  ].join(",");

  const rows = (data ?? []).map((d) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- nested join shape
    const pledge = d.pledges as any;
    return [
      "", // Title — not captured
      csvField(d.first_name),
      csvField(d.last_name),
      csvField(d.house_name_or_number),
      csvField(d.postcode),
      "", // Aggregated donations
      "", // Sponsored event
      hmrcDate(pledge.created_at),
      shareAtIndex(
        Number(pledge.total_amount),
        charityIds.length,
        charityIndex,
      ).toFixed(2),
    ].join(",");
  });

  const filename =
    charityIds.length > 1
      ? `gift-aid-schedule-${favpollId}-${charityIds[charityIndex]}.csv`
      : `gift-aid-schedule-${favpollId}.csv`;

  return new NextResponse([header, ...rows].join("\n") + "\n", {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
