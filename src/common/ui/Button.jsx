import { cn } from "@/common/lib/cn";
import { Spinner } from "./Spinner";
const VARIANTS = {
  primary: "bg-brand-700 text-white hover:bg-brand-800",
  secondary: "bg-subtle text-ink hover:bg-border",
  ghost: "bg-transparent text-ink hover:bg-subtle",
  danger: "bg-danger text-white hover:opacity-90"
};
const SIZES = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base"
};
function Button({
  variant = "primary",
  size = "md",
  loading = false,
  leftIcon,
  className,
  disabled,
  children,
  ...rest
}) {
  return <button
    className={cn(
      "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors",
      "disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand-500",
      VARIANTS[variant],
      SIZES[size],
      className
    )}
    disabled={disabled || loading}
    {...rest}
  >
      {loading ? <Spinner /> : leftIcon}
      {children}
    </button>;
}
export {
  Button
};
