import { initials } from "@/common/lib/format";
function isImageSource(src) {
  if (!src || typeof src !== "string") return false;
  return /^(https?:|data:|blob:|\/)/i.test(src.trim());
}

function Avatar({ name, src, size = 36 }) {
  const style = { width: size, height: size };
  if (isImageSource(src)) return <img src={src} alt={name} style={style} className="rounded-full object-cover" />;
  return <span style={style} className="inline-flex items-center justify-center rounded-full bg-brand-700 text-xs font-semibold text-white">
      {src || initials(name)}
    </span>;
}
export {
  Avatar
};
