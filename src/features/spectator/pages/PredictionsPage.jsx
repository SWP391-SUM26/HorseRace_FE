import { useMemo, useState } from "react";
import { Lightbulb, Clock } from "lucide-react";
import { Badge, Button, Card, CardBody, DataTable, EmptyState, Select, Skeleton, Tabs } from "@/common/ui";
import { PageHeader } from "@/common/components/PageHeader";
import { useToast } from "@/common/providers/ToastProvider";
import { useMyPredictions, useRaceEntries, useSpectatorRaces, useSubmitPrediction, useCancelPrediction } from "../hooks";
import { BettingPanel } from "../components/BettingPanel";
import { canPredict, errorMessage, parseOdds, PREDICTION_STATUS_META, PREDICTION_TYPE_OPTIONS } from "../constants";
const SUB_TYPES = PREDICTION_TYPE_OPTIONS.map((o) => o.value);
function fmtTime(iso) {
  if (!iso) return "TBD";
  return new Date(iso).toLocaleString("vi-VN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}
function PredictionsPage() {
  const toast = useToast();
  const [tab, setTab] = useState("upcoming");
  const racesQuery = useSpectatorRaces();
  const openRaces = useMemo(
    () => (racesQuery.data?.rows ?? []).filter((r) => r.status === "SCHEDULED" || r.status === "OPEN"),
    [racesQuery.data]
  );
  const [raceId, setRaceId] = useState(null);
  const selectedRace = useMemo(
    () => openRaces.find((r) => r.raceId === raceId) ?? openRaces[0] ?? null,
    [openRaces, raceId]
  );
  const activeRaceId = selectedRace?.raceId ?? null;
  const entriesQuery = useRaceEntries(activeRaceId);
  const entries = entriesQuery.data ?? [];
  const [selectedEntryId, setSelectedEntryId] = useState(null);
  const [predictionType, setPredictionType] = useState("WIN");
  const [stake, setStake] = useState(100);
  const selectedEntry = entries.find((e) => e.entryId === selectedEntryId) ?? null;
  const oddsMultiplier = parseOdds(selectedEntry?.odds ?? null);
  const submit = useSubmitPrediction();
  const open = canPredict(selectedRace?.status);
  function pick(entry, type) {
    setSelectedEntryId(entry.entryId);
    setPredictionType(type);
  }
  function confirm() {
    if (!selectedRace || !selectedEntry) return;
    submit.mutate(
      {
        raceId: selectedRace.raceId,
        predictedEntryId: selectedEntry.entryId,
        predictionType,
        stakeAmount: stake
      },
      {
        onSuccess: (p) => toast.success(
          `Prediction confirmed \u2014 locked odds ${p.lockedOdds ?? "\u2014"}, potential payout ${p.potentialPayout?.toLocaleString("vi-VN") ?? "\u2014"}`
        ),
        onError: (e) => toast.error(errorMessage(e))
      }
    );
  }
  return <div className="space-y-6">
      <PageHeader title="Race Predictions" subtitle="Study the field, pick your runner, and place a prediction into an open pool." />

      <Tabs
    tabs={[
      { key: "upcoming", label: "Upcoming Races" },
      { key: "active", label: "My Active Predictions" }
    ]}
    active={tab}
    onChange={setTab}
  />

      {tab === "upcoming" ? <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-5">
            {racesQuery.isLoading ? <Skeleton className="h-28 w-full rounded-2xl" /> : openRaces.length === 0 ? <EmptyState title="No open races" description="There are no races currently open for predictions." /> : <>
                {
    /* Race header card */
  }
                <Card>
                  <CardBody className="space-y-3">
                    {openRaces.length > 1 && <Select
    aria-label="Select race"
    options={openRaces.map((r) => ({ value: r.raceId, label: r.name ?? r.raceCode ?? r.raceId }))}
    value={activeRaceId ?? ""}
    onChange={(e) => {
      setRaceId(e.target.value);
      setSelectedEntryId(null);
    }}
  />}
                    {selectedRace && <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <Badge tone="info">{selectedRace.raceType ?? "Feature"}</Badge>
                          <h2 className="mt-2 text-xl font-semibold text-ink">
                            {selectedRace.name ?? selectedRace.raceCode}
                          </h2>
                          <p className="text-sm text-muted">
                            {selectedRace.venueName ?? selectedRace.venue ?? "\u2014"} •{" "}
                            {selectedRace.distanceMeter ? `${selectedRace.distanceMeter}m` : "\u2014"}
                          </p>
                          <p className="mt-1 text-sm text-muted">Post: {fmtTime(selectedRace.scheduledStartAt)}</p>
                        </div>
                        <span className="flex items-center gap-1.5 text-sm font-semibold text-danger">
                          <Clock className="h-4 w-4" /> Pool {selectedRace.status}
                        </span>
                      </div>}
                  </CardBody>
                </Card>

                {
    /* Field & predictions */
  }
                <Card>
                  <CardBody>
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Field & Predictions</h3>
                    {entriesQuery.isLoading ? <Skeleton className="h-40 w-full" /> : entries.length === 0 ? <EmptyState title="No runners" description="This race has no confirmed entries yet." /> : <ul className="space-y-2">
                        {entries.map((e) => {
    const active = e.entryId === selectedEntryId;
    return <li
      key={e.entryId}
      className={`rounded-xl border p-3 transition-colors ${active ? "border-brand-600 bg-brand-50" : "border-border bg-surface"}`}
    >
                              <div className="flex items-center gap-3">
                                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-subtle text-sm font-bold text-ink">
                                  {e.entryNo ?? "\u2014"}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate font-medium text-ink">{e.horseName ?? "Unknown"}</p>
                                  <p className="truncate text-xs text-muted">
                                    J: {e.jockeyName ?? "TBD"} • Form: {e.recentForm ?? "\u2014"}
                                  </p>
                                </div>
                                <span className="rounded-full bg-subtle px-2.5 py-1 text-xs font-semibold text-ink">
                                  Odds: {e.odds ?? "\u2014"}
                                </span>
                              </div>
                              <div className="mt-2 flex gap-2">
                                {SUB_TYPES.map((t) => {
      const on = active && predictionType === t;
      return <button
        key={t}
        type="button"
        disabled={!open}
        onClick={() => pick(e, t)}
        className={`h-8 flex-1 rounded-lg text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${on ? "bg-brand-700 text-white" : "bg-subtle text-ink hover:bg-border"}`}
      >
                                      {t}
                                    </button>;
    })}
                              </div>
                            </li>;
  })}
                      </ul>}
                  </CardBody>
                </Card>

                {
    /* Expert insight — STATIC (no BE endpoint) */
  }
                <Card>
                  <CardBody className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                      <Lightbulb className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted">Expert Insight</p>
                      <p className="mt-1 text-sm text-ink">
                        Analyst commentary is a preview placeholder — no live tipping feed is wired yet. Study the
                        odds and recent form above before staking.
                      </p>
                    </div>
                  </CardBody>
                </Card>
              </>}
          </div>

          {
    /* Right: betting panel */
  }
          <div className="lg:sticky lg:top-4 lg:self-start">
            <BettingPanel
    raceStatus={selectedRace?.status}
    selectionLabel={selectedEntry ? `${selectedEntry.horseName ?? "Runner"} \xB7 ${predictionType}` : null}
    oddsLabel={selectedEntry?.odds ?? null}
    oddsMultiplier={oddsMultiplier}
    stake={stake}
    onStakeChange={setStake}
    predictionType={predictionType}
    onTypeChange={setPredictionType}
    onConfirm={confirm}
    submitting={submit.isPending}
  />
          </div>
        </div> : <ActivePredictions />}
    </div>;
}
function ActivePredictions() {
  const toast = useToast();
  const query = useMyPredictions();
  const cancel = useCancelPrediction();
  const rows = (query.data ?? []).filter((p) => p.status === "PENDING" || p.status === "CONFIRMED");
  const columns = [
    {
      key: "race",
      header: "Race",
      render: (p) => <span className="font-medium text-ink">{p.raceName ?? p.raceCode ?? p.raceId}</span>
    },
    { key: "type", header: "Type", render: (p) => p.predictionType },
    { key: "stake", header: "Stake", render: (p) => p.stakeAmount.toLocaleString("vi-VN") },
    { key: "odds", header: "Locked Odds", render: (p) => p.lockedOdds ?? "\u2014" },
    {
      key: "payout",
      header: "Potential",
      render: (p) => p.potentialPayout != null ? p.potentialPayout.toLocaleString("vi-VN") : "\u2014"
    },
    { key: "status", header: "Status", render: (p) => <Badge tone={PREDICTION_STATUS_META[p.status].tone}>{PREDICTION_STATUS_META[p.status].label}</Badge> },
    {
      key: "actions",
      header: "",
      render: (p) => <Button
        size="sm"
        variant="ghost"
        loading={cancel.isPending}
        onClick={() => cancel.mutate(p.predictionId, {
          onSuccess: () => toast.success("Prediction cancelled"),
          onError: (e) => toast.error(errorMessage(e))
        })}
      >
          Cancel
        </Button>
    }
  ];
  return <Card>
      <CardBody>
        <DataTable
    rows={rows}
    columns={columns}
    rowKey={(p) => p.predictionId}
    loading={query.isLoading}
    emptyLabel="No active predictions"
  />
      </CardBody>
    </Card>;
}
export {
  PredictionsPage as default
};
