import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : (import.meta.env?.VITE_APP_URL || process.env?.BETTER_AUTH_URL || (process.env?.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : (process.env?.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://interviewmate.shivamkareliya11.workers.dev"))),
});

export const { useSession, signIn, signUp, signOut } = authClient;
