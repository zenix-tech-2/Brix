import { useState, useRef, useEffect } from "react";
import { aiChat } from "../lib/ai";
import { Button } from "./ui";

export default function AIChat({ context }: { context?: string }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<{ role: string; content: string }[]>([
    {
      role: "assistant",
      content:
        "👋 Hi! I'm the Brixnode AI assistant. Ask me how to use any product, get listing help, or marketplace tips.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, open]);

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    const history = [...msgs, userMsg];
    setMsgs(history);
    setInput("");
    setLoading(true);
    const sys = {
      role: "system",
      content:
        "You are the Brixnode AI assistant for a digital marketplace. Be concise and helpful." +
        (context ? " Context about the current item: " + context : ""),
    };
    const reply = await aiChat([sys, ...history]);
    setMsgs((m) => [...m, { role: "assistant", content: reply }]);
    setLoading(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-2xl text-white shadow-2xl shadow-indigo-500/40 transition hover:scale-105 md:bottom-6"
        aria-label="AI Assistant"
      >
        {open ? "✕" : "🤖"}
      </button>
      {open && (
        <div className="fixed bottom-36 right-4 z-50 flex h-[460px] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl md:bottom-24 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-3 text-white">
            <span className="text-lg">🤖</span>
            <div>
              <p className="text-sm font-bold">Brixnode AI</p>
              <p className="text-[11px] opacity-80">Multi-provider assistant</p>
            </div>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {msgs.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm ${
                    m.role === "user"
                      ? "bg-indigo-500 text-white"
                      : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-slate-100 px-4 py-3 dark:bg-slate-800">
                  <span className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:.15s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:.3s]" />
                  </span>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
          <div className="flex items-center gap-2 border-t border-slate-200 p-3 dark:border-slate-700">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask anything..."
              className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <Button size="sm" onClick={send} disabled={loading}>
              Send
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
