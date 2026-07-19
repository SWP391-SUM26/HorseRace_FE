import { Card, CardHeader, CardBody, Badge } from "@/common/ui";
import { formatDate } from "@/common/lib/format";
function UpcomingRaces({ races }) {
  return <Card>
      <CardHeader>
        <h2 className="font-semibold text-ink">Upcoming Races</h2>
      </CardHeader>
      <CardBody className="flex flex-col gap-4">
        {races.length === 0 && <p className="py-8 text-center text-sm text-muted">Chưa có cuộc đua sắp tới.</p>}
        {races.map((race) => (
    // same race can appear once per horse → key must include the horse
    <div key={`${race.id}-${race.yourHorse}`} className="flex flex-col gap-1 border-b border-border pb-4 last:border-0 last:pb-0">
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium text-ink">{race.name}</p>
              <Badge tone="success">{race.entryStatus}</Badge>
            </div>
            <p className="text-xs text-muted">
              {race.course} · {formatDate(race.date)}
            </p>
            <p className="text-sm text-muted">
              Your horse: <span className="font-medium text-ink">{race.yourHorse}</span>
            </p>
          </div>
  ))}
      </CardBody>
    </Card>;
}
export {
  UpcomingRaces
};
