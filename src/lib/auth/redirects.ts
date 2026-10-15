export function safeInternalRedirect(value: string | null | undefined, fallback = "/dashboard") {
  if (!value?.startsWith("/") || value.startsWith("//") || value.includes("\\") || /[\u0000-\u0020\u007f]/.test(value)) return fallback;
  try {
    const target = new URL(value, "https://internal.invalid");
    return target.origin === "https://internal.invalid" ? value : fallback;
  } catch { return fallback; }
}
