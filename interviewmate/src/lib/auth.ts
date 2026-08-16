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
const envUrl = getEnvVar("BETTER_AUTH_URL");
const baseURL = envUrl ? envUrl : (typeof process !== "undefined" && process.env.NODE_ENV === "development" ? "http://localhost:8080" : "https://interviewmate.shivamkareliya51.workers.dev");
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
      url: "file:sqlite.db"
    })
  });
  
  authInstance = betterAuth({
    database: dialect,
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

export const auth = {
  handler: async (req: Request) => {
    console.log("-> auth.handler called", req.url, req.method);
    console.log("COOKIE HEADER:", req.headers.get("cookie"));
    try {
      const res = await authInstance.handler(req);
      console.log("<- auth.handler returned", res.status);
      return res;
    } catch (e) {
      console.error("<- auth.handler threw", e.name, e.message);
      console.error("STACK:", e.stack);
      console.error("DETAILS:", JSON.stringify(e, Object.getOwnPropertyNames(e), 2));
      throw e;
    }
  },
  api: authInstance.api
};
