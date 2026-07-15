import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trash2, UserPlus } from "lucide-react";
import { Avatar, Badge, Button, Card, CardBody, EmptyState, Skeleton } from "@/common/ui";
import { useToast } from "@/common/providers/ToastProvider";
import { formatDate } from "@/common/lib/format";
import { AssignPanelModal } from "../components/AssignPanelModal";
import { useRace, useRacePanel, useRemoveAssignment } from "../hooks";
import { PANEL_ROLE_OPTIONS, RACE_STATUS_LABEL, RACE_STATUS_TONE } from "../constants";
const ROLE_LABEL = Object.fromEntries(PANEL_ROLE_OPTIONS.map((o) => [o.value, o.label]));
const ROLE_TONE = {
  CHIEF: "success",
  JUDGE: "info",
  STEWARD: "warning",
  TIMEKEEPER: "neutral",
  OBSERVER: "neutral"
};
function StaffingDetailPage() {
  const { raceId = "" } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const raceQuery = useRace(raceId);
  const panelQuery = useRacePanel(raceId);
  const remove = useRemoveAssignment();
  const [adding, setAdding] = useState(false);
  const race = raceQuery.data;
  const panel = panelQuery.data ?? [];
  function onRemove(a) {
    remove.mutate(a.refAssignmentId, {
      onSuccess: () => toast.success("Referee removed from panel")
    });
  }
  return <>
      <button
    type="button"
    onClick={() => navigate("/admin/staffing")}
    className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
  >
        <ArrowLeft size={16} /> Staffing
      </button>

      {
    /* Race header */
  }
      {raceQuery.isPending ? <Skeleton className="h-24 w-full rounded-2xl" /> : raceQuery.isError || !race ? <Card><CardBody><EmptyState title="Couldn't load race" description="Go back to the staffing list." /></CardBody></Card> : <Card>
          <CardBody className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold text-ink">{race.name ?? race.raceCode}</h1>
                <Badge tone={RACE_STATUS_TONE[race.status]}>{RACE_STATUS_LABEL[race.status] ?? race.status}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted">
                {race.raceCode}{race.tournamentName ? ` \xB7 ${race.tournamentName}` : ""}
                {race.scheduledStartAt ? ` \xB7 ${formatDate(race.scheduledStartAt)}` : ""}
              </p>
            </div>
            <Button onClick={() => setAdding(true)}><UserPlus size={16} /> Assign Referees</Button>
          </CardBody>
        </Card>}

      {
    /* Panel */
  }
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-ink">
          Referee Panel{panel.length > 0 ? ` (${panel.length})` : ""}
        </h2>
      </div>

      <Card className="mt-3">
        <CardBody className="p-0">
          {panelQuery.isPending ? <div className="flex flex-col gap-2 p-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}</div> : panelQuery.isError ? <EmptyState title="Couldn't load the panel" description="Please reload the page." /> : panel.length === 0 ? <EmptyState title="No referees assigned" description="Assign referees to build this race's panel." /> : <ul className="divide-y divide-border">
              {panel.map((a) => <li key={a.refAssignmentId} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <Avatar name={a.refereeName ?? "\u2014"} src={a.refereeAvatarUrl ?? void 0} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-ink">{a.refereeName ?? "\u2014"}</p>
                    <p className="text-xs text-muted">{a.status ?? "ASSIGNED"}{a.assignedAt ? ` \xB7 ${formatDate(a.assignedAt)}` : ""}</p>
                  </div>
                  {a.refCode && <span
    title="Per-race report code issued to this referee"
    className="rounded-md border border-brand-200 bg-brand-50 px-2 py-0.5 font-mono text-xs font-semibold text-brand-800"
  >
                      {a.refCode}
                    </span>}
                  {a.panelRole ? <Badge tone={ROLE_TONE[a.panelRole] ?? "neutral"}>{ROLE_LABEL[a.panelRole] ?? a.panelRole}</Badge> : <span className="text-xs text-muted">No role</span>}
                  <Button
    size="sm"
    variant="ghost"
    className="border border-danger text-danger hover:bg-danger/10"
    loading={remove.isPending}
    onClick={() => onRemove(a)}
  >
                    <Trash2 size={14} /> Remove
                  </Button>
                </li>)}
            </ul>}
        </CardBody>
      </Card>

      {adding && race && <AssignPanelModal raceId={raceId} onClose={() => setAdding(false)} />}
    </>;
}
export {
  StaffingDetailPage as default
};
