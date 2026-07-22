import { useRef, useState } from "react";
import {
  ShieldCheck,
  Plus,
  Pencil,
  Trash2,
  FileText,
  Syringe,
  HeartPulse,
  StickyNote,
  Paperclip,
  ExternalLink,
  Upload,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardBody,
  Badge,
  Button,
  Modal,
  Input,
  Select,
  Textarea,
} from "@/common/ui";
import { useToast } from "@/common/providers/ToastProvider";
import { getApiErrorMessage } from "@/common/lib/apiError";
import { formatDate } from "@/common/lib/format";
import {
  useMedicalRecords,
  useAddMedicalRecord,
  useUpdateMedicalRecord,
  useDeleteMedicalRecord,
  useUploadMedicalRecordFile,
} from "../hooks";

const TYPES = [
  { value: "CERTIFICATE", label: "Health certificate" },
  { value: "VACCINATION", label: "Vaccination" },
  { value: "INJURY", label: "Injury / issue" },
  { value: "NOTE", label: "Note" },
];

const TYPE_LABEL = Object.fromEntries(TYPES.map((t) => [t.value, t.label]));

function typeTone(type) {
  switch (type) {
    case "CERTIFICATE":
      return "success";
    case "VACCINATION":
      return "info";
    case "INJURY":
      return "danger";
    default:
      return "neutral";
  }
}

// Static classes so Tailwind's JIT can see them (no dynamic interpolation).
const ICON_COLOR = {
  CERTIFICATE: "text-success",
  VACCINATION: "text-info",
  INJURY: "text-danger",
  NOTE: "text-muted",
};

function TypeIcon({ type, className }) {
  switch (type) {
    case "CERTIFICATE":
      return <FileText className={className} />;
    case "VACCINATION":
      return <Syringe className={className} />;
    case "INJURY":
      return <HeartPulse className={className} />;
    default:
      return <StickyNote className={className} />;
  }
}

const EMPTY = {
  recordType: "CERTIFICATE",
  title: "",
  note: "",
  recordDate: "",
};

