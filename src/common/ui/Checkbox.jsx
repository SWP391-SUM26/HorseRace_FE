import { forwardRef } from "react";
const Checkbox = forwardRef(({ label, id, name, ...rest }, ref) => {
  const cbId = id ?? name;
  return <label htmlFor={cbId} className="flex items-center gap-2 text-sm text-ink">
      <input ref={ref} type="checkbox" id={cbId} name={name} className="h-4 w-4 rounded border-border text-brand-700 focus:ring-brand-500" {...rest} />
      {label}
    </label>;
});
Checkbox.displayName = "Checkbox";
export {
  Checkbox
};
