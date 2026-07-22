import { Link } from "react-router-dom";
import { Boxes, Users, ExternalLink } from "lucide-react";
import { Button } from "@/common/ui";
import dashboardMonitor from "@/assets/dashboard_monitor.png";

function FeatureRow({ icon, title, description }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
        {icon}
      </div>
      <div>
        <p className="font-medium text-ink">{title}</p>
        <p className="text-sm text-muted">{description}</p>
      </div>
    </div>
  );
}

export function BackboneSection() {
  return (
    <section className="bg-bg py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 md:grid-cols-2">
        {/* LEFT — copy + features */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">
            The Backbone
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-ink">
            Precision Intelligence for Modern Stables
          </h2>
          <p className="mt-4 text-muted">
            Our administrative layer handles the clinical complexities of racing
            management so you can focus on the finish line. From inventory
            tracking to staff duty logs, nothing is left to chance.
          </p>

          <div className="mt-8 space-y-6">
            <FeatureRow
              icon={<Boxes className="h-5 w-5" />}
              title="Supply Chain"
              description="Automated stock management"
            />
            <FeatureRow
              icon={<Users className="h-5 w-5" />}
              title="Staff Hub"
              description="Duty logs and payroll"
            />
          </div>

          <Link to="/login" className="mt-8 inline-block">
            <Button variant="primary" className="gap-2">
              Admin Dashboard
              <ExternalLink className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* RIGHT — dashboard image */}
        <div>
          <img
            src={dashboardMonitor}
            alt="Analytics dashboards on a monitor"
            className="w-full rounded-xl object-contain shadow-lg"
          />
        </div>
      </div>
    </section>
  );
}
