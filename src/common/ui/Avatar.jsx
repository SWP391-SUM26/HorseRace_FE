import { initials } from "@/common/lib/format";
function Avatar({ name, src, size = 36 }) {
  const style = { width: size, height: size };
  if (src) return <img src={src} alt={name} style={style} className="rounded-full object-cover" />;
  return <span style={style} className="inline-flex items-center justify-center rounded-full bg-brand-700 text-xs font-semibold text-white">
      {initials(name)}
    </span>;
}
export {
  Avatar
};
