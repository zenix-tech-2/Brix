import { supabase } from "./supabase";
import type { ApiKeyConfig } from "./types";

export async function getActiveKey(): Promise<ApiKeyConfig | null> {
  const { data } = await supabase
    .from("api_keys")
    .select("*")
    .eq("active", true)
    .limit(1)
    .maybeSingle();
  return (data as ApiKeyConfig) || null;
}

// Unified adapter for multiple providers. Keys are admin-managed in DB.
export async function aiChat(
  messages: { role: string; content: string }[]
): Promise<string> {
  const key = await getActiveKey();
  if (!key || !key.key_value) {
    return demoReply(messages[messages.length - 1]?.content || "");
  }
  try {
    const provider = key.provider.toLowerCase();
    if (provider.includes("openai") || provider.includes("grok") || provider.includes("xai") || provider.includes("groq")) {
      const base =
        provider.includes("grok") || provider.includes("xai")
          ? "https://api.x.ai/v1/chat/completions"
          : provider.includes("groq")
          ? "https://api.groq.com/openai/v1/chat/completions"
          : "https://api.openai.com/v1/chat/completions";
      const res = await fetch(base, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key.key_value}`,
        },
        body: JSON.stringify({
          model: key.model || "gpt-4o-mini",
          messages,
        }),
      });
      const j = await res.json();
      return j.choices?.[0]?.message?.content || demoReply("");
    }
    if (provider.includes("gemini") || provider.includes("google")) {
      const model = key.model || "gemini-1.5-flash";
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key.key_value}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: messages.map((m) => ({
              role: m.role === "assistant" ? "model" : "user",
              parts: [{ text: m.content }],
            })),
          }),
        }
      );
      const j = await res.json();
      return (
        j.candidates?.[0]?.content?.parts?.[0]?.text || demoReply("")
      );
    }
    if (provider.includes("anthropic") || provider.includes("claude")) {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": key.key_value,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: key.model || "claude-3-5-sonnet-20241022",
          max_tokens: 1024,
          messages: messages.filter((m) => m.role !== "system"),
        }),
      });
      const j = await res.json();
      return j.content?.[0]?.text || demoReply("");
    }
    return demoReply("");
  } catch {
    return "⚠️ The AI service is currently unavailable. The admin may need to add or rotate an API key.";
  }
}

function demoReply(prompt: string) {
  const p = prompt.toLowerCase();
  if (p.includes("how") && (p.includes("use") || p.includes("template")))
    return "To use this item, open it in your library after approval, then follow the included 'What you'll get' guide. Duplicate any Notion/Canva links to your own workspace and customize. Need a specific walkthrough?";
  if (p.includes("description") || p.includes("seo") || p.includes("tags"))
    return "Here's a polished listing draft:\n\n**Title:** Premium Productivity Toolkit\n**Description:** A beautifully designed, ready-to-use system that saves you hours every week. Plug-and-play, fully customizable, and built for results.\n**Tags:** productivity, template, notion, workflow, premium\n**Suggested price:** $19–29";
  return "I'm the Brixnode AI assistant. I can help you write product listings, explain how to use purchased items, suggest pricing, and answer marketplace questions. (Admin: add an API key in the Admin → AI Keys panel to enable live AI.)";
}
