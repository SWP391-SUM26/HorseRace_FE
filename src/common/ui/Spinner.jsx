import { Loader2 } from "lucide-react";
import { cn } from "@/common/lib/cn";
function Spinner({ className }) {
  return <Loader2 className={cn("animate-spin", className)} size={16} aria-hidden />;
}
export {
  Spinner
};
