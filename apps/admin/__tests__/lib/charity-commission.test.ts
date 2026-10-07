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

  // A short token is a WORD unless there is reason to think otherwise
  // (inverted 2026-10-07). Every example below is a real register name.
  it("treats an ordinary short word as a word, not an acronym", () => {
    expect(titleCaseCharityName("ST JOHN AMBULANCE")).toBe("St John Ambulance");
    expect(titleCaseCharityName("ST RICHARDS HOSPICE FOUNDATION")).toBe(
      "St Richards Hospice Foundation",
    );
    expect(titleCaseCharityName("THE POOR CLARES OF ARKLEY")).toBe(
      "The Poor Clares of Arkley",
    );
    expect(titleCaseCharityName("RIVER CHRISTIAN ASSOCIATION YATE")).toBe(
      "River Christian Association Yate",
    );
    expect(titleCaseCharityName("MEDECINS SANS FRONTIERES (UK)")).toBe(
      "Medecins Sans Frontieres (UK)",
    );
    // Welsh place-names have no a/e/i/o/u, so the vowel-less test would
    // otherwise shout them.
    expect(titleCaseCharityName("BRYN HAFOD COMMUNITY TRUST")).toBe(
      "Bryn Hafod Community Trust",
    );
    expect(titleCaseCharityName("CWM TAF HOSPICE")).toBe("Cwm Taf Hospice");
    expect(titleCaseCharityName("SIGNALS ESSEX MEDIA CENTRE LTD")).toBe(
      "Signals Essex Media Centre Ltd",
    );
  });

  it("keeps a listed acronym upper-case", () => {
    expect(titleCaseCharityName("AGE UK")).toBe("Age UK");
    expect(titleCaseCharityName("ACLE ACADEMY PTA")).toBe("Acle Academy PTA");
    expect(titleCaseCharityName("ABERCONWY PHAB CLUB")).toBe(
      "Aberconwy PHAB Club",
    );
    expect(titleCaseCharityName("YMCA SCARBOROUGH")).toBe("YMCA Scarborough");
  });

  it("keeps an ordinal suffix lower-case after a digit", () => {
    // Thousands of scout groups: "128Th" is as wrong as "128TH".
    expect(
      titleCaseCharityName("128TH OLDHAM SCOUT GROUP ST JOHN THE BAPTIST"),
    ).toBe("128th Oldham Scout Group St John the Baptist");
    expect(titleCaseCharityName("1ST MITCHAM SCOUT GROUP")).toBe(
      "1st Mitcham Scout Group",
    );
    expect(titleCaseCharityName("25TH ANNIVERSARY FUND")).toBe(
      "25th Anniversary Fund",
    );
    // Away from a digit the same tokens are words again.
    expect(titleCaseCharityName("ST LUKE'S CHESHIRE HOSPICE")).toBe(
      "St Luke's Cheshire Hospice",
    );
  });

  it("capitalises the first letter, not the first character", () => {
    // 390 register names open with a quote; the token is "'chestnuts".
    expect(titleCaseCharityName("'CHESTNUTS' PRE-SCHOOL")).toBe(
      "'Chestnuts' Pre-School",
    );
    expect(titleCaseCharityName("'THE BLUE HUT' YOUTH CLUB")).toBe(
      "'The Blue Hut' Youth Club",
    );
    // A lone letter after an apostrophe is a possessive, not an initial.
    expect(titleCaseCharityName("CENTRE FOR OVER 60'S")).toBe(
      "Centre for Over 60's",
    );
    // ...but a lone letter on its own is an initial.
    expect(titleCaseCharityName("A J CUNNINGHAM TRUST")).toBe(
      "A J Cunningham Trust",
    );
  });

  it("keeps connecting words lower-case inside a name", () => {
    expect(titleCaseCharityName("FRIENDS OF THE EARTH")).toBe(
      "Friends of the Earth",
    );
    expect(titleCaseCharityName("SAVE THE CHILDREN FUND")).toBe(
      "Save the Children Fund",
    );
    expect(titleCaseCharityName("HELP FOR HEROES")).toBe("Help for Heroes");
    // Four-letter connectors: before the rule these read as acronyms,
    // because every token of four letters or fewer did.
    expect(titleCaseCharityName("SHELTER FROM THE STORM")).toBe(
      "Shelter from the Storm",
    );
    expect(titleCaseCharityName("HOSPICE UPON THAMES")).toBe(
      "Hospice upon Thames",
    );
  });

  it("capitalises a connecting word at either end", () => {
    expect(titleCaseCharityName("THE ROYAL BRITISH LEGION")).toBe(
      "The Royal British Legion",
    );
    expect(titleCaseCharityName("A CHANCE TO SHINE")).toBe("A Chance to Shine");
    expect(titleCaseCharityName("SOMETHING TO SHOUT FOR")).toBe(
      "Something to Shout For",
    );
    // A name that is one connecting word is both ends at once.
    expect(titleCaseCharityName("THE")).toBe("The");
  });

  it("treats punctuation as the start of a fresh phrase", () => {
    expect(
      titleCaseCharityName("SHELTER: THE NATIONAL CAMPAIGN FOR HOMELESS"),
    ).toBe("Shelter: The National Campaign for Homeless");
    expect(titleCaseCharityName("SCOPE - FOR DISABLED PEOPLE")).toBe(
      "Scope - For Disabled People",
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

  it("caps results at 20", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () =>
        Array.from({ length: 30 }, (_, i) =>
          searchRow({ reg_charity_number: i + 1 }),
        ),
    });

    const results = await searchRegister("charity");

    expect(results).toHaveLength(20);
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

  it("total exceeds the 20-result cap when the register has more", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () =>
        Array.from({ length: 30 }, (_, i) =>
          searchRow({ reg_charity_number: i + 1 }),
        ),
    });

    const { results, total } = await searchRegisterRanked("charity");

    expect(results).toHaveLength(20);
    expect(total).toBe(30);
  });

  it("the cap widens on request (the place-aware fallback asks for 40)", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () =>
        Array.from({ length: 30 }, (_, i) =>
          searchRow({ reg_charity_number: i + 1 }),
        ),
    });

    const { results } = await searchRegisterRanked("charity", 40);

    expect(results).toHaveLength(30);
  });
});

