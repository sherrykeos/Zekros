import axios from "axios";

export interface StandardApiErrorResponse {
  success?: boolean;
  message?: string;
  error?:
    | string
    | {
        code?: string;
        message?: string;
        details?: unknown;
      };
}

function parseCleanMessage(raw: unknown): string | null {
  if (!raw) return null;

  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed) && parsed[0]?.message) {
          return parsed[0].message;
        }
        if (typeof parsed === "object" && parsed?.message) {
          return parsed.message;
        }
      } catch (_) {}
    }
    return raw;
  }

  if (Array.isArray(raw) && raw[0]?.message) {
    return raw[0].message;
  }

  if (typeof raw === "object" && (raw as any)?.message) {
    return (raw as any).message;
  }

  return null;
}

/**
 * Standardized API Error Message Extractor
 * Extracts user-friendly error messages from backend responses across REST and Axios calls.
 */
export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong.",
): string {
  if (!error) return fallback;

  if (axios.isAxiosError<StandardApiErrorResponse>(error)) {
    const data = error.response?.data;
    if (data) {
      // 1. Standard backend format: { error: { message: "..." } }
      if (typeof data.error === "object" && data.error?.message) {
        const clean = parseCleanMessage(data.error.message);
        if (clean) return clean;
      }
      // 2. String error format: { error: "..." }
      if (typeof data.error === "string") {
        const clean = parseCleanMessage(data.error);
        if (clean) return clean;
      }
      // 3. Top-level message format: { message: "..." }
      if (typeof data.message === "string") {
        const clean = parseCleanMessage(data.message);
        if (clean) return clean;
      }
    }
    // 4. Axios error message (avoid raw status code string if fallback available)
    if (error.message && !error.message.includes("status code")) {
      return error.message;
    }
  }

  if (error instanceof Error) {
    const clean = parseCleanMessage(error.message);
    if (clean) return clean;
  }

  if (typeof error === "string") {
    const clean = parseCleanMessage(error);
    if (clean) return clean;
  }

  return fallback;
}

/**
 * Standardized API Error Code Extractor
 */
export function getApiErrorCode(error: unknown): string | undefined {
  if (axios.isAxiosError<StandardApiErrorResponse>(error)) {
    const data = error.response?.data;
    if (typeof data?.error === "object" && data?.error?.code) {
      return data.error.code;
    }
  }
  return undefined;
}

/**
 * Standardized API Error Status Extractor
 */
export function getApiErrorStatus(error: unknown): number | undefined {
  return axios.isAxiosError(error) ? error.response?.status : undefined;
}
