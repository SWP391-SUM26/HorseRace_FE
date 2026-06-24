import { CheckCircle2, XCircle, Info } from "lucide-react";
import { cn } from "@/common/lib/cn";
const ICON = { success: CheckCircle2, error: XCircle, info: Info };
const TONE = { success: "text-success", error: "text-danger", info: "text-info" };
function ToastViewport({ items }) {
  return <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2">
      {items.map((t) => {
    const Icon = ICON[t.tone];
    return <div key={t.id} className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 shadow-lg">
            <Icon size={18} className={cn(TONE[t.tone])} />
            <span className="text-sm text-ink">{t.message}</span>
          </div>;
  })}
    </div>;
}
export {
  ToastViewport
};
