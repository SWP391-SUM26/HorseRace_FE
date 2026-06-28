import { useEffect, useState } from "react";
import { AlertCircle, Check, FileText, Scale, Stethoscope } from "lucide-react";
import { isAxiosError } from "axios";
import { PageHeader } from "@/common/components/PageHeader";
import {
  Badge,
  Button,
  Card,
  CardBody,
  EmptyState,
  Select,
  Skeleton,
  Textarea
} from "@/common/ui";
import { useToast } from "@/common/providers/ToastProvider";
import { cn } from "@/common/lib/cn";
import { formatDate } from "@/common/lib/format";
import {
  useHorsePassport,
  useInspections,
  useRecordInspection,
  useRefereeRaces,
  useSubmitAllInspections
} from "../hooks";
const STATUS_TONE = {
  CLEARED: "success",
  PENDING: "warning",
  VET_CHECK: "danger"
};
function PreRaceInspectionPage() {
  const toast = useToast();
  const racesQuery = useRefereeRaces();
  const [raceId, setRaceId] = useState("");
  const [selectedEntry, setSelectedEntry] = useState(null);
  useEffect(() => {
    if (!raceId && racesQuery.data && racesQuery.data.length > 0) {
      setRaceId(racesQuery.data[0].raceId);
    }
  }, [racesQuery.data, raceId]);
  const inspectionsQuery = useInspections(raceId || null);
  const submitAll = useSubmitAllInspections(raceId);
  const rows = inspectionsQuery.data ?? [];
  const selected = rows.find((r) => r.entryId === selectedEntry) ?? rows[0] ?? null;
  const race = racesQuery.data?.find((r) => r.raceId === raceId);
  function handleSubmitAll() {
    submitAll.mutate(void 0, {
      onSuccess: (res) => res.blockedEntries.length > 0 ? toast.info(`${res.submittedCount} cleared \xB7 ${res.blockedEntries.length} blocked`) : toast.success(`Submitted ${res.submittedCount} clearances`),
      onError: (err) => toast.error(errorMessage(err))
    });
  }
  return <>
      <PageHeader
    title="Pre-Race Inspection"
    subtitle={race ? `${race.name} \xB7 ${race.trackCondition ?? "Inspection"}` : "Official steward access"}
    actions={<div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => window.print()}>
              Print Roster
            </Button>
            <Button loading={submitAll.isPending} disabled={!raceId} onClick={handleSubmitAll}>
              Submit All Clearances
            </Button>
          </div>}
  />

      <div className="mb-4 w-72">
        <Select
    label="Race"
    value={raceId}
    onChange={(e) => {
      setRaceId(e.target.value);
      setSelectedEntry(null);
    }}
    options={(racesQuery.data ?? []).map((r) => ({
      value: r.raceId,
      label: `${r.raceCode ?? r.raceId.slice(0, 6)} \xB7 ${r.name}`
    }))}
  />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {
    /* LEFT — inspection roster table */
  }
        <div className="lg:col-span-2">
          <Card>
            <CardBody className="p-0">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <h2 className="font-semibold text-ink">Inspection Roster</h2>
                <Badge tone="neutral">{rows.length} entries</Badge>
              </div>
              {inspectionsQuery.isPending ? <div className="flex flex-col gap-2 p-4">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
                </div> : inspectionsQuery.isError ? <EmptyState title="Could not load inspections" description="Please reload the page." /> : rows.length === 0 ? <EmptyState title="No runners to inspect" /> : <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                      <th className="px-4 py-2">Gate</th>
                      <th className="px-4 py-2">Horse / Jockey</th>
                      <th className="px-4 py-2 text-center">Health Cert</th>
                      <th className="px-4 py-2 text-center">Weight</th>
                      <th className="px-4 py-2 text-center">Cleared</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => <RosterRow
    key={row.entryId}
    row={row}
    active={selected?.entryId === row.entryId}
    onSelect={() => setSelectedEntry(row.entryId)}
  />)}
                  </tbody>
                </table>}
            </CardBody>
          </Card>
        </div>

        {
    /* RIGHT — passport + vet clearance */
  }
        <aside>
          {selected && raceId ? <ClearancePanel key={selected.entryId} raceId={raceId} row={selected} /> : <Card>
              <CardBody>
                <p className="text-sm text-muted">Select a runner to review its passport.</p>
              </CardBody>
            </Card>}
        </aside>
      </div>
    </>;
}
function RosterRow({
  row,
  active,
  onSelect
}) {
  return <tr
    onClick={onSelect}
    className={cn("cursor-pointer border-b border-border/60 transition-colors", active ? "bg-brand-50" : "hover:bg-subtle/60")}
  >
      <td className="px-4 py-3">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-subtle text-xs font-semibold text-muted">
          {row.laneNo ?? "\u2014"}
        </span>
      </td>
      <td className="px-4 py-3">
        <p className="font-medium text-ink">{row.horseName}</p>
        <p className="text-xs text-muted">J: {row.jockeyName ?? "\u2014"}</p>
      </td>
      <td className="px-4 py-3 text-center">
        {row.healthCertPassed ? <Check size={18} className="mx-auto text-success" /> : <AlertCircle size={18} className="mx-auto text-danger" />}
      </td>
      <td className="px-4 py-3 text-center">
        {row.weightVerified ? <Check size={18} className="mx-auto text-success" /> : <span className="text-muted">—</span>}
      </td>
      <td className="px-4 py-3 text-center">
        <input
    type="checkbox"
    readOnly
    checked={row.inspectionStatus === "CLEARED"}
    className="h-4 w-4 rounded border-border text-brand-700"
  />
      </td>
    </tr>;
}
function ClearancePanel({ raceId, row }) {
  const toast = useToast();
  const passport = useHorsePassport(row.horseId);
  const record = useRecordInspection(raceId);
  const [healthCert, setHealthCert] = useState(row.healthCertPassed);
  const [weightVerified, setWeightVerified] = useState(row.weightVerified);
  const [coggins, setCoggins] = useState(row.inspectionStatus === "CLEARED");
  const [exam, setExam] = useState(row.inspectionStatus === "CLEARED");
  const [status, setStatus] = useState(row.inspectionStatus);
  const [note, setNote] = useState("");
  function save() {
    record.mutate(
      {
        entryId: row.entryId,
        healthCertPassed: healthCert,
        weightVerified,
        cogginsTestPassed: coggins,
        preRaceExamPassed: exam,
        inspectionStatus: status,
        stewardNote: note.trim() || void 0
      },
      {
        onSuccess: () => toast.success("Clearance saved"),
        onError: (err) => toast.error(errorMessage(err))
      }
    );
  }
  function flagForReview() {
    setStatus("VET_CHECK");
    record.mutate(
      {
        entryId: row.entryId,
        healthCertPassed: healthCert,
        weightVerified,
        cogginsTestPassed: coggins,
        preRaceExamPassed: exam,
        inspectionStatus: "VET_CHECK",
        stewardNote: note.trim() || "Flagged for vet review."
      },
      {
        onSuccess: () => toast.info("Flagged for review"),
        onError: (err) => toast.error(errorMessage(err))
      }
    );
  }
  const verifiedAt = row.inspectedAt ? formatDate(row.inspectedAt) : null;
  return <Card>
      <CardBody className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-ink">{row.horseName}</h2>
          <Badge tone={STATUS_TONE[row.inspectionStatus]}>
            Gate {row.laneNo ?? "\u2014"}
          </Badge>
        </div>

        {
    /* Digital Passport */
  }
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Digital Passport</p>
          {passport.isPending ? <Skeleton className="mt-2 h-20 w-full rounded" /> : <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
              <Field label="Microchip ID" value={passport.data?.microchipNo ?? "\u2014"} />
              <Field
    label="Age / Sex"
    value={passport.data?.ageYears != null ? `${passport.data.ageYears}yo ${passport.data.genderWord}` : passport.data?.genderWord ?? "\u2014"}
  />
              <Field label="Trainer" value={passport.data?.trainer ?? "\u2014"} />
              <Field label="Owner" value={passport.data?.owner ?? "\u2014"} />
            </div>}
        </div>

        {
    /* Vet Clearance (editable) */
  }
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Vet Clearance</p>
          <div className="mt-2 flex flex-col gap-2.5">
            <ClearanceToggle
    icon={<Stethoscope size={16} />}
    label="Health Certificate"
    checked={healthCert}
    onChange={setHealthCert}
    verifiedAt={healthCert ? verifiedAt : null}
  />
            <ClearanceToggle
    icon={<Scale size={16} />}
    label="Weight Verified"
    checked={weightVerified}
    onChange={setWeightVerified}
    verifiedAt={weightVerified ? verifiedAt : null}
  />
            <ClearanceToggle
    icon={<FileText size={16} />}
    label="Coggins Test"
    checked={coggins}
    onChange={setCoggins}
    verifiedAt={coggins ? verifiedAt : null}
  />
            <ClearanceToggle
    icon={<Check size={16} />}
    label="Pre-Race Exam"
    checked={exam}
    onChange={setExam}
    verifiedAt={exam ? verifiedAt : null}
  />
          </div>
        </div>

        <Select
    label="Inspection status"
    value={status}
    onChange={(e) => setStatus(e.target.value)}
    options={[
      { value: "PENDING", label: "Pending" },
      { value: "CLEARED", label: "Cleared" },
      { value: "VET_CHECK", label: "Vet Check" }
    ]}
  />

        <Textarea
    label="Steward notes"
    rows={3}
    placeholder="Add inspection notes here…"
    value={note}
    onChange={(e) => setNote(e.target.value)}
  />

        <div className="flex flex-col gap-2 border-t border-border pt-4">
          <Button leftIcon={<Check size={16} />} loading={record.isPending} onClick={save}>
            Save clearance
          </Button>
          <Button variant="ghost" className="text-danger hover:bg-danger/10" onClick={flagForReview}>
            Flag for Review
          </Button>
        </div>
      </CardBody>
    </Card>;
}
function Field({ label, value }) {
  return <div>
      <p className="text-xs text-muted">{label}</p>
      <p className="font-medium text-ink">{value}</p>
    </div>;
}
function ClearanceToggle({
  icon,
  label,
  checked,
  onChange,
  verifiedAt
}) {
  return <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border px-3 py-2">
      <span className={cn("shrink-0", checked ? "text-success" : "text-muted")}>{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-ink">{label}</span>
        {checked && verifiedAt && <span className="text-xs text-muted">Verified {verifiedAt}</span>}
      </span>
      <input
    type="checkbox"
    checked={checked}
    onChange={(e) => onChange(e.target.checked)}
    className="h-4 w-4 rounded border-border text-brand-700 focus:ring-brand-500"
  />
    </label>;
}
function errorMessage(err) {
  if (isAxiosError(err)) {
    const s = err.response?.status;
    if (s === 403) return "You are not authorized to inspect.";
    if (s === 400) return "Invalid inspection data.";
  }
  return "Something went wrong. Please try again.";
}
export {
  PreRaceInspectionPage as default
};
