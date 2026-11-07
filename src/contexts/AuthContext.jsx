import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./AuthContextValue";
import { API_BASE_URL } from "../config/api";
const AUTH_STORAGE_KEY = "auth";

function decodeJwtPayload(token) {
  const payload = token.split(".")[1];

  if (!payload) {
    throw new Error("Invalid login token.");
  }

  const base64 = payload.replaceAll("-", "+").replaceAll("_", "/");
  const paddedBase64 = base64.padEnd(
    Math.ceil(base64.length / 4) * 4,
    "=",
  );

  return JSON.parse(atob(paddedBase64));
}

function readStoredAuth() {
  try {
    const storedAuth = JSON.parse(
      localStorage.getItem(AUTH_STORAGE_KEY) || "null",
    );

    if (!storedAuth?.token) {
      return null;
    }

    const claims = decodeJwtPayload(storedAuth.token);
    const expiresAt = Number(claims.exp) * 1000;

    if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }

    return {
      ...storedAuth,
      expiresAt,
    };
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}


export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readStoredAuth);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuth(null);
  }, []);

  const authenticatedFetch = useCallback(
    async (input, init = {}) => {
      const headers = new Headers(init.headers);

      if (auth?.token) {
        headers.set("Authorization", `Bearer ${auth.token}`);
      }

      const response = await fetch(input, { ...init, headers });

      if (response.status === 401) {
        logout();
      }

      return response;
    },
    [auth, logout],
  );

  const login = useCallback(async (email, password) => {
    let response;

    try {
      response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
    } catch {
      throw new Error("Unable to reach the login server.");
    }

    if (response.status === 401) {
      throw new Error("Invalid email or password.");
    }

    if (!response.ok) {
      throw new Error("Login failed. Please try again.");
    }

    const data = await response.json();

    if (!data.token) {
      throw new Error("The server did not return a login token.");
    }

    const claims = decodeJwtPayload(data.token);
    const expiresAt = Number(claims.exp) * 1000;

    if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
      throw new Error("The server returned an expired login token.");
    }

    const user = {
      email: claims.email ?? email,
      roles: Array.isArray(claims.roles) ? claims.roles : [],
    };
    const nextAuth = { token: data.token, user, expiresAt };

    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ token: nextAuth.token, user: nextAuth.user }),
    );
    setAuth(nextAuth);

    return user;
  }, []);

  const handleUnauthorized = logout;

  const hasRole = useCallback(
    (role) => auth?.user?.roles?.includes(role) ?? false,
    [auth?.user?.roles],
  );

  useEffect(() => {
    if (!auth) {
      return undefined;
    }

    const remainingTime = auth.expiresAt - Date.now();
    const timeoutId = window.setTimeout(() => {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setAuth(null);
    }, Math.max(remainingTime, 0));

    return () => window.clearTimeout(timeoutId);
  }, [auth]);

  const contextValue = useMemo(
    () => ({
      token: auth?.token ?? null,
      user: auth?.user ?? null,
      isAuthenticated: Boolean(auth),
      login,
      logout,
      authenticatedFetch,
      handleUnauthorized,
      hasRole,
    }),
    [auth, login, logout, authenticatedFetch, handleUnauthorized, hasRole],
  );



  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
