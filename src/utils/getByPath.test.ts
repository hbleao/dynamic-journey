import { describe, expect, it } from "vitest";
import { getByPath } from "./getByPath";

describe("getByPath", () => {
  it("returns the same value when path is empty", () => {
    expect(getByPath({ a: 1 }, "")).toEqual({ a: 1 });
  });

  it("returns nested values using dot path", () => {
    const obj = { a: { b: { c: 42 } } };
    expect(getByPath(obj, "a.b.c")).toBe(42);
  });

  it("returns undefined when path is missing", () => {
    const obj = { a: { b: { c: 42 } } };
    expect(getByPath(obj, "a.x.c")).toBeUndefined();
  });

  it("returns undefined when traversing non-object", () => {
    const obj = { a: 10 };
    expect(getByPath(obj, "a.b")).toBeUndefined();
  });
});
