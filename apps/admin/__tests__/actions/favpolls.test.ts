// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeSupabaseMock } from "@/tests/mocks/supabase-admin";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

let mock = makeSupabaseMock();
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => mock.supabase,
}));

import {
  getAllFavpolls,
  setListed,
  closeFavpollNow,
} from "@/lib/actions/favpolls";

beforeEach(() => {
  mock = makeSupabaseMock();
});

describe("getAllFavpolls", () => {
  it("maps protagonist name with cause_label fallback", async () => {
    mock.queue([
      {
        id: "f1",
        category: "memorial",
        total_raised: 120,
        is_listed: false,
        is_exemplar: true,
        closed_at: "2026-06-01T00:00:00Z",
        closes_at: null,
        created_at: "2026-05-01T00:00:00Z",
        cause_label: null,
        protagonist: { name: "Belinda" },
      },
      {
        id: "f2",
        category: "fundraiser",
        total_raised: null,
        is_listed: true,
        is_exemplar: false,
        closed_at: null,
        closes_at: "2026-08-01T00:00:00Z",
        created_at: "2026-07-01T00:00:00Z",
        cause_label: "The Appeal",
        protagonist: null,
      },
    ]);

    const { data, error } = await getAllFavpolls();

    expect(error).toBeNull();
    expect(data![0]).toMatchObject({
      display_name: "Belinda",
      is_listed: false,
      is_exemplar: true,
    });
    expect(data![1]).toMatchObject({
      display_name: "The Appeal",
      total_raised: 0,
    });
  });

  it("returns error on DB failure", async () => {
    mock.queue(null, { message: "DB down" });
    const { data, error } = await getAllFavpolls();
    expect(data).toBeNull();
    expect(error).toBe("DB down");
  });
});

describe("setListed", () => {
  it("updates is_listed", async () => {
    mock.queue(null);

    const { error } = await setListed("f1", false);

    expect(error).toBeNull();
    const call = mock.callsFor("favpolls").find((c) => c.method === "update")!;
    expect(call.args[0]).toEqual({ is_listed: false });
  });
});

describe("closeFavpollNow", () => {
  it("sums non-withdrawn pledges and freezes total_raised", async () => {
    mock.queue([
      { total_amount: 10, favpoll_polls: { favpoll_id: "f1" } },
      { total_amount: 25.5, favpoll_polls: { favpoll_id: "f1" } },
    ]); // pledges select
    mock.queue(null); // favpolls update

    const { error } = await closeFavpollNow("f1");

    expect(error).toBeNull();
    const update = mock
      .callsFor("favpolls")
      .find((c) => c.method === "update")!;
    expect(update.args[0]).toMatchObject({ total_raised: 35.5 });
    expect(update.args[0].closed_at).toEqual(expect.any(String));
  });

  it("closes with zero when there are no pledges", async () => {
    mock.queue([]); // pledges select
    mock.queue(null); // update

    const { error } = await closeFavpollNow("f1");

    expect(error).toBeNull();
    const update = mock
      .callsFor("favpolls")
      .find((c) => c.method === "update")!;
    expect(update.args[0]).toMatchObject({ total_raised: 0 });
  });

  it("returns error when the pledge fetch fails", async () => {
    mock.queue(null, { message: "no pledges table" });
    const { error } = await closeFavpollNow("f1");
    expect(error).toBe("no pledges table");
  });
});