export function MedicalRecordsCard({ horseId, medical }) {
  const { data: records, isPending } = useMedicalRecords(horseId);
  const add = useAddMedicalRecord(horseId);
  const update = useUpdateMedicalRecord(horseId);
  const remove = useDeleteMedicalRecord(horseId);
  const uploadFile = useUploadMedicalRecordFile(horseId);
  const toast = useToast();
  // YYYY-MM-DD, for capping the injury date
  const todayStr = new Date().toISOString().slice(0, 10);

  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [pendingFile, setPendingFile] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const fileInputRef = useRef(null);

  function openAdd() {
    setEditing(null);
    setForm(EMPTY);
    setPendingFile(null);
    setFormOpen(true);
  }

  function openEdit(r) {
    setEditing(r);
    setForm({
      recordType: r.recordType,
      title: r.title,
      note: r.note ?? "",
      recordDate: r.recordDate ?? "",
    });
    setPendingFile(null);
    setFormOpen(true);
  }

  function submit() {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    // An injury can only have happened in the past — reject a future date.
    if (
      form.recordType === "INJURY" &&
      form.recordDate &&
      form.recordDate > todayStr
    ) {
      toast.error("An injury's date can't be in the future");
      return;
    }
    const body = {
      recordType: form.recordType,
      title: form.title.trim(),
      note: form.note?.trim() || undefined,
      recordDate: form.recordDate || undefined,
    };
    const file = pendingFile;
    // After the record is saved, upload the file (if any) against its id, then close.
    const afterSave = (rec, verb) => {
      if (file) {
        uploadFile.mutate(
          { recordId: rec.recordId, file },
          {
            onSuccess: () => {
              toast.success(`Record ${verb}`);
              setFormOpen(false);
            },
            onError: (e) =>
              toast.error(
                `Record ${verb}; file upload failed: ${getApiErrorMessage(e)}`,
              ),
          },
        );
      } else {
        toast.success(`Record ${verb}`);
        setFormOpen(false);
      }
    };
    if (editing) {
      update.mutate(
        { recordId: editing.recordId, body },
        { onSuccess: (rec) => afterSave(rec, "updated") },
      );
    } else {
      add.mutate(body, { onSuccess: (rec) => afterSave(rec, "added") });
    }
  }

  function confirmDelete() {
    if (!deleting) return;
    remove.mutate(deleting.recordId, {
      onSuccess: () => {
        toast.success("Record deleted");
        setDeleting(null);
      },
    });
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <h2 className="font-semibold text-ink">Medical Status</h2>
        <ShieldCheck className="h-5 w-5 text-success" />
      </CardHeader>
      <CardBody className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 border-b border-border pb-4">
          <Row label="Last Vet Check">
            <span className="text-sm font-medium text-ink">
              {medical.lastVetCheck}
            </span>
          </Row>
          <Row label="Vaccinations">
            <Badge tone={medical.vaccinationsUpToDate ? "success" : "warning"}>
              {medical.vaccinationsUpToDate ? "UP TO DATE" : "DUE"}
            </Badge>
          </Row>
          <Row label="Recovery Status">
            <span className="text-sm font-medium text-ink">
              {medical.recoveryStatus}
            </span>
          </Row>
        </div>

        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink">
            Records & Certificates
          </h3>
          <Button size="sm" variant="secondary" onClick={openAdd}>
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>

        {isPending ? (
          <p className="py-2 text-sm text-muted">Loading records…</p>
        ) : !records || records.length === 0 ? (
          <p className="rounded-lg bg-subtle px-3 py-4 text-center text-sm text-muted">
            No medical records yet. Add a health certificate, vaccination or
            note.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {records.map((r) => (
              <li
                key={r.recordId}
                className="flex items-start gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-subtle"
              >
                <span
                  className={`mt-0.5 ${ICON_COLOR[r.recordType] ?? "text-muted"}`}
                >
                  <TypeIcon type={r.recordType} className="h-4 w-4" />
                </span>
                <button
                  type="button"
                  onClick={() => setViewing(r)}
                  className="min-w-0 flex-1 text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-ink">
                      {r.title}
                    </span>
                    <Badge tone={typeTone(r.recordType)}>
                      {TYPE_LABEL[r.recordType] ?? r.recordType}
                    </Badge>
                  </div>
                  {r.recordDate && (
                    <p className="mt-0.5 text-xs text-muted">
                      {formatDate(r.recordDate)}
                    </p>
                  )}
                  {r.note && (
                    <p className="mt-1 line-clamp-1 text-xs text-muted">
                      {r.note}
                    </p>
                  )}
                  {r.fileUrl && (
                    <p className="mt-1 inline-flex items-center gap-1 text-xs text-brand-700">
                      <Paperclip className="h-3 w-3" />{" "}
                      {r.fileName ?? "File attached"}
                    </p>
                  )}
                </button>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(r)}
                    aria-label="Edit record"
                    className="rounded-md p-1.5 text-muted transition-colors hover:bg-surface hover:text-ink"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleting(r)}
                    aria-label="Delete record"
                    className="rounded-md p-1.5 text-muted transition-colors hover:bg-surface hover:text-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardBody>

      {/* Add / Edit modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Edit Medical Record" : "Add Medical Record"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button
              loading={add.isPending || update.isPending || uploadFile.isPending}
              onClick={submit}
            >
              {editing ? "Save Changes" : "Add Record"}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Select
            label="Type"
            options={TYPES}
            value={form.recordType}
            onChange={(e) =>
              setForm((f) => ({ ...f, recordType: e.target.value }))
            }
          />
          <Input
            label="Title"
            placeholder="e.g. Annual health certificate"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <Input
            label="Date"
            type="date"
            max={form.recordType === "INJURY" ? todayStr : undefined}
            value={form.recordDate ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, recordDate: e.target.value }))
            }
          />
          <Textarea
            label="Details / Notes"
            placeholder="Findings, vet name, follow-up…"
            value={form.note ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
          />

          <div>
            <p className="mb-1.5 text-sm font-medium text-ink">Attached file</p>
            {editing?.fileUrl && !pendingFile && (
              <a
                href={editing.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="mb-2 inline-flex items-center gap-1.5 text-sm text-brand-700 hover:underline"
              >
                <FileText className="h-4 w-4" />{" "}
                {editing.fileName ?? "Current file"}{" "}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={(e) => setPendingFile(e.target.files?.[0] ?? null)}
            />
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />{" "}
                {editing?.fileUrl ? "Replace file" : "Choose file"}
              </Button>
              {pendingFile && (
                <span className="min-w-0 flex-1 truncate text-xs text-muted">
                  {pendingFile.name}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-muted">
              Image scan/photo (PNG, JPG, WEBP, GIF), up to 5MB.
              {editing?.fileUrl
                ? " Choosing a new file replaces the current one."
                : ""}
            </p>
          </div>
        </div>
      </Modal>

      {/* View detail modal */}
      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title="Medical Record"
        footer={
          <Button variant="secondary" onClick={() => setViewing(null)}>
            Close
          </Button>
        }
      >
        {viewing && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className={ICON_COLOR[viewing.recordType] ?? "text-muted"}>
                <TypeIcon type={viewing.recordType} className="h-6 w-6" />
              </span>
              <div>
                <h3 className="text-base font-semibold text-ink">
                  {viewing.title}
                </h3>
                <Badge tone={typeTone(viewing.recordType)}>
                  {TYPE_LABEL[viewing.recordType] ?? viewing.recordType}
                </Badge>
              </div>
            </div>
            <DetailRow
              label="Date"
              value={viewing.recordDate ? formatDate(viewing.recordDate) : "—"}
            />
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted">Details / Notes</span>
              <p className="whitespace-pre-wrap text-sm text-ink">
                {viewing.note || "—"}
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-sm text-muted">Attached file</span>
              {viewing.fileUrl ? (
                <a
                  href={viewing.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex flex-col gap-2"
                >
                  <img
                    src={viewing.fileUrl}
                    alt={viewing.fileName ?? "Medical record file"}
                    className="max-h-64 w-full rounded-lg border border-border object-contain"
                  />
                  <span className="inline-flex items-center gap-2 text-sm text-brand-700 group-hover:underline">
                    <FileText className="h-4 w-4" />
                    <span className="truncate">
                      {viewing.fileName ?? "Open file"}
                    </span>
                    <ExternalLink className="ml-auto h-3.5 w-3.5 shrink-0" />
                  </span>
                </a>
              ) : (
                <p className="text-sm text-muted">No file attached.</p>
              )}
            </div>

            {viewing.createdAt && (
              <DetailRow
                label="Recorded on"
                value={formatDate(viewing.createdAt)}
              />
            )}
          </div>
        )}
      </Modal>

      {/* Delete confirm */}
      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete record?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={remove.isPending}
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">
          Delete <span className="font-medium text-ink">{deleting?.title}</span>?
          This action cannot be undone.
        </p>
      </Modal>
    </Card>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted">{label}</span>
      {children}
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-sm font-medium text-ink">{value}</span>
    </div>
  );
}
