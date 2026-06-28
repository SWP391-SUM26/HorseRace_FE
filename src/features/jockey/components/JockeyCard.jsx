import { Star } from "lucide-react";
import { Avatar, Badge, Button, Card, CardBody } from "@/common/ui";
import { cn } from "@/common/lib/cn";
function JockeyCard({ jockey, primary = false, disabled = false, onInvite }) {
  const metrics = [
    { label: "Riding Style", value: jockey.ridingStyle },
    { label: "Min Weight", value: `${jockey.bodyWeight} lbs` }
  ];
  return <Card>
      <CardBody className="flex flex-col gap-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          {
    /* Avatar + PRO badge */
  }
          <div className="flex shrink-0 flex-col items-center gap-2">
            <Avatar name={jockey.fullName} src={jockey.avatarUrl} size={64} />
            <Badge tone="success">{jockey.status}</Badge>
          </div>

          {
    /* Name, rating, wins, compatibility + metric grid */
  }
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h3 className="text-lg font-semibold text-ink">{jockey.fullName}</h3>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-ink">
                <Star className="h-4 w-4 fill-warning text-warning" />
                {jockey.rating.toFixed(1)}
              </span>
              {jockey.compatibility != null && <Badge tone="info">{jockey.compatibility}% Compatibility</Badge>}
            </div>
            <p className="mt-0.5 text-sm text-muted">
              {jockey.winCount.toLocaleString("en-US")} Career Wins
            </p>

            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
              {metrics.map((m) => <div key={m.label}>
                  <p className="text-xs text-muted">{m.label}</p>
                  <p className="mt-0.5 text-sm font-medium text-ink">{m.value}</p>
                </div>)}
              <div>
                <p className="text-xs text-muted">Last 5 Races</p>
                <div className="mt-1.5 flex items-center gap-1">
                  {jockey.last5.map((filled, i) => <span
    key={i}
    className={cn(
      "h-2.5 w-2.5 rounded-full",
      filled ? "bg-brand-700" : "bg-border"
    )}
  />)}
                </div>
              </div>
            </div>
          </div>

          {
    /* Win rate box */
  }
          <div className="flex shrink-0 flex-col items-center justify-center rounded-xl bg-subtle px-5 py-3 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">Win Rate (2km)</p>
            <p className="mt-1 text-2xl font-bold text-brand-700">{jockey.winRate2km}%</p>
          </div>
        </div>

        {
    /* Footer strip */
  }
        <div className="flex flex-col gap-4 rounded-xl bg-subtle p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FooterStat label="Base Riding Fee" value={jockey.baseFee} />
            <FooterStat label="Prize Percentage" value={jockey.prizePct} />
            <FooterStat label="Trophy Cabinet" value={jockey.trophyCabinet} />
          </div>
          <Button
    variant={primary ? "primary" : "secondary"}
    className="shrink-0"
    disabled={disabled}
    onClick={() => onInvite(jockey.userId, jockey.fullName)}
  >
            Invite to Ride
          </Button>
        </div>
      </CardBody>
    </Card>;
}
function FooterStat({ label, value }) {
  return <div>
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-ink">{value}</p>
    </div>;
}
export {
  JockeyCard
};
