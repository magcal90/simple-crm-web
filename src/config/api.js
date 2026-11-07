import { normalizeApiBaseUrl } from "./apiUrl";

export const API_BASE_URL = normalizeApiBaseUrl(
  import.meta.env.VITE_API_BASE_URL,
);
