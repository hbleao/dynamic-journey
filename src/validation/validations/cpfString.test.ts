import { describe, expect, it } from "vitest";
import { cpfString } from "./cpfString";

describe("cpfString", () => {
  it("accepts formatted CPF when required", () => {
    const schema = cpfString(true);
    const result = schema.safeParse("123.456.789-00");
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data).toBe("12345678900");
  });

  it("rejects invalid length when required", () => {
    const schema = cpfString(true);
    const result = schema.safeParse("123");
    expect(result.success).toBe(false);
  });

  it("accepts empty string when not required", () => {
    const schema = cpfString(false);
    const result = schema.safeParse("");
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data).toBeUndefined();
  });

  it("rejects invalid length when not required and value is present", () => {
    const schema = cpfString(false);
    const result = schema.safeParse("123.456");
    expect(result.success).toBe(false);
  });
});
