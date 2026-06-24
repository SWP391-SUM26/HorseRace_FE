import { forwardRef } from "react";
import { cn } from "@/common/lib/cn";
const Select = forwardRef(
  ({ label, error, options, id, name, className, ...rest }, ref) => {
    const selectId = id ?? name;
    return <div className="flex flex-col gap-1">
        {label && <label htmlFor={selectId} className="text-sm font-medium text-ink">{label}</label>}
        <select
      ref={ref}
      id={selectId}
      name={name}
      className={cn("h-10 rounded-lg border border-border bg-surface px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-500", error && "border-danger", className)}
      {...rest}
    >
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        {error && <span className="text-xs text-danger">{error}</span>}
      </div>;
  }
);
Select.displayName = "Select";
export {
  Select
};
