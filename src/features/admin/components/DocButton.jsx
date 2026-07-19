import { useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/common/ui";
import { apiClient } from "@/common/lib/apiClient";
import { useToast } from "@/common/providers/ToastProvider";

/**
 * Opens a jockey/registration document.
 *
 * Two shapes arrive here and they must be handled differently:
 *  - an auth-gated API path (`/api/v1/attachments/{id}/download`) — fetch via
 *    apiClient so the Bearer token is attached, then open the blob; a plain
 *    <a href> would not carry the token.
 *  - an absolute CDN URL (`jockey_profile.jockey_license_url` is a public
 *    Cloudinary link) — open it directly. Routing this through apiClient sent
 *    our Authorization header to a third-party origin and the request failed,
 *    so the button always reported "Could not open the document".
 */
export function DocButton({ label, path }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const urlsRef = useRef([]);

  useEffect(() => {
    const urls = urlsRef.current;
    return () => {
      for (const url of urls) URL.revokeObjectURL(url);
    };
  }, []);

  const open = async () => {
    // Public CDN asset: never send our token cross-origin.
    if (/^https?:\/\//i.test(path)) {
      window.open(path, "_blank", "noopener");
      return;
    }
    setLoading(true);
    try {
      // The BE returns the path already prefixed with /api/v1; apiClient.baseURL
      // already includes it.
      const res = await apiClient.get(path.replace(/^\/api\/v1/, ""), {
        responseType: "blob",
      });
      const url = URL.createObjectURL(res.data);
      urlsRef.current.push(url);
      window.open(url, "_blank", "noopener");
    } catch {
      toast.error("Could not open the document.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={open}
      loading={loading}
      leftIcon={<Download size={15} />}
    >
      {label}
    </Button>
  );
}
