// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default async (env: any) => {
  const config = await defineConfig({
    vite: {
      resolve: {
        tsconfigPaths: true,
      },
      plugins: [
        {
          name: 'dev-api-middleware',
          apply: 'serve',
          configureServer(server) {
            server.middlewares.use(async (req, res, next) => {
              if (req.url?.startsWith('/api/')) {
                try {
                  // 1. Better Auth (uses its own Node adapter)
                  if (req.url.startsWith('/api/auth/')) {
                    const { authInstance } = await server.ssrLoadModule('/src/lib/auth.ts');
                    const { toNodeHandler } = await server.ssrLoadModule('better-auth/node');
                    return toNodeHandler(authInstance)(req, res);
                  }

                  // 2. Custom APIs (convert Node request to Web request)
                  const { handleApiQuestions, handleApiCall, handleApiChat } = await server.ssrLoadModule('/src/server/api-handlers.ts');
                  
                  let bodyStr = '';
                  if (req.method !== 'GET' && req.method !== 'HEAD') {
                    bodyStr = await new Promise((resolve, reject) => {
                      let data = '';
                      req.on('data', chunk => { data += chunk; });
                      req.on('end', () => resolve(data));
                      req.on('error', reject);
                    });
                  }
                  
                  const protocol = req.headers['x-forwarded-proto'] || 'http';
                  const host = req.headers.host || 'localhost:8080';
                  const url = new URL(req.url, `${protocol}://${host}`);
                  
                  const fetchReq = new Request(url, {
                    method: req.method,
                    headers: req.headers as any,
                    body: bodyStr ? bodyStr : undefined
                  });
                  
                  let fetchRes: Response;
                  if (url.pathname === '/api/questions') fetchRes = await handleApiQuestions(fetchReq);
                  else if (url.pathname === '/api/call') fetchRes = await handleApiCall(fetchReq);
                  else if (url.pathname === '/api/chat') fetchRes = await handleApiChat(fetchReq);
                  else {
                    res.statusCode = 404;
                    return res.end();
                  }
                  
                  res.statusCode = fetchRes.status;
                  fetchRes.headers.forEach((value, key) => {
                    res.setHeader(key, value);
                  });
                  
                  if (fetchRes.body) {
                    const { Readable } = await import('node:stream');
                    if (fetchRes.body instanceof ReadableStream) {
                       Readable.fromWeb(fetchRes.body as any).pipe(res);
                    } else {
                       res.end(await fetchRes.text());
                    }
                  } else {
                    res.end();
                  }
                } catch (e) {
                  console.error("Dev API Middleware Error:", e);
                  res.statusCode = 500;
                  res.end("Internal Server Error");
                }
              } else {
                next();
              }
            });
          }
        }
      ],
      server: {
        proxy: {
          "/api/groq": {
            target: "https://api.groq.com/openai/v1",
            changeOrigin: true,
            rewrite: (path: string) => path.replace(/^\/api\/groq/, ""),
          },
        },
      },
    },
    nitro: {
      entry: './src/server.ts',
    },
  })(env);

  // Filter out vite-tsconfig-paths since Vite 8.2 natively supports it
  if (config.plugins) {
    config.plugins = config.plugins.filter((p: any) => !p || p.name !== 'vite-tsconfig-paths');
  }

  return config;
};
