import { useEffect, useRef, useState } from "react";
import { FileText, Upload } from "lucide-react";

export function UploadBox({ label, onFile }) {
  const inputRef = useRef(null);
  const urlRef = useRef(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(
    () => () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    [],
  );

  const isImage = file?.type?.startsWith("image/");

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className="flex w-full flex-col items-center rounded-lg border-2 border-dashed border-border p-6 text-center hover:bg-subtle"
    >
      {isImage && previewUrl ? (
        <img src={previewUrl} alt={`${label} preview`} className="mb-1 max-h-24 max-w-full rounded object-cover" />
      ) : file ? (
        <FileText size={20} className="text-muted" />
      ) : (
        <Upload size={20} className="text-muted" />
      )}
      <span className="mt-2 text-sm font-medium text-ink">{label}</span>
      <span className="mt-1 text-xs text-muted">{file?.name ?? "Upload a file or drag and drop"}</span>
      <span className="mt-1 text-xs text-muted">PDF, PNG, JPG up to 10MB</span>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg"
        className="hidden"
        onChange={(event) => {
          const nextFile = event.target.files?.[0] ?? null;
          if (urlRef.current) {
            URL.revokeObjectURL(urlRef.current);
            urlRef.current = null;
          }
          const url = nextFile?.type?.startsWith("image/") ? URL.createObjectURL(nextFile) : null;
          urlRef.current = url;
          setPreviewUrl(url);
          setFile(nextFile);
          onFile(nextFile);
        }}
      />
    </button>
  );
}
