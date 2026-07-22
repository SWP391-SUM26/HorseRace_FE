import { Link } from "react-router-dom";
import { Briefcase, Users, Eye, Check, Play } from "lucide-react";
import { Card, CardBody, Badge, Button } from "@/common/ui";

function BulletList({ items }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item} className="flex items-center gap-2.5 text-sm text-ink">
          <Check className="h-4 w-4 shrink-0 text-brand-700" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function EcosystemCard({
  icon,
  title,
  description,
  highlight,
  bullets,
  cta,
}) {
  return (
    <Card className="flex flex-col">
      <CardBody className="flex flex-1 flex-col">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-ink">{title}</h3>
        <p className="mt-1.5 text-sm text-muted">{description}</p>

        <div className="my-5">{highlight}</div>

        <div className="flex-1">
          <BulletList items={bullets} />
        </div>

        <Link to={cta.to} className="mt-6 block">
          <Button variant={cta.variant} className="w-full">
            {cta.label}
          </Button>
        </Link>
      </CardBody>
    </Card>
  );
}

export function EcosystemSection() {
  return (
    <section className="bg-bg py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-3xl font-semibold text-ink">
            The Elite Ecosystem
          </h2>
          <p className="mt-3 text-muted">
            Tailored operational hubs for every professional and enthusiast in
            the racing circuit.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {/* Card A — Syndicates & Owners */}
          <EcosystemCard
            icon={<Briefcase className="h-6 w-6" />}
            title="Syndicates & Owners"
            description="Asset management and fiduciary oversight for elite thoroughbred portfolios."
            highlight={
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Portfolio ROI</span>
                  <span className="font-semibold text-success">+14.2%</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-subtle">
                  <div className="h-full w-[70%] rounded-full bg-brand-700" />
                </div>
              </div>
            }
            bullets={[
              "Horse Registration",
              "Financial Ledgering",
              "Health Reports",
            ]}
            cta={{
              label: "Launch Owner Portal",
              to: "/login",
              variant: "primary",
            }}
          />

          {/* Card B — Professional Jockeys */}
          <EcosystemCard
            icon={<Users className="h-6 w-6" />}
            title="Professional Jockeys"
            description="Schedule, communication, and biometric performance tracking."
            highlight={
              <div className="rounded-xl bg-subtle p-4">
                <p className="text-xs uppercase tracking-wide text-muted">
                  Next Booking
                </p>
                <div className="mt-1.5 flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-ink">
                    Race 7 @ Flemington
                  </span>
                  <Badge tone="success">Confirmed</Badge>
                </div>
              </div>
            }
            bullets={[
              "Ride Schedule Management",
              "Agent Communication",
              "Weight Analytics",
            ]}
            cta={{
              label: "View Ride Deck",
              to: "/login",
              variant: "secondary",
            }}
          />

          {/* Card C — Spectators & Fans */}
          <EcosystemCard
            icon={<Eye className="h-6 w-6" />}
            title="Spectators & Fans"
            description="Immersive race experience with real-time data and prediction tools."
            highlight={
              <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-brand-900">
                <span className="absolute left-3 top-3 text-[10px] font-semibold uppercase tracking-wide text-white/70">
                  Live Stream
                </span>
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                  <Play className="h-5 w-5 fill-white text-white" />
                </span>
              </div>
            }
            bullets={[
              "Real-time Results Feed",
              "Community Predictions",
              "Digital Collectibles",
            ]}
            cta={{
              label: "Enter Fan Zone",
              to: "/register/spectator",
              variant: "secondary",
            }}
          />
        </div>
      </div>
    </section>
  );
}
