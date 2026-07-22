import { Link } from "react-router-dom";
import { Card, Badge } from "@/common/ui";
import silverStreak from "@/assets/silver-streak.png";

export function HorseCard({ horse }) {
  return (
    <Link to={`/owner/stable/${horse.id}`}>
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        <img
          src={horse.imageUrl ?? silverStreak}
          alt={horse.name}
          className="h-40 w-full object-cover"
          onError={(e) => {
            e.currentTarget.src = silverStreak;
          }}
        />
        <div className="p-4">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-ink">{horse.name}</p>
            <Badge tone={horse.status === "Active" ? "success" : "neutral"}>
              {horse.status}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-muted">
            #{horse.horseCode} · {horse.breed} {horse.gender}
          </p>
        </div>
      </Card>
    </Link>
  );
}
