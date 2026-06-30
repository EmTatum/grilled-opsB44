import { describe, it, expect } from "vitest";
import {
  normalizeText,
  normalizeClientName,
  getDayKey,
  getNoteDuplicateKey,
  getDeduplicatedNotes,
  getGeneratedIntelligenceKey,
  getGeneratedDuplicateSets,
  getNotePreview,
  getReportDataFromTags,
  isIntelligenceReportNote,
  getIntelligenceReportViewModel,
  normalizePaymentStatus,
} from "../customerNotes";

describe("normalizeText", () => {
  it("trims and lowercases", () => {
    expect(normalizeText("  Hello  World  ")).toBe("hello world");
  });

  it("collapses multiple whitespace", () => {
    expect(normalizeText("a   b\t\nc")).toBe("a b c");
  });

  it("returns empty string for undefined", () => {
    expect(normalizeText()).toBe("");
  });
});

describe("normalizeClientName", () => {
  it("delegates to normalizeText", () => {
    expect(normalizeClientName("  John Doe  ")).toBe("john doe");
  });
});

describe("getDayKey", () => {
  it("returns YYYY-MM-DD from a date string", () => {
    expect(getDayKey("2025-03-15T10:30:00Z")).toBe("2025-03-15");
  });

  it("returns empty string for falsy input", () => {
    expect(getDayKey(null)).toBe("");
    expect(getDayKey("")).toBe("");
  });

  it("returns empty string for invalid date", () => {
    expect(getDayKey("not-a-date")).toBe("");
  });
});

describe("getNoteDuplicateKey", () => {
  it("creates content-based key when content exists", () => {
    const note = { id: "1", client_name: "Alice", content: "Hello", created_date: "2025-01-01" };
    expect(getNoteDuplicateKey(note)).toBe("alice::content::hello");
  });

  it("creates date-based key when no content but date exists", () => {
    const note = { id: "1", client_name: "Alice", content: "", created_date: "2025-01-01T00:00:00Z" };
    expect(getNoteDuplicateKey(note)).toBe("alice::date::2025-01-01");
  });

  it("creates id-based key as last resort", () => {
    const note = { id: "42", client_name: "Alice", content: "", created_date: "" };
    expect(getNoteDuplicateKey(note)).toBe("alice::id::42");
  });

  it("returns empty string when client_name is missing", () => {
    const note = { id: "1", client_name: "", content: "test" };
    expect(getNoteDuplicateKey(note)).toBe("");
  });
});

describe("getDeduplicatedNotes", () => {
  it("removes duplicates with same client and content", () => {
    const notes = [
      { id: "1", client_name: "Alice", content: "Hello", created_date: "2025-01-01" },
      { id: "2", client_name: "Alice", content: "Hello", created_date: "2025-01-01" },
      { id: "3", client_name: "Bob", content: "Hi", created_date: "2025-01-01" },
    ];
    const { deduped, duplicateSets } = getDeduplicatedNotes(notes);
    expect(deduped).toHaveLength(2);
    expect(deduped.map((n) => n.id)).toEqual(["1", "3"]);
    expect(duplicateSets).toHaveLength(1);
    expect(duplicateSets[0]).toHaveLength(2);
  });

  it("returns all notes when no duplicates", () => {
    const notes = [
      { id: "1", client_name: "Alice", content: "A", created_date: "2025-01-01" },
      { id: "2", client_name: "Bob", content: "B", created_date: "2025-01-02" },
    ];
    const { deduped, duplicateSets } = getDeduplicatedNotes(notes);
    expect(deduped).toHaveLength(2);
    expect(duplicateSets).toHaveLength(0);
  });

  it("handles empty input", () => {
    const { deduped, duplicateSets } = getDeduplicatedNotes([]);
    expect(deduped).toHaveLength(0);
    expect(duplicateSets).toHaveLength(0);
  });

  it("handles undefined input", () => {
    const { deduped, duplicateSets } = getDeduplicatedNotes();
    expect(deduped).toHaveLength(0);
    expect(duplicateSets).toHaveLength(0);
  });
});

describe("getGeneratedIntelligenceKey", () => {
  it("combines client name and sorted tags", () => {
    const note = { client_name: "Alice", tags: ["b-tag", "a-tag"] };
    expect(getGeneratedIntelligenceKey(note)).toBe("alice::a-tag|b-tag");
  });

  it("handles missing tags", () => {
    const note = { client_name: "Alice" };
    expect(getGeneratedIntelligenceKey(note)).toBe("alice::");
  });
});

describe("getGeneratedDuplicateSets", () => {
  it("groups notes by client+tags+date", () => {
    const notes = [
      { id: "1", client_name: "Alice", tags: ["x"], created_date: "2025-01-01T00:00:00Z" },
      { id: "2", client_name: "Alice", tags: ["x"], created_date: "2025-01-01T10:00:00Z" },
      { id: "3", client_name: "Bob", tags: ["x"], created_date: "2025-01-01T00:00:00Z" },
    ];
    const sets = getGeneratedDuplicateSets(notes);
    expect(sets).toHaveLength(1);
    expect(sets[0]).toHaveLength(2);
  });

  it("returns empty array when no duplicates", () => {
    const notes = [
      { id: "1", client_name: "Alice", tags: ["x"], created_date: "2025-01-01T00:00:00Z" },
      { id: "2", client_name: "Bob", tags: ["y"], created_date: "2025-01-02T00:00:00Z" },
    ];
    expect(getGeneratedDuplicateSets(notes)).toHaveLength(0);
  });
});

