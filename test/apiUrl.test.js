import assert from "node:assert/strict";
import test from "node:test";

import { normalizeApiBaseUrl } from "../src/config/apiUrl.js";

test("normalizes a configured API base URL", () => {
  assert.equal(
    normalizeApiBaseUrl(" https://api.example.com/// "),
    "https://api.example.com",
  );
});

test("rejects missing and relative API URLs", () => {
  assert.throws(() => normalizeApiBaseUrl(), /VITE_API_BASE_URL/);
  assert.throws(() => normalizeApiBaseUrl("/api"), /VITE_API_BASE_URL/);
});
