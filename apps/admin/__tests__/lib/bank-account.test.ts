import { describe, it, expect } from "vitest";
import {
  normaliseSortCode,
  normaliseAccountNumber,
  formatSortCode,
  maskAccountNumber,
  parseBankAccount,
} from "@/lib/bank-account";

describe("normaliseSortCode", () => {
  it("takes a sort code however it was typed", () => {
    for (const input of ["11-22-33", "11 22 33", "112233", " 11–22–33 "]) {
      expect(normaliseSortCode(input)).toBe("112233");
    }
  });

  it("refuses anything that is not six digits", () => {
    expect(normaliseSortCode("1122")).toBeNull();
    expect(normaliseSortCode("11223344")).toBeNull();
    expect(normaliseSortCode("")).toBeNull();
    // the shape a half-filled form leaves behind
    expect(normaliseSortCode("00-00-00")).toBeNull();
  });
});

describe("normaliseAccountNumber", () => {
  it("keeps an eight-digit number as it is", () => {
    expect(normaliseAccountNumber("12345678")).toBe("12345678");
    expect(normaliseAccountNumber("1234 5678")).toBe("12345678");
  });

  // THE ONE THAT MATTERS: not every UK account number has eight digits.
  // Several banks issue six or seven — the Co-operative Bank most commonly
  // — and the convention is to zero-pad on the left. An eight-digit-only
  // rule rejects a real charity's real account.
  it("pads a six or seven digit number to eight", () => {
    expect(normaliseAccountNumber("1234567")).toBe("01234567");
    expect(normaliseAccountNumber("123456")).toBe("00123456");
  });

  it("refuses anything outside six to eight digits", () => {
    expect(normaliseAccountNumber("12345")).toBeNull();
    expect(normaliseAccountNumber("123456789")).toBeNull();
    expect(normaliseAccountNumber("")).toBeNull();
    expect(normaliseAccountNumber("00000000")).toBeNull();
  });
});

describe("display helpers", () => {
  it("formats a sort code for reading back", () => {
    expect(formatSortCode("112233")).toBe("11-22-33");
  });

  it("masks all but the last four", () => {
    expect(maskAccountNumber("12345678")).toBe("••••5678");
    expect(maskAccountNumber("5678")).toBe("5678");
  });
});

describe("parseBankAccount", () => {
  it("returns the normalised account when everything is there", () => {
    const result = parseBankAccount({
      accountName: "  Charity Projects  ",
      sortCode: "11-22-33",
      accountNumber: "1234567",
    });
    expect(result.account).toEqual({
      accountName: "Charity Projects",
      sortCode: "112233",
      accountNumber: "01234567",
    });
    expect(result.problems).toEqual([]);
  });

  // Every problem at once, so a correction is one round trip not three.
  it("reports every problem together", () => {
    const result = parseBankAccount({
      accountName: "   ",
      sortCode: "112",
      accountNumber: "1",
    });
    expect(result.account).toBeNull();
    expect(result.problems).toEqual([
      "account_name_missing",
      "sort_code_invalid",
      "account_number_invalid",
    ]);
  });

  it("holds the account name separately from the charity's display name", () => {
    // Comic Relief banks as Charity Projects; Confirmation of Payee checks
    // the banking name, which is why this is its own field.
    const result = parseBankAccount({
      accountName: "Charity Projects",
      sortCode: "112233",
      accountNumber: "12345678",
    });
    expect(result.account?.accountName).toBe("Charity Projects");
  });
});
