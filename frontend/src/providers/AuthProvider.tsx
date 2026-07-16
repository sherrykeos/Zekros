import { useCurrentUser } from "@/hooks/useCurrentUser";


export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useCurrentUser();

  return <>{children}</>;
}





















// import { useEffect } from "react";

// import { authApi } from "@/services/api/auth.api";
// import { useAuthStore } from "@/store/auth.store";

// /**
//  * AuthProvider
//  *
//  * Runs once when the application starts.
//  *
//  * Responsibilities:
//  * - Check whether the user is already logged in.
//  * - Restore authentication after page refresh.
//  * - Populate the global auth store.
//  *
//  * This component renders nothing.
//  */
// export default function AuthProvider({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const setUser = useAuthStore((state) => state.setUser);
//   const setLoading = useAuthStore((state) => state.setLoading);
//   const clearAuth = useAuthStore((state) => state.clearAuth);

//   useEffect(() => {
//     /**
//      * Restore authentication from the backend.
//      */
//     async function restoreSession() {
//       try {
//         const response = await authApi.getCurrentUser();

//         // Adjust this according to your backend response.
//         // setUser(response.user);
//       } catch {
//         // User is not authenticated.
//         clearAuth();
//       } finally {
//         // Authentication check finished.
//         setLoading(false);
//       }
//     }

//     restoreSession();
//   }, [setUser, clearAuth, setLoading]);

//   return <>{children}</>;
// }