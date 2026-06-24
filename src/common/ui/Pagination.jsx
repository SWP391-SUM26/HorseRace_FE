import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";
function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return <div className="flex items-center justify-end gap-2">
      <Button size="sm" variant="ghost" disabled={page <= 0} onClick={() => onChange(page - 1)} leftIcon={<ChevronLeft size={16} />}>Trước</Button>
      <span className="text-sm text-muted">Trang {page + 1}/{totalPages}</span>
      <Button size="sm" variant="ghost" disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)}>Sau<ChevronRight size={16} /></Button>
    </div>;
}
export {
  Pagination
};
