export function photoUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  const base = process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:4000";
  return `${base}${url}`;
}
