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

const memoryDb: Record<string, any[]> = {};
const memoryAdapter = {
  id: "memory-adapter",
  create: async ({ model, data }: any) => {
    if (!memoryDb[model]) memoryDb[model] = [];
    const id = data.id || Math.random().toString(36).slice(2);
    const record = { ...data, id };
    memoryDb[model].push(record);
    return record;
  },
  findOne: async ({ model, where }: any) => {
    if (!memoryDb[model]) return null;
    return memoryDb[model].find((record: any) => {
      for (const condition of where) {
        if (record[condition.field] !== condition.value) return false;
      }
      return true;
    }) || null;
  },
  findMany: async ({ model, where }: any) => {
    if (!memoryDb[model]) return [];
    if (!where || where.length === 0) return memoryDb[model];
    return memoryDb[model].filter((record: any) => {
      for (const condition of where) {
        if (record[condition.field] !== condition.value) return false;
      }
      return true;
    });
  },
  update: async ({ model, where, update }: any) => {
    if (!memoryDb[model]) return null;
    const record = memoryDb[model].find((record: any) => {
      for (const condition of where) {
        if (record[condition.field] !== condition.value) return false;
      }
      return true;
    });
    if (record) {
      Object.assign(record, update);
      return record;
    }
    return null;
  },
  updateMany: async ({ model, where, update }: any) => {
    if (!memoryDb[model]) return 0;
    let count = 0;
    for (const record of memoryDb[model]) {
      let match = true;
      for (const condition of where) {
        if (record[condition.field] !== condition.value) match = false;
      }
      if (match) {
        Object.assign(record, update);
        count++;
      }
    }
    return count;
  },
  delete: async ({ model, where }: any) => {
    if (!memoryDb[model]) return;
    const index = memoryDb[model].findIndex((record: any) => {
      for (const condition of where) {
        if (record[condition.field] !== condition.value) return false;
      }
      return true;
    });
    if (index !== -1) {
      memoryDb[model].splice(index, 1);
    }
  },
  deleteMany: async ({ model, where }: any) => {
    if (!memoryDb[model]) return 0;
    const initialLength = memoryDb[model].length;
    memoryDb[model] = memoryDb[model].filter((record: any) => {
      let match = true;
      for (const condition of where) {
        if (record[condition.field] !== condition.value) match = false;
      }
      return !match;
    });
    return initialLength - memoryDb[model].length;
  }
};

let authInstance: ReturnType<typeof betterAuth>;
try {
  authInstance = betterAuth({
    database: memoryAdapter as any,
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
    try {
      const res = await authInstance.handler(req);
      console.log("<- auth.handler returned", res.status);
      return res;
    } catch (e) {
      console.error("<- auth.handler threw", e);
      throw e;
    }
  },
  api: authInstance.api
};
