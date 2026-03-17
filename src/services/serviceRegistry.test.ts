import { describe, expect, it } from "vitest";
import { callService } from "./serviceRegistry";

describe("serviceRegistry", () => {
  it("returns error for unknown service", async () => {
    const result = await callService("missing", {});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("missing");
    }
  });

  it("calls eligibility service", async () => {
    const result = await callService("eligibility", { a: 1 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ eligible: true, input: { a: 1 } });
    }
  });
});
