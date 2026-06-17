const viteEnv = typeof import.meta !== "undefined" ? import.meta.env || {} : {};
const processEnv = typeof process !== "undefined" ? process.env || {} : {};
export const API_BASE_URL = (
  processEnv.NEXT_PUBLIC_API_BASE_URL
  || viteEnv.VITE_API_BASE_URL
  || "https://sathihomecare-backend.onrender.com/api"
)
  .replace(/\/+$/, "");
const API_TIMEOUT_MS = Number(processEnv.NEXT_PUBLIC_API_TIMEOUT_MS || viteEnv.VITE_API_TIMEOUT_MS || 60000);
const RETRYABLE_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504]);

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function apiFetch(path, options = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
  const retries = Number.isFinite(options.retries) ? options.retries : 1;
  const timeoutMs = Number.isFinite(options.timeoutMs) ? options.timeoutMs : API_TIMEOUT_MS;
  const shouldSendJson = options.body && !(options.body instanceof FormData);
  const headers = {
    ...(options.headers || {})
  };
  Object.keys(headers).forEach((key) => headers[key] === undefined && delete headers[key]);
  if (shouldSendJson && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  let response;
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      response = await fetch(url, { ...options, headers, signal: options.signal || controller.signal });
      clearTimeout(timeoutId);
      if (!RETRYABLE_STATUSES.has(response.status) || attempt === retries) break;
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error;
      if (attempt === retries) {
        const message = error?.name === "AbortError"
          ? "The server took too long to respond. Please try again."
          : "Unable to reach the server right now. Please try again in a moment.";
        throw new Error(message);
      }
    }
  }

  if (!response) throw lastError || new Error("Unable to reach the server right now.");
  const data = await safeJson(response);
  if (!response.ok) {
    const message = data?.message || data?.error || response.statusText || "Request failed";
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export async function authFetch(token, path, options = {}) {
  const headers = {
    Authorization: token ? `Bearer ${token}` : undefined,
    ...(options.headers || {})
  };

  return apiFetch(path, { ...options, headers });
}
