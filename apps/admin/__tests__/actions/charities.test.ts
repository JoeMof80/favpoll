// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeSupabaseMock } from "@/tests/mocks/supabase-admin";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const mockVerify = vi.hoisted(() => vi.fn());
const mockContact = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ email: null, website: null }),
);
const mockPurpose = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ activities: null, classification: null }),
);
// importOriginal, not a hand-written stand-in: `normaliseName` is the
// real comparison the mirror verifies names with, and a copy of it in a
// mock is how the two definitions drifted apart in the first place. Only
// the network calls are mocked.
vi.mock("@/lib/charity-commission", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/charity-commission")>()),
  verifyCharityNumber: mockVerify,
  fetchRegisterContact: mockContact,
  fetchRegisterPurpose: mockPurpose,
}));

let mock = makeSupabaseMock();
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => mock.supabase,
}));

import {
  getCharities,
  createCharity,
  updateCharity,
  deactivateCharity,
  getCharityTopics,
  setCharityTopics,
  setCharityConsent,
  getConsentQueue,
  getRegisterRemovals,
  getPerfectTopicQueue,
  dismissPerfectTopicSuggestion,
} from "@/lib/actions/charities";

beforeEach(() => {
  mock = makeSupabaseMock();
  mockVerify.mockReset();
  mockVerify.mockResolvedValue({
    status: "verified",
    registeredName: "AGE UK",
  });
});

const makeCharity = (overrides: Record<string, unknown> = {}) => ({
  id: "charity-1",
  name: "Cancer Research UK",
  description: null,
  logo_url: null,
  registered_number: "1089464",
  is_active: true,
  market: "en-GB",
  created_at: "2026-01-01T00:00:00Z",
  ...overrides,
});

// ─────────────────────────────────────────────────────────────────────────────
// getCharities
// ─────────────────────────────────────────────────────────────────────────────

