import { forwardRef } from "react";
import { cn } from "@/common/lib/cn";
const Input = forwardRef(
  ({ label, error, id, name, className, ...rest }, ref) => {
    const inputId = id ?? name;
    return <div className="flex flex-col gap-1">
        {label && <label htmlFor={inputId} className="text-sm font-medium text-ink">{label}</label>}
        <input
      ref={ref}
      id={inputId}
      name={name}
      className={cn(
        "h-10 rounded-lg border border-border bg-surface px-3 text-sm text-ink",
        "focus:outline-none focus:ring-2 focus:ring-brand-500",
        error && "border-danger focus:ring-danger",
        className
      )}
      aria-invalid={!!error}
      {...rest}
    />
        {error && <span className="text-xs text-danger">{error}</span>}
      </div>;
  }
);
Input.displayName = "Input";
export {
  Input
};
