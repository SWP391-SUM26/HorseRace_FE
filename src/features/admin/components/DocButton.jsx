import { useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/common/ui";
import { apiClient } from "@/common/lib/apiClient";
import { useToast } from "@/common/providers/ToastProvider";
function DocButton({ label, path }) {
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
    setLoading(true);
    try {
      const res = await apiClient.get(path.replace(/^\/api\/v1/, ""), { responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      urlsRef.current.push(url);
      window.open(url, "_blank", "noopener");
    } catch {
      toast.error("Could not open the document.");
    } finally {
      setLoading(false);
    }
  };
  return <Button variant="secondary" size="sm" onClick={open} loading={loading} leftIcon={<Download size={15} />}>
      {label}
    </Button>;
}
export {
  DocButton
};
