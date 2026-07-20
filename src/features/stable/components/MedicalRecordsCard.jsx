import { useRef, useState } from "react";
import {
  ExternalLink,
  FileText,
  HeartPulse,
  Paperclip,
  Pencil,
  Plus,
  ShieldCheck,
  StickyNote,
  Syringe,
  Trash2,
  Upload
} from "lucide-react";
import { Badge, Button, Card, CardBody, CardHeader, Input, Modal, Select, Textarea } from "@/common/ui";
import { getApiErrorMessage } from "@/common/lib/apiError";
import { formatDate } from "@/common/lib/format";
import { useToast } from "@/common/providers/ToastProvider";
import {
  useAddMedicalRecord,
  useDeleteMedicalRecord,
  useMedicalRecords,
  useUpdateMedicalRecord,
  useUploadMedicalRecordFile
} from "../hooks";

const TYPES = [
  { value: "CERTIFICATE", label: "Health certificate" },
  { value: "VACCINATION", label: "Vaccination" },
  { value: "INJURY", label: "Injury / issue" },
  { value: "NOTE", label: "Note" }
];

const TYPE_LABEL = Object.fromEntries(TYPES.map((t) => [t.value, t.label]));

const ICON_COLOR = {
  CERTIFICATE: "text-success",
  VACCINATION: "text-info",
  INJURY: "text-danger",
  NOTE: "text-muted"
};

const EMPTY = { recordType: "CERTIFICATE", title: "", note: "", recordDate: "" };

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

function getRecordId(record) {
  return record?.recordId ?? record?.id;
}

function getFileUrl(record) {
  return record?.fileUrl ?? record?.attachmentUrl ?? record?.documentUrl;
}

function getFileName(record) {
  return record?.fileName ?? record?.attachmentName ?? record?.documentName;
}

