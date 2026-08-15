import { betterAuth } from "better-auth";

function getEnvVar(key: string): string {
  const viteKey = `VITE_${key}`;
  if (typeof import.meta !== "undefined" && import.meta.env) {
    if (import.meta.env[key]) return String(import.meta.env[key]);
    if (import.meta.env[viteKey]) return String(import.meta.env[viteKey]);
  }
  if (typeof process !== "undefined" && process.env) {
    if (process.env[key]) return String(process.env[key]);
    if (process.env[viteKey]) return String(process.env[viteKey]);
  }
  return "";
}

const secret = getEnvVar("BETTER_AUTH_SECRET") || "interviewmate_secret_key_32bytes_minimum_length_required";
const baseURL = getEnvVar("BETTER_AUTH_URL") || "http://localhost:8080";
const clientId = getEnvVar("GOOGLE_CLIENT_ID").trim();
const clientSecret = getEnvVar("GOOGLE_CLIENT_SECRET").trim();

if (!clientId || !clientSecret) {
  console.warn("[Better Auth Warning] Google Client ID or Client Secret is missing from environment variables!");
} else {
  console.log(`[Better Auth] Configured Google Auth for Client ID: ${clientId.slice(0, 20)}...`);
}

export const auth = betterAuth({
  secret,
  baseURL,
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId,
      clientSecret,
    },
  },
});
