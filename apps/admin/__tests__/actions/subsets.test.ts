// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeSupabaseMock } from "@/tests/mocks/supabase-admin";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

let mock = makeSupabaseMock();
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => mock.supabase,
}));

import {
  approveSubset,
  promoteHomemadeTopic,
  renameSubset,
} from "@/lib/actions/subsets";

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

describe("promoteHomemadeTopic (favpoll-topic-rules §1, ruling 8)", () => {
  const homemade = {
    id: "h1",
    title: "Farm animal",
    created_by: "user_1",
    favourites: [
      { label: "Cow" },
      { label: "Pig" },
      { label: "Sheep" },
      { label: "Goat" },
      { label: "Chicken" },
      { label: "Donkey" },
      { label: "Chook" },
    ],
  };
  const parent = {
    id: "animal",
    title: "Animal",
    created_by: null,
    favourites: [
      { id: "a", label: "Cow" },
      { id: "b", label: "Pig" },
      { id: "c", label: "Sheep" },
      { id: "d", label: "Goat" },
      { id: "e", label: "Chicken" },
      { id: "f", label: "Donkey" },
      { id: "g", label: "Lion" },
    ],
  };

  it("refuses a catalogue topic, itself, and a homemade parent", async () => {
    mock.queue({ ...homemade, created_by: null });
    expect((await promoteHomemadeTopic("h1", "animal")).error).toMatch(
      /homemade/,
    );
    mock = makeSupabaseMock();
    mock.queue(homemade);
    expect((await promoteHomemadeTopic("h1", "h1")).error).toMatch(/itself/);
    mock = makeSupabaseMock();
    mock.queue(homemade);
    mock.queue({ ...parent, created_by: "user_2" });
    expect((await promoteHomemadeTopic("h1", "animal")).error).toMatch(
      /catalogue topic/,
    );
  });

  it("refuses when fewer than six items are on the parent's list, naming the rest", async () => {
    mock.queue(homemade);
    mock.queue({ ...parent, favourites: parent.favourites.slice(0, 3) });
    const r = await promoteHomemadeTopic("h1", "animal");
    expect(r.error).toMatch(/needs 6/);
    expect(r.unmatched).toEqual(["Goat", "Chicken", "Donkey", "Chook"]);
    expect(
      mock.callsFor("topic_subsets").some((c) => c.method === "insert"),
    ).toBe(false);
  });

  it("creates the approved subset from matched items and delists the homemade row", async () => {
    mock.queue(homemade);
    mock.queue(parent);
    mock.queue({ id: "s1" }); // the subset insert
    mock.queue(null); // the items insert
    mock.queue(null); // the delist
    const r = await promoteHomemadeTopic("h1", "animal", " Farm  animal ");
    expect(r.error).toBeNull();
    expect(r.unmatched).toEqual(["Chook"]);
    const insert = mock
      .callsFor("topic_subsets")
      .find((c) => c.method === "insert")!;
    expect(insert.args[0]).toMatchObject({
      topic_id: "animal",
      title: "Farm animal",
      status: "approved",
      source: "homemade",
    });
    const items = mock
      .callsFor("topic_subset_items")
      .find((c) => c.method === "insert")!;
    expect(items.args[0]).toHaveLength(6);
    const delist = mock.callsFor("topics").find((c) => c.method === "update")!;
    expect(delist.args[0]).toEqual({ is_listed: false });
  });
});
