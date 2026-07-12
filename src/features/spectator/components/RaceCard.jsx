import { Link } from "react-router-dom";
import { Badge } from "@/common/ui";
import { MapPin, Ruler } from "lucide-react";
function RaceCard({ race, leader, to, live }) {
  const venue = race.venueName ?? race.venue ?? "Venue TBD";
  const distance = race.distanceMeter ? `${race.distanceMeter}m` : "\u2014";
  return <Link
    to={to}
    className="block rounded-2xl border border-border bg-surface p-4 transition-shadow hover:shadow-md"
  >
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 truncate font-semibold text-ink">{race.name ?? race.raceCode ?? "Race"}</p>
        {live ? <span className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-danger">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-danger" /> LIVE
          </span> : <Badge tone="info">{race.status}</Badge>}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted">
        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {venue}</span>
        <span className="flex items-center gap-1"><Ruler className="h-3.5 w-3.5" /> {distance}</span>
      </div>
      {leader && <div className="mt-3 flex items-center justify-between rounded-xl bg-brand-50 px-3 py-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">{leader.horseName}</p>
            <p className="truncate text-xs text-muted">{leader.jockeyName ?? "TBD"}</p>
          </div>
          <Badge tone="success">Leading</Badge>
        </div>}
    </Link>;
}
export {
  RaceCard
};
