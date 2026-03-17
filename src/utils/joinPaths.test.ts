import { describe, expect, it } from "vitest";
import { joinPaths } from "./joinPaths";

describe("joinPaths", () => {
  it("joins base and path with one slash", () => {
    expect(joinPaths("https://x.com", "a")).toBe("https://x.com/a");
    expect(joinPaths("https://x.com/", "/a")).toBe("https://x.com/a");
  });

  it("handles empty base", () => {
    expect(joinPaths("", "a")).toBe("/a");
    expect(joinPaths("", "")).toBe("/");
  });

  it("handles empty path", () => {
    expect(joinPaths("https://x.com", "")).toBe("https://x.com");
  });
});
