export function joinPaths(base: string, path: string) {
  const normalizedBase = base.trim().replace(/\/+$/, "");
  const normalizedPath = path.trim().replace(/^\/+/, "");
  if (!normalizedBase) return normalizedPath ? `/${normalizedPath}` : "/";
  if (!normalizedPath) return normalizedBase;
  return `${normalizedBase}/${normalizedPath}`;
}