export function MedicalRecordsCard({ horseId, medical }) {
  const { data: records, isPending } = useMedicalRecords(horseId);
  const add = useAddMedicalRecord(horseId);
  const update = useUpdateMedicalRecord(horseId);
  const remove = useDeleteMedicalRecord(horseId);
  const uploadFile = useUploadMedicalRecordFile(horseId);
  const toast = useToast();
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

  function openEdit(record) {
    setEditing(record);
    setForm({
      recordType: record.recordType ?? "CERTIFICATE",
      title: record.title ?? "",
      note: record.note ?? "",
      recordDate: record.recordDate ?? ""
    });
    setPendingFile(null);
    setFormOpen(true);
  }

  function afterSave(record, actionLabel) {
    const recordId = getRecordId(record) ?? getRecordId(editing);
    if (pendingFile && recordId) {
      uploadFile.mutate(
        { recordId, file: pendingFile },
        {
          onSuccess: () => {
            toast.success(`Record ${actionLabel}`);
            setFormOpen(false);
          },
          onError: (error) => toast.error(`Record ${actionLabel}; file upload failed: ${getApiErrorMessage(error)}`)
        }
      );
      return;
    }

    toast.success(`Record ${actionLabel}`);
    setFormOpen(false);
  }

  function submit() {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (form.recordType === "INJURY" && form.recordDate && form.recordDate > todayStr) {
      toast.error("An injury date cannot be in the future");
      return;
    }

    const body = {
      recordType: form.recordType,
      title: form.title.trim(),
      note: form.note?.trim() || undefined,
      recordDate: form.recordDate || undefined
    };

    if (editing) {
      update.mutate(
        { recordId: getRecordId(editing), body },
        {
          onSuccess: (record) => afterSave(record ?? editing, "updated"),
          onError: (error) => toast.error(getApiErrorMessage(error))
        }
      );
      return;
    }

    add.mutate(body, {
      onSuccess: (record) => afterSave(record, "added"),
      onError: (error) => toast.error(getApiErrorMessage(error))
    });
  }

  function confirmDelete() {
    const recordId = getRecordId(deleting);
    if (!recordId) return;
    remove.mutate(recordId, {
      onSuccess: () => {
        toast.success("Record deleted");
        setDeleting(null);
      },
      onError: (error) => toast.error(getApiErrorMessage(error))
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
            <span className="text-sm font-medium text-ink">{medical?.lastVetCheck ?? "-"}</span>
          </Row>
          <Row label="Vaccinations">
            <Badge tone={medical?.vaccinationsUpToDate ? "success" : "warning"}>
              {medical?.vaccinationsUpToDate ? "UP TO DATE" : "DUE"}
            </Badge>
          </Row>
          <Row label="Recovery Status">
            <span className="text-sm font-medium text-ink">{medical?.recoveryStatus ?? "-"}</span>
          </Row>
        </div>

        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink">Records & Certificates</h3>
          <Button size="sm" variant="secondary" onClick={openAdd}>
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>

        {isPending ? (
          <p className="py-2 text-sm text-muted">Loading records...</p>
        ) : !records || records.length === 0 ? (
          <p className="rounded-lg bg-subtle px-3 py-4 text-center text-sm text-muted">
            No medical records yet. Add a health certificate, vaccination or note.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {records.map((record) => {
              const recordId = getRecordId(record);
              const fileUrl = getFileUrl(record);
              const fileName = getFileName(record);
              return (
                <li
                  key={recordId}
                  className="flex items-start gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-subtle"
                >
                  <span className={`mt-0.5 ${ICON_COLOR[record.recordType] ?? "text-muted"}`}>
                    <TypeIcon type={record.recordType} className="h-4 w-4" />
                  </span>
                  <button type="button" onClick={() => setViewing(record)} className="min-w-0 flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-ink">{record.title}</span>
                      <Badge tone={typeTone(record.recordType)}>{TYPE_LABEL[record.recordType] ?? record.recordType}</Badge>
                    </div>
                    {record.recordDate && <p className="mt-0.5 text-xs text-muted">{formatDate(record.recordDate)}</p>}
                    {record.note && <p className="mt-1 line-clamp-1 text-xs text-muted">{record.note}</p>}
                    {fileUrl && (
                      <p className="mt-1 inline-flex items-center gap-1 text-xs text-brand-700">
                        <Paperclip className="h-3 w-3" /> {fileName ?? "File attached"}
                      </p>
                    )}
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(record)}
                      aria-label="Edit record"
                      className="rounded-md p-1.5 text-muted transition-colors hover:bg-surface hover:text-ink"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleting(record)}
                      aria-label="Delete record"
                      className="rounded-md p-1.5 text-muted transition-colors hover:bg-surface hover:text-danger"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardBody>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Edit Medical Record" : "Add Medical Record"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button loading={add.isPending || update.isPending || uploadFile.isPending} onClick={submit}>
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
            onChange={(event) => setForm((current) => ({ ...current, recordType: event.target.value }))}
          />
          <Input
            label="Title"
            placeholder="e.g. Annual health certificate"
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
          />
          <Input
            label="Date"
            type="date"
            max={form.recordType === "INJURY" ? todayStr : undefined}
            value={form.recordDate ?? ""}
            onChange={(event) => setForm((current) => ({ ...current, recordDate: event.target.value }))}
          />
          <Textarea
            label="Details / Notes"
            placeholder="Findings, vet name, follow-up..."
            value={form.note ?? ""}
            onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
          />

          <div>
            <p className="mb-1.5 text-sm font-medium text-ink">Attached file</p>
            {editing && getFileUrl(editing) && !pendingFile && (
              <a
                href={getFileUrl(editing)}
                target="_blank"
                rel="noreferrer"
                className="mb-2 inline-flex items-center gap-1.5 text-sm text-brand-700 hover:underline"
              >
                <FileText className="h-4 w-4" /> {getFileName(editing) ?? "Current file"}{" "}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,application/pdf"
              className="hidden"
              onChange={(event) => setPendingFile(event.target.files?.[0] ?? null)}
            />
            <div className="flex items-center gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4" /> {editing && getFileUrl(editing) ? "Replace file" : "Choose file"}
              </Button>
              {pendingFile && <span className="min-w-0 flex-1 truncate text-xs text-muted">{pendingFile.name}</span>}
            </div>
            <p className="mt-1 text-xs text-muted">Upload a scan/photo document. PNG, JPG, WEBP, GIF or PDF.</p>
          </div>
        </div>
      </Modal>

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
                <h3 className="text-base font-semibold text-ink">{viewing.title}</h3>
                <Badge tone={typeTone(viewing.recordType)}>{TYPE_LABEL[viewing.recordType] ?? viewing.recordType}</Badge>
              </div>
            </div>
            <DetailRow label="Date" value={viewing.recordDate ? formatDate(viewing.recordDate) : "-"} />
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted">Details / Notes</span>
              <p className="whitespace-pre-wrap text-sm text-ink">{viewing.note || "-"}</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm text-muted">Attached file</span>
              {getFileUrl(viewing) ? (
                <a
                  href={getFileUrl(viewing)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-brand-700 hover:underline"
                >
                  <FileText className="h-4 w-4" />
                  <span className="truncate">{getFileName(viewing) ?? "Open file"}</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : (
                <p className="text-sm text-muted">No file attached.</p>
              )}
            </div>
            {viewing.createdAt && <DetailRow label="Recorded on" value={formatDate(viewing.createdAt)} />}
          </div>
        )}
      </Modal>

      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete record?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button variant="danger" loading={remove.isPending} onClick={confirmDelete}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">
          Delete <span className="font-medium text-ink">{deleting?.title}</span>? This action cannot be undone.
        </p>
      </Modal>
    </Card>
  );
}
