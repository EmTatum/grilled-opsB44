import { describe, it, expect } from "vitest";
import {
  splitManifestItems,
  extractQuantity,
  matchProductFromItem,
  buildDispatchDiscrepancies,
} from "../dispatchReconciliation";

describe("splitManifestItems", () => {
  it("splits on newlines", () => {
    expect(splitManifestItems("item a\nitem b")).toEqual(["item a", "item b"]);
  });

  it("splits on commas", () => {
    expect(splitManifestItems("item a, item b")).toEqual(["item a", "item b"]);
  });

  it("splits on bullet characters", () => {
    expect(splitManifestItems("item a • item b")).toEqual(["item a", "item b"]);
  });

  it("splits on pipe characters", () => {
    expect(splitManifestItems("item a | item b")).toEqual(["item a", "item b"]);
  });

  it("removes leading dashes/bullets", () => {
    expect(splitManifestItems("- item a\n• item b\n* item c")).toEqual(["item a", "item b", "item c"]);
  });

  it("deduplicates case-insensitively", () => {
    expect(splitManifestItems("Apple\napple\nAPPLE")).toEqual(["Apple"]);
  });

  it("handles empty input", () => {
    expect(splitManifestItems("")).toEqual([]);
    expect(splitManifestItems(null)).toEqual([]);
  });

  it("collapses extra whitespace", () => {
    expect(splitManifestItems("  item   a  \n  item   b  ")).toEqual(["item a", "item b"]);
  });
});

describe("extractQuantity", () => {
  it("extracts leading quantity (e.g. '3x Burger')", () => {
    expect(extractQuantity("3x Burger")).toBe(3);
    expect(extractQuantity("3 x Burger")).toBe(3);
    expect(extractQuantity("3× Burger")).toBe(3);
  });

  it("extracts leading number without x", () => {
    expect(extractQuantity("5 Burgers")).toBe(5);
  });

  it("extracts trailing x quantity", () => {
    expect(extractQuantity("Burger x2")).toBe(2);
  });

  it("extracts unit-based quantities", () => {
    expect(extractQuantity("10 packs of chips")).toBe(10);
    expect(extractQuantity("5 bags rice")).toBe(5);
    expect(extractQuantity("2 bottles water")).toBe(2);
  });

  it("defaults to 1 when no quantity found", () => {
    expect(extractQuantity("Burger")).toBe(1);
    expect(extractQuantity("")).toBe(1);
    expect(extractQuantity(null)).toBe(1);
  });

  it("handles decimal quantities", () => {
    expect(extractQuantity("1.5x Burger")).toBe(1.5);
  });
});

describe("matchProductFromItem", () => {
  const products = [
    { id: "p1", product_name: "Burger" },
    { id: "p2", product_name: "Chips" },
    { id: "p3", product_name: "Steak" },
  ];

  it("matches product by name substring", () => {
    const match = matchProductFromItem("3x Burger patty", products);
    expect(match).toEqual(products[0]);
  });

  it("matches case-insensitively", () => {
    const match = matchProductFromItem("CHIPS", products);
    expect(match).toEqual(products[1]);
  });

  it("returns null when no match", () => {
    expect(matchProductFromItem("Salad", products)).toBeNull();
  });

  it("strips quantity prefix before matching", () => {
    const match = matchProductFromItem("5x Steak", products);
    expect(match).toEqual(products[2]);
  });

  it("strips unit words before matching", () => {
    const match = matchProductFromItem("3 packs Burger", products);
    expect(match).toEqual(products[0]);
  });
});

describe("buildDispatchDiscrepancies", () => {
  const products = [
    { id: "p1", product_name: "Burger", current_stock: 10 },
    { id: "p2", product_name: "Chips", current_stock: 2 },
  ];

  it("returns empty array when stock is sufficient", () => {
    const orders = [{ id: "o1", client_name: "Alice", order_list: "3x Burger" }];
    const result = buildDispatchDiscrepancies(orders, products);
    expect(result).toEqual([]);
  });

  it("flags insufficient stock", () => {
    const orders = [{ id: "o1", client_name: "Alice", order_list: "5x Chips" }];
    const result = buildDispatchDiscrepancies(orders, products);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("insufficient_stock");
    expect(result[0].severity).toBe("critical");
    expect(result[0].required_quantity).toBe(5);
    expect(result[0].current_stock).toBe(2);
  });

  it("flags unmatched items", () => {
    const orders = [{ id: "o1", client_name: "Alice", order_list: "Salad" }];
    const result = buildDispatchDiscrepancies(orders, products);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("unmatched");
    expect(result[0].severity).toBe("warning");
  });

  it("handles multiple orders with mixed issues", () => {
    const orders = [
      { id: "o1", client_name: "Alice", order_list: "5x Chips, Salad" },
      { id: "o2", client_name: "Bob", order_list: "2x Burger" },
    ];
    const result = buildDispatchDiscrepancies(orders, products);
    expect(result).toHaveLength(2);
    expect(result.some((d) => d.type === "insufficient_stock")).toBe(true);
    expect(result.some((d) => d.type === "unmatched")).toBe(true);
  });

  it("uses order_details as fallback when order_list is empty", () => {
    const orders = [{ id: "o1", client_name: "Alice", order_details: "Salad" }];
    const result = buildDispatchDiscrepancies(orders, products);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("unmatched");
  });
});
