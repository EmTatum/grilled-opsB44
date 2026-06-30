import { describe, it, expect } from "vitest";
import {
  ORDER_STATUSES,
  statusToLegacyStatus,
  getPlannerStatus,
  getPriorityTone,
} from "../orderPlannerConfig";

describe("ORDER_STATUSES", () => {
  it("contains all expected statuses", () => {
    expect(ORDER_STATUSES).toEqual(["Pending", "Processing", "Dispatched", "Complete"]);
  });
});

describe("statusToLegacyStatus", () => {
  it("maps Pending to Pending", () => {
    expect(statusToLegacyStatus.Pending).toBe("Pending");
  });

  it("maps Processing to Confirmed", () => {
    expect(statusToLegacyStatus.Processing).toBe("Confirmed");
  });

  it("maps Dispatched to Fulfilled", () => {
    expect(statusToLegacyStatus.Dispatched).toBe("Fulfilled");
  });

  it("maps Complete to Fulfilled", () => {
    expect(statusToLegacyStatus.Complete).toBe("Fulfilled");
  });
});

describe("getPlannerStatus", () => {
  it("maps Pending -> Pending", () => {
    expect(getPlannerStatus({ status: "Pending" })).toBe("Pending");
  });

  it("maps Confirmed -> Processing", () => {
    expect(getPlannerStatus({ status: "Confirmed" })).toBe("Processing");
  });

  it("maps Fulfilled -> Dispatched", () => {
    expect(getPlannerStatus({ status: "Fulfilled" })).toBe("Dispatched");
  });

  it("maps Complete -> Complete", () => {
    expect(getPlannerStatus({ status: "Complete" })).toBe("Complete");
  });

  it("defaults to Pending for unknown status", () => {
    expect(getPlannerStatus({ status: "Unknown" })).toBe("Pending");
    expect(getPlannerStatus({})).toBe("Pending");
  });
});

describe("getPriorityTone", () => {
  it("returns high-priority tone", () => {
    const tone = getPriorityTone("High");
    expect(tone.color).toBe("#C2185B");
    expect(tone.border).toContain("194,24,91");
  });

  it("returns medium-priority tone", () => {
    const tone = getPriorityTone("Medium");
    expect(tone.color).toBe("#C9A84C");
    expect(tone.border).toContain("201,168,76");
  });

  it("returns default tone for low/unknown priority", () => {
    const tone = getPriorityTone("Low");
    expect(tone.color).toBe("rgba(245,240,232,0.7)");

    const toneDefault = getPriorityTone(undefined);
    expect(toneDefault.color).toBe("rgba(245,240,232,0.7)");
  });
});
