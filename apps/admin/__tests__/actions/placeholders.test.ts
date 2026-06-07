// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeSupabaseMock } from "@/tests/mocks/supabase-admin";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

let mock = makeSupabaseMock();
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => mock.supabase,
}));

import { getTopics, updatePlaceholder } from "@/lib/actions/placeholders";

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
  it("rejects invalid (non-register) keys without hitting the DB", async () => {
    const { error } = await updatePlaceholder(
      "topic-1",
      "Memorial" as never,
      "A",
      "B",
    );
    expect(error).toMatch(/Invalid register/);
    expect(mock.calls).toHaveLength(0);
  });

  it("accepts all 5 valid register keys", async () => {
    const registers = [
      "remembering",
      "celebrating_one",
      "celebrating_many",
      "cause",
      "neutral",
    ] as const;
    for (const reg of registers) {
      mock.queue({ placeholders: {} });
      mock.queue(null);
      const { error } = await updatePlaceholder("topic-1", reg, "A", "B");
      expect(error).toBeNull();
    }
  });

  it("merges register entry without overwriting other registers", async () => {
    const existing = {
      remembering: { about: "Old about", reveal: "Old reveal" },
      celebrating_one: { about: "Birthday about", reveal: "Birthday reveal" },
    };
    mock.queue({ placeholders: existing }); // fetch .single()
    mock.queue(null); // update direct await

    const { error } = await updatePlaceholder(
      "topic-1",
      "remembering",
      "New about",
      "New reveal",
    );
    expect(error).toBeNull();

    const updateCall = mock
      .callsFor("topics")
      .find((c) => c.method === "update")!;
    expect(updateCall.args[0]).toEqual({
      placeholders: {
        remembering: { about: "New about", reveal: "New reveal" },
        celebrating_one: { about: "Birthday about", reveal: "Birthday reveal" },
      },
    });
  });

  it("returns error when fetch fails", async () => {
    mock.queue(null, { message: "Not found" });
    const { error } = await updatePlaceholder(
      "topic-1",
      "remembering",
      "A",
      "B",
    );
    expect(error).toBe("Not found");
  });

  it("returns error when update fails", async () => {
    mock.queue({ placeholders: {} }); // fetch ok
    mock.queue(null, { message: "Write failed" }); // update error
    const { error } = await updatePlaceholder(
      "topic-1",
      "remembering",
      "A",
      "B",
    );
    expect(error).toBe("Write failed");
  });
});
