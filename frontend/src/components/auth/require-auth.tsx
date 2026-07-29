import { Link, Navigate, useLocation } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

import { useCurrentUser } from "@/hooks/useCurrentUser";

export function RequireAuth({ children }: { children: ReactNode }) {
  const currentUser = useCurrentUser();
  const location = useLocation();

  if (currentUser.isPending) {
    return (
      <div className="grid min-h-[320px] place-items-center text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }

  if (!currentUser.data) {
    return (
      <Navigate
        to="/auth/sign-in"
        search={{ redirect: location.href }}
        replace
      />
    );
  }

  return <>{children}</>;
}

export function AccountOnlyEmptyState() {
  return (
    <div className="mx-auto grid min-h-[320px] max-w-md place-items-center text-center">
      <div>
        <h1 className="font-display text-xl font-semibold tracking-tight">
          Sign in required
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This area uses your ZEKROS account data.
        </p>
        <Link
          to="/auth/sign-in"
          search={{}}
          className="mt-5 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