describe("getNotePreview", () => {
  it("returns truncated content", () => {
    expect(getNotePreview("Short note")).toBe("Short note");
  });

  it("returns default for empty content", () => {
    expect(getNotePreview("")).toBe("No preview available.");
    expect(getNotePreview("   ")).toBe("No preview available.");
  });

  it("collapses newlines", () => {
    expect(getNotePreview("line one\n\nline two")).toBe("line one line two");
  });

  it("handles intelligence report content", () => {
    const content = "CLIENT SALES INTELLIGENCE REPORT\nKey insight one\nKey insight two\nSection:";
    const preview = getNotePreview(content);
    expect(preview).toBe("Key insight one \u2022 Key insight two");
  });

  it("truncates long content to 220 chars", () => {
    const long = "a".repeat(300);
    expect(getNotePreview(long).length).toBe(220);
  });
});

describe("getReportDataFromTags", () => {
  it("parses report-data tag", () => {
    const tags = ["other-tag", 'report-data:{"client_name":"Alice"}'];
    expect(getReportDataFromTags(tags)).toEqual({ client_name: "Alice" });
  });

  it("returns null when no report-data tag", () => {
    expect(getReportDataFromTags(["foo", "bar"])).toBeNull();
  });

  it("returns null for invalid JSON", () => {
    expect(getReportDataFromTags(["report-data:invalid"])).toBeNull();
  });

  it("handles undefined/null tags", () => {
    expect(getReportDataFromTags()).toBeNull();
    expect(getReportDataFromTags(null)).toBeNull();
  });
});

describe("isIntelligenceReportNote", () => {
  it("returns true when note has delivery_date", () => {
    expect(isIntelligenceReportNote({ delivery_date: "2025-01-01" })).toBe(true);
  });

  it("returns true when note has cell_number", () => {
    expect(isIntelligenceReportNote({ cell_number: "0123456789" })).toBe(true);
  });

  it("returns true when note has report-data tag", () => {
    expect(isIntelligenceReportNote({ tags: ['report-data:{"x":1}'] })).toBe(true);
  });

  it("returns false for empty note", () => {
    expect(isIntelligenceReportNote({ tags: [] })).toBe(false);
  });

  it("returns false for empty object with no tags", () => {
    expect(isIntelligenceReportNote({})).toBe(false);
  });
});

describe("getIntelligenceReportViewModel", () => {
  it("builds view model from note fields", () => {
    const note = {
      id: "1",
      created_date: "2025-01-01",
      client_name: "Alice",
      cell_number: "0123456789",
      delivery_date: "2025-01-15",
      delivery_address: "123 Main St",
      order_list: "2x Burgers",
      order_total: 500,
      payment_status: "PAID",
      next_action: "Deliver",
      fulfilment_status: "Active",
      tags: [],
    };
    const vm = getIntelligenceReportViewModel(note);
    expect(vm.client_name).toBe("Alice");
    expect(vm.cell_number).toBe("0123456789");
    expect(vm.order_total).toBe("R500");
    expect(vm.payment_status).toBe("PAID");
    expect(vm.fulfilment_status).toBe("Active");
  });

  it("falls back to report-data tag values", () => {
    const note = {
      id: "2",
      created_date: "2025-01-01",
      tags: ['report-data:{"client_name":"Bob","cell_number":"999","payment_method":"Cash","sentiment_analysis":"Good","red_flags":"None","green_flags":"Loyal"}'],
    };
    const vm = getIntelligenceReportViewModel(note);
    expect(vm.client_name).toBe("Bob");
    expect(vm.cell_number).toBe("999");
    expect(vm.payment_method).toBe("Cash");
    expect(vm.sentiment_analysis).toBe("Good");
  });

  it("shows 'Not recorded.' for missing fields", () => {
    const note = { id: "3", tags: [] };
    const vm = getIntelligenceReportViewModel(note);
    expect(vm.client_name).toBe("Not recorded.");
    expect(vm.delivery_date).toBe("Not recorded.");
    expect(vm.order_total).toBe("Not confirmed.");
  });
});

describe("normalizePaymentStatus", () => {
  it("returns PAID for paid status", () => {
    expect(normalizePaymentStatus("Paid", "")).toBe("PAID");
    expect(normalizePaymentStatus("PAID", "")).toBe("PAID");
    expect(normalizePaymentStatus("already paid", "")).toBe("PAID");
  });

  it("returns CASH for cash payment method", () => {
    expect(normalizePaymentStatus("", "Cash")).toBe("CASH");
    expect(normalizePaymentStatus("", "cash on delivery")).toBe("CASH");
  });

  it("returns PENDING for unknown status", () => {
    expect(normalizePaymentStatus("", "")).toBe("PENDING");
    expect(normalizePaymentStatus("unknown", "EFT")).toBe("PENDING");
  });

  it("handles undefined inputs", () => {
    expect(normalizePaymentStatus()).toBe("PENDING");
  });
});
