import { useEffect, useMemo, useState } from "react";
import {
  FileText,
  Video,
  Plus,
  Pencil,
  Trash2,
  Upload,
  KeyRound,
  X as XIcon,
} from "lucide-react";
import { PageHeader } from "@/common/components/PageHeader";
import { getApiErrorMessage } from "@/common/lib/apiError";
import {
  Badge,
  Button,
  Card,
  CardBody,
  EmptyState,
  Input,
  Modal,
  Select,
  Skeleton,
  Tabs,
  Textarea,
} from "@/common/ui";
import { useToast } from "@/common/providers/ToastProvider";
import { cn } from "@/common/lib/cn";
import { downloadCsv } from "@/common/lib/csv";
import { formatDate } from "@/common/lib/format";
import {
  useRaceViolations,
  useRecordRuling,
  useRefereeRaces,
  useViolation,
  useCreateViolation,
  useUpdateViolation,
  useDeleteViolation,
  useRaceEntries,
  useMyAssignments,
} from "../hooks";
import { humanize, uploadAttachment } from "../api";
import {
  DECISION_TYPES,
  INFRACTION_TYPES,
  PENALTY_OPTIONS,
  SEVERITY_OPTIONS,
  SEVERITY_TONE,
} from "../constants";

const TABS = [
  { key: "", label: "All" },
  { key: "PENDING", label: "Pending" },
  { key: "RESOLVED", label: "Resolved" },
];

const TYPE_FILTERS = [{ value: "", label: "All Types" }, ...INFRACTION_TYPES];

