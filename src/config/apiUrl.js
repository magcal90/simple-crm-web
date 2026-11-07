export function normalizeApiBaseUrl(value) {
  const normalized = value?.trim().replace(/\/+$/, "");

  if (!normalized || !/^https?:\/\//i.test(normalized)) {
    throw new Error(
      "VITE_API_BASE_URL must be set to an absolute http(s) URL.",
    );
  }

  return normalized;
}