describe("getCharities", () => {
  // The account rows come first, then the overlays: the suggested cause
  // family from the PROFILE (step 2) and the register's own words from the
  // MIRROR (step 4). Three responses, in that order.
  const queueCharities = (rows: unknown[]) => {
    mock.queue(rows);
    mock.queue([]); // charity_profiles
    mock.queue([]); // register_charities
  };

  it("returns all charities ordered by name", async () => {
    queueCharities([
      makeCharity(),
      makeCharity({ id: "charity-2", name: "Diabetes UK" }),
    ]);

    const { data, error } = await getCharities();

    expect(error).toBeNull();
    expect(data).toHaveLength(2);
  });

  it("filters by market when provided", async () => {
    queueCharities([makeCharity()]);

    await getCharities("en-GB");

    const eqCalls = mock.callsFor("charities").filter((c) => c.method === "eq");
    expect(
      eqCalls.some((c) => c.args[0] === "market" && c.args[1] === "en-GB"),
    ).toBe(true);
  });

  it("does not add market filter when market is not provided", async () => {
    queueCharities([makeCharity()]);

    await getCharities();

    const eqCalls = mock.callsFor("charities").filter((c) => c.method === "eq");
    expect(eqCalls.some((c) => c.args[0] === "market")).toBe(false);
  });

  it("returns error on DB failure", async () => {
    mock.queue(null, { message: "DB error" });

    const { data, error } = await getCharities();

    expect(data).toBeNull();
    expect(error).toBe("DB error");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// createCharity
// ─────────────────────────────────────────────────────────────────────────────

describe("createCharity", () => {
  it("returns error if name is empty", async () => {
    const { error } = await createCharity({ name: "   ", market: "en-GB" });
    expect(error).toBe("Name is required.");
  });

  it("returns error if name is empty string", async () => {
    const { error } = await createCharity({ name: "", market: "en-GB" });
    expect(error).toBe("Name is required.");
  });

  it("returns error if market is not a known value", async () => {
    const { error } = await createCharity({
      name: "Test Charity",
      market: "en-US",
    });
    expect(error).toMatch(/Invalid market/);
  });

  it("inserts charity with is_active true on success", async () => {
    mock.queue(null); // insert

    const { error } = await createCharity({
      name: "Macmillan",
      market: "en-GB",
    });

    expect(error).toBeNull();
    const insertCall = mock
      .callsFor("charities")
      .find((c) => c.method === "insert")!;
    expect(insertCall.args[0]).toMatchObject({
      name: "Macmillan",
      is_active: true,
      market: "en-GB",
    });
  });

  it("returns error on DB failure", async () => {
    mock.queue(null, { message: "insert failed" });

    const { error } = await createCharity({
      name: "Macmillan",
      market: "en-GB",
    });

    expect(error).toBe("insert failed");
  });

  it("verifies against the Charity Commission when a number is given", async () => {
    mock.queue(null); // insert

    const { error } = await createCharity({
      name: "Age UK",
      registered_number: "1128267",
      market: "en-GB",
    });

    expect(error).toBeNull();
    expect(mockVerify).toHaveBeenCalledWith("1128267", "Age UK");
    const insertCall = mock
      .callsFor("charities")
      .find((c) => c.method === "insert")!;
    expect(insertCall.args[0]).toMatchObject({
      verification_status: "verified",
      verified_name: "AGE UK",
      verified_at: expect.any(String),
    });
  });

  it("does not call the Charity Commission without a number", async () => {
    mock.queue(null); // insert

    await createCharity({ name: "Macmillan", market: "en-GB" });

    expect(mockVerify).not.toHaveBeenCalled();
    const insertCall = mock
      .callsFor("charities")
      .find((c) => c.method === "insert")!;
    expect(insertCall.args[0]).toMatchObject({
      verification_status: null,
      verified_name: null,
      verified_at: null,
    });
  });

  it("stores the error status when verification fails", async () => {
    mockVerify.mockResolvedValue({ status: "error", registeredName: null });
    mock.queue(null); // insert

    const { error } = await createCharity({
      name: "Age UK",
      registered_number: "1128267",
      market: "en-GB",
    });

    expect(error).toBeNull();
    const insertCall = mock
      .callsFor("charities")
      .find((c) => c.method === "insert")!;
    expect(insertCall.args[0]).toMatchObject({
      verification_status: "error",
      verified_name: null,
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// updateCharity
// ─────────────────────────────────────────────────────────────────────────────

describe("updateCharity", () => {
  it("returns error if name is set to empty string", async () => {
    const { error } = await updateCharity("charity-1", { name: "" });
    expect(error).toBe("Name cannot be empty.");
  });

  it("returns error if name is set to whitespace", async () => {
    const { error } = await updateCharity("charity-1", { name: "   " });
    expect(error).toBe("Name cannot be empty.");
  });

  it("updates provided fields on success", async () => {
    mock.queue(null); // update

    const { error } = await updateCharity("charity-1", {
      name: "Updated Name",
      description: "New desc",
    });

    expect(error).toBeNull();
    const updateCall = mock
      .callsFor("charities")
      .find((c) => c.method === "update")!;
    expect(updateCall.args[0]).toMatchObject({
      name: "Updated Name",
      description: "New desc",
    });
  });

  it("returns error on DB failure", async () => {
    mock.queue(null, { message: "update failed" });

    const { error } = await updateCharity("charity-1", { name: "Valid Name" });

    expect(error).toBe("update failed");
  });

  it("re-verifies when the registered number changes", async () => {
    mock.queue(null); // update

    const { error } = await updateCharity("charity-1", {
      name: "Age UK",
      registered_number: "1128267",
    });

    expect(error).toBeNull();
    expect(mockVerify).toHaveBeenCalledWith("1128267", "Age UK");
    const updateCall = mock
      .callsFor("charities")
      .find((c) => c.method === "update")!;
    expect(updateCall.args[0]).toMatchObject({
      registered_number: "1128267",
      verification_status: "verified",
      verified_name: "AGE UK",
    });
  });

  it("fetches the stored name when re-verifying without a name in the update", async () => {
    mock.queue({ name: "Age UK" }); // select existing name
    mock.queue(null); // update

    await updateCharity("charity-1", { registered_number: "1128267" });

    expect(mockVerify).toHaveBeenCalledWith("1128267", "Age UK");
  });

  it("clears verification when the number is removed", async () => {
    mock.queue(null); // update

    const { error } = await updateCharity("charity-1", {
      registered_number: "",
    });

    expect(error).toBeNull();
    expect(mockVerify).not.toHaveBeenCalled();
    const updateCall = mock
      .callsFor("charities")
      .find((c) => c.method === "update")!;
    expect(updateCall.args[0]).toMatchObject({
      registered_number: null,
      verification_status: null,
      verified_name: null,
      verified_at: null,
    });
  });

  it("does not re-verify when the number is not part of the update", async () => {
    mock.queue(null); // update

    await updateCharity("charity-1", { name: "Updated Name" });

    expect(mockVerify).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// deactivateCharity
// ─────────────────────────────────────────────────────────────────────────────

describe("deactivateCharity", () => {
  it("returns success without warning if charity is used in zero favpolls", async () => {
    mock.queue([]); // favpoll_charities select → empty
    mock.queue(null); // charities update

    const { error, warning } = await deactivateCharity("charity-1");

    expect(error).toBeNull();
    expect(warning).toBeUndefined();
  });

  it("returns success with warning if charity is used in one or more favpolls", async () => {
    mock.queue([{ id: "ec-1" }, { id: "ec-2" }]); // favpoll_charities select → 2 rows
    mock.queue(null); // charities update

    const { error, warning } = await deactivateCharity("charity-1");

    expect(error).toBeNull();
    expect(warning).toMatch(/2 favpolls/);
  });

  it('uses singular "favpoll" when used in exactly one favpoll', async () => {
    mock.queue([{ id: "ec-1" }]); // favpoll_charities select → 1 row
    mock.queue(null); // charities update

    const { warning } = await deactivateCharity("charity-1");

    expect(warning).toMatch(/1 favpoll[^s]/);
  });

  it("returns error if favpoll_charities query fails", async () => {
    mock.queue(null, { message: "count failed" });

    const { error } = await deactivateCharity("charity-1");

    expect(error).toBe("count failed");
  });

  it("returns error if charities update fails", async () => {
    mock.queue([]); // favpoll_charities succeeds
    mock.queue(null, { message: "update failed" }); // charities update fails

    const { error } = await deactivateCharity("charity-1");

    expect(error).toBe("update failed");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getCharityTopics
// ─────────────────────────────────────────────────────────────────────────────

describe("getCharityTopics", () => {
  it("returns topic ids for the given charity", async () => {
    mock.queue([{ topic_id: "t-1" }, { topic_id: "t-2" }]);

    const { data, error } = await getCharityTopics("charity-1");

    expect(error).toBeNull();
    expect(data).toEqual(["t-1", "t-2"]);
  });

  it("returns an empty array when no suggestions are set", async () => {
    mock.queue([]);

    const { data, error } = await getCharityTopics("charity-1");

    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it("returns error on DB failure", async () => {
    mock.queue(null, { message: "DB error" });

    const { data, error } = await getCharityTopics("charity-1");

    expect(data).toBeNull();
    expect(error).toBe("DB error");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// setCharityTopics
// ─────────────────────────────────────────────────────────────────────────────

describe("setCharityTopics", () => {
  it("deletes then inserts the given topic ids", async () => {
    mock.queue(null); // delete
    mock.queue(null); // insert

    const { error } = await setCharityTopics("charity-1", ["t-1", "t-2"]);

    expect(error).toBeNull();

    const ctCalls = mock.callsFor("charity_topics");
    expect(ctCalls.some((c) => c.method === "delete")).toBe(true);
    const insertCall = ctCalls.find((c) => c.method === "insert");
    expect(insertCall).toBeDefined();
    expect(insertCall!.args[0]).toEqual([
      { charity_id: "charity-1", topic_id: "t-1" },
      { charity_id: "charity-1", topic_id: "t-2" },
    ]);
  });

  it("only deletes when topicIds is empty (no insert)", async () => {
    mock.queue(null); // delete

    const { error } = await setCharityTopics("charity-1", []);

    expect(error).toBeNull();

    const ctCalls = mock.callsFor("charity_topics");
    expect(ctCalls.some((c) => c.method === "delete")).toBe(true);
    expect(ctCalls.some((c) => c.method === "insert")).toBe(false);
  });

  it("returns error if delete fails", async () => {
    mock.queue(null, { message: "delete failed" });

    const { error } = await setCharityTopics("charity-1", ["t-1"]);

    expect(error).toBe("delete failed");
  });

  it("returns error if insert fails", async () => {
    mock.queue(null); // delete succeeds
    mock.queue(null, { message: "insert failed" }); // insert fails

    const { error } = await setCharityTopics("charity-1", ["t-1"]);

    expect(error).toBe("insert failed");
  });
});

describe("setCharityConsent", () => {
  it("approve stamps the decision and lists the charity", async () => {
    mock.queue(null);

    const { error } = await setCharityConsent("charity-1", "approved");

    expect(error).toBeNull();
    const update = mock
      .callsFor("charities")
      .find((c) => c.method === "update")!;
    expect(update.args[0]).toMatchObject({
      consent_status: "approved",
      is_active: true,
    });
    expect(update.args[0].consent_decided_at).toEqual(expect.any(String));
  });

  it("decline delists the charity", async () => {
    mock.queue(null);

    const { error } = await setCharityConsent("charity-1", "declined");

    expect(error).toBeNull();
    const update = mock
      .callsFor("charities")
      .find((c) => c.method === "update")!;
    expect(update.args[0]).toMatchObject({
      consent_status: "declined",
      is_active: false,
    });
  });

  it("returns error on DB failure", async () => {
    // Approval reads the charity first (the removal check), so the
    // update's response is the second in the queue.
    mock.queue({ name: "Cancer Research UK", registered_number: null });
    mock.queue(null, { message: "update failed" });

    const { error } = await setCharityConsent("charity-1", "approved");

    expect(error).toBe("update failed");
  });

  // ─── THE REMOVAL CHECK reaches the write ─────────────────────────────────
  // profiles note §3: approval lists the charity and opens the money rail,
  // so a deregistered number is refused where the write happens, not only
  // in the button that calls it.

  it("refuses approval when the register has removed the charity", async () => {
    mock.queue({ name: "Gone Trust", registered_number: "1000002" });
    mock.queue({
      name: "GONE TRUST",
      status: "Removed",
      removed_on: "2023-02-16",
    });

    const { error } = await setCharityConsent("charity-1", "approved");

    expect(error).toMatch(/removed this charity/i);
    expect(mock.callsFor("charities").some((c) => c.method === "update")).toBe(
      false,
    );
  });

  it("approves when the mirror says Registered", async () => {
    mock.queue({ name: "Age UK", registered_number: "1128267" });
    mock.queue({ name: "AGE UK", status: "Registered", removed_on: null });
    mock.queue(null);

    const { error } = await setCharityConsent("charity-1", "approved");

    expect(error).toBeNull();
    const update = mock
      .callsFor("charities")
      .find((c) => c.method === "update")!;
    expect(update.args[0]).toMatchObject({ consent_status: "approved" });
  });

  it("declining a removed charity is never blocked — it is the way out", async () => {
    mock.queue(null);

    const { error } = await setCharityConsent("charity-1", "declined");

    expect(error).toBeNull();
    expect(mock.callsFor("register_charities")).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// A GIVEN LOGO DROPS THE SCRAPED IMAGE (decision 2's second guard)
// ─────────────────────────────────────────────────────────────────────────────

describe("a given logo and the scraped image", () => {
  it("drops the profile's scraped image when a logo is saved", async () => {
    mock.queue(null); // the account update
    mock.queue({ registered_number: "207076" }); // the number lookup
    mock.queue(null); // the profile update

    const { error } = await updateCharity("c1", {
      logo_url: "https://rspb.org.uk/logo.png",
    });

    expect(error).toBeNull();
    const update = mock
      .callsFor("charity_profiles")
      .find((c) => c.method === "update")!;
    expect(update.args[0]).toMatchObject({
      image_url: null,
      image_source: null,
    });
    // ...and only a SCRAPED one: a logo the charity gave us is theirs.
    expect(
      mock.callsFor("charity_profiles").find((c) => c.method === "in")?.args,
    ).toEqual(["image_source", ["og", "favicon"]]);
  });

  it("leaves the profile alone when the edit is not a logo", async () => {
    mock.queue(null);

    await updateCharity("c1", { description: "A bird charity." });

    expect(mock.callsFor("charity_profiles")).toHaveLength(0);
  });

  it("drops it on create too — a wave may have prepared the profile", async () => {
    mock.queue(null); // the insert
    mock.queue(null); // the profile update

    const { error } = await createCharity({
      name: "RSPB",
      registered_number: "207076",
      logo_url: "https://rspb.org.uk/logo.png",
      market: "en-GB",
    });

    expect(error).toBeNull();
    expect(
      mock.callsFor("charity_profiles").some((c) => c.method === "update"),
    ).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getRegisterRemovals — the removal check's read
// ─────────────────────────────────────────────────────────────────────────────

describe("getRegisterRemovals", () => {
  it("returns the rows the function found", async () => {
    mock.queue([
      {
        charity_id: "charity-1",
        name: "Gone Trust",
        verdict: "removed",
        raised: 120,
      },
    ]);

    const { data, error } = await getRegisterRemovals();

    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(mock.callsFor("rpc:register_account_removals")).toHaveLength(1);
  });

  it("an empty result is no rows, not an error", async () => {
    mock.queue([]);

    const { data, error } = await getRegisterRemovals();

    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it("surfaces the function's error", async () => {
    mock.queue(null, {
      message: "canceling statement due to statement timeout",
    });

    const { data, error } = await getRegisterRemovals();

    expect(data).toBeNull();
    expect(error).toMatch(/statement timeout/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getConsentQueue — the verdict travels with the row
// ─────────────────────────────────────────────────────────────────────────────

describe("getConsentQueue", () => {
  // The queue reads the removals and the favpoll links together; the rpc
  // is called while the array is built, so its response is queued first.
  const queueResponses = (
    removals: unknown[],
    charities: unknown[],
    profiles: unknown[] = [],
    register: unknown[] = [],
  ) => {
    mock.queue(removals);
    mock.queue([{ charity_id: "charity-1" }]);
    mock.queue(charities);
    mock.queue(profiles); // charity_profiles — the suggestions
    mock.queue(register); // register_charities — contact and its own words
  };

  it("carries the register verdict onto the row it affects", async () => {
    queueResponses(
      [
        {
          charity_id: "charity-1",
          verdict: "removed",
          removed_on: "2023-02-16",
        },
      ],
      [{ id: "charity-1", name: "Gone Trust", registered_number: "1000002" }],
    );

    const { data, error } = await getConsentQueue();

    expect(error).toBeNull();
    expect(data![0].register_verdict).toBe("removed");
    expect(data![0].register_removed_on).toBe("2023-02-16");
  });

  it("shows the suggestion the PROFILE holds, with its title looked up", async () => {
    // rpc(removals), favpoll_charities, charities, charity_profiles,
    // register_charities, then the title lookups the suggested ids need.
    queueResponses(
      [],
      [{ id: "charity-1", name: "RSPB", registered_number: "207076" }],
      [
        {
          registered_number: "207076",
          perfect_topic_suggested_id: "t-bird",
          perfect_subset_suggested_id: null,
          perfect_topic_reason: "Birds are the whole point.",
          cause_family_suggested: "animals",
          signature_events: [{ name: "Big Garden Birdwatch" }],
          website_read_at: "2026-10-01T00:00:00Z",
        },
      ],
      [
        {
          registered_number: 207076,
          email: "enquiries@rspb.org.uk",
          website: "www.rspb.org.uk",
          activities: "We protect wild birds.",
        },
      ],
    );
    mock.queue([{ id: "t-bird", title: "Bird" }]);

    const { data, error } = await getConsentQueue();

    expect(error).toBeNull();
    expect(data![0]).toMatchObject({
      perfect_topic_suggested_id: "t-bird",
      perfect_topic_title: "Bird",
      perfect_topic_reason: "Birds are the whole point.",
      cause_family_suggested: "animals",
      // Step 4: the contact and the register's own words come from the
      // mirror, not from a copy on the account.
      registered_email: "enquiries@rspb.org.uk",
      registered_website: "www.rspb.org.uk",
      activities: "We protect wild birds.",
    });
    expect(data![0].signature_events).toHaveLength(1);
  });

  it("leaves the verdict null for a charity the register is happy with", async () => {
    queueResponses(
      [],
      [{ id: "charity-1", name: "Age UK", registered_number: "1128267" }],
    );

    const { data } = await getConsentQueue();

    expect(data![0].register_verdict).toBeNull();
    expect(data![0].favpoll_count).toBe(1);
  });
});

// The cause family (references/favpoll-pairing-table §2). Confirmed here,
// read by the generator only once confirmed.
import { setCauseFamily, setPerfectTopic } from "@/lib/actions/charities";

describe("setPerfectTopic", () => {
  it("writes the confirmed topic, and null when none fits", async () => {
    mock.queue(null);
    const { error } = await setPerfectTopic("charity-1", "topic-9");
    expect(error).toBeNull();
    const update = mock
      .callsFor("charities")
      .find((c) => c.method === "update");
    expect(update?.args[0]).toEqual({
      perfect_topic_id: "topic-9",
      perfect_subset_id: null,
    });
    mock.queue(null);
    expect((await setPerfectTopic("charity-1", null)).error).toBeNull();
  });

  it("writes the subset beside the topic, and never without one", async () => {
    mock.queue(null);
    await setPerfectTopic("charity-1", "topic-9", "subset-3");
    expect(
      mock.callsFor("charities").find((c) => c.method === "update")?.args[0],
    ).toEqual({ perfect_topic_id: "topic-9", perfect_subset_id: "subset-3" });
    mock = makeSupabaseMock();
    mock.queue(null);
    await setPerfectTopic("charity-1", null, "subset-3");
    expect(
      mock.callsFor("charities").find((c) => c.method === "update")?.args[0],
    ).toEqual({ perfect_topic_id: null, perfect_subset_id: null });
  });
});

describe("setCauseFamily", () => {
  it("writes a confirmed family", async () => {
    mock.queue(null); // update
    const { error } = await setCauseFamily("charity-1", "homelessness");
    expect(error).toBeNull();
    const update = mock
      .callsFor("charities")
      .find((c) => c.method === "update");
    expect(update?.args[0]).toEqual({ cause_family: "homelessness" });
  });

  it("clears to null — 'no cause of its own' is a real answer", async () => {
    mock.queue(null);
    const { error } = await setCauseFamily("charity-1", null);
    expect(error).toBeNull();
    const update = mock
      .callsFor("charities")
      .find((c) => c.method === "update");
    expect(update?.args[0]).toEqual({ cause_family: null });
  });

  it("rejects a value that is not a family", async () => {
    const { error } = await setCauseFamily(
      "charity-1",
      "puppies" as unknown as "animals",
    );
    expect(error).toBe("Unknown cause family: puppies");
    expect(mock.callsFor("charities")).toHaveLength(0);
  });
});

// The edit form is the confirm path for charities OUTSIDE the outreach queue
// (not pending, or not yet on a favpoll) — the queue only lists pending
// charities in use. Saving the form writes the family as confirmed.
describe("updateCharity — cause family", () => {
  it("writes a confirmed family from the form", async () => {
    mock.queue(null); // update
    const { error } = await updateCharity("charity-1", {
      cause_family: "end_of_life",
    });
    expect(error).toBeNull();
    const update = mock
      .callsFor("charities")
      .find((c) => c.method === "update");
    expect(update?.args[0]).toEqual({ cause_family: "end_of_life" });
  });

  it("treats the empty option as 'no cause of its own'", async () => {
    mock.queue(null);
    await updateCharity("charity-1", { cause_family: "" });
    const update = mock
      .callsFor("charities")
      .find((c) => c.method === "update");
    expect(update?.args[0]).toEqual({ cause_family: null });
  });

  it("rejects a value that is not a family", async () => {
    const { error } = await updateCharity("charity-1", {
      cause_family: "puppies",
    });
    expect(error).toBe("Unknown cause family: puppies");
    expect(mock.callsFor("charities")).toHaveLength(0);
  });
});

// THE PERFECT TOPIC QUEUE (founder, 2026-10-02): the consent queue showed
// a suggestion only while a charity was pending AND in use, so decided
// charities kept unconfirmed suggestions nobody could see.
describe("getPerfectTopicQueue", () => {
  // Step 2 of the profiles note: the SUGGESTION lives on the profile, so
  // "has a suggestion" is no longer a column on `charities` to filter by.
  // The account query asks only for the unconfirmed ones; the profiles
  // decide which of them have anything to show.
  it("asks for active, unconfirmed accounts and takes the suggestion from the profile", async () => {
    mock.queue([
      { id: "c1", name: "RSPB", registered_number: "207076" },
      { id: "c2", name: "Nothing Yet", registered_number: "1089464" },
    ]);
    mock.queue([
      {
        registered_number: "207076",
        perfect_topic_suggested_id: "t-bird",
        perfect_topic_reason: "Birds are the whole point.",
        signature_events: null,
      },
    ]);

    const r = await getPerfectTopicQueue();

    expect(r.error).toBeNull();
    // Only the charity whose profile holds a suggestion.
    expect(r.data).toHaveLength(1);
    expect(r.data![0]).toMatchObject({
      id: "c1",
      perfect_topic_suggested_id: "t-bird",
      perfect_topic_reason: "Birds are the whole point.",
    });

    const calls = mock.callsFor("charities");
    expect(calls.find((c) => c.method === "is")?.args).toEqual([
      "perfect_topic_id",
      null,
    ]);
    expect(calls.find((c) => c.method === "eq")?.args).toEqual([
      "is_active",
      true,
    ]);
    // The old filter is gone — it would ask for a column nothing writes.
    expect(calls.some((c) => c.method === "not")).toBe(false);
    // Never filtered by consent status or by favpoll use.
    expect(
      calls.some((c) => JSON.stringify(c.args).includes("consent_status")),
    ).toBe(false);
    // The suggestions were read from the profile, by its own key.
    expect(mock.callsFor("charity_profiles").length).toBeGreaterThan(0);
  });
});

describe("dismissPerfectTopicSuggestion", () => {
  it("clears both suggested ids on the PROFILE — 'no topic of its own' is a real answer", async () => {
    mock.queue({ registered_number: "207076" });
    mock.queue(null);

    const r = await dismissPerfectTopicSuggestion("c1");

    expect(r.error).toBeNull();
    const update = mock
      .callsFor("charity_profiles")
      .find((c) => c.method === "update")!;
    expect(update.args[0]).toMatchObject({
      perfect_topic_suggested_id: null,
      perfect_subset_suggested_id: null,
    });
    expect(
      mock.callsFor("charity_profiles").find((c) => c.method === "eq")?.args,
    ).toEqual(["registered_number", "207076"]);
  });

  it("never touches the account — the CONFIRMED topic lives there", async () => {
    mock.queue({ registered_number: "207076" });
    mock.queue(null);

    await dismissPerfectTopicSuggestion("c1");

    expect(mock.callsFor("charities").some((c) => c.method === "update")).toBe(
      false,
    );
  });

  it("says so when the number is not a shape the profile key accepts", async () => {
    mock.queue({ registered_number: "GB-CHC-99999999" });

    const r = await dismissPerfectTopicSuggestion("c1");

    expect(r.error).toMatch(/no profile/i);
    expect(mock.callsFor("charity_profiles")).toHaveLength(0);
  });
});
