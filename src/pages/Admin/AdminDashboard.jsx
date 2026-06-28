import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/common/components/PageHeader";
import { Badge, Card, CardBody, EmptyState, Skeleton, StatCard } from "@/common/ui";
import { getAllUsers } from "@/services/user";
import { getTournaments } from "@/services/tournament";
import { getRaceList } from "@/services/race";
import { getRegistrationList } from "@/services/registration";

function unwrapList(payload) {
  const data = payload?.data ?? payload;
  return data?.items ?? data?.content ?? data ?? [];
}

function countBy(rows, key, value) {
  return rows.filter((row) => String(row?.[key] || "").toUpperCase() === value).length;
}

function getRaceStatusTone(status) {
  const normalizedStatus = String(status || "SCHEDULED").toUpperCase();

  if (["CANCELLED", "CANCELED", "CANCLED"].includes(normalizedStatus)) {
    return "danger";
  }

  if (["OPEN", "ACTIVE", "RUNNING", "OFFICIAL", "FINISHED"].includes(normalizedStatus)) {
    return "success";
  }

  if (["CLOSED", "PAUSED", "POSTPONED"].includes(normalizedStatus)) {
    return "warning";
  }

  if (["SCHEDULED"].includes(normalizedStatus)) {
    return "info";
  }

  return "neutral";
}

export default function AdminDashboard() {
  const [state, setState] = useState({
    loading: true,
    error: "",
    users: [],
    tournaments: [],
    races: [],
    registrations: [],
  });

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      setState((current) => ({ ...current, loading: true, error: "" }));
      try {
        const [users, tournamentsResponse, racesResponse, registrationsResponse] = await Promise.all([
          getAllUsers(),
          getTournaments({ page: 0, size: 100 }),
          getRaceList({ page: 1, pageSize: 100 }),
          getRegistrationList({ page: 1, pageSize: 100 }),
        ]);

        if (!mounted) return;
        setState({
          loading: false,
          error: "",
          users: users || [],
          tournaments: unwrapList(tournamentsResponse),
          races: racesResponse?.items || [],
          registrations: registrationsResponse?.items || [],
        });
      } catch (error) {
        if (!mounted) return;
        setState((current) => ({
          ...current,
          loading: false,
          error: error?.response?.data?.message || error.message || "Unable to load admin dashboard.",
        }));
      }
    }

    loadDashboard();
    return () => {
      mounted = false;
    };
  }, []);

  const recentRaces = useMemo(
    () => [...state.races].slice(0, 5),
    [state.races],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        subtitle="System overview for users, tournaments, races, and registration activity."
      />

      {state.error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-danger">{state.error}</div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {state.loading ? (
          Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-28 rounded-2xl" />)
        ) : (
          <>
            <StatCard label="Total Users" value={state.users.length} />
            <StatCard label="Tournaments" value={state.tournaments.length} />
            <StatCard label="Races" value={state.races.length} />
            <StatCard label="Pending Registrations" value={countBy(state.registrations, "status", "SUBMITTED") + countBy(state.registrations, "status", "UNDER_REVIEW")} />
          </>
        )}
      </div>

      <Card>
        <CardBody>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">Recent Races</h2>
            <Badge tone="info">Live API</Badge>
          </div>

          {state.loading ? (
            <Skeleton className="h-56 rounded-xl" />
          ) : recentRaces.length === 0 ? (
            <EmptyState title="No race data returned" description="Create races or check the Race Management API." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                    <th className="px-4 py-3 font-medium">Race</th>
                    <th className="px-4 py-3 font-medium">Tournament</th>
                    <th className="px-4 py-3 font-medium">Schedule</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentRaces.map((race) => (
                    <tr key={race.raceId || race.id}>
                      <td className="px-4 py-3 font-semibold text-ink">{race.name || race.raceCode}</td>
                      <td className="px-4 py-3 text-muted">{race.tournamentName || "N/A"}</td>
                      <td className="px-4 py-3 text-muted">{race.scheduledStartAt ? new Date(race.scheduledStartAt).toLocaleString() : "TBA"}</td>
                      <td className="px-4 py-3">
                        <Badge tone={getRaceStatusTone(race.status)}>
                          {race.status || "SCHEDULED"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
