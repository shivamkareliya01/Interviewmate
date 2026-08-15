import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : (import.meta.env?.VITE_APP_URL || process.env?.BETTER_AUTH_URL || "https://interviewmate.shivamkareliya51.workers.dev"),
});

export const { useSession, signIn, signUp, signOut } = authClient;
