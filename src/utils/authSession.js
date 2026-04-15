const AUTH_SESSION_VERSION = 1;

function decodeBase64Url(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));

  try {
    return atob(normalized + padding);
  } catch {
    return "";
  }
}

export function parseJwt(token) {
  if (!token || typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    const payload = decodeBase64Url(parts[1]);
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

export function getTokenExpiry(token) {
  const payload = parseJwt(token);
  const exp = Number(payload?.exp || 0);
  return Number.isFinite(exp) && exp > 0 ? exp * 1000 : null;
}

export function isTokenExpired(token) {
  const expiry = getTokenExpiry(token);
  return expiry ? expiry <= Date.now() : true;
}

export function createStoredSession(session) {
  return {
    version: AUTH_SESSION_VERSION,
    expiresAt: getTokenExpiry(session?.token),
    session
  };
}

export function readStoredSession(raw, fallbackSession) {
  if (!raw) return fallbackSession;

  try {
    const parsed = JSON.parse(raw);
    const session = parsed?.session || parsed;
    if (!session?.token) return fallbackSession;
    if (isTokenExpired(session.token)) return fallbackSession;
    return session;
  } catch {
    return fallbackSession;
  }
}

export function getAuthErrorMessage(error, fallbackMessage = "Request failed.") {
  const message = String(error?.message || fallbackMessage).trim();
  if (!message) return fallbackMessage;
  if (message.toLowerCase().includes("jwt")) return "Your session has expired. Please login again.";
  return message;
}
