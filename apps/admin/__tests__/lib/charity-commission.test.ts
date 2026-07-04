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
