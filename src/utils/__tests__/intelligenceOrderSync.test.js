import { describe, it, expect, vi } from "vitest";

vi.mock("@/api/base44Client", () => ({
  base44: {
    entities: {
      Order: { filter: vi.fn(), create: vi.fn(), update: vi.fn() },
      CustomerNote: { get: vi.fn(), update: vi.fn() },
    },
  },
}));

const { buildOrderFromReport } = await import("../intelligenceOrderSync");

describe("buildOrderFromReport", () => {
  it("builds order payload from report data", () => {
    const reportData = {
      client_name: "Alice",
      cell_number: "0123456789",
      delivery_date: "2025-06-15",
      delivery_address: "123 Main St",
      order_list: "2x Burger, 1x Chips",
      order_total: "R500",
      payment_status: "PAID",
      next_action: "Deliver tomorrow",
      fulfilment_status: "Active",
    };
    const result = buildOrderFromReport(reportData, "report-42");

    expect(result.client_name).toBe("Alice");
    expect(result.cell_number).toBe("0123456789");
    expect(result.delivery_date).toBe("2025-06-15");
    expect(result.delivery_address).toBe("123 Main St");
    expect(result.order_list).toBe("2x Burger, 1x Chips");
    expect(result.order_total).toBe(500);
    expect(result.payment_status).toBe("PAID");
    expect(result.next_action).toBe("Deliver tomorrow");
    expect(result.fulfilment_status).toBe("Active");
    expect(result.intelligence_report_id).toBe("report-42");
  });

  it("handles missing fields with defaults", () => {
    const result = buildOrderFromReport({}, "report-1");
    expect(result.client_name).toBe("Not recorded.");
    expect(result.cell_number).toBe("");
    expect(result.delivery_date).toBe("");
    expect(result.order_total).toBe(0);
    expect(result.payment_status).toBe("PENDING");
    expect(result.fulfilment_status).toBe("Active");
  });

  it("skips delivery_date when it is 'Not recorded.'", () => {
    const result = buildOrderFromReport({ delivery_date: "Not recorded." }, "r1");
    expect(result.delivery_date).toBe("");
  });

  it("parses order_total from string with currency symbol", () => {
    const result = buildOrderFromReport({ order_total: "R1,250" }, "r1");
    expect(result.order_total).toBe(1250);
  });

  it("parses order_total from plain number", () => {
    const result = buildOrderFromReport({ order_total: 750 }, "r1");
    expect(result.order_total).toBe(750);
  });

  it("normalizes payment status via normalizePaymentStatus", () => {
    const result = buildOrderFromReport({ payment_status: "already paid", payment_method: "" }, "r1");
    expect(result.payment_status).toBe("PAID");
  });

  it("detects cash payment via method", () => {
    const result = buildOrderFromReport({ payment_status: "", payment_method: "Cash" }, "r1");
    expect(result.payment_status).toBe("CASH");
  });
});
