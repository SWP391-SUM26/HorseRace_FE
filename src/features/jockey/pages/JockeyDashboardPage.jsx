import { Link } from "react-router-dom";
import { Check, X } from "lucide-react";
import { PageHeader } from "@/common/components/PageHeader";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  EmptyState,
  Skeleton,
  StatCard,
} from "@/common/ui";
import { useAuth } from "@/common/hooks/useAuth";
import { useToast } from "@/common/providers/ToastProvider";
import { formatDate } from "@/common/lib/format";
import {
  useAcceptInvitation,
  useJockeyInvitations,
  useJockeyStats,
  useMyRides,
  useRejectInvitation,
} from "../hooks";

/** USD-shaped earnings; render with a $ prefix. */
function formatUsd(amount) {
  return `$${Math.round(amount).toLocaleString("en-US")}`;
}

/**
 * The BE invitation shape carries no race grade, so we derive a stable
 * GROUP/MAIDEN-style chip from the assignment id purely for visual variety.
 */
function raceGradeBadge(inv) {
  const grades = [
    { tone: "info", label: "GROUP 1" },
    { tone: "neutral", label: "MAIDEN" },
    { tone: "info", label: "GROUP 2" },
  ];
  let hash = 0;
  for (const ch of inv.id) hash = (hash + ch.charCodeAt(0)) % grades.length;
  return grades[hash];
}

export default function JockeyDashboardPage() {
  const { user } = useAuth();
  const toast = useToast();
  const jockeyUserId = user?.id ?? "";

  const statsQuery = useJockeyStats(!!jockeyUserId);
  const invitedQuery = useJockeyInvitations(jockeyUserId, "INVITED");
  const upcomingQuery = useMyRides("UPCOMING", !!jockeyUserId);

  const accept = useAcceptInvitation();
  const reject = useRejectInvitation();

  function handleAccept(id) {
    accept.mutate(id, {
      onSuccess: () => toast.success("Đã nhận lời mời"),
    });
  }

  function handleDecline(id) {
    reject.mutate(id, {
      onSuccess: () => toast.success("Đã từ chối"),
    });
  }

  const stats = statsQuery.data;

  return (
    <>
      <PageHeader
        title="Overview"
        subtitle="Current Standings & Pending Actions"
        actions={<Badge tone="success">Current Season</Badge>}
      />

      {/* KPI row — all REAL from GET /jockeys/me/stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {statsQuery.isPending ? (
          <>
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
          </>
        ) : statsQuery.isError || !stats ? (
          <Card className="flex h-28 items-center justify-center p-6 text-sm text-muted sm:col-span-3">
            Không tải được thống kê
          </Card>
        ) : (
          <>
            <StatCard
              label="Win Rate"
              value={`${stats.winRate}%`}
              hint={`${stats.wins} wins this season`}
            />

            <StatCard
              label="Total Rides"
              value={stats.totalRides}
              hint={`${stats.wins} wins · ${stats.places} places`}
            />

            {/* dark emerald card — NOT <Card> (bg override loses class-order) */}
            <div className="rounded-2xl border border-brand-700 bg-brand-800 p-6 text-white shadow-sm">
              <p className="text-sm text-white/70">Current Season Earnings</p>
              <p className="mt-1 text-3xl font-semibold">
                {formatUsd(stats.seasonEarnings)}
              </p>
              <p className="mt-2 text-xs text-white/70">
                Career: {formatUsd(stats.careerEarnings)}
              </p>
            </div>
          </>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Active Invitations (REAL) */}
        <section className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-ink">Active Invitations</h2>
            <Link
              to="/app/jockey/invitations"
              className="text-sm font-medium text-brand-700 hover:text-brand-800"
            >
              View History →
            </Link>
          </div>

          {invitedQuery.isPending ? (
            <InvitationsSkeleton />
          ) : invitedQuery.isError ? (
            <EmptyState
              title="Không tải được lời mời"
              description="Vui lòng tải lại trang để thử lại."
            />
          ) : !invitedQuery.data || invitedQuery.data.length === 0 ? (
            <EmptyState title="Không có lời mời đang chờ" />
          ) : (
            <div className="flex flex-col gap-4">
              {invitedQuery.data.map((inv) => (
                <InvitationRow
                  key={inv.id}
                  invitation={inv}
                  onAccept={() => handleAccept(inv.id)}
                  onDecline={() => handleDecline(inv.id)}
                  accepting={accept.isPending && accept.variables === inv.id}
                  declining={reject.isPending && reject.variables === inv.id}
                />
              ))}
            </div>
          )}
        </section>

        {/* Upcoming Week — REAL confirmed rides (GET /assignments/me/rides?when=UPCOMING) */}
        <aside>
          <Card>
            <CardBody className="flex flex-col gap-4">
              <h2 className="font-semibold text-ink">Upcoming Week</h2>

              {upcomingQuery.isPending ? (
                <div className="flex flex-col gap-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-xl" />
                  ))}
                </div>
              ) : upcomingQuery.isError ? (
                <p className="text-sm text-muted">Không tải được lịch đua.</p>
              ) : !upcomingQuery.data || upcomingQuery.data.length === 0 ? (
                <p className="text-sm text-muted">Chưa có lịch đua sắp tới.</p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {upcomingQuery.data.map((ride) => (
                    <li
                      key={ride.id}
                      className="rounded-xl border border-border bg-subtle/40 p-3"
                    >
                      <p className="text-xs font-medium text-muted">
                        {ride.date ? formatDate(ride.date) : "Chưa lên lịch"}
                      </p>
                      <p className="mt-0.5 text-sm font-medium text-ink">
                        {ride.raceName}
                      </p>
                      <p className="text-xs text-muted">Riding: {ride.horse}</p>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </aside>
      </div>
    </>
  );
}

function InvitationRow({
  invitation,
  onAccept,
  onDecline,
  accepting,
  declining,
}) {
  const grade = raceGradeBadge(invitation);
  return (
    <Card>
      <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <Avatar name={invitation.horse} size={48} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate font-semibold text-ink">
                {invitation.horse}
              </h3>
              <Badge tone={grade.tone}>{grade.label}</Badge>
            </div>
            <p className="text-sm text-muted">{invitation.owner}</p>
            <p className="mt-0.5 text-xs text-muted">
              {invitation.race} · {formatDate(invitation.date)}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<X size={16} />}
            loading={declining}
            disabled={accepting}
            onClick={onDecline}
          >
            Decline
          </Button>
          <Button
            size="sm"
            leftIcon={<Check size={16} />}
            loading={accepting}
            disabled={declining}
            onClick={onAccept}
          >
            Accept Ride
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

function InvitationsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-28 w-full rounded-2xl" />
      ))}
    </div>
  );
}