/** ms offset from race start → "M:SS". */
function fmtOffset(ms) {
  if (ms == null) return "—";
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function priorityLabel(sev) {
  if (sev === "CRITICAL") return "Critical Priority";
  if (sev === "HIGH") return "High Priority";
  return null;
}

export default function ViolationsPage() {
  const toast = useToast();
  const racesQuery = useRefereeRaces();
  const [raceId, setRaceId] = useState("");
  const [tab, setTab] = useState("");
  const [type, setType] = useState("");
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const del = useDeleteViolation();

  // Violations are filed/viewed only after the admin ends the race (FINISHED); OFFICIAL is read-only.
  const reportableRaces = useMemo(
    () =>
      (racesQuery.data ?? []).filter(
        (r) => r.status === "FINISHED" || r.status === "OFFICIAL",
      ),
    [racesQuery.data],
  );
  const canLog =
    reportableRaces.find((r) => r.raceId === raceId)?.status === "FINISHED";

  useEffect(() => {
    if (!raceId && reportableRaces.length > 0) {
      setRaceId(reportableRaces[0].raceId);
    }
  }, [reportableRaces, raceId]);

  const listQuery = useRaceViolations(raceId || null);
  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (listQuery.data ?? []).filter((r) => {
      if (tab && r.status !== tab) return false;
      if (type && r.infractionType !== type) return false;
      if (
        needle &&
        !`${r.entityLabel} ${humanize(r.infractionType)}`
          .toLowerCase()
          .includes(needle)
      )
        return false;
      return true;
    });
  }, [listQuery.data, tab, type, q]);
  const selected =
    rows.find((r) => r.violationId === selectedId) ?? rows[0] ?? null;

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
        { label: "Created", value: (r) => r.createdAt },
      ],
      rows,
    );
    toast.success(
      `Exported ${rows.length} violation${rows.length === 1 ? "" : "s"}`,
    );
  }

  return (
    <>
      <PageHeader
        title="Violation Log & Management"
        subtitle="Review pending inquiries, analyze footage, and issue official rulings."
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={exportLog}>
              <FileText size={16} /> Export Log
            </Button>
            <Button
              disabled={!raceId || !canLog}
              title={
                !canLog
                  ? "Violations can be logged only after the admin ends the race"
                  : undefined
              }
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus size={16} /> Log Violation
            </Button>
          </div>
        }
      />

      {/* Filter bar */}
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="w-full sm:w-64">
          <Select
            label="Race"
            value={raceId}
            onChange={(e) => {
              setRaceId(e.target.value);
              setSelectedId(null);
            }}
            options={
              reportableRaces.length === 0
                ? [{ value: "", label: "No finished races yet" }]
                : reportableRaces.map((r) => ({
                    value: r.raceId,
                    label: `${r.raceCode ?? r.raceId.slice(0, 6)} · ${r.name}`,
                  }))
            }
          />
        </div>
        <div className="w-full sm:w-52">
          <Select
            label="Infraction type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={TYPE_FILTERS}
          />
        </div>
        <div className="w-full sm:min-w-56 flex-1">
          <Input
            label="Search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search entity or infraction…"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* LEFT — inquiries table */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Tabs tabs={TABS} active={tab} onChange={setTab} />
          <Card>
            <CardBody className="p-0">
              {listQuery.isPending ? (
                <div className="flex flex-col gap-2 p-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-xl" />
                  ))}
                </div>
              ) : listQuery.isError ? (
                <EmptyState
                  title="Could not load violations"
                  description="Please reload the page."
                />
              ) : rows.length === 0 ? (
                <EmptyState
                  title="No inquiries"
                  description="Nothing to review here."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                        <th className="px-4 py-3 font-medium">Severity</th>
                        <th className="px-4 py-3 font-medium">
                          Infraction &amp; Entity
                        </th>
                        <th className="px-4 py-3 font-medium">Time / Turn</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {rows.map((row) => (
                        <ViolationRow
                          key={row.violationId}
                          row={row}
                          active={selected?.violationId === row.violationId}
                          onSelect={() => setSelectedId(row.violationId)}
                          onEdit={() => {
                            setEditing(row);
                            setFormOpen(true);
                          }}
                          onDelete={() => setDeleting(row)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* RIGHT — inquiry details */}
        <aside>
          {selected ? (
            <InquiryDetails
              key={selected.violationId}
              violationId={selected.violationId}
            />
          ) : (
            <Card>
              <CardBody>
                <p className="text-sm text-muted">
                  Select an inquiry to view details.
                </p>
              </CardBody>
            </Card>
          )}
        </aside>
      </div>

      {(formOpen || editing) && raceId && (
        <ViolationFormModal
          raceId={raceId}
          editing={editing}
          onClose={() => {
            setFormOpen(false);
            setEditing(null);
          }}
        />
      )}

      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete violation?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={del.isPending}
              onClick={() => {
                if (!deleting) return;
                del.mutate(deleting.violationId, {
                  onSuccess: () => {
                    toast.success("Violation deleted");
                    setDeleting(null);
                  },
                });
              }}
            >
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">
          Delete this {humanize(deleting?.infractionType ?? "")} violation? This
          cannot be undone.
        </p>
      </Modal>
    </>
  );
}

function ViolationRow({ row, active, onSelect, onEdit, onDelete }) {
  return (
    <tr
      className={cn(
        "transition-colors",
        active ? "bg-brand-50" : "hover:bg-subtle/60",
      )}
    >
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
        <Badge tone={row.status === "RESOLVED" ? "success" : "warning"}>
          {row.status}
        </Badge>
      </td>
      <td className="px-4 py-3 align-top text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={onSelect}
            className="mr-1 text-xs font-medium text-brand-700 hover:text-brand-800"
          >
            Review →
          </button>
          <button
            type="button"
            aria-label="Edit violation"
            onClick={onEdit}
            className="rounded-md p-1.5 text-muted hover:bg-subtle hover:text-ink"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            aria-label="Delete violation"
            onClick={onDelete}
            className="rounded-md p-1.5 text-muted hover:bg-subtle hover:text-danger"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}

function ViolationFormModal({ raceId, editing, onClose }) {
  const toast = useToast();
  const entries = useRaceEntries(editing ? null : raceId); // entry picker only needed when creating
  const myAssignments = useMyAssignments();
  const create = useCreateViolation(raceId);
  const update = useUpdateViolation();
  const isEdit = !!editing;
  const myCode =
    myAssignments.data?.find((a) => a.raceId === raceId)?.refCode ?? null;
  const [entryId, setEntryId] = useState("");
  const [infractionType, setInfractionType] = useState(
    editing?.infractionType ?? "BUMPING",
  );
  const [severity, setSeverity] = useState(editing?.severity ?? "MEDIUM");
  const [turnNo, setTurnNo] = useState(
    editing?.turnNo != null ? String(editing.turnNo) : "",
  );
  const [remarks, setRemarks] = useState("");
  const [code, setCode] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  function pickFile(f) {
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function submit() {
    // Upload the violation photo first (if any), then attach its id. This is a raw api call
    // (not a react-query mutation), so its failure is toasted here rather than by the global handler.
    let footageAttachmentId;
    if (file) {
      setUploading(true);
      try {
        const up = await uploadAttachment(file, "VIOLATION");
        footageAttachmentId = up.attachmentId;
      } catch (e) {
        setUploading(false);
        toast.error(getApiErrorMessage(e));
        return;
      }
      setUploading(false);
    }

    const body = {
      entryId: entryId || undefined,
      infractionType,
      severity,
      turnNo: turnNo ? Number(turnNo) : undefined,
      remarks: remarks.trim() || undefined,
      footageAttachmentId,
    };

    if (isEdit) {
      update.mutate(
        { violationId: editing.violationId, body },
        {
          onSuccess: () => {
            toast.success("Violation updated");
            onClose();
          },
        },
      );
    } else {
      if (!entryId) {
        toast.error("Select the runner involved");
        return;
      }
      if (!code.trim()) {
        toast.error("Enter your referee race code to submit");
        return;
      }
      create.mutate(
        { ...body, refCode: code.trim() },
        {
          onSuccess: () => {
            toast.success("Violation logged");
            onClose();
          },
        },
      );
    }
  }

  const busy = create.isPending || update.isPending || uploading;

  return (
    <Modal
      open
      onClose={onClose}
      title={isEdit ? "Edit Violation" : "Log Violation"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={busy} onClick={submit}>
            {isEdit ? "Save Changes" : "Log Violation"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {!isEdit && (
          <Select
            label="Runner involved"
            value={entryId}
            onChange={(e) => setEntryId(e.target.value)}
            options={[
              {
                value: "",
                label: entries.isPending
                  ? "Loading runners…"
                  : "— select a runner —",
              },
              ...(entries.data ?? []).map((en) => ({
                value: en.entryId,
                label: `#${en.entryNo ?? "?"} ${en.horseName}`,
              })),
            ]}
          />
        )}
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
        <Input
          label="Turn no."
          type="number"
          value={turnNo}
          onChange={(e) => setTurnNo(e.target.value)}
        />
        <Textarea
          label="Remarks"
          rows={3}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="What happened…"
        />

        {/* Violation photo */}
        <div>
          <p className="mb-1 text-sm font-medium text-ink">Violation photo</p>
          {preview ? (
            <div className="relative w-fit">
              <img
                src={preview}
                alt="Violation evidence"
                className="h-32 rounded-lg border border-border object-cover"
              />
              <button
                type="button"
                aria-label="Remove photo"
                onClick={() => pickFile(null)}
                className="absolute -right-2 -top-2 rounded-full bg-danger p-1 text-white shadow"
              >
                <XIcon size={12} />
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border bg-subtle/40 px-3 py-3 text-sm text-muted hover:bg-subtle">
              <Upload size={16} /> Attach a photo of the incident (PNG/JPG,
              ≤5MB)
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
              />
            </label>
          )}
        </div>

        {/* Per-race referee code (required to submit a new violation) */}
        {!isEdit && (
          <div className="rounded-lg border border-brand-200 bg-brand-50 p-3">
            <div className="flex items-center gap-2">
              <KeyRound size={14} className="text-brand-700" />
              <p className="text-sm font-medium text-ink">Referee race code</p>
              {myCode && (
                <span className="ml-auto font-mono text-xs font-semibold text-brand-800">
                  Issued: {myCode}
                </span>
              )}
            </div>
            <Input
              className="mt-2"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter your code to file this report"
            />
          </div>
        )}
      </div>
    </Modal>
  );
}

function InquiryDetails({ violationId }) {
  const { data, isPending, isError } = useViolation(violationId);

  return (
    <Card>
      <CardBody className="flex flex-col gap-4">
        <h2 className="font-semibold text-ink">Inquiry Details</h2>

        {isPending ? (
          <Skeleton className="h-64 w-full rounded-xl" />
        ) : isError || !data ? (
          <p className="text-sm text-muted">Could not load the inquiry.</p>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              {priorityLabel(data.severity) && (
                <Badge tone="danger">{priorityLabel(data.severity)}</Badge>
              )}
              <Badge tone={SEVERITY_TONE[data.severity]}>{data.severity}</Badge>
              <Badge tone={data.status === "RESOLVED" ? "success" : "warning"}>
                {data.status}
              </Badge>
            </div>

            <div>
              <p className="text-sm font-semibold text-ink">
                {humanize(data.infractionType)}
              </p>
              <p className="text-xs text-muted">
                {data.horseName ?? "—"}
                {data.jockeyName ? ` · ${data.jockeyName}` : ""}
                {data.turnNo != null ? ` · Turn ${data.turnNo}` : ""}
                {` · ${fmtOffset(data.raceTimeOffsetMs)}`}
              </p>
            </div>

            {/* Incident footage */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Incident Footage
              </p>
              <div className="mt-2 flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-border bg-brand-900 text-white/60">
                {data.footageUrl ? (
                  <a
                    href={data.footageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block h-full w-full"
                  >
                    <img
                      src={data.footageUrl}
                      alt="Violation evidence"
                      className="h-full w-full object-contain"
                    />
                  </a>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Video size={28} />
                    <span className="text-xs">No footage attached</span>
                  </div>
                )}
              </div>
            </div>

            {/* Live monitor notes */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Live Monitor Notes
              </p>
              <p className="mt-1 rounded-xl border border-border bg-subtle/40 p-3 text-sm text-ink">
                {data.remarks?.trim() ||
                  "No notes recorded during the live monitor."}
              </p>
            </div>

            {/* Regulatory reference */}
            {(data.regulatoryRef || data.regulatoryText) && (
              <div className="rounded-xl border border-border bg-subtle/40 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Regulatory Reference
                </p>
                {data.regulatoryRef && (
                  <p className="mt-1 text-sm font-medium text-ink">
                    {data.regulatoryRef}
                  </p>
                )}
                {data.regulatoryText && (
                  <p className="mt-1 text-xs text-muted">
                    {data.regulatoryText}
                  </p>
                )}
              </div>
            )}

            {/* Official ruling */}
            {data.ruling ? (
              <div className="rounded-xl border border-brand-700 bg-brand-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Official Ruling
                </p>
                <p className="mt-1 text-sm font-medium text-ink">
                  {humanize(data.ruling.decisionType)}
                  {data.ruling.penaltyType
                    ? ` · ${humanize(data.ruling.penaltyType)}`
                    : ""}
                  {data.ruling.penaltyValue
                    ? ` (${data.ruling.penaltyValue})`
                    : ""}
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  {data.ruling.ruledByName ?? "—"}
                  {data.ruling.ruledAt
                    ? ` · ${formatDate(data.ruling.ruledAt)}`
                    : ""}
                </p>
              </div>
            ) : (
              <RulingForm violationId={violationId} />
            )}
          </>
        )}
      </CardBody>
    </Card>
  );
}

function RulingForm({ violationId }) {
  const toast = useToast();
  const ruling = useRecordRuling(violationId);
  const [decisionType, setDecisionType] = useState("PENALTY_APPLIED");
  const [penaltyType, setPenaltyType] = useState("TIME_PENALTY");
  const [notes, setNotes] = useState("");

  function submit() {
    ruling.mutate(
      { decisionType, penaltyType, rulingNotes: notes.trim() || undefined },
      {
        onSuccess: () => toast.success("Ruling recorded"),
      },
    );
  }

  return (
    <div className="flex flex-col gap-3 border-t border-border pt-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        Official Ruling
      </p>
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
    </div>
  );
}
