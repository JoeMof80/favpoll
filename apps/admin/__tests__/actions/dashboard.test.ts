// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeSupabaseMock } from "@/tests/mocks/supabase-admin";

let mock = makeSupabaseMock();
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => mock.supabase,
}));

import {
  getDashboardStats,
  getRecentFavpolls,
  getRecentPledges,
} from "@/lib/actions/dashboard";

beforeEach(() => {
  mock = makeSupabaseMock();
});

describe("getDashboardStats", () => {
  it("returns the stats json from the rpc", async () => {
    const stats = {
      favpolls_total: 10,
      favpolls_open: 6,
      favpolls_closed: 4,
      pledges_count: 100,
      total_pledged: 1234.5,
      total_tips: 42,
      pending_contributions: 2,
      active_charities: 30,
      charity_issues: 1,
      drafts_to_review: 0,
    };
    mock.queue(stats);

    const { data, error } = await getDashboardStats();

    expect(error).toBeNull();
    expect(data).toEqual(stats);
    expect(mock.rpc).toHaveBeenCalledWith("admin_dashboard_stats");
  });

  it("returns error on rpc failure", async () => {
    mock.queue(null, { message: "boom" });

    const { data, error } = await getDashboardStats();

    expect(data).toBeNull();
    expect(error).toBe("boom");
  });
});

describe("getRecentFavpolls", () => {
  it("maps protagonist name, falling back to cause_label", async () => {
    mock.queue([
      {
        id: "f1",
        category: "memorial",
        total_raised: 100,
        closed_at: null,
        created_at: "2026-07-01T00:00:00Z",
        cause_label: null,
        protagonist: { name: "Belinda" },
      },
      {
        id: "f2",
        category: "fundraiser",
        total_raised: 0,
        closed_at: "2026-07-02T00:00:00Z",
        created_at: "2026-07-02T00:00:00Z",
        cause_label: "The Sunshine Appeal",
        protagonist: null,
      },
    ]);

    const { data, error } = await getRecentFavpolls();

    expect(error).toBeNull();
    expect(data![0].display_name).toBe("Belinda");
    expect(data![1].display_name).toBe("The Sunshine Appeal");
  });

  it("returns error on DB failure", async () => {
    mock.queue(null, { message: "DB down" });
    const { data, error } = await getRecentFavpolls();
    expect(data).toBeNull();
    expect(error).toBe("DB down");
  });
});

describe("getRecentPledges", () => {
  it("maps the favpoll display name and defaults tip to 0", async () => {
    mock.queue([
      {
        id: "p1",
        total_amount: 10,
        tip_amount: 1,
        created_at: "2026-07-05T00:00:00Z",
        favpoll_polls: {
          favpolls: { cause_label: null, protagonists: { name: "Poppy" } },
        },
      },
      {
        id: "p2",
        total_amount: 5,
        tip_amount: null,
        created_at: "2026-07-05T00:00:00Z",
        favpoll_polls: {
          favpolls: { cause_label: "An Appeal", protagonists: null },
        },
      },
    ]);

    const { data, error } = await getRecentPledges();

    expect(error).toBeNull();
    expect(data![0]).toMatchObject({ favpoll_name: "Poppy", tip_amount: 1 });
    expect(data![1]).toMatchObject({
      favpoll_name: "An Appeal",
      tip_amount: 0,
    });
  });
});
