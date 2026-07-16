import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, setApiAuthToken } from "@/services/client";

export type AuthUser = {
  id: string;
  name: string;
  email: string | null;
  avatar?: string;
};

export type AuthStatus = "guest" | "authenticated" | "anonymous";

type AuthState = {
  status: AuthStatus;
  user: AuthUser | null;
  continueAsGuest: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
};

type StoredAuth = {
  status: AuthStatus;
  user: AuthUser | null;
  token: string | null;
};

const Ctx = createContext<AuthState | null>(null);
const KEY = "zekros.auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("anonymous");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(KEY) : null;
      if (!raw) return;

      const parsed = JSON.parse(raw) as StoredAuth;
      setStatus(parsed.status);
      setUser(parsed.user);
      setToken(parsed.token);
      setApiAuthToken(parsed.token);
    } catch {
      setApiAuthToken(null);
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify({ status, user, token }));
    } catch {
      // Auth persistence is a convenience; failed storage should not break the app shell.
    }
  }, [status, user, token]);

  const continueAsGuest = () => {
    setApiAuthToken(null);
    setToken(null);
    setStatus("guest");
    setUser({ id: "guest", name: "Guest Player", email: null });
  };

  const signIn = async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    const { token: authToken, user: authUser } = response.data.data;

    setApiAuthToken(authToken);
    setToken(authToken);
    setStatus("authenticated");
    setUser({
      id: authUser.id,
      name: authUser.username,
      email: authUser.email,
    });
  };

  const signOut = () => {
    setApiAuthToken(null);
    setToken(null);
    setStatus("anonymous");
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ status, user, continueAsGuest, signIn, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}

export function isGuest(s: AuthStatus) {
  return s === "guest";
}
