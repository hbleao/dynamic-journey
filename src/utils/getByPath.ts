export function getByPath(value: unknown, path: string): unknown {
  if (!path) return value;
  if (value == null) return undefined;

  const parts = path.split(".").filter(Boolean);
  let cur: unknown = value;

  for (const part of parts) {
    if (cur == null) return undefined;
    if (typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }

  return cur;
}
