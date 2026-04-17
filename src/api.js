const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "https://sathihomecare-backend.onrender.com/api")
  .replace(/\/+$/, "");

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function apiFetch(path, options = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
  const shouldSendJson = options.body && !(options.body instanceof FormData);
  const headers = {
    ...(options.headers || {})
  };
  if (shouldSendJson && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  let response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch {
    throw new Error("Unable to reach the server right now. Please try again in a moment.");
  }
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
