import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Radio, Video } from "lucide-react";
import { isAxiosError } from "axios";
import { PageHeader } from "@/common/components/PageHeader";
import { Badge, Button, Card, CardBody, EmptyState, Input, Modal, Select, Skeleton, Textarea } from "@/common/ui";
import { useToast } from "@/common/providers/ToastProvider";
import { cn } from "@/common/lib/cn";
import { useCreateViolation, useLiveRace, useRaceViolations, useRefereeRaces } from "../hooks";
import { humanize } from "../api";
import { INFRACTION_TYPES, SEVERITY_OPTIONS } from "../constants";
function fmtClock(ms) {
  if (ms == null) return "00:00.0";
  const m = Math.floor(ms / 6e4);
  const s = Math.floor(ms % 6e4 / 1e3);
  const d = Math.floor(ms % 1e3 / 100);
  const p = (n) => String(n).padStart(2, "0");
  return `${p(m)}:${p(s)}.${d}`;
}
function fmtTime(iso) {
  const dt = new Date(iso);
  const p = (n) => String(n).padStart(2, "0");
  return `${p(dt.getUTCHours())}:${p(dt.getUTCMinutes())}:${p(dt.getUTCSeconds())}`;
}
const QUICK_TAGS = ["BUMPING", "INTERFERENCE", "WHIP_USAGE"];
function LiveRaceMonitorPage() {
  const racesQuery = useRefereeRaces();
  const [raceId, setRaceId] = useState("");
  const [violationOpen, setViolationOpen] = useState(false);
  const [presetType, setPresetType] = useState("WHIP_USAGE");
  useEffect(() => {
    if (!raceId && racesQuery.data && racesQuery.data.length > 0) {
      setRaceId(racesQuery.data[0].raceId);
    }
  }, [racesQuery.data, raceId]);
  const liveQuery = useLiveRace(raceId || null);
  const violationsQuery = useRaceViolations(raceId || null);
  const live = liveQuery.data;
  const race = racesQuery.data?.find((r) => r.raceId === raceId);
  const log = violationsQuery.data ?? [];
  function openViolation(type) {
    setPresetType(type);
    setViolationOpen(true);
  }
  return <>
      <PageHeader
    title={race ? race.name : "Live Race Monitor"}
    subtitle={race ? `${race.trackCondition ?? "Live"} \xB7 officiating` : "Monitor the running race in real time."}
    actions={<div className="flex items-center gap-3">
            {live?.raceClockMs != null && <span className="inline-flex items-center gap-2">
                <Badge tone="danger">● LIVE</Badge>
                <span className="font-mono text-lg font-semibold tabular-nums text-ink">
                  {fmtClock(live.raceClockMs)}
                </span>
              </span>}
            <Button variant="danger" disabled={!raceId} onClick={() => openViolation("WHIP_USAGE")}>
              Record Violation
            </Button>
          </div>}
  />

      <div className="mb-4 w-72">
        <Select
    label="Race"
    value={raceId}
    onChange={(e) => setRaceId(e.target.value)}
    options={(racesQuery.data ?? []).map((r) => ({
      value: r.raceId,
      label: `${r.raceCode ?? r.raceId.slice(0, 6)} \xB7 ${r.name}`
    }))}
  />
      </div>

      {liveQuery.isPending ? <Skeleton className="h-72 w-full rounded-2xl" /> : liveQuery.isError || !live ? <EmptyState title="No live feed" description="The live monitor is unavailable for this race." /> : <div className="grid gap-6 lg:grid-cols-3">
          {
    /* LEFT — feed + running order */
  }
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardBody className="flex flex-col gap-4">
                {
    /* video feed with overlays */
  }
                <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-border bg-brand-900 text-white/60">
                  <div className="absolute left-3 top-3 flex gap-2">
                    <span className="rounded-md bg-black/50 px-2 py-0.5 text-xs text-white">CAM 1: WIDE</span>
                    <span className="rounded-md bg-black/50 px-2 py-0.5 text-xs text-white">
                      Wind {live.windSpeedKph ?? "\u2014"} kph {live.windDirection ?? ""}
                    </span>
                  </div>
                  {live.videoFeedUrl ? <div className="flex flex-col items-center gap-2">
                      <Video size={32} />
                      <span className="text-xs">Live stream connected</span>
                    </div> : <span className="text-sm">No video feed</span>}
                  {live.runningOrder[0]?.currentSpeedKph != null && <div className="absolute bottom-3 right-3 flex gap-4 rounded-lg bg-black/55 px-4 py-2 text-right text-white">
                      <div>
                        <p className="text-[10px] uppercase text-white/60">Current Speed</p>
                        <p className="font-mono text-lg font-semibold">{live.runningOrder[0].currentSpeedKph} km/h</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-white/60">Wind</p>
                        <p className="font-mono text-sm">{live.windSpeedKph ?? "\u2014"} kph {live.windDirection ?? ""}</p>
                      </div>
                    </div>}
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="flex flex-col gap-3">
                <h2 className="font-semibold text-ink">Live Running Order</h2>
                {live.runningOrder.length === 0 ? <p className="text-sm text-muted">Waiting for the field…</p> : <ul className="flex flex-col gap-2">
                    {live.runningOrder.map((r, i) => <li
    key={`${r.entryNo}-${i}`}
    className="flex items-center gap-3 rounded-xl border border-border px-3 py-2"
  >
                        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand-700 text-xs font-semibold text-white">
                          {r.position ?? i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-ink">{r.horseName}</p>
                          <p className="truncate text-xs text-muted">{r.jockeyName ?? "\u2014"}</p>
                        </div>
                        <span className="font-mono text-xs tabular-nums text-muted">
                          {r.currentSpeedKph != null ? `${r.currentSpeedKph} km/h` : "\u2014"}
                        </span>
                      </li>)}
                  </ul>}
              </CardBody>
            </Card>
          </div>

          {
    /* RIGHT — quick action log */
  }
          <aside>
            <Card className="flex flex-col">
              <CardBody className="flex flex-col gap-3">
                <h2 className="inline-flex items-center gap-2 font-semibold text-ink">
                  <Radio size={16} className="text-danger" /> Quick Action Log
                </h2>
                {violationsQuery.isPending ? <Skeleton className="h-24 w-full rounded" /> : log.length === 0 ? <p className="text-sm text-muted">No incidents logged yet.</p> : <ul className="flex flex-col divide-y divide-border">
                    {log.map((v) => <li key={v.violationId} className="py-3">
                        <div className="flex items-center justify-between text-xs text-muted">
                          <span className="font-mono">{fmtTime(v.createdAt)}</span>
                          <span>{v.turnNo != null ? `Turn ${v.turnNo}` : "Race"}</span>
                        </div>
                        <p className="mt-0.5 text-sm text-ink">
                          {humanize(v.infractionType)} — {v.entityLabel}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge tone={v.status === "RESOLVED" ? "success" : "warning"}>{v.status}</Badge>
                          <Link
    to="/app/referee/violations"
    className="text-xs font-medium text-brand-700 hover:text-brand-800"
  >
                            Review →
                          </Link>
                        </div>
                      </li>)}
                  </ul>}

                {
    /* quick-tag buttons */
  }
                <div className="mt-auto flex flex-wrap gap-2 border-t border-border pt-3">
                  {QUICK_TAGS.map((t) => <button
    key={t}
    type="button"
    onClick={() => openViolation(t)}
    className={cn(
      "rounded-full border border-border px-3 py-1 text-xs font-medium text-ink",
      "hover:border-brand-500 hover:bg-subtle"
    )}
  >
                      {humanize(t)}
                    </button>)}
                </div>
              </CardBody>
            </Card>
          </aside>
        </div>}

      {raceId && <RecordViolationModal
    open={violationOpen}
    onClose={() => setViolationOpen(false)}
    raceId={raceId}
    presetType={presetType}
  />}
    </>;
}
function RecordViolationModal({
  open,
  onClose,
  raceId,
  presetType
}) {
  const toast = useToast();
  const create = useCreateViolation(raceId);
  const [infractionType, setInfractionType] = useState(presetType);
  const [severity, setSeverity] = useState("MEDIUM");
  const [turnNo, setTurnNo] = useState("");
  const [remarks, setRemarks] = useState("");
  useEffect(() => {
    if (open) setInfractionType(presetType);
  }, [open, presetType]);
  function submit() {
    create.mutate(
      {
        infractionType,
        severity,
        turnNo: turnNo ? Number(turnNo) : void 0,
        remarks: remarks.trim() || void 0
      },
      {
        onSuccess: () => {
          toast.success("Violation recorded");
          onClose();
          setRemarks("");
          setTurnNo("");
        },
        onError: (err) => toast.error(errorMessage(err))
      }
    );
  }
  return <Modal
    open={open}
    onClose={onClose}
    title="Record Violation"
    footer={<>
          <Button variant="secondary" onClick={onClose} disabled={create.isPending}>
            Cancel
          </Button>
          <Button variant="danger" onClick={submit} loading={create.isPending}>
            Log violation
          </Button>
        </>}
  >
      <div className="flex flex-col gap-4">
        <Select
    label="Infraction type"
    value={infractionType}
    onChange={(e) => setInfractionType(e.target.value)}
    options={INFRACTION_TYPES}
  />
        <Select
    label="Severity"
    value={severity}
    onChange={(e) => setSeverity(e.target.value)}
    options={SEVERITY_OPTIONS}
  />
        <Input label="Turn" type="number" value={turnNo} onChange={(e) => setTurnNo(e.target.value)} placeholder="e.g. 3" />
        <Textarea
    label="Remarks"
    rows={3}
    value={remarks}
    onChange={(e) => setRemarks(e.target.value)}
    placeholder="Describe the incident…"
  />
      </div>
    </Modal>;
}
function errorMessage(err) {
  if (isAxiosError(err)) {
    const s = err.response?.status;
    if (s === 403) return "You are not authorized to record violations.";
    if (s === 400) return "Invalid violation data.";
  }
  return "Something went wrong. Please try again.";
}
export {
  LiveRaceMonitorPage as default
};
