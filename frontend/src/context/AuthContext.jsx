import React, { createContext, useEffect, useState, useCallback } from "react";
import {
  loginAccount,
  createAccount as apiCreateAccount,
} from "../services/api";

export const AuthContext = createContext(null);

const USERS_STORAGE = "4blue_users_v1";
const SESSION_STORAGE = "4blue_session_v1";

const DEFAULT_USERS = [
  { id: "A", name: "Usuário A", defaultName: "Usuário A", hasPassword: false },
  { id: "B", name: "Usuário B", defaultName: "Usuário B", hasPassword: false },
];

function readUsers() {
  try {
    const raw = localStorage.getItem(USERS_STORAGE);
    if (!raw) return DEFAULT_USERS.slice();
    const parsed = JSON.parse(raw);
    const merged = DEFAULT_USERS.map((d) => {
      const found = Array.isArray(parsed)
        ? parsed.find((p) => p.id === d.id)
        : null;
      return found ? { ...d, ...found } : d;
    });
    const extras = Array.isArray(parsed)
      ? parsed.filter((p) => !merged.find((m) => m.id === p.id))
      : [];
    return [...merged, ...extras];
  } catch (e) {
    console.error("AuthContext: failed to read users", e);
    return DEFAULT_USERS.slice();
  }
}

function writeUsers(arr) {
  try {
    localStorage.setItem(USERS_STORAGE, JSON.stringify(arr));
  } catch (e) {
    console.warn("AuthContext: failed to write users", e);
  }
}

function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function writeSession(obj) {
  try {
    if (!obj) localStorage.removeItem(SESSION_STORAGE);
    else localStorage.setItem(SESSION_STORAGE, JSON.stringify(obj));
  } catch (e) {
    console.warn("AuthContext: failed to write session", e);
  }
}

export function AuthProvider({ children }) {
  const [availableUsers, setAvailableUsers] = useState(() => readUsers());
  const [user, setUser] = useState(() => readSession());

  useEffect(() => {
    writeUsers(availableUsers);
  }, [availableUsers]);

  useEffect(() => {
    writeSession(user);
  }, [user]);

  useEffect(() => {
    let mounted = true;
    async function validateRemoteAccounts() {
      const extras = availableUsers.filter((u) => u.id !== "A" && u.id !== "B");
      if (!extras.length) return;
      const base = import.meta.env?.VITE_API_BASE || "http://localhost:8000";
      const toRemove = [];
      for (const u of extras) {
        try {
          const resp = await fetch(
            `${base}/api/accounts/${encodeURIComponent(u.id)}/`,
            { method: "GET", headers: { Accept: "application/json" } }
          );
          if (resp.status === 404) toRemove.push(u.id);
        } catch (e) {
          console.warn("validateRemoteAccounts network error for", u.id, e);
        }
      }
      if (toRemove.length && mounted) {
        setAvailableUsers((prev) =>
          prev.filter((x) => !toRemove.includes(x.id))
        );
        setUser((prev) => (prev && toRemove.includes(prev.id) ? null : prev));
        window.dispatchEvent(new CustomEvent("accounts:updated"));
      }
    }
    validateRemoteAccounts();
    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(
    async (userId, password) => {
      const base = import.meta.env.VITE_API_BASE || "http://localhost:8000";

      if (userId === "A" || userId === "B") {
        const u = availableUsers.find((x) => x.id === userId);
        if (!u) throw new Error("Conta não encontrada localmente");
        const session = { id: u.id, name: u.name };
        setUser(session);
        return session;
      }

      try {
        const resp = await fetch(`${base}/api/auth/login/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            Accept: "application/json",
          },
          body: JSON.stringify({
            identifier: userId,
            password: password || "",
          }),
        });
        const text = await resp.text();
        let data = null;
        try {
          data = text ? JSON.parse(text) : null;
        } catch (e) {
          data = text;
        }
        if (!resp.ok) {
          const err = new Error(data?.detail || `status ${resp.status}`);
          err.status = resp.status;
          err.body = data;
          throw err;
        }

        const identifier = data.identifier || data.id || userId;
        const name =
          data.name ||
          availableUsers.find((u) => u.id === userId)?.name ||
          "Usuário";

        setAvailableUsers((prev) => {
          const exists = prev.find((p) => p.id === identifier);
          if (exists) {
            return prev.map((p) => (p.id === identifier ? { ...p, name } : p));
          }

          const filtered = prev.filter((p) => p.id !== userId);
          return [
            ...filtered,
            {
              id: identifier,
              name,
              defaultName: name,
              hasPassword: !!password,
            },
          ];
        });

        const session = { id: identifier, name, identifier };
        setUser(session);
        return session;
      } catch (err) {
        console.error("AuthContext.login: server login failed", err);
        throw err;
      }
    },
    [availableUsers, setAvailableUsers]
  );

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const switchUser = useCallback(
    (userId) => {
      const u = availableUsers.find((x) => x.id === userId);
      if (!u) return;
      setUser({ id: u.id, name: u.name });
    },
    [availableUsers]
  );

  const updateUserName = useCallback((userId, newName) => {
    if (!userId) return false;
    setAvailableUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, name: newName } : u))
    );
    setUser((prev) =>
      prev && prev.id === userId ? { ...prev, name: newName } : prev
    );
    return true;
  }, []);

  const resetUserName = useCallback(
    (userId) => {
      if (!userId) return false;
      setAvailableUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, name: u.defaultName || `Usuário ${u.id}` }
            : u
        )
      );
      setUser((prev) =>
        prev && prev.id === userId
          ? {
              ...prev,
              name:
                availableUsers.find((u) => u.id === userId)?.defaultName ||
                `Usuário ${userId}`,
            }
          : prev
      );
      return true;
    },
    [availableUsers]
  );

  const createAccount = useCallback(
    async ({ name, password = "" }, { autoLogin = true } = {}) => {
      if (!name || !name.trim()) throw new Error("name required");
      const payload = { name: name.trim(), password: password || "" };
      const resp = await apiCreateAccount(payload);

      const id = resp.identifier || resp.id || null;
      const displayName = resp.name || name.trim();
      if (!id) throw new Error("server did not return identifier");
      setAvailableUsers((prev) => {
        if (prev.find((p) => p.id === id))
          return prev.map((p) =>
            p.id === id ? { ...p, name: displayName } : p
          );
        return [
          ...prev,
          {
            id,
            name: displayName,
            defaultName: displayName,
            hasPassword: !!password,
          },
        ];
      });
      if (autoLogin) {
        setUser({ id, name: displayName });
      }
      window.dispatchEvent(new CustomEvent("accounts:updated"));
      return { identifier: id, name: displayName };
    },
    []
  );

  const addAccount = useCallback((id, name) => {
    setAvailableUsers((prev) => {
      if (prev.find((p) => p.id === id)) return prev;
      return [...prev, { id, name, defaultName: name, hasPassword: false }];
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        availableUsers,
        user,
        login,
        logout,
        switchUser,
        updateUserName,
        resetUserName,
        addAccount,
        createAccount,
        setAvailableUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
