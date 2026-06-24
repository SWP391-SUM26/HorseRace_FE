import { cn } from "@/common/lib/cn";
function Card({ className, ...rest }) {
  return <div className={cn("bg-surface rounded-2xl border border-border shadow-sm", className)} {...rest} />;
}
function CardBody({ className, ...rest }) {
  return <div className={cn("p-6", className)} {...rest} />;
}
function CardHeader({ className, ...rest }) {
  return <div className={cn("px-6 py-4 border-b border-border", className)} {...rest} />;
}
export {
  Card,
  CardBody,
  CardHeader
};
