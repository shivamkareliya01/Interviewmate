import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { auth, baseURL } from "./lib/auth";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown; error?: unknown };
    return payload.unhandled === true && (payload.message === "HTTPError" || payload.error === true);
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);

      
      if (url.pathname.startsWith("/api/auth")) {
        const timeoutPromise = new Promise<Response>((_, reject) => setTimeout(() => reject(new Error("Auth handler timed out")), 5000));
        const res = await Promise.race([auth.handler(request), timeoutPromise]);
        if (res) return res;
        return new Response(JSON.stringify({ error: "Auth route not found or not handled by Better Auth" }), {
          status: 404,
          headers: { "content-type": "application/json" }
        });
      }

      if (url.pathname === "/api/debug-env") {
        return new Response(JSON.stringify({
          baseURL: baseURL,
          VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL,
          VERCEL_URL: process.env.VERCEL_URL,
          BETTER_AUTH_URL: process.env.BETTER_AUTH_URL
        }), { headers: { "content-type": "application/json" } });
      }

      if (request.method === "POST") {
        if (url.pathname === "/api/questions") {
          const { handleApiQuestions } = await import("./server/api-handlers");
          return await handleApiQuestions(request);
        }
        if (url.pathname === "/api/call") {
          const { handleApiCall } = await import("./server/api-handlers");
          return await handleApiCall(request);
        }
        if (url.pathname === "/api/chat") {
          const { handleApiChat } = await import("./server/api-handlers");
          return await handleApiChat(request);
        }
      }
      
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error("SERVER CRASH:", error);
      
      const isApi = request.url.includes("/api/");
      if (isApi) {
        return new Response(JSON.stringify({ 
          error: "Internal Server Error", 
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined 
        }), {
          status: 500,
          headers: { "content-type": "application/json" },
        });
      }

      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
