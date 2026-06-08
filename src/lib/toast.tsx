import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

type Toast = { id: number; msg: string; type: "success" | "error" | "info" };
const Ctx = createContext<(msg: string, type?: Toast["type"]) => void>(
  () => {}
);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((msg: string, type: Toast["type"] = "info") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);
  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-20 left-1/2 z-[100] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4 sm:bottom-6">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={
              "pointer-events-auto animate-[slideUp_.3s_ease] rounded-xl px-4 py-3 text-sm font-medium text-white shadow-xl " +
              (t.type === "success"
                ? "bg-emerald-600"
                : t.type === "error"
                ? "bg-rose-600"
                : "bg-slate-800")
            }
          >
            {t.msg}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);
