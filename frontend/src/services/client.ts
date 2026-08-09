import axios from "axios";

export type DevRestLog = {
  id: string;
  method: string;
  url: string;
  status: number | "ERR";
  durationMs: number;
  ok: boolean;
  request?: unknown;
  response?: unknown;
  error?: unknown;
  at: string;
};

const ACCESS_TOKEN_KEY = "zekros_access_token";
const REFRESH_TOKEN_KEY = "zekros_refresh_token";

let accessToken: string | null = null;
let refreshToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (typeof window !== "undefined") {
    if (token) {
      try {
        localStorage.setItem(ACCESS_TOKEN_KEY, token);
      } catch {
        // Ignore quota/storage errors
      }
    } else {
      try {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
      } catch {
        // Ignore quota/storage errors
      }
    }
  }
}

export function setRefreshToken(token: string | null) {
  refreshToken = token;
  if (typeof window !== "undefined") {
    if (token) {
      try {
        localStorage.setItem(REFRESH_TOKEN_KEY, token);
      } catch {
        // Ignore quota/storage errors
      }
    } else {
      try {
        localStorage.removeItem(REFRESH_TOKEN_KEY);
      } catch {
        // Ignore quota/storage errors
      }
    }
  }
}

export function setTokens(access: string | null, refresh?: string | null) {
  setAccessToken(access);
  if (refresh !== undefined) {
    setRefreshToken(refresh);
  }
}

export function getAccessToken(): string | null {
  if (accessToken) return accessToken;
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (stored) {
        accessToken = stored;
        return stored;
      }
    } catch {
      // Ignore quota/storage errors
    }
  }
  return null;
}

export function getRefreshToken(): string | null {
  if (refreshToken) return refreshToken;
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (stored) {
        refreshToken = stored;
        return stored;
      }
    } catch {
      // Ignore quota/storage errors
    }
  }
  return null;
}

const requestStart = new WeakMap<object, number>();

function now() {
  return typeof performance === "undefined" ? Date.now() : performance.now();
}

function emitRestLog(entry: DevRestLog) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent("zekros:rest-log", {
      detail: entry,
    }),
  );
}

function requestLabel(config: { baseURL?: string; url?: string }) {
  const base = config.baseURL?.replace(/\/$/, "") ?? "";
  const path = config.url ?? "";

  return path.startsWith("http") ? path : `${base}${path}`;
}

export const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== "undefined") {
    const protocol = window.location.protocol === "https:" ? "https:" : "http:";
    return `${protocol}//${window.location.hostname}:5000/api`;
  }
  return "http://localhost:5000/api";
};

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  requestStart.set(config, now());

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  } else if (config.headers.Authorization) {
    delete config.headers.Authorization;
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    const startedAt = requestStart.get(response.config) ?? now();
    const durationMs = Math.round(now() - startedAt);

    emitRestLog({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      method: response.config.method?.toUpperCase() ?? "GET",
      url: requestLabel(response.config),
      status: response.status,
      durationMs,
      ok: true,
      request: response.config.data,
      response: response.data,
      at: new Date().toISOString(),
    });

    return response;
  },
  (error) => {
    const config = error.config ?? {};
    const startedAt = requestStart.get(config) ?? now();
    const durationMs = Math.round(now() - startedAt);

    emitRestLog({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      method: config.method?.toUpperCase() ?? "GET",
      url: requestLabel(config),
      status: error.response?.status ?? "ERR",
      durationMs,
      ok: false,
      request: config.data,
      response: error.response?.data,
      error: error.message,
      at: new Date().toISOString(),
    });

    return Promise.reject(error);
  },
);
