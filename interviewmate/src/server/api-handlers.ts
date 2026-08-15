export async function handleApiQuestions(request: Request) {
  try {
    const body = await request.json();
    const { messages } = body;

    const apiKey = process.env.GROQ_API_KEY || "";
    const baseUrl = process.env.VITE_GROQ_API_URL || process.env.GROQ_API_URL || "https://api.groq.com/openai/v1";
    const model = process.env.VITE_GROQ_MODEL || process.env.GROQ_MODEL || "llama-3.1-8b-instant";

    if (!apiKey || !apiKey.startsWith("gsk_")) {
      const response = await fetch("https://text.pollinations.ai/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, model: "openai" }),
      });

      if (response.ok) {
        const text = await response.text();
        if (text && text.length > 10) {
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) return new Response(jsonMatch[0], { headers: { "Content-Type": "application/json" } });
          return new Response(text.trim(), { headers: { "Content-Type": "application/json" } });
        }
      }
      return new Response(JSON.stringify({ error: "No valid GROQ_API_KEY found and fallback failed." }), { status: 500, headers: { "Content-Type": "application/json" } });
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
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ error: `Groq API Error: ${errorText}` }), { status: response.status, headers: { "Content-Type": "application/json" } });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (content) {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) return new Response(jsonMatch[0], { headers: { "Content-Type": "application/json" } });
      return new Response(content.trim(), { headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Empty response from Groq" }), { status: 500, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("[Groq Server API Error]:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

export async function handleApiCall(request: Request) {
  try {
    const body = await request.json();
    const { messages, jsonMode = true } = body;

    const apiKey = process.env.GROQ_API_KEY || "";
    const baseUrl = process.env.VITE_GROQ_API_URL || process.env.GROQ_API_URL || "https://api.groq.com/openai/v1";
    const model = process.env.VITE_GROQ_MODEL || process.env.GROQ_MODEL || "llama-3.1-8b-instant";

    if (!apiKey || !apiKey.startsWith("gsk_")) {
      const response = await fetch("https://text.pollinations.ai/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, model: "openai" }),
      });

      if (response.ok) {
        const text = await response.text();
        if (text && text.length > 10) {
          if (jsonMode) {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) return new Response(jsonMatch[0], { headers: { "Content-Type": "application/json" } });
          }
          return new Response(text.trim(), { headers: { "Content-Type": "application/json" } });
        }
      }
      return new Response(JSON.stringify({ error: "No valid GROQ_API_KEY found and fallback failed." }), { status: 500, headers: { "Content-Type": "application/json" } });
    }

    const groqBody: Record<string, any> = { model, messages, temperature: 0.3 };
    if (jsonMode) groqBody.response_format = { type: "json_object" };

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(groqBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ error: `Groq API Error: ${errorText}` }), { status: response.status, headers: { "Content-Type": "application/json" } });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (content) {
      if (jsonMode) {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) return new Response(jsonMatch[0], { headers: { "Content-Type": "application/json" } });
      }
      return new Response(content.trim(), { headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Empty response from Groq" }), { status: 500, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("[Groq Server API Error]:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

export async function handleApiChat(request: Request) {
  try {
    const body = await request.json();
    const { messages } = body;

    const apiKey = process.env.GROQ_API_KEY || "";
    const baseUrl = process.env.VITE_GROQ_API_URL || process.env.GROQ_API_URL || "https://api.groq.com/openai/v1";
    const model = process.env.VITE_GROQ_MODEL || process.env.GROQ_MODEL || "llama-3.1-8b-instant";

    if (!apiKey || !apiKey.startsWith("gsk_")) {
      const response = await fetch("https://text.pollinations.ai/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, model: "openai" }),
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
}
