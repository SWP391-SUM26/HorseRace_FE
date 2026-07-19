import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { ToastViewport } from "@/common/ui/Toast";
import { registerToastEmitters } from "@/common/lib/toastBus";

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const push = useCallback((tone, message) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setItems((prev) => [...prev, { id, tone, message }]);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);
  const api = {
    success: (m) => push("success", m),
    error: (m) => push("error", m),
    info: (m) => push("info", m),
  };
  // Bridge the same toast queue to non-React callers (react-query MutationCache). Idempotent —
  // `push` is stable, so this registers once and re-registers only if it ever changes.
  useEffect(() => {
    registerToastEmitters({
      success: (m) => push("success", m),
      error: (m) => push("error", m),
      info: (m) => push("info", m),
    });
  }, [push]);
  return (
    <ToastCtx.Provider value={api}>
      {children}
      <ToastViewport items={items} />
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
