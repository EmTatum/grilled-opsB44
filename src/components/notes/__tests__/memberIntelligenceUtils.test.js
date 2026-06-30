import { describe, it, expect } from "vitest";
import {
  normalizeClientName,
  cleanClientName,
  isValidClientName,
  isVisibleOrderRecord,
  consolidateOrderList,
  formatCurrency,
  formatDeliveryDate,
  normalizeDeliveryDate,
} from "../memberIntelligenceUtils";

describe("normalizeClientName", () => {
  it("trims and lowercases", () => {
    expect(normalizeClientName("  John Doe  ")).toBe("john doe");
  });

  it("handles null/undefined", () => {
    expect(normalizeClientName(null)).toBe("");
    expect(normalizeClientName(undefined)).toBe("");
  });
});

describe("cleanClientName", () => {
  it("removes parenthetical content", () => {
    expect(cleanClientName("Jon (hate Kate Bro)")).toBe("Jon");
  });

  it("removes text after dash", () => {
    expect(cleanClientName("Alice - VIP")).toBe("Alice");
  });

  it("removes text after pipe", () => {
    expect(cleanClientName("Bob | Manager")).toBe("Bob");
  });

  it("removes text after slash", () => {
    expect(cleanClientName("Charlie/CEO")).toBe("Charlie");
  });

  it("returns 'Unknown Client' for empty/null input", () => {
    expect(cleanClientName("")).toBe("Unknown Client");
    expect(cleanClientName(null)).toBe("Unknown Client");
  });
});

describe("isValidClientName", () => {
  it("returns true for valid names", () => {
    expect(isValidClientName("Alice")).toBe(true);
    expect(isValidClientName("Bob (note)")).toBe(true);
  });

  it("returns false for unknown-type names", () => {
    expect(isValidClientName("Unknown")).toBe(false);
    expect(isValidClientName("Unknown Client")).toBe(false);
    expect(isValidClientName("Unnamed Client")).toBe(false);
  });

  it("returns false for null/empty", () => {
    expect(isValidClientName("")).toBe(false);
    expect(isValidClientName(null)).toBe(false);
  });
});

describe("isVisibleOrderRecord", () => {
  it("returns true for valid active order", () => {
    expect(isVisibleOrderRecord({ client_name: "Alice", fulfilment_status: "Active" })).toBe(true);
  });

  it("returns false for cancelled orders", () => {
    expect(isVisibleOrderRecord({ client_name: "Alice", fulfilment_status: "Cancelled" })).toBe(false);
  });

  it("returns false for unknown client names", () => {
    expect(isVisibleOrderRecord({ client_name: "Unknown", fulfilment_status: "Active" })).toBe(false);
  });

  it("returns false for null/undefined", () => {
    expect(isVisibleOrderRecord(null)).toBe(false);
    expect(isVisibleOrderRecord(undefined)).toBe(false);
  });
});

describe("consolidateOrderList", () => {
  it("consolidates duplicate items with count", () => {
    expect(consolidateOrderList("Burger, Burger, Chips")).toBe("2x Burger, Chips");
  });

  it("filters out delivery-related items", () => {
    expect(consolidateOrderList("Burger, Delivery Fee, Chips")).toBe("Burger, Chips");
    expect(consolidateOrderList("Steak, delivery, tip")).toBe("Steak");
  });

  it("handles empty input", () => {
    expect(consolidateOrderList("")).toBe("");
    expect(consolidateOrderList(null)).toBe("");
  });

  it("preserves original casing for display", () => {
    const result = consolidateOrderList("Burger, burger");
    expect(result).toBe("2x Burger");
  });
});

describe("formatCurrency", () => {
  it("formats with R prefix", () => {
    const result = formatCurrency(1000);
    expect(result).toMatch(/^R/);
    expect(result).toContain("1");
  });

  it("handles zero", () => {
    expect(formatCurrency(0)).toBe("R0");
  });

  it("handles null/undefined", () => {
    expect(formatCurrency(null)).toBe("R0");
    expect(formatCurrency(undefined)).toBe("R0");
  });
});

describe("formatDeliveryDate", () => {
  it("formats date with time when T present", () => {
    const result = formatDeliveryDate("2025-06-15T14:30:00");
    expect(result).toContain("15");
    expect(result).toContain("June");
    expect(result).toContain("2025");
    expect(result).toContain("at 14:30");
  });

  it("formats date without time", () => {
    const result = formatDeliveryDate("2025-06-15");
    expect(result).toContain("15");
    expect(result).toContain("June");
    expect(result).toContain("Time TBC");
  });

  it("returns 'Date TBC' for empty/falsy input", () => {
    expect(formatDeliveryDate("")).toBe("Date TBC");
    expect(formatDeliveryDate(null)).toBe("Date TBC");
  });

  it("returns 'Date TBC' for invalid date", () => {
    expect(formatDeliveryDate("invalid")).toBe("Date TBC");
  });
});

describe("normalizeDeliveryDate", () => {
  it("returns value as-is when it contains T", () => {
    expect(normalizeDeliveryDate("2025-06-15T10:00")).toBe("2025-06-15T10:00");
  });

  it("extracts YYYY-MM-DD from string", () => {
    expect(normalizeDeliveryDate("2025-06-15")).toBe("2025-06-15");
  });

  it("returns empty string for empty input", () => {
    expect(normalizeDeliveryDate("")).toBe("");
    expect(normalizeDeliveryDate(null)).toBe("");
  });

  it("returns raw value when no date pattern found", () => {
    expect(normalizeDeliveryDate("tomorrow")).toBe("tomorrow");
  });
});
