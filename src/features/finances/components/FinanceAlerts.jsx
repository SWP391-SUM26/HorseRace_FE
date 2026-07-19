import { FileText, AlertTriangle } from "lucide-react";
import { Card, CardBody } from "@/common/ui";

export function FinanceAlerts() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <Card>
        <CardBody className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
              <FileText size={18} />
            </span>
            <h3 className="font-semibold text-ink">Tax Preparation 2023</h3>
          </div>
          <p className="text-sm text-muted">
            Your annual financial summary is 85% ready to export to your
            accounting software.
          </p>
          <button
            type="button"
            className="text-sm font-medium text-brand-700 hover:text-brand-800"
          >
            Continue Prep
          </button>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-warning">
              <AlertTriangle size={18} />
            </span>
            <h3 className="font-semibold text-ink">Upcoming Expense Alert</h3>
          </div>
          <p className="text-sm text-muted">
            Maintenance for 'Thunderbolt Dash' is due in 3 days. Estimated cost:
            $1,250.00.
          </p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="text-sm font-medium text-brand-700 hover:text-brand-800"
            >
              Pay Now
            </button>
            <button
              type="button"
              className="text-sm font-medium text-muted hover:text-ink"
            >
              View Quote
            </button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
