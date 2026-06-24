import { cn } from "@/common/lib/cn";
const TONES = {
  neutral: "bg-subtle text-muted",
  success: "bg-brand-50 text-success",
  warning: "bg-amber-50 text-warning",
  danger: "bg-red-50 text-danger",
  info: "bg-blue-50 text-info"
};
function Badge({ tone = "neutral", children }) {
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", TONES[tone])}>{children}</span>;
}
export {
  Badge
};
