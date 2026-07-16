import { Badge } from "@/common/ui";
import silverStreak from "@/assets/silver-streak.png";

export function HorseImageCard({ imageUrl, name, status, grade }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border shadow-sm">
      <img
        src={imageUrl ?? silverStreak}
        alt={name}
        className="h-72 w-full object-cover"
        onError={(event) => {
          event.currentTarget.src = silverStreak;
        }}
      />
      <div className="absolute right-4 top-4 flex gap-2">
        <Badge tone="success">{String(status).toUpperCase()}</Badge>
        {grade && <Badge tone="neutral">{String(grade).toUpperCase()}</Badge>}
      </div>
    </div>
  );
}
