export function safeInternalRedirect(value: string | null | undefined, fallback = "/dashboard") {
  return value?.startsWith("/") && !value.startsWith("//") && !value.includes("\\") ? value : fallback;
}

