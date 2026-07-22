import { ArrowRight } from "lucide-react";
import { Card, CardHeader, CardBody } from "@/common/ui";
import { usdCompact } from "../format";

export function HorseProfitabilityCard({ horses }) {
  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold text-ink">Horse Profitability</h2>
      </CardHeader>
      <CardBody className="space-y-5">
        {horses.map((horse) => (
          <div key={horse.id}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-ink">{horse.name}</span>
              <span className="text-muted">{usdCompact(horse.earnings)}</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-subtle">
              <div
                className="h-full rounded-full bg-brand-700"
                style={{ width: `${horse.percent}%` }}
              />
            </div>
          </div>
        ))}
        <button
          type="button"
          className="inline-flex items-center gap-1 pt-1 text-sm font-medium text-brand-700 hover:text-brand-800"
        >
          View Detailed Analytics
          <ArrowRight size={14} />
        </button>
      </CardBody>
    </Card>
  );
}
