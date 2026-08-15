import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { messages } = body;

          const apiKey = process.env.GROQ_API_KEY || "";
          const baseUrl = process.env.VITE_GROQ_API_URL || process.env.GROQ_API_URL || "https://api.groq.com/openai/v1";
          const model = process.env.VITE_GROQ_MODEL || process.env.GROQ_MODEL || "llama-3.1-8b-instant";

          if (!apiKey || !apiKey.startsWith("gsk_")) {
            // Fallback to public pollinations if no key is configured
            const response = await fetch("https://text.pollinations.ai/", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                messages,
                model: "openai",
              }),
            });

            if (response.ok) {
              const text = await response.text();
              return new Response(text);
            }
            return new Response("Error: No valid GROQ_API_KEY found and fallback failed.", { status: 500 });
          }

          const response = await fetch(`${baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model,
              messages,
              temperature: 0.3,
              stream: true,
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            return new Response(`Groq API Error: ${errorText}`, { status: response.status });
          }

          // Return the ReadableStream directly to the client
          return new Response(response.body, {
            headers: {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
              "Connection": "keep-alive",
            },
          });
        } catch (err) {
          console.error("[Groq Server API Error]:", err);
          return new Response("Internal Server Error", { status: 500 });
        }
      },
    },
  },
});