describe("fetchRegisterContact", () => {
  it("returns the register's email, website, name and place", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        email: "enquiries@slhospice.co.uk",
        web: "www.slhospice.co.uk ",
        charity_name: "ST LUKE'S CHESHIRE HOSPICE",
        address_line_one: "Grosvenor House",
        address_line_two: "Queensway",
        address_line_three: "WINSFORD",
        address_line_four: "Cheshire",
        address_line_five: null,
      }),
    });

    const contact = await fetchRegisterContact("515595");

    expect(contact).toEqual({
      email: "enquiries@slhospice.co.uk",
      website: "www.slhospice.co.uk",
      registeredName: "ST LUKE'S CHESHIRE HOSPICE",
      place: "Winsford, Cheshire",
    });
    expect(mockFetch.mock.calls[0][0]).toContain("/allcharitydetails/515595/0");
  });

  it("returns nulls on 404, empty fields, or fetch failure", async () => {
    const empty = {
      email: null,
      website: null,
      registeredName: null,
      place: null,
    };

    mockFetch.mockResolvedValue({ ok: false, status: 404 });
    expect(await fetchRegisterContact("9999999")).toEqual(empty);

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ email: "", web: null }),
    });
    expect(await fetchRegisterContact("515595")).toEqual(empty);

    mockFetch.mockRejectedValue(new Error("network down"));
    expect(await fetchRegisterContact("515595")).toEqual(empty);
  });

  it("returns nulls without calling the API when key or digits are missing", async () => {
    const contact = await fetchRegisterContact("n/a");
    expect(contact.email).toBeNull();
    expect(contact.place).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

// ─── fetchRegisterPurpose ────────────────────────────────────────────────────
// What the charity is FOR. Two endpoints, both optional, never throws.
// Shapes verified against the live register on 2026-09-23.
import { fetchRegisterPurpose } from "@/lib/charity-commission";

function jsonResponse(body: unknown, status = 200) {
  return { ok: status < 400, status, json: async () => body };
}

describe("fetchRegisterPurpose", () => {
  it("normalises who_what_where and reads activities from the overview", async () => {
    mockFetch.mockImplementation(async (url: string) => {
      if (url.includes("/allcharitydetails/"))
        return jsonResponse({
          charity_name: "RESCUE KITTIES",
          who_what_where: [
            { classification_type: "What", classification_desc: "Animals" },
            {
              classification_type: "How",
              classification_desc: "Provides Services",
            },
          ],
        });
      if (url.includes("/charityoverview/"))
        return jsonResponse({
          activities:
            "  Rescue Kitties is a feral, stray and at-risk cat charity.  ",
          grant_making_main_activity: false,
        });
      if (url.includes("/charitygoverningdocument/"))
        return jsonResponse({
          charitable_objects: "TO RELIEVE THE SUFFERING OF\n  CATS  IN NEED",
        });
      if (url.includes("/charityareaofoperation/"))
        return jsonResponse([
          {
            area_of_operation: "Manchester",
            geographic_area_type: "Local Authority",
          },
          {
            area_of_operation: "Salford",
            geographic_area_type: "Local Authority",
          },
        ]);
      return jsonResponse({}, 404);
    });

    const purpose = await fetchRegisterPurpose("1196284");
    expect(purpose).toEqual({
      activities: "Rescue Kitties is a feral, stray and at-risk cat charity.",
      classification: {
        what: ["Animals"],
        who: [],
        how: ["Provides Services"],
      },
      objects: "TO RELIEVE THE SUFFERING OF CATS IN NEED",
      areas: [
        { area: "Manchester", type: "Local Authority" },
        { area: "Salford", type: "Local Authority" },
      ],
      grantMaking: false,
    });
  });

  it("returns nulls, not a throw, when the register is unavailable", async () => {
    mockFetch.mockRejectedValue(new Error("network"));
    expect(await fetchRegisterPurpose("1196284")).toEqual({
      activities: null,
      classification: null,
      objects: null,
      areas: null,
      grantMaking: null,
    });
  });

  it("returns null classification when who_what_where is empty", async () => {
    mockFetch.mockImplementation(async (url: string) =>
      url.includes("/allcharitydetails/")
        ? jsonResponse({ who_what_where: [] })
        : jsonResponse({ activities: null }),
    );
    expect(await fetchRegisterPurpose("515595")).toEqual({
      activities: null,
      classification: null,
      objects: null,
      areas: null,
      grantMaking: null,
    });
  });

  it("does nothing without a key or a number", async () => {
    vi.stubEnv("CHARITY_COMMISSION_API_KEY", "");
    expect(await fetchRegisterPurpose("1196284")).toEqual({
      activities: null,
      classification: null,
      objects: null,
      areas: null,
      grantMaking: null,
    });
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
