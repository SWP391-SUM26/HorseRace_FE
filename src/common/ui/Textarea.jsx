import { forwardRef } from "react";
import { cn } from "@/common/lib/cn";
const Textarea = forwardRef(
  ({ label, error, id, name, className, ...rest }, ref) => {
    const taId = id ?? name;
    return <div className="flex flex-col gap-1">
        {label && <label htmlFor={taId} className="text-sm font-medium text-ink">{label}</label>}
        <textarea
      ref={ref}
      id={taId}
      name={name}
      className={cn("min-h-24 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-500", error && "border-danger", className)}
      {...rest}
    />
        {error && <span className="text-xs text-danger">{error}</span>}
      </div>;
  }
);
Textarea.displayName = "Textarea";
export {
  Textarea
};
