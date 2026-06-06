// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeSupabaseMock } from "@/tests/mocks/supabase-admin";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

let mock = makeSupabaseMock();
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => mock.supabase,
}));

import {
  getTopics,
  updatePlaceholder,
  addOccasion,
  deleteOccasion,
} from "@/lib/actions/placeholders";
// VALID_OCCASIONS is in @/lib/occasions (not a 'use server' file)

beforeEach(() => {
  mock = makeSupabaseMock();
});

// ─────────────────────────────────────────────────────────────────────────────
// getTopics
// ─────────────────────────────────────────────────────────────────────────────

describe("getTopics", () => {
  it("returns topics ordered by title", async () => {
    const topics = [
      { id: "a", title: "Colour", is_finite: true, placeholders: {} },
      { id: "b", title: "Season", is_finite: true, placeholders: {} },
    ];
    mock.queue(topics);
    const { data, error } = await getTopics();
    expect(error).toBeNull();
    expect(data).toEqual(topics);
    const topicsCalls = mock.callsFor("topics");
    expect(
      topicsCalls.some((c) => c.method === "order" && c.args[0] === "title"),
    ).toBe(true);
  });

  it("returns error on Supabase failure", async () => {
    mock.queue(null, { message: "DB error" });
    const { data, error } = await getTopics();
    expect(data).toBeNull();
    expect(error).toBe("DB error");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// updatePlaceholder
// ─────────────────────────────────────────────────────────────────────────────

describe("updatePlaceholder", () => {
  it("fetches current placeholders, merges occasion, and updates without overwriting others", async () => {
    const existing = {
      Memorial: { about: "Old about", reveal: "Old reveal" },
      Birthday: { about: "Birthday about", reveal: "Birthday reveal" },
    };
    mock.queue({ placeholders: existing }); // fetch .single()
    mock.queue(null); // update direct await

    const { error } = await updatePlaceholder(
      "topic-1",
      "Memorial",
      "New about",
      "New reveal",
    );
    expect(error).toBeNull();

    const updateCall = mock
      .callsFor("topics")
      .find((c) => c.method === "update")!;
    expect(updateCall.args[0]).toEqual({
      placeholders: {
        Memorial: { about: "New about", reveal: "New reveal" },
        Birthday: { about: "Birthday about", reveal: "Birthday reveal" },
      },
    });
  });

  it("returns error when fetch fails", async () => {
    mock.queue(null, { message: "Not found" });
    const { error } = await updatePlaceholder("topic-1", "Memorial", "A", "B");
    expect(error).toBe("Not found");
  });

  it("returns error when update fails", async () => {
    mock.queue({ placeholders: {} }); // fetch ok
    mock.queue(null, { message: "Write failed" }); // update error
    const { error } = await updatePlaceholder("topic-1", "Memorial", "A", "B");
    expect(error).toBe("Write failed");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// addOccasion
// ─────────────────────────────────────────────────────────────────────────────

describe("addOccasion", () => {
  it("rejects invalid occasion type names without hitting the DB", async () => {
    const { error } = await addOccasion(
      "topic-1",
      "INVALID_OCCASION",
      "A",
      "B",
    );
    expect(error).toMatch(/Invalid occasion type/);
    expect(mock.calls).toHaveLength(0);
  });

  it("accepts all 15 valid occasion types", async () => {
    const validOccasions = [
      "Memorial",
      "Tribute",
      "Birthday",
      "Retirement",
      "Leaving do",
      "Graduation",
      "Christening",
      "Achievement",
      "Recovery",
      "Award",
      "Promotion",
      "Wedding",
      "Engagement",
      "Anniversary",
      "default",
    ];
    for (const occasion of validOccasions) {
      mock.queue({ placeholders: {} });
      mock.queue(null);
      const { error } = await addOccasion("topic-1", occasion, "A", "B");
      expect(error).toBeNull();
    }
  });

  it("rejects an occasion type that already exists", async () => {
    const existing = { Memorial: { about: "M about", reveal: "M reveal" } };
    mock.queue({ placeholders: existing });
    const { error } = await addOccasion(
      "topic-1",
      "Memorial",
      "New about",
      "New reveal",
    );
    expect(error).toMatch(/already exists/i);
    // should not have called update
    expect(
      mock.callsFor("topics").find((c) => c.method === "update"),
    ).toBeUndefined();
  });

  it("merges the new occasion type without overwriting existing ones", async () => {
    const existing = { Birthday: { about: "B about", reveal: "B reveal" } };
    mock.queue({ placeholders: existing });
    mock.queue(null);
    const { error } = await addOccasion(
      "topic-1",
      "Memorial",
      "M about",
      "M reveal",
    );
    expect(error).toBeNull();
    const updateCall = mock
      .callsFor("topics")
      .find((c) => c.method === "update")!;
    expect(updateCall.args[0].placeholders).toMatchObject({
      Birthday: existing.Birthday,
      Memorial: { about: "M about", reveal: "M reveal" },
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// deleteOccasion
// ─────────────────────────────────────────────────────────────────────────────

describe("deleteOccasion", () => {
  it('returns an error for "default" without writing to the DB', async () => {
    const { error } = await deleteOccasion("topic-1", "default");
    expect(error).toMatch(/cannot be deleted/i);
    expect(mock.calls).toHaveLength(0);
  });

  it("removes only the specified occasion key from placeholders", async () => {
    const existing = {
      Memorial: { about: "M about", reveal: "M reveal" },
      Birthday: { about: "B about", reveal: "B reveal" },
    };
    mock.queue({ placeholders: existing });
    mock.queue(null);

    const { error } = await deleteOccasion("topic-1", "Birthday");
    expect(error).toBeNull();

    const updateCall = mock
      .callsFor("topics")
      .find((c) => c.method === "update")!;
    expect(updateCall.args[0].placeholders).toEqual({
      Memorial: { about: "M about", reveal: "M reveal" },
    });
    expect(updateCall.args[0].placeholders.Birthday).toBeUndefined();
  });

  it("returns error when fetch fails", async () => {
    mock.queue(null, { message: "Fetch error" });
    const { error } = await deleteOccasion("topic-1", "Memorial");
    expect(error).toBe("Fetch error");
  });
});
