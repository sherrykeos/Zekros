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

const requestStart = new WeakMap<object, number>();

function now() {
  return typeof performance === "undefined" ? Date.now() : performance.now();
}

function emitRestLog(entry: DevRestLog) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("zekros:rest-log", { detail: entry }));
}

function requestLabel(config: { baseURL?: string; url?: string }) {
  const base = config.baseURL?.replace(/\/$/, "") ?? "";
  const path = config.url ?? "";
  return path.startsWith("http") ? path : `${base}${path}`;
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 10000,
});

export function setApiAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete api.defaults.headers.common.Authorization;
}

api.interceptors.request.use((config) => {
  requestStart.set(config, now());

  console.log(
    `%c ${config.method?.toUpperCase()} ${config.url}`,
    "color:#4CAF50;font-weight:bold;",
  );
  console.log(config.data);

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

    console.log(
      `%c Response ${response.status}`,
      "color:#2196F3;font-weight:bold;",
    );
    console.log(response.data);

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

    console.error(error.response?.data || error.message);

    return Promise.reject(error);
  },
);
