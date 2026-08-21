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
const vercelProjectProductionUrl = getEnvVar("VERCEL_PROJECT_PRODUCTION_URL");
const vercelUrlEnv = getEnvVar("VERCEL_URL");
const vercelBranchUrl = getEnvVar("VERCEL_BRANCH_URL");

const defaultProductionUrl = vercelProjectProductionUrl 
  ? `https://${vercelProjectProductionUrl}` 
  : (vercelUrlEnv ? `https://${vercelUrlEnv}` : "https://interviewmate.shivamkareliya11.workers.dev");

const envUrl = getEnvVar("BETTER_AUTH_URL");

const baseURL = envUrl ? envUrl : (typeof process !== "undefined" && process.env.NODE_ENV === "development" ? "http://localhost:8080" : defaultProductionUrl);

const trustedOrigins = [
  "http://localhost:8080",
  baseURL,
];
if (vercelProjectProductionUrl) trustedOrigins.push(`https://${vercelProjectProductionUrl}`);
if (vercelUrlEnv) trustedOrigins.push(`https://${vercelUrlEnv}`);
if (vercelBranchUrl) trustedOrigins.push(`https://${vercelBranchUrl}`);

const clientId = getEnvVar("GOOGLE_CLIENT_ID").trim();
const clientSecret = getEnvVar("GOOGLE_CLIENT_SECRET").trim();

if (!clientId || !clientSecret) {
  console.warn("[Better Auth Warning] Google Client ID or Client Secret is missing from environment variables!");
} else {
  console.log(`[Better Auth] Configured Google Auth for Client ID: ${clientId.slice(0, 20)}...`);
}

import { LibsqlDialect } from "@libsql/kysely-libsql";
import { createClient } from "@libsql/client";

let authInstance: ReturnType<typeof betterAuth>;
try {
  const dialect = new LibsqlDialect({
    client: createClient({
      url: getEnvVar("DATABASE_URL") || "file:sqlite.db",
      authToken: getEnvVar("DATABASE_AUTH_TOKEN") || undefined
    })
  });
  
  authInstance = betterAuth({
    database: dialect,
    secret,
    baseURL,
    trustedOrigins,
    emailAndPassword: {
      enabled: true,
    },
    socialProviders: {
      google: {
        clientId,
        clientSecret,
      },
    },
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ["google"]
      }
    }
  });
} catch (error) {
  console.warn("Failed to initialize betterAuth. This usually means a database configuration is missing.", error);
  authInstance = {
    handler: async (req: any) => {
      console.log("Mock handler called!");
      return new Response(JSON.stringify({ error: "Auth misconfigured" }), { status: 500 })
    },
    api: {
      getSession: async () => null
    }
  } as any;
}

// Export the raw betterAuth instance for use with toNodeHandler() in Vite dev middleware.
// toNodeHandler() from better-auth/node needs the raw instance, not our wrapper.
export { authInstance };
export default authInstance;

export const auth = {
  handler: async (req: Request) => {
    try {
      return await authInstance.handler(req);
    } catch (e: any) {
      // Handle stale/corrupted cookies causing Base64 decode errors
      if (e?.message?.includes("Invalid Base64 character")) {
        // Stale/corrupted cookies — silently clear them
        const url = new URL(req.url);
        const cookieDomain = url.hostname;
        const clearCookies = [
          "better-auth.session_token",
          "better-auth.session_data",
          "better-auth.account_data",
          "better-auth.state",
        ];
        const setCookieHeaders = clearCookies.map(
          (name) => `${name}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`
        );
        return new Response(
          JSON.stringify({ session: null, user: null }),
          {
            status: 200,
            headers: [
              ["Content-Type", "application/json"],
              ...setCookieHeaders.map((v) => ["Set-Cookie", v] as [string, string]),
            ],
          }
        );
      }
      console.error("[Better Auth] Unhandled error:", e);
      throw e;
    }
  },
  api: authInstance.api
};
