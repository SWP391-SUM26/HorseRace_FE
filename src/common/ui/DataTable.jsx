import { cn } from "@/common/lib/cn";
import { Skeleton } from "./Skeleton";
import { EmptyState } from "./EmptyState";
function DataTable({ rows, columns, rowKey, loading, emptyLabel = "Kh\xF4ng c\xF3 d\u1EEF li\u1EC7u", onRowClick, rowClassName, flush }) {
  if (loading) {
    return <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
      </div>;
  }
  if (rows.length === 0) return <EmptyState title={emptyLabel} />;
  return <div className={cn("w-full max-w-full overflow-x-auto bg-surface", !flush && "rounded-2xl border border-border")}>
      <table className="min-w-[760px] w-full text-left text-sm">
        <thead className="border-b border-border bg-subtle/50">
          <tr>{columns.map((c) => <th key={c.key} className={cn("px-4 py-3 font-medium text-muted", c.className)}>{c.header}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row) => <tr
    key={rowKey(row)}
    onClick={() => onRowClick?.(row)}
    className={cn("border-b border-border last:border-0", onRowClick && "cursor-pointer hover:bg-subtle/40", rowClassName?.(row))}
  >
              {columns.map((c) => <td key={c.key} className={cn("px-4 py-3 align-middle text-ink", c.className)}>{c.render(row)}</td>)}
            </tr>)}
        </tbody>
      </table>
    </div>;
}
export {
  DataTable
};
