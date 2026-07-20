import { useCallback, useEffect, useRef, useState } from "react";
import { Download, FileText } from "lucide-react";
import { apiClient } from "@/common/lib/apiClient";
import { Modal, Spinner } from "@/common/ui";
function effectiveType(blob, fileName) {
  if (blob.type) return blob.type;
  const ext = (fileName ?? "").toLowerCase().split(".").pop() ?? "";
  if (["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"].includes(ext)) {
    return `image/${ext === "jpg" ? "jpeg" : ext}`;
  }
  if (ext === "pdf") return "application/pdf";
  return "";
}
function DocumentViewerModal({ open, onClose, path, fileName }) {
  const [objectUrl, setObjectUrl] = useState(null);
  const [mimeType, setMimeType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const urlRef = useRef(null);
  const revoke = useCallback(() => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
  }, []);
  useEffect(() => {
    if (!open || !path) return;
    let cancelled = false;
    revoke();
    setObjectUrl(null);
    setMimeType("");
    setError(false);
    setLoading(true);
    apiClient.get(path, { responseType: "blob" }).then((res) => {
      if (cancelled) return;
      const blob = res.data;
      const url = URL.createObjectURL(blob);
      urlRef.current = url;
      setObjectUrl(url);
      setMimeType(effectiveType(blob, fileName));
    }).catch(() => {
      if (!cancelled) setError(true);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [open, path, fileName, revoke]);
  useEffect(() => {
    if (!open) revoke();
  }, [open, revoke]);
  useEffect(() => revoke, [revoke]);
  const title = fileName ?? "Document";
  return <Modal open={open} onClose={onClose} title={title} size="xl">
      {loading ? <div className="flex h-64 items-center justify-center gap-2 text-sm text-muted">
          <Spinner /> Loading document…
        </div> : error ? <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
          <FileText size={28} className="text-muted" />
          <p className="text-sm text-danger">Could not load this document.</p>
          <p className="text-xs text-muted">It may be restricted, unavailable, or you may need to sign in again.</p>
        </div> : objectUrl ? mimeType.startsWith("image/") ? <img src={objectUrl} alt={title} className="mx-auto max-h-[75vh] w-full rounded-lg object-contain" /> : mimeType === "application/pdf" ? <iframe src={objectUrl} title={title} className="h-[75vh] max-h-[75vh] w-full rounded-lg border border-border" /> : <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
            <FileText size={28} className="text-muted" />
            <p className="text-sm text-muted">Preview isn't available for this file type.</p>
            <a
    href={objectUrl}
    download={fileName ?? void 0}
    className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-brand-700 hover:bg-subtle"
  >
              <Download size={14} /> Download {fileName ?? "file"}
            </a>
          </div> : null}
    </Modal>;
}
function useDocumentViewer() {
  const [state, setState] = useState(null);
  const view = useCallback((path, fileName) => {
    setState({ path, fileName });
  }, []);
  const onClose = useCallback(() => setState(null), []);
  return {
    view,
    modalProps: {
      open: state !== null,
      path: state?.path ?? null,
      fileName: state?.fileName ?? null,
      onClose
    }
  };
}
export {
  DocumentViewerModal,
  useDocumentViewer
};
