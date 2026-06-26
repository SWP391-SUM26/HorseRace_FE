import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Flag, Mail, Rabbit, Trophy } from "lucide-react";
import { PageHeader } from "@/common/components/PageHeader";
import { Badge, Button, Card, CardBody, CardHeader, EmptyState, Skeleton } from "@/common/ui";
import { useAuth } from "@/common/hooks/useAuth";
import { getHorses } from "@/services/horse";
import { getInvitationList } from "@/services/jockey";
import { getRaceList } from "@/services/race";

function getUserId(user) {
  return user?.id || user?.userId || user?.user_id || "";
}

function formatDate(value) {
  if (!value) return "TBA";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function Overview() {
  const { user } = useAuth();
  const ownerId = getUserId(user);
  const [horses, setHorses] = useState([]);
  const [races, setRaces] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadOverview() {
      setLoading(true);
      setError("");
      try {
        const [horseData, raceData, invitationData] = await Promise.all([
          getHorses(),
          getRaceList({ page: 1, pageSize: 5, sortBy: "scheduledStartAt", sortOrder: "asc" }),
          ownerId ? getInvitationList({ ownerId, page: 1, pageSize: 5 }) : Promise.resolve({ items: [] }),
        ]);

        if (!active) return;
        setHorses(horseData || []);
        setRaces(raceData?.items || []);
        setInvitations(invitationData?.items || []);
      } catch (requestError) {
        if (active) setError(requestError?.response?.data?.message || requestError.message || "Unable to load owner overview.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadOverview();
    return () => {
      active = false;
    };
  }, [ownerId]);

  const kpis = useMemo(() => {
    const activeHorses = horses.filter((horseItem) =>
      ["ACTIVE", "FIT TO RACE", "HEALTHY"].includes(String(horseItem.status || horseItem.healthStatus).toUpperCase()),
    ).length;
    const pendingInvites = invitations.filter((invitation) => invitation.status === "INVITED").length;

    return [
      { label: "Total Horses", value: horses.length, icon: Rabbit, tone: "success" },
      { label: "Active Horses", value: activeHorses, icon: Trophy, tone: "info" },
      { label: "Upcoming Races", value: races.length, icon: CalendarDays, tone: "warning" },
      { label: "Pending Invites", value: pendingInvites, icon: Mail, tone: "neutral" },
    ];
  }, [horses, invitations, races]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Owner Overview"
        subtitle={`Welcome back, ${user?.fullName || user?.email || "Owner"}. Review your stable, races, and invitations.`}
        actions={
          <Link to="/owner/stable">
            <Button>Register Horse</Button>
          </Link>
        }
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-danger">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-32 rounded-2xl" />)
          : kpis.map(({ label, value, icon: Icon, tone }) => (
              <Card key={label}>
                <CardBody className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
                    <strong className="mt-4 block text-4xl font-semibold text-ink">{value}</strong>
                  </div>
                  <Badge tone={tone}>
                    <Icon size={14} />
                  </Badge>
                </CardBody>
              </Card>
            ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">Stable Summary</h2>
            <Link className="text-sm font-semibold text-success" to="/owner/stable">
              View Stable
            </Link>
          </CardHeader>
          <CardBody>
            {loading ? (
              <Skeleton className="h-64 rounded-xl" />
            ) : horses.length === 0 ? (
              <EmptyState title="No horses found" description="Register your first horse to start building your stable." />
            ) : (
              <div className="divide-y divide-border">
                {horses.slice(0, 5).map((horseItem) => (
                  <div key={horseItem.id || horseItem.horseId} className="flex items-center justify-between gap-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                        <Rabbit size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-ink">{horseItem.name}</p>
                        <p className="text-sm text-muted">{horseItem.breed || horseItem.details || "Horse profile"}</p>
                      </div>
                    </div>
                    <Badge tone={String(horseItem.status).includes("FIT") ? "success" : "neutral"}>
                      {horseItem.status || "ACTIVE"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">Upcoming Races</h2>
            <Link className="text-sm font-semibold text-success" to="/owner/race-schedule">
              View All
            </Link>
          </CardHeader>
          <CardBody>
            {loading ? (
              <Skeleton className="h-64 rounded-xl" />
            ) : races.length === 0 ? (
              <EmptyState title="No scheduled races" />
            ) : (
              <div className="space-y-4">
                {races.slice(0, 4).map((race) => (
                  <div key={race.raceId || race.id} className="rounded-xl border border-border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-ink">{race.name || race.raceCode}</p>
                        <p className="text-sm text-muted">{race.tournamentName}</p>
                      </div>
                      <Flag size={18} className="text-muted" />
                    </div>
                    <p className="mt-3 text-sm text-muted">{formatDate(race.scheduledStartAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
