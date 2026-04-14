const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function apiFetch(path, options = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  const response = await fetch(url, { ...options, headers });
  const data = await safeJson(response);
  if (!response.ok) {
    const message = data?.message || data?.error || response.statusText || "Request failed";
    throw new Error(message);
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
