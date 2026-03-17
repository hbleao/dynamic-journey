export function clsx(...args: unknown[]) {
  const parts: string[] = [];

  for (const arg of args) {
    if (!arg) continue;
    if (typeof arg === "string") {
      parts.push(arg);
      continue;
    }
    if (typeof arg === "object") {
      for (const [key, value] of Object.entries(arg)) {
        if (value) parts.push(key);
      }
    }
  }

  return parts.join(" ");
}
