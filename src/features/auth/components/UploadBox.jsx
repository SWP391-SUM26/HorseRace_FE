import { useEffect, useRef, useState } from "react";
import { Upload, FileText } from "lucide-react";

/**
 * File picker for a credential document. Shows an image thumbnail preview for
 * image files (via `URL.createObjectURL`, revoked on every new selection and on
 * unmount to avoid leaks) and a filename + file icon for non-image files
 * (e.g. PDFs).
 */
export function UploadBox({ label, onFile }) {
  const ref = useRef(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  // Mirror the current object URL in a ref so the unmount cleanup revokes the
  // latest value.
  const urlRef = useRef(null);

  useEffect(
    () => () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    [],
  );

  const isImage = !!file && file.type.startsWith("image/");

  return (
    <button
      type="button"
      onClick={() => ref.current?.click()}
      className="flex w-full flex-col items-center rounded-lg border-2 border-dashed border-border p-6 text-center hover:bg-subtle"
    >
      {isImage && previewUrl ? (
        <img
          src={previewUrl}
          alt={`${label} preview`}
          className="mb-1 max-h-24 max-w-full rounded object-cover"
        />
      ) : file ? (
        <FileText size={20} className="text-muted" />
      ) : (
        <Upload size={20} className="text-muted" />
      )}
      <span className="mt-2 text-sm font-medium text-ink">{label}</span>
      <span className="mt-1 text-xs text-muted">
        {file?.name ?? "Upload a file or drag and drop"}
      </span>
      <span className="mt-1 text-xs text-muted">PDF, PNG, JPG up to 10MB</span>
      <input
        ref={ref}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0] ?? null;
          // Revoke the previous preview URL before creating a new one (no leak).
          if (urlRef.current) {
            URL.revokeObjectURL(urlRef.current);
            urlRef.current = null;
          }
          let url = null;
          if (f && f.type.startsWith("image/")) {
            url = URL.createObjectURL(f);
            urlRef.current = url;
          }
          setPreviewUrl(url);
          setFile(f);
          onFile(f);
        }}
      />
    </button>
  );
}
