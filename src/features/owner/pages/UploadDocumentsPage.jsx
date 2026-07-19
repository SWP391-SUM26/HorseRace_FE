import { useRef, useState } from "react";
import { isAxiosError } from "axios";
import { Download, FileText, ShieldCheck, Upload } from "lucide-react";
import { PageHeader } from "@/common/components/PageHeader";
import {
  DocumentViewerModal,
  useDocumentViewer,
} from "@/common/components/DocumentViewerModal";
import {
  Badge,
  Button,
  Card,
  CardBody,
  EmptyState,
  Select,
  Skeleton,
} from "@/common/ui";
import { useToast } from "@/common/providers/ToastProvider";
import { formatDate } from "@/common/lib/format";
import { useOwnerHorseOptions } from "@/features/registrations/hooks";
import {
  useHorseDocuments,
  useOwnerDocuments,
  useUploadHorseDocument,
  useUploadOwnerDocument,
} from "../hooks";

function errMsg(e) {
  if (isAxiosError(e)) return e.response?.data?.message ?? "Upload failed";
  return "Upload failed";
}

/** CN2 — owners upload their own papers + per-horse papers for referee document review. */
export default function UploadDocumentsPage() {
  return (
    <>
      <PageHeader
        title="My Documents"
        subtitle="Upload your owner papers and per-horse documents. Referees review these before your horses can compete."
      />

      <div className="flex flex-col gap-6">
        <OwnerDocsSection />
        <HorseDocsSection />
      </div>
    </>
  );
}

// ---------- Owner-scoped documents ----------
function OwnerDocsSection() {
  const toast = useToast();
  const docsQ = useOwnerDocuments();
  const upload = useUploadOwnerDocument();
  const inputRef = useRef(null);

  function onPick(file) {
    if (!file) return;
    upload.mutate(file, {
      onSuccess: () => {
        toast.success("Document uploaded");
        if (inputRef.current) inputRef.current.value = "";
      },
      onError: (e) => toast.error(errMsg(e)),
    });
  }

  return (
    <Card>
      <CardBody className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-ink">Owner documents</h2>
            <p className="text-xs text-muted">
              ID, licences and other papers that identify you as the owner.
            </p>
          </div>
          <div>
            <input
              ref={inputRef}
              type="file"
              onChange={(e) => onPick(e.target.files?.[0])}
              disabled={upload.isPending}
              className="hidden"
            />
            <Button
              size="sm"
              loading={upload.isPending}
              onClick={() => inputRef.current?.click()}
            >
              <Upload size={15} /> Upload document
            </Button>
          </div>
        </div>
        <DocList query={docsQ} emptyText="No owner documents uploaded yet." />
      </CardBody>
    </Card>
  );
}

// ---------- Per-horse documents ----------
function HorseDocsSection() {
  const toast = useToast();
  const horsesQ = useOwnerHorseOptions();
  const horses = horsesQ.data ?? [];
  const [horseId, setHorseId] = useState("");
  const selected = horseId || horses[0]?.value || "";

  const docsQ = useHorseDocuments(selected || null);
  const upload = useUploadHorseDocument(selected || null);
  const inputRef = useRef(null);

  function onPick(file) {
    if (!file || !selected) return;
    upload.mutate(file, {
      onSuccess: () => {
        toast.success("Document uploaded");
        if (inputRef.current) inputRef.current.value = "";
      },
      onError: (e) => toast.error(errMsg(e)),
    });
  }

  return (
    <Card>
      <CardBody className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-semibold text-ink">Horse documents</h2>
            <p className="text-xs text-muted">
              Passports, health certificates and other papers per horse.
            </p>
          </div>
          <div className="flex items-end gap-2">
            {horses.length > 0 && (
              <Select
                label="Horse"
                value={selected}
                onChange={(e) => setHorseId(e.target.value)}
                options={horses}
              />
            )}
            <input
              ref={inputRef}
              type="file"
              onChange={(e) => onPick(e.target.files?.[0])}
              disabled={upload.isPending || !selected}
              className="hidden"
            />
            <Button
              size="sm"
              loading={upload.isPending}
              disabled={!selected}
              onClick={() => inputRef.current?.click()}
            >
              <Upload size={15} /> Upload document
            </Button>
          </div>
        </div>

        {horsesQ.isPending ? (
          <Skeleton className="h-16 w-full rounded-xl" />
        ) : horses.length === 0 ? (
          <EmptyState
            title="No horses yet"
            description="Register a horse in your stable to upload its documents."
          />
        ) : (
          <DocList
            query={docsQ}
            emptyText="No documents uploaded for this horse yet."
          />
        )}
      </CardBody>
    </Card>
  );
}

// ---------- Shared document list ----------
function DocList({ query, emptyText }) {
  const viewer = useDocumentViewer();
  if (query.isPending) return <Skeleton className="h-16 w-full rounded-xl" />;
  if (query.isError)
    return <p className="text-sm text-danger">Couldn't load documents.</p>;
  const docs = query.data ?? [];
  if (docs.length === 0) return <p className="text-sm text-muted">{emptyText}</p>;

  return (
    <>
      <ul className="flex flex-col gap-2">
        {docs.map((d) => {
          const restricted =
            (d.sensitivityLevel ?? "").toUpperCase() === "RESTRICTED";
          return (
            <li key={d.attachmentId}>
              <button
                type="button"
                onClick={() =>
                  viewer.view(
                    `/owner/documents/${d.attachmentId}/download`,
                    d.fileName,
                  )
                }
                className="flex w-full items-center gap-2 rounded-lg border border-border px-3 py-2 text-left text-sm text-brand-700 hover:bg-subtle"
              >
                <FileText size={14} className="shrink-0" />
                <span className="truncate">{d.fileName}</span>
                {restricted && (
                  <Badge tone="warning">
                    <ShieldCheck size={11} className="mr-1" /> Restricted
                  </Badge>
                )}
                <span className="ml-auto flex shrink-0 items-center gap-2 text-xs text-muted">
                  {d.uploadedAt ? formatDate(d.uploadedAt) : ""}
                  <Download size={13} />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <DocumentViewerModal {...viewer.modalProps} />
    </>
  );
}
