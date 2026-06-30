import { describe, it, expect } from "vitest";
import {
  getDatePart,
  formatDeliveryDateLabel,
  formatCurrency,
  sortByDeliveryDateAscNullsLast,
} from "../memberOrderUtils";

describe("getDatePart", () => {
  it("extracts the date part before T", () => {
    expect(getDatePart("2025-06-15T10:30:00")).toBe("2025-06-15");
  });

  it("returns the value when no T present", () => {
    expect(getDatePart("2025-06-15")).toBe("2025-06-15");
  });

  it("returns empty string for falsy input", () => {
    expect(getDatePart("")).toBe("");
    expect(getDatePart(null)).toBe("");
    expect(getDatePart(undefined)).toBe("");
  });
});

describe("formatDeliveryDateLabel", () => {
  it("formats date with time when T present", () => {
    const result = formatDeliveryDateLabel("2025-06-15T14:30:00");
    expect(result).toContain("15");
    expect(result).toContain("June");
    expect(result).toContain("2025");
    expect(result).toContain("at 14:30");
  });

  it("formats date without time", () => {
    const result = formatDeliveryDateLabel("2025-06-15");
    expect(result).toContain("15");
    expect(result).toContain("June");
    expect(result).toContain("Time TBC");
  });

  it("returns 'Date TBC' for empty/falsy input", () => {
    expect(formatDeliveryDateLabel("")).toBe("Date TBC");
    expect(formatDeliveryDateLabel(null)).toBe("Date TBC");
  });

  it("returns 'Date TBC' for invalid date", () => {
    expect(formatDeliveryDateLabel("not-a-date")).toBe("Date TBC");
  });
});

describe("formatCurrency", () => {
  it("formats positive amounts with R prefix", () => {
    const result = formatCurrency(500);
    expect(result).toMatch(/^R/);
    expect(result).toContain("500");
  });

  it("returns TBC for zero", () => {
    expect(formatCurrency(0)).toBe("TBC");
  });

  it("returns TBC for negative values", () => {
    expect(formatCurrency(-100)).toBe("TBC");
  });

  it("handles null/undefined", () => {
    expect(formatCurrency(null)).toBe("TBC");
    expect(formatCurrency(undefined)).toBe("TBC");
  });
});

describe("sortByDeliveryDateAscNullsLast", () => {
  it("sorts by delivery_date ascending", () => {
    const records = [
      { delivery_date: "2025-03-01" },
      { delivery_date: "2025-01-01" },
      { delivery_date: "2025-02-01" },
    ];
    const sorted = sortByDeliveryDateAscNullsLast(records);
    expect(sorted.map((r) => r.delivery_date)).toEqual([
      "2025-01-01",
      "2025-02-01",
      "2025-03-01",
    ]);
  });

  it("puts null/empty dates last", () => {
    const records = [
      { delivery_date: "" },
      { delivery_date: "2025-01-01" },
      { delivery_date: null },
    ];
    const sorted = sortByDeliveryDateAscNullsLast(records);
    expect(sorted[0].delivery_date).toBe("2025-01-01");
  });

  it("does not mutate original array", () => {
    const records = [{ delivery_date: "2025-02-01" }, { delivery_date: "2025-01-01" }];
    const sorted = sortByDeliveryDateAscNullsLast(records);
    expect(sorted).not.toBe(records);
  });

  it("handles null/undefined input", () => {
    expect(sortByDeliveryDateAscNullsLast(null)).toEqual([]);
    expect(sortByDeliveryDateAscNullsLast(undefined)).toEqual([]);
  });
});
