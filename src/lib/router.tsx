import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface RouterCtx {
  path: string;
  navigate: (to: string, opts?: { replace?: boolean }) => void;
  back: () => void;
  params: Record<string, string>;
  query: URLSearchParams;
}

const Ctx = createContext<RouterCtx>(null as unknown as RouterCtx);

export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(
    () => window.location.pathname + window.location.search
  );

  useEffect(() => {
    const onPop = () =>
      setPath(window.location.pathname + window.location.search);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = useCallback(
    (to: string, opts?: { replace?: boolean }) => {
      if (opts?.replace) window.history.replaceState({}, "", to);
      else window.history.pushState({}, "", to);
      setPath(to);
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    },
    []
  );

  const back = useCallback(() => window.history.back(), []);

  const query = useMemo(
    () => new URLSearchParams(window.location.search),
    [path]
  );

  const value = useMemo(
    () => ({ path: path.split("?")[0], navigate, back, params: {}, query }),
    [path, navigate, back, query]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useRouter = () => useContext(Ctx);

export function matchRoute(
  pattern: string,
  path: string
): Record<string, string> | null {
  const pParts = pattern.split("/").filter(Boolean);
  const aParts = path.split("/").filter(Boolean);
  if (pParts.length !== aParts.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < pParts.length; i++) {
    if (pParts[i].startsWith(":")) {
      params[pParts[i].slice(1)] = decodeURIComponent(aParts[i]);
    } else if (pParts[i] !== aParts[i]) {
      return null;
    }
  }
  return params;
}

export function Link({
  to,
  children,
  className,
  onClick,
}: {
  to: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const { navigate } = useRouter();
  return (
    <a
      href={to}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        onClick?.();
        navigate(to);
      }}
    >
      {children}
    </a>
  );
}
