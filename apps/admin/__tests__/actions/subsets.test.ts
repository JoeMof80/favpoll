// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeSupabaseMock } from "@/tests/mocks/supabase-admin";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

let mock = makeSupabaseMock();
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => mock.supabase,
}));

import { approveSubset, renameSubset } from "@/lib/actions/subsets";

beforeEach(() => {
  mock = makeSupabaseMock();
});

describe("approveSubset (favpoll-topic-rules §1, ruling 7)", () => {
  it("refuses a subset with fewer than six items on the parent's list", async () => {
    mock.queue([{ favourite_id: "a" }, { favourite_id: "b" }]);
    const r = await approveSubset("s1");
    expect(r.error).toMatch(/at least 6/);
    expect(
      mock.callsFor("topic_subsets").some((c) => c.method === "update"),
    ).toBe(false);
  });

  it("approves and relists a subset with six", async () => {
    mock.queue(
      ["a", "b", "c", "d", "e", "f"].map((favourite_id) => ({ favourite_id })),
    );
    mock.queue(null);
    const r = await approveSubset("s1");
    expect(r.error).toBeNull();
    const update = mock
      .callsFor("topic_subsets")
      .find((c) => c.method === "update")!;
    expect(update.args[0]).toMatchObject({
      status: "approved",
      is_active: true,
    });
  });
});

describe("renameSubset", () => {
  it("collapses whitespace and refuses an empty name", async () => {
    expect((await renameSubset("s1", "   ")).error).toMatch(/needs a name/);
    mock.queue(null);
    await renameSubset("s1", "  Farm   animal ");
    const update = mock
      .callsFor("topic_subsets")
      .find((c) => c.method === "update")!;
    expect(update.args[0]).toEqual({ title: "Farm animal" });
  });
});
