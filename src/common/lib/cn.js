function cn(...parts) {
  const out = [];
  for (const p of parts) {
    if (!p) continue;
    if (typeof p === "string" || typeof p === "number") out.push(String(p));
    else for (const [k, v] of Object.entries(p)) if (v) out.push(k);
  }
  return out.join(" ");
}
export {
  cn
};
