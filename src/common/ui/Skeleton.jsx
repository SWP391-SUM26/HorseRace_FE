import { cn } from "@/common/lib/cn";
function Skeleton({ className }) {
  return <div className={cn("animate-pulse rounded-md bg-border/60", className)} />;
}
export {
  Skeleton
};
