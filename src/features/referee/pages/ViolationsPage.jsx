import { useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import { FileText, Play, Video } from "lucide-react";
import { PageHeader } from "@/common/components/PageHeader";
import {
  Badge,
  Button,
  Card,
  CardBody,
  EmptyState,
  Input,
  Select,
  Skeleton,
  Tabs,
  Textarea
} from "@/common/ui";
import { useToast } from "@/common/providers/ToastProvider";
import { cn } from "@/common/lib/cn";
import { downloadCsv } from "@/common/lib/csv";
import { formatDate } from "@/common/lib/format";
import { useRaceViolations, useRecordRuling, useRefereeRaces, useViolation } from "../hooks";
import { humanize } from "../api";
import { DECISION_TYPES, INFRACTION_TYPES, PENALTY_OPTIONS, SEVERITY_TONE } from "../constants";
const TABS = [
  { key: "", label: "All" },
  { key: "PENDING", label: "Pending" },
  { key: "RESOLVED", label: "Resolved" }
];
const TYPE_FILTERS = [{ value: "", label: "All Types" }, ...INFRACTION_TYPES];
function fmtOffset(ms) {
  if (ms == null) return "\u2014";
  const m = Math.floor(ms / 6e4);
  const s = Math.floor(ms % 6e4 / 1e3);
  return `${m}:${String(s).padStart(2, "0")}`;
}
function priorityLabel(sev) {
  if (sev === "CRITICAL") return "Critical Priority";
  if (sev === "HIGH") return "High Priority";
  return null;
}
function ViolationsPage() {
  const toast = useToast();
  const racesQuery = useRefereeRaces();
  const [raceId, setRaceId] = useState("");
  const [tab, setTab] = useState("");
  const [type, setType] = useState("");
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  useEffect(() => {
    if (!raceId && racesQuery.data && racesQuery.data.length > 0) {
      setRaceId(racesQuery.data[0].raceId);
    }
  }, [racesQuery.data, raceId]);
  const listQuery = useRaceViolations(raceId || null);
  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (listQuery.data ?? []).filter((r) => {
      if (tab && r.status !== tab) return false;
      if (type && r.infractionType !== type) return false;
      if (needle && !`${r.entityLabel} ${humanize(r.infractionType)}`.toLowerCase().includes(needle))
        return false;
      return true;
    });
  }, [listQuery.data, tab, type, q]);
  const selected = rows.find((r) => r.violationId === selectedId) ?? rows[0] ?? null;
  function exportLog() {
    if (rows.length === 0) {
      toast.error("Nothing to export");
      return;
    }
    downloadCsv(
      "violation-log.csv",
      [
        { label: "Severity", value: (r) => r.severity },
        { label: "Infraction", value: (r) => humanize(r.infractionType) },
        { label: "Entity", value: (r) => r.entityLabel },
        { label: "Turn", value: (r) => r.turnNo ?? "" },
        { label: "Race time (ms)", value: (r) => r.raceTimeOffsetMs ?? "" },
        { label: "Status", value: (r) => r.status },
        { label: "Created", value: (r) => r.createdAt }
      ],
      rows
    );
    toast.success(`Exported ${rows.length} violation${rows.length === 1 ? "" : "s"}`);
  }
  return <>
      <PageHeader
    title="Violation Log & Management"
    subtitle="Review pending inquiries, analyze footage, and issue official rulings."
    actions={<Button variant="secondary" onClick={exportLog}>
            <FileText size={16} /> Export Log
          </Button>}
  />

      {
    /* Filter bar */
  }
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="w-64">
          <Select
    label="Race"
    value={raceId}
    onChange={(e) => {
      setRaceId(e.target.value);
      setSelectedId(null);
    }}
    options={(racesQuery.data ?? []).map((r) => ({
      value: r.raceId,
      label: `${r.raceCode ?? r.raceId.slice(0, 6)} \xB7 ${r.name}`
    }))}
  />
        </div>
        <div className="w-52">
          <Select
    label="Infraction type"
    value={type}
    onChange={(e) => setType(e.target.value)}
    options={TYPE_FILTERS}
  />
        </div>
        <div className="min-w-56 flex-1">
          <Input
    label="Search"
    value={q}
    onChange={(e) => setQ(e.target.value)}
    placeholder="Search entity or infraction…"
  />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {
    /* LEFT — inquiries table */
  }
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Tabs tabs={TABS} active={tab} onChange={setTab} />
          <Card>
            <CardBody className="p-0">
              {listQuery.isPending ? <div className="flex flex-col gap-2 p-4">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
                </div> : listQuery.isError ? <EmptyState title="Could not load violations" description="Please reload the page." /> : rows.length === 0 ? <EmptyState title="No inquiries" description="Nothing to review here." /> : <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                        <th className="px-4 py-3 font-medium">Severity</th>
                        <th className="px-4 py-3 font-medium">Infraction &amp; Entity</th>
                        <th className="px-4 py-3 font-medium">Time / Turn</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {rows.map((row) => <ViolationRow
    key={row.violationId}
    row={row}
    active={selected?.violationId === row.violationId}
    onSelect={() => setSelectedId(row.violationId)}
  />)}
                    </tbody>
                  </table>
                </div>}
            </CardBody>
          </Card>
        </div>

        {
    /* RIGHT — inquiry details */
  }
        <aside>
          {selected ? <InquiryDetails key={selected.violationId} violationId={selected.violationId} /> : <Card>
              <CardBody>
                <p className="text-sm text-muted">Select an inquiry to view details.</p>
              </CardBody>
            </Card>}
        </aside>
      </div>
    </>;
}
function ViolationRow({
  row,
  active,
  onSelect
}) {
  return <tr className={cn("transition-colors", active ? "bg-brand-50" : "hover:bg-subtle/60")}>
      <td className="px-4 py-3 align-top">
        <Badge tone={SEVERITY_TONE[row.severity]}>{row.severity}</Badge>
      </td>
      <td className="px-4 py-3 align-top">
        <p className="font-medium text-ink">{humanize(row.infractionType)}</p>
        <p className="text-xs text-muted">{row.entityLabel}</p>
      </td>
      <td className="px-4 py-3 align-top text-xs text-muted">
        <span className="font-mono">{fmtOffset(row.raceTimeOffsetMs)}</span>
        {row.turnNo != null && <span> · Turn {row.turnNo}</span>}
      </td>
      <td className="px-4 py-3 align-top">
        <Badge tone={row.status === "RESOLVED" ? "success" : "warning"}>{row.status}</Badge>
      </td>
      <td className="px-4 py-3 align-top text-right">
        <button
    type="button"
    onClick={onSelect}
    className="text-xs font-medium text-brand-700 hover:text-brand-800"
  >
          Review →
        </button>
      </td>
    </tr>;
}
function InquiryDetails({ violationId }) {
  const { data, isPending, isError } = useViolation(violationId);
  return <Card>
      <CardBody className="flex flex-col gap-4">
        <h2 className="font-semibold text-ink">Inquiry Details</h2>

        {isPending ? <Skeleton className="h-64 w-full rounded-xl" /> : isError || !data ? <p className="text-sm text-muted">Could not load the inquiry.</p> : <>
            <div className="flex flex-wrap items-center gap-2">
              {priorityLabel(data.severity) && <Badge tone="danger">{priorityLabel(data.severity)}</Badge>}
              <Badge tone={SEVERITY_TONE[data.severity]}>{data.severity}</Badge>
              <Badge tone={data.status === "RESOLVED" ? "success" : "warning"}>{data.status}</Badge>
            </div>

            <div>
              <p className="text-sm font-semibold text-ink">{humanize(data.infractionType)}</p>
              <p className="text-xs text-muted">
                {data.horseName ?? "\u2014"}
                {data.jockeyName ? ` \xB7 ${data.jockeyName}` : ""}
                {data.turnNo != null ? ` \xB7 Turn ${data.turnNo}` : ""}
                {` \xB7 ${fmtOffset(data.raceTimeOffsetMs)}`}
              </p>
            </div>

            {
    /* Incident footage */
  }
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Incident Footage</p>
              <div className="mt-2 flex aspect-video items-center justify-center rounded-xl border border-border bg-brand-900 text-white/60">
                {data.footageUrl ? <a
    href={data.footageUrl}
    target="_blank"
    rel="noreferrer"
    className="flex flex-col items-center gap-2 hover:text-white"
  >
                    <Play size={28} />
                    <span className="text-xs">Play incident footage</span>
                  </a> : <div className="flex flex-col items-center gap-2">
                    <Video size={28} />
                    <span className="text-xs">No footage attached</span>
                  </div>}
              </div>
            </div>

            {
    /* Live monitor notes */
  }
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Live Monitor Notes</p>
              <p className="mt-1 rounded-xl border border-border bg-subtle/40 p-3 text-sm text-ink">
                {data.remarks?.trim() || "No notes recorded during the live monitor."}
              </p>
            </div>

            {
    /* Regulatory reference */
  }
            {(data.regulatoryRef || data.regulatoryText) && <div className="rounded-xl border border-border bg-subtle/40 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Regulatory Reference</p>
                {data.regulatoryRef && <p className="mt-1 text-sm font-medium text-ink">{data.regulatoryRef}</p>}
                {data.regulatoryText && <p className="mt-1 text-xs text-muted">{data.regulatoryText}</p>}
              </div>}

            {
    /* Official ruling */
  }
            {data.ruling ? <div className="rounded-xl border border-brand-700 bg-brand-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Official Ruling</p>
                <p className="mt-1 text-sm font-medium text-ink">
                  {humanize(data.ruling.decisionType)}
                  {data.ruling.penaltyType ? ` \xB7 ${humanize(data.ruling.penaltyType)}` : ""}
                  {data.ruling.penaltyValue ? ` (${data.ruling.penaltyValue})` : ""}
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  {data.ruling.ruledByName ?? "\u2014"}
                  {data.ruling.ruledAt ? ` \xB7 ${formatDate(data.ruling.ruledAt)}` : ""}
                </p>
              </div> : <RulingForm violationId={violationId} />}
          </>}
      </CardBody>
    </Card>;
}
function RulingForm({ violationId }) {
  const toast = useToast();
  const ruling = useRecordRuling(violationId);
  const [decisionType, setDecisionType] = useState("PENALTY_APPLIED");
  const [penaltyType, setPenaltyType] = useState("TIME_PENALTY");
  const [notes, setNotes] = useState("");
  function submit() {
    ruling.mutate(
      { decisionType, penaltyType, rulingNotes: notes.trim() || void 0 },
      {
        onSuccess: () => toast.success("Ruling recorded"),
        onError: (err) => toast.error(errorMessage(err))
      }
    );
  }
  return <div className="flex flex-col gap-3 border-t border-border pt-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">Official Ruling</p>
      <Select
    label="Decision type"
    value={decisionType}
    onChange={(e) => setDecisionType(e.target.value)}
    options={DECISION_TYPES}
  />
      <Select
    label="Select penalty"
    value={penaltyType}
    onChange={(e) => setPenaltyType(e.target.value)}
    options={PENALTY_OPTIONS}
  />
      <Textarea
    label="Ruling notes"
    rows={3}
    value={notes}
    onChange={(e) => setNotes(e.target.value)}
    placeholder="Detail the ruling…"
  />
      <Button onClick={submit} loading={ruling.isPending}>
        Issue Ruling
      </Button>
    </div>;
}
function errorMessage(err) {
  if (isAxiosError(err)) {
    const s = err.response?.status;
    if (s === 409) return "This inquiry was already ruled.";
    if (s === 403) return "You are not authorized to issue rulings.";
  }
  return "Something went wrong. Please try again.";
}
export {
  ViolationsPage as default
};
