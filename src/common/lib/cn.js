import { twMerge } from "tailwind-merge";

export function cn(...parts) {
  const out = [];
  for (const p of parts) {
    if (!p) continue;
    if (typeof p === "string" || typeof p === "number") out.push(String(p));
    else for (const [k, v] of Object.entries(p)) if (v) out.push(k);
  }
  // twMerge resolves conflicting Tailwind utilities (last wins), so a caller-passed
  // `bg-brand-800` overrides a component's default `bg-surface` instead of both surviving.
  return twMerge(out.join(" "));
}
