import { createContext, useCallback, useContext, useState } from "react";
import { ToastViewport } from "@/common/ui/Toast";
const ToastCtx = createContext(null);
function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const push = useCallback((tone, message) => {
    const id = Date.now() + Math.floor(Math.random() * 1e3);
    setItems((prev) => [...prev, { id, tone, message }]);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);
  const api = {
    success: (m) => push("success", m),
    error: (m) => push("error", m),
    info: (m) => push("info", m)
  };
  return <ToastCtx.Provider value={api}>
      {children}
      <ToastViewport items={items} />
    </ToastCtx.Provider>;
}
function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
export {
  ToastProvider,
  useToast
};
