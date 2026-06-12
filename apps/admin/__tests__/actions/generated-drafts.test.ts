// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeSupabaseMock } from "@/tests/mocks/supabase-admin";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

let mock = makeSupabaseMock();
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => mock.supabase,
}));

import {
  getGeneratedDrafts,
  updateGeneratedDraft,
  setGeneratedDraftStatus,
} from "@/lib/actions/generated-drafts";

beforeEach(() => {
  mock = makeSupabaseMock();
});

const makeRawDraft = (overrides: Record<string, unknown> = {}) => ({
  id: "draft-1",
  cache_key: "cause:topic-1:charity-1:cause",
  register: "cause",
  subject: "cause",
  about: "Come together and give.",
  reveal: "They support clean water projects.",
  status: "generated",
  created_at: "2026-01-01T00:00:00Z",
  topics: { title: "Colour" },
  charities: { name: "Shelter" },
  ...overrides,
});

// ─────────────────────────────────────────────────────────────────────────────
// getGeneratedDrafts
// ─────────────────────────────────────────────────────────────────────────────

describe("getGeneratedDrafts", () => {
  it("returns mapped drafts with topic_title and charity_name", async () => {
    mock.queue([makeRawDraft()]);

    const { data, error } = await getGeneratedDrafts("generated");

    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data![0]).toMatchObject({
      id: "draft-1",
      register: "cause",
      subject: "cause",
      about: "Come together and give.",
      reveal: "They support clean water projects.",
      status: "generated",
      topic_title: "Colour",
      charity_name: "Shelter",
    });
  });

  it("defaults to 'generated' filter when no argument given", async () => {
    mock.queue([]);

    await getGeneratedDrafts();

    const eqCalls = mock
      .callsFor("generated_drafts")
      .filter((c) => c.method === "eq");
    expect(
      eqCalls.some((c) => c.args[0] === "status" && c.args[1] === "generated"),
    ).toBe(true);
  });

  it("applies the requested status filter", async () => {
    mock.queue([makeRawDraft({ status: "curated" })]);

    const { data } = await getGeneratedDrafts("curated");

    const eqCalls = mock
      .callsFor("generated_drafts")
      .filter((c) => c.method === "eq");
    expect(
      eqCalls.some((c) => c.args[0] === "status" && c.args[1] === "curated"),
    ).toBe(true);
    expect(data![0].status).toBe("curated");
  });

  it("sets charity_name to null when charities is null (person event)", async () => {
    mock.queue([makeRawDraft({ charities: null, subject: "someone" })]);

    const { data } = await getGeneratedDrafts();

    expect(data![0].charity_name).toBeNull();
    expect(data![0].subject).toBe("someone");
  });

  it("returns error string on DB failure", async () => {
    mock.queue(null, { message: "DB error" });

    const { data, error } = await getGeneratedDrafts();

    expect(data).toBeNull();
    expect(error).toBe("DB error");
  });

  it("returns empty array when no drafts match", async () => {
    mock.queue([]);

    const { data, error } = await getGeneratedDrafts();

    expect(error).toBeNull();
    expect(data).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// updateGeneratedDraft
// ─────────────────────────────────────────────────────────────────────────────

describe("updateGeneratedDraft", () => {
  it("updates about when only about is provided", async () => {
    mock.queue(null);

    const { error } = await updateGeneratedDraft("draft-1", {
      about: "Revised about.",
    });

    expect(error).toBeNull();
    const updateCall = mock
      .callsFor("generated_drafts")
      .find((c) => c.method === "update")!;
    expect(updateCall.args[0]).toEqual({ about: "Revised about." });
    expect(updateCall.args[0]).not.toHaveProperty("reveal");
  });

  it("updates reveal when only reveal is provided", async () => {
    mock.queue(null);

    const { error } = await updateGeneratedDraft("draft-1", {
      reveal: "Revised reveal.",
    });

    expect(error).toBeNull();
    const updateCall = mock
      .callsFor("generated_drafts")
      .find((c) => c.method === "update")!;
    expect(updateCall.args[0]).toEqual({ reveal: "Revised reveal." });
  });

  it("updates both about and reveal when both provided", async () => {
    mock.queue(null);

    await updateGeneratedDraft("draft-1", {
      about: "New about.",
      reveal: "New reveal.",
    });

    const updateCall = mock
      .callsFor("generated_drafts")
      .find((c) => c.method === "update")!;
    expect(updateCall.args[0]).toEqual({
      about: "New about.",
      reveal: "New reveal.",
    });
  });

  it("returns error when neither field is provided", async () => {
    const { error } = await updateGeneratedDraft("draft-1", {});

    expect(error).toBe("Nothing to update.");
  });

  it("returns error on DB failure", async () => {
    mock.queue(null, { message: "update failed" });

    const { error } = await updateGeneratedDraft("draft-1", {
      about: "text",
    });

    expect(error).toBe("update failed");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// setGeneratedDraftStatus
// ─────────────────────────────────────────────────────────────────────────────

describe("setGeneratedDraftStatus", () => {
  it("sets status to curated", async () => {
    mock.queue(null);

    const { error } = await setGeneratedDraftStatus("draft-1", "curated");

    expect(error).toBeNull();
    const updateCall = mock
      .callsFor("generated_drafts")
      .find((c) => c.method === "update")!;
    expect(updateCall.args[0]).toEqual({ status: "curated" });
  });

  it("sets status to rejected", async () => {
    mock.queue(null);

    const { error } = await setGeneratedDraftStatus("draft-1", "rejected");

    expect(error).toBeNull();
    const updateCall = mock
      .callsFor("generated_drafts")
      .find((c) => c.method === "update")!;
    expect(updateCall.args[0]).toEqual({ status: "rejected" });
  });

  it("returns error on DB failure", async () => {
    mock.queue(null, { message: "status update failed" });

    const { error } = await setGeneratedDraftStatus("draft-1", "curated");

    expect(error).toBe("status update failed");
  });
});
