import { useCallback, useEffect, useRef, useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { apiClient } from '@/common/lib/apiClient';
import { Modal, Spinner } from '@/common/ui';

interface DocumentViewerModalProps {
  open: boolean;
  onClose: () => void;
  /** Auth-gated API path (relative to the apiClient baseURL) to fetch the file bytes from. */
  path: string | null;
  fileName?: string | null;
}

/** Best-effort MIME type: prefer the blob's own type, else infer from the file extension. */
function effectiveType(blob: Blob, fileName?: string | null): string {
  if (blob.type) return blob.type;
  const ext = (fileName ?? '').toLowerCase().split('.').pop() ?? '';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) {
    return `image/${ext === 'jpg' ? 'jpeg' : ext}`;
  }
  if (ext === 'pdf') return 'application/pdf';
  return '';
}

/**
 * Previews an auth-gated document inline. A plain `<a href target=_blank>` can't send the
 * `Authorization: Bearer` header, so it 401s (or shows nothing for RESTRICTED docs whose
 * public `url` is null). Here we fetch the bytes via apiClient, wrap them in an object URL,
 * and render the preview inline — revoking the URL on close / unmount / path change.
 */
export function DocumentViewerModal({ open, onClose, path, fileName }: DocumentViewerModalProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const urlRef = useRef<string | null>(null);

  const revoke = useCallback(() => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!open || !path) return;
    let cancelled = false;
    // Drop any previous object URL before fetching a new one (path changed / re-open).
    revoke();
    setObjectUrl(null);
    setMimeType('');
    setError(false);
    setLoading(true);

    apiClient
      .get(path, { responseType: 'blob' })
      .then((res) => {
        if (cancelled) return;
        const blob = res.data as Blob;
        const url = URL.createObjectURL(blob);
        urlRef.current = url;
        setObjectUrl(url);
        setMimeType(effectiveType(blob, fileName));
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, path, fileName, revoke]);

  // Revoke when the modal closes and on unmount.
  useEffect(() => {
    if (!open) revoke();
  }, [open, revoke]);
  useEffect(() => revoke, [revoke]);

  const title = fileName ?? 'Document';

  return (
    <Modal open={open} onClose={onClose} title={title} size="xl">
      {loading ? (
        <div className="flex h-64 items-center justify-center gap-2 text-sm text-muted">
          <Spinner /> Loading document…
        </div>
      ) : error ? (
        <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
          <FileText size={28} className="text-muted" />
          <p className="text-sm text-danger">Could not load this document.</p>
          <p className="text-xs text-muted">It may be restricted, unavailable, or you may need to sign in again.</p>
        </div>
      ) : objectUrl ? (
        mimeType.startsWith('image/') ? (
          <img src={objectUrl} alt={title} className="mx-auto max-h-[75vh] w-full rounded-lg object-contain" />
        ) : mimeType === 'application/pdf' ? (
          <iframe src={objectUrl} title={title} className="h-[75vh] max-h-[75vh] w-full rounded-lg border border-border" />
        ) : (
          <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
            <FileText size={28} className="text-muted" />
            <p className="text-sm text-muted">Preview isn't available for this file type.</p>
            <a
              href={objectUrl}
              download={fileName ?? undefined}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-brand-700 hover:bg-subtle"
            >
              <Download size={14} /> Download {fileName ?? 'file'}
            </a>
          </div>
        )
      ) : null}
    </Modal>
  );
}

/**
 * Small controller for {@link DocumentViewerModal}. Call `view(path, fileName)` to open the
 * viewer for a document, and spread `modalProps` onto a single `<DocumentViewerModal>`.
 */
export function useDocumentViewer() {
  const [state, setState] = useState<{ path: string; fileName?: string | null } | null>(null);

  const view = useCallback((path: string, fileName?: string | null) => {
    setState({ path, fileName });
  }, []);

  const onClose = useCallback(() => setState(null), []);

  return {
    view,
    modalProps: {
      open: state !== null,
      path: state?.path ?? null,
      fileName: state?.fileName ?? null,
      onClose,
    },
  };
}
