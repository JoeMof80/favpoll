// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { verifyCharityNumber } from "@/lib/charity-commission";

const mockFetch = vi.fn();

function registerResponse(overrides: Record<string, unknown> = {}) {
  return {
    ok: true,
    status: 200,
    json: async () => ({
      charity_name: "AGE UK",
      reg_status: "R",
      date_of_removal: null,
      ...overrides,
    }),
  };
}

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch);
  vi.stubEnv("CHARITY_COMMISSION_API_KEY", "test-key");
  mockFetch.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("verifyCharityNumber", () => {
  it("returns verified when registered and names match (case-insensitive)", async () => {
    mockFetch.mockResolvedValue(registerResponse());

    const result = await verifyCharityNumber("1128267", "Age UK");

    expect(result).toEqual({ status: "verified", registeredName: "AGE UK" });
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.charitycommission.gov.uk/register/api/allcharitydetails/1128267/0",
      expect.objectContaining({
        headers: { "Ocp-Apim-Subscription-Key": "test-key" },
      }),
    );
  });

  it("strips non-digits from the registered number", async () => {
    mockFetch.mockResolvedValue(registerResponse());

    await verifyCharityNumber(" 1128267-0 ", "Age UK");

    expect(mockFetch.mock.calls[0][0]).toContain(
      "/allcharitydetails/11282670/0",
    );
  });

  it("returns name_mismatch with the register name when names differ", async () => {
    mockFetch.mockResolvedValue(
      registerResponse({ charity_name: "MACMILLAN CANCER SUPPORT" }),
    );

    const result = await verifyCharityNumber("261017", "Macmillan");

    expect(result).toEqual({
      status: "name_mismatch",
      registeredName: "MACMILLAN CANCER SUPPORT",
    });
  });

  it("ignores punctuation differences when comparing names", async () => {
    mockFetch.mockResolvedValue(registerResponse({ charity_name: "R.N.L.I." }));

    const result = await verifyCharityNumber("209603", "RNLI");

    expect(result.status).toBe("verified");
  });

  it("returns removed when reg_status is not R", async () => {
    mockFetch.mockResolvedValue(
      registerResponse({
        reg_status: "RM",
        date_of_removal: "2020-01-01T00:00:00",
      }),
    );

    const result = await verifyCharityNumber("1128267", "Age UK");

    expect(result.status).toBe("removed");
    expect(result.registeredName).toBe("AGE UK");
  });

  it("returns removed when date_of_removal is set even if status is R", async () => {
    mockFetch.mockResolvedValue(
      registerResponse({ date_of_removal: "2020-01-01T00:00:00" }),
    );

    const result = await verifyCharityNumber("1128267", "Age UK");

    expect(result.status).toBe("removed");
  });

  it("returns not_found on 404", async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 404 });

    const result = await verifyCharityNumber("9999999", "Nobody");

    expect(result).toEqual({ status: "not_found", registeredName: null });
  });

  it("returns not_found when the number contains no digits", async () => {
    const result = await verifyCharityNumber("n/a", "Nobody");

    expect(result).toEqual({ status: "not_found", registeredName: null });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("returns error on non-404 HTTP failure", async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 });

    const result = await verifyCharityNumber("1128267", "Age UK");

    expect(result).toEqual({ status: "error", registeredName: null });
  });

  it("returns error when fetch throws", async () => {
    mockFetch.mockRejectedValue(new Error("network down"));

    const result = await verifyCharityNumber("1128267", "Age UK");

    expect(result).toEqual({ status: "error", registeredName: null });
  });

  it("returns error when the API key is missing", async () => {
    vi.stubEnv("CHARITY_COMMISSION_API_KEY", "");

    const result = await verifyCharityNumber("1128267", "Age UK");

    expect(result).toEqual({ status: "error", registeredName: null });
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

// ─── searchRegister + titleCaseCharityName ────────────────────────────────────

import {
  searchRegister,
  searchRegisterRanked,
  registerQueryVariants,
  titleCaseCharityName,
  fetchRegisterContact,
} from "@/lib/charity-commission";

describe("titleCaseCharityName", () => {
  it("title-cases ordinary words", () => {
    expect(titleCaseCharityName("HOSPICE UK")).toBe("Hospice UK");
    expect(
      titleCaseCharityName("THE ROYAL NATIONAL LIFEBOAT INSTITUTION"),
    ).toBe("The Royal National Lifeboat Institution");
  });

  it("keeps vowel-less acronyms upper-case", () => {
    expect(titleCaseCharityName("RNLI")).toBe("RNLI");
    expect(titleCaseCharityName("NSPCC")).toBe("NSPCC");
    expect(titleCaseCharityName("WWF - UK")).toBe("WWF - UK");
  });

  it("does not treat short common words as acronyms", () => {
    expect(titleCaseCharityName("ST RICHARDS HOSPICE FOUNDATION")).toBe(
      "St Richards Hospice Foundation",
    );
    expect(titleCaseCharityName("FRIENDS OF THE EARTH")).toBe(
      "Friends Of The Earth",
    );
  });
});

describe("searchRegister", () => {
  function searchRow(overrides: Record<string, unknown> = {}) {
    return {
      reg_charity_number: 1128267,
      charity_name: "AGE UK",
      reg_status: "R",
      group_subsid_suffix: 0,
      ...overrides,
    };
  }

  it("returns mapped results for registered main charities", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [searchRow()],
    });

    const results = await searchRegister("age uk");

    expect(results).toEqual([
      {
        registeredNumber: "1128267",
        registeredName: "AGE UK",
        displayName: "Age UK",
      },
    ]);
    expect(mockFetch.mock.calls[0][0]).toContain("/searchCharityName/age%20uk");
  });

  it("filters out removed charities and group members", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [
        searchRow(),
        searchRow({ reg_charity_number: 2, reg_status: "RM" }),
        searchRow({ reg_charity_number: 3, group_subsid_suffix: 1 }),
      ],
    });

    const results = await searchRegister("age");

    expect(results).toHaveLength(1);
  });

  it("caps results at 8", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () =>
        Array.from({ length: 20 }, (_, i) =>
          searchRow({ reg_charity_number: i + 1 }),
        ),
    });

    const results = await searchRegister("charity");

    expect(results).toHaveLength(8);
  });

  it("returns [] on 404 (the API's no-matches response)", async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 404 });

    expect(await searchRegister("zzqxzzqx")).toEqual([]);
  });

  it("returns [] for short queries without calling the API", async () => {
    expect(await searchRegister("ab")).toEqual([]);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("returns [] on upstream failure", async () => {
    mockFetch.mockRejectedValue(new Error("network down"));

    expect(await searchRegister("age uk")).toEqual([]);
  });

  it("returns [] when the API key is missing", async () => {
    vi.stubEnv("CHARITY_COMMISSION_API_KEY", "");

    expect(await searchRegister("age uk")).toEqual([]);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

// ─── apostrophe variants + relevance ranking (2026-09-07) ─────────────────────

describe("registerQueryVariants", () => {
  it("searches both apostrophe spellings", () => {
    expect(registerQueryVariants("st lukes")).toEqual([
      "st lukes",
      "st luke's",
    ]);
    expect(registerQueryVariants("st luke's")).toEqual([
      "st luke's",
      "st lukes",
    ]);
  });

  it("collapses when no apostrophe is in play", () => {
    expect(registerQueryVariants("age uk")).toEqual(["age uk"]);
  });

  it("drops variants below the 3-char search floor", () => {
    expect(registerQueryVariants("ab")).toEqual([]);
  });
});

describe("searchRegisterRanked", () => {
  function searchRow(overrides: Record<string, unknown> = {}) {
    return {
      reg_charity_number: 1128267,
      charity_name: "AGE UK",
      reg_status: "R",
      group_subsid_suffix: 0,
      ...overrides,
    };
  }

  it("ranks starts-with above word-boundary above substring", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [
        searchRow({
          reg_charity_number: 1,
          charity_name: "12TH CROSBY (ST LUKES) SCOUT GROUP",
        }),
        searchRow({ reg_charity_number: 2, charity_name: "ST LUKES HOSPICE" }),
        searchRow({
          reg_charity_number: 3,
          charity_name: "BEST LUKES FELLOWSHIP",
        }),
      ],
    });

    const { results } = await searchRegisterRanked("st lukes");

    expect(results.map((r) => r.registeredName)).toEqual([
      "ST LUKES HOSPICE",
      "12TH CROSBY (ST LUKES) SCOUT GROUP",
      "BEST LUKES FELLOWSHIP",
    ]);
  });

  it("merges both spellings and reports the pre-cap total", async () => {
    mockFetch.mockImplementation((url: string) =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: async () =>
          String(url).includes("luke's")
            ? [
                searchRow({
                  reg_charity_number: 10,
                  charity_name: "ST LUKE'S CHESHIRE HOSPICE",
                }),
              ]
            : [
                searchRow({
                  reg_charity_number: 11,
                  charity_name: "ST LUKES SCOUT GROUP",
                }),
              ],
      }),
    );

    const { results, total } = await searchRegisterRanked("st lukes");

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(total).toBe(2);
    expect(results.map((r) => r.registeredNumber).sort()).toEqual(["10", "11"]);
  });

  it("the apostrophe-stripped ranking finds the hospice from 'st lukes'", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [
        searchRow({
          reg_charity_number: 20,
          charity_name: "1ST LOSCOE ST LUKES SCOUT GROUP",
        }),
        searchRow({
          reg_charity_number: 21,
          charity_name: "ST LUKE'S CHESHIRE HOSPICE",
        }),
      ],
    });

    const { results } = await searchRegisterRanked("st lukes");

    expect(results[0].registeredName).toBe("ST LUKE'S CHESHIRE HOSPICE");
  });

  it("total exceeds the 8-result cap when the register has more", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () =>
        Array.from({ length: 20 }, (_, i) =>
          searchRow({ reg_charity_number: i + 1 }),
        ),
    });

    const { results, total } = await searchRegisterRanked("charity");

    expect(results).toHaveLength(8);
    expect(total).toBe(20);
  });
});

describe("fetchRegisterContact", () => {
  it("returns the register's email and website", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        email: "enquiries@slhospice.co.uk",
        web: "www.slhospice.co.uk ",
      }),
    });

    const contact = await fetchRegisterContact("515595");

    expect(contact).toEqual({
      email: "enquiries@slhospice.co.uk",
      website: "www.slhospice.co.uk",
    });
    expect(mockFetch.mock.calls[0][0]).toContain("/allcharitydetails/515595/0");
  });

  it("returns nulls on 404, empty fields, or fetch failure", async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 404 });
    expect(await fetchRegisterContact("9999999")).toEqual({
      email: null,
      website: null,
    });

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ email: "", web: null }),
    });
    expect(await fetchRegisterContact("515595")).toEqual({
      email: null,
      website: null,
    });

    mockFetch.mockRejectedValue(new Error("network down"));
    expect(await fetchRegisterContact("515595")).toEqual({
      email: null,
      website: null,
    });
  });

  it("returns nulls without calling the API when key or digits are missing", async () => {
    expect(await fetchRegisterContact("n/a")).toEqual({
      email: null,
      website: null,
    });
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
