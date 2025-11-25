const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";
console.log("DEBUG: front API_BASE =", API_BASE);

async function safeFetch(path, opts = {}) {
  const url = `${API_BASE}${path}`;
  const options = {
    method: opts.method || "GET",
    headers: Object.assign({ Accept: "application/json" }, opts.headers || {}),
    body: opts.body,
  };

  try {
    const res = await fetch(url, options);
    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      data = text;
    }
    if (!res.ok) {
      const err = new Error(`HTTP ${res.status} ${res.statusText}`);
      err.status = res.status;
      err.body = data;
      throw err;
    }
    return data;
  } catch (err) {
    throw err;
  }
}

export function getAuthHeaders() {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    null;
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export async function getCurrentAccount() {
  const stored = localStorage.getItem("accountIdentifier");
  if (stored) {
    try {
      const data = await safeFetch(
        `/api/accounts/${encodeURIComponent(stored)}/`,
        { method: "GET", headers: getAuthHeaders() }
      );
      return data;
    } catch (e) {
      console.warn(
        "getCurrentAccount: GET /api/accounts/{identifier}/ failed",
        e
      );
    }
  }

  try {
    const data = await safeFetch("/api/accounts/me/", {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return data;
  } catch (e) {
    console.warn("getCurrentAccount: GET /api/accounts/me/ failed", e);
  }

  throw new Error(
    "Não foi possível obter os dados da conta (getCurrentAccount)."
  );
}

export async function getMessagesByUser(userId, { page = 1, page_size } = {}) {
  const qp = new URLSearchParams();
  if (userId) qp.set("user", userId);
  if (page) qp.set("page", page);
  if (page_size) qp.set("page_size", page_size);
  const res = await safeFetch(`/api/messages/?${qp.toString()}`, {
    method: "GET",
  });
  if (res && typeof res === "object" && Array.isArray(res.results))
    return res.results;
  if (Array.isArray(res)) return res;
  return [];
}

export async function postMessage({ user, text, userName }) {
  const body = JSON.stringify({ user, text, user_name: userName });
  return await safeFetch("/api/messages/", {
    method: "POST",
    headers: Object.assign(
      { "Content-Type": "application/json; charset=utf-8" },
      getAuthHeaders()
    ),
    body,
  });
}

export async function markMessagesViewed(userId) {
  if (!userId) throw new Error("userId required");
  return await safeFetch(
    `/api/messages/mark_viewed/?user=${encodeURIComponent(userId)}`,
    {
      method: "POST",
      headers: getAuthHeaders(),
    }
  );
}

export async function deleteHistory(userId) {
  if (!userId) throw new Error("userId required");
  return await safeFetch("/api/messages/delete_history/", {
    method: "POST",
    headers: Object.assign(
      { "Content-Type": "application/json; charset=utf-8" },
      getAuthHeaders()
    ),
    body: JSON.stringify({ user: userId }),
  });
}

export async function createAccount({ name, password = "" }) {
  return await safeFetch("/api/accounts/", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ name, password }),
  });
}

export async function updateAccount(identifier, { name, password } = {}) {
  return await safeFetch(`/api/accounts/${encodeURIComponent(identifier)}/`, {
    method: "PUT",
    headers: Object.assign(
      { "Content-Type": "application/json; charset=utf-8" },
      getAuthHeaders()
    ),
    body: JSON.stringify({ name, password }),
  });
}

export async function deleteAccount(identifier) {
  return await safeFetch(`/api/accounts/${encodeURIComponent(identifier)}/`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
}

export async function loginAccount(identifier, password) {
  return await safeFetch("/api/auth/login/", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ identifier, password }),
  });
}

export default {
  getMessagesByUser,
  postMessage,
  markMessagesViewed,
  deleteHistory,
  createAccount,
  updateAccount,
  deleteAccount,
  loginAccount,
  getAuthHeaders,
  getCurrentAccount,
};
