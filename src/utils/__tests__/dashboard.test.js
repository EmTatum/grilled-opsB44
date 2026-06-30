import { describe, it, expect } from "vitest";
import {
  toDayKey,
  getRollingDays,
  getOrdersByDay,
  getClientById,
  getNotesByClientId,
  getStatusLabel,
  getStatusTone,
} from "../dashboard";

describe("toDayKey", () => {
  it("formats a date as YYYY-MM-DD", () => {
    const result = toDayKey(new Date(2025, 2, 15));
    expect(result).toBe("2025-03-15");
  });

  it("pads single-digit month and day", () => {
    const result = toDayKey(new Date(2025, 0, 5));
    expect(result).toBe("2025-01-05");
  });

  it("works with date strings", () => {
    const result = toDayKey("2025-06-01T12:00:00Z");
    expect(result).toMatch(/^2025-06-0[12]$/);
  });
});

describe("getRollingDays", () => {
  it("returns 14 days starting from baseDate", () => {
    const base = new Date(2025, 0, 1);
    const days = getRollingDays(base);
    expect(days).toHaveLength(14);
    expect(days[0].getDate()).toBe(1);
    expect(days[13].getDate()).toBe(14);
  });

  it("defaults to today when no argument given", () => {
    const days = getRollingDays();
    expect(days).toHaveLength(14);
    const today = new Date();
    expect(days[0].getDate()).toBe(today.getDate());
  });
});

describe("getOrdersByDay", () => {
  it("filters orders matching the given day key", () => {
    const orders = [
      { id: 1, scheduledFor: new Date(2025, 0, 15) },
      { id: 2, scheduledFor: new Date(2025, 0, 16) },
      { id: 3, scheduledFor: new Date(2025, 0, 15) },
    ];
    const result = getOrdersByDay(orders, "2025-01-15");
    expect(result).toHaveLength(2);
    expect(result.map((o) => o.id)).toEqual([1, 3]);
  });

  it("returns empty array for no matches", () => {
    expect(getOrdersByDay([{ scheduledFor: new Date(2025, 0, 1) }], "2025-12-31")).toEqual([]);
  });

  it("handles null orders", () => {
    expect(getOrdersByDay(null, "2025-01-01")).toEqual([]);
  });
});

describe("getClientById", () => {
  const clients = [
    { id: "c1", name: "Alice" },
    { id: "c2", name: "Bob" },
  ];

  it("returns matching client", () => {
    expect(getClientById(clients, "c2")).toEqual({ id: "c2", name: "Bob" });
  });

  it("returns null for no match", () => {
    expect(getClientById(clients, "c99")).toBeNull();
  });

  it("returns null for falsy clientId", () => {
    expect(getClientById(clients, null)).toBeNull();
    expect(getClientById(clients, "")).toBeNull();
  });

  it("handles null clients array", () => {
    expect(getClientById(null, "c1")).toBeNull();
  });
});

describe("getNotesByClientId", () => {
  const notes = [
    { id: "n1", clientId: "c1" },
    { id: "n2", clientId: "c2" },
    { id: "n3", clientId: "c1" },
  ];

  it("returns notes for matching clientId", () => {
    const result = getNotesByClientId(notes, "c1");
    expect(result).toHaveLength(2);
    expect(result.map((n) => n.id)).toEqual(["n1", "n3"]);
  });

  it("returns empty array for no match", () => {
    expect(getNotesByClientId(notes, "c99")).toEqual([]);
  });

  it("returns empty array for falsy clientId", () => {
    expect(getNotesByClientId(notes, null)).toEqual([]);
  });
});

describe("getStatusLabel", () => {
  it("returns capitalized label for known statuses", () => {
    expect(getStatusLabel("pending")).toBe("Pending");
    expect(getStatusLabel("processing")).toBe("Processing");
    expect(getStatusLabel("scheduled")).toBe("Scheduled");
    expect(getStatusLabel("completed")).toBe("Completed");
    expect(getStatusLabel("overdue")).toBe("Overdue");
    expect(getStatusLabel("cancelled")).toBe("Cancelled");
  });

  it("returns raw value for unknown status", () => {
    expect(getStatusLabel("custom")).toBe("custom");
  });
});

describe("getStatusTone", () => {
  it("returns alert for overdue and cancelled", () => {
    expect(getStatusTone("overdue")).toBe("alert");
    expect(getStatusTone("cancelled")).toBe("alert");
  });

  it("returns warning for pending", () => {
    expect(getStatusTone("pending")).toBe("warning");
  });

  it("returns info for processing and scheduled", () => {
    expect(getStatusTone("processing")).toBe("info");
    expect(getStatusTone("scheduled")).toBe("info");
  });

  it("returns success for other statuses", () => {
    expect(getStatusTone("completed")).toBe("success");
    expect(getStatusTone("unknown")).toBe("success");
  });
});
