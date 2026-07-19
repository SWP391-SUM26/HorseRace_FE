import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button, Modal, Select } from "@/common/ui";
import { useToast } from "@/common/providers/ToastProvider";
import { getApiErrorMessage } from "@/common/lib/apiError";
import {
  useAssignReferee,
  useRacePanel,
  useRefereeConflicts,
  useStaff,
} from "../hooks";
import { PANEL_ROLE_OPTIONS } from "../constants";

/**
 * Assign one or more referees (each with a panel role) to a race, in one shot.
 * Self-contained: fetches the race's current panel, the staff list, and the
 * referee time-conflict set itself, so callers only pass `raceId` + `onClose`.
 * Mounted from both the Staffing list (per-row quick-assign) and the per-race
 * Staffing detail page.
 */
export function AssignPanelModal({ raceId, onClose }) {
  const toast = useToast();
  const staffQuery = useStaff();
  const panelQuery = useRacePanel(raceId);
  const conflictsQuery = useRefereeConflicts(raceId);
  const assign = useAssignReferee();
  const [rows, setRows] = useState([
    { refereeUserId: "", panelRole: "STEWARD" },
  ]);

  const staff = staffQuery.data ?? [];
  // Exclude referees already on the panel, chosen in another row, or busy at an
  // overlapping time (±window).
  const assignedRefereeIds = (panelQuery.data ?? []).map((p) => p.refereeUserId);
  const chosen = new Set([
    ...assignedRefereeIds,
    ...(conflictsQuery.data ?? []),
    ...rows.map((r) => r.refereeUserId).filter(Boolean),
  ]);

  function setRow(i, patch) {
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRows((rs) => [...rs, { refereeUserId: "", panelRole: "STEWARD" }]);
  }

  function removeRow(i) {
    setRows((rs) => rs.filter((_, idx) => idx !== i));
  }

  async function assignAll() {
    const valid = rows.filter((r) => r.refereeUserId);
    if (valid.length === 0) return toast.error("Pick at least one referee");
    const results = await Promise.allSettled(
      valid.map((r) =>
        assign.mutateAsync({
          raceId,
          refereeUserId: r.refereeUserId,
          panelRole: r.panelRole,
        }),
      ),
    );
    const ok = results.filter((x) => x.status === "fulfilled").length;
    const failed = results.length - ok;
    if (ok > 0) toast.success(`Assigned ${ok} referee${ok === 1 ? "" : "s"}`);
    if (failed > 0) {
      const firstErr = results.find((x) => x.status === "rejected");
      toast.error(
        `${failed} failed — ${firstErr ? getApiErrorMessage(firstErr.reason) : "please retry"}`,
      );
    }
    if (failed === 0) onClose();
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title="Assign Referees to Panel"
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={assign.isPending}
          >
            Cancel
          </Button>
          <Button loading={assign.isPending} onClick={assignAll}>
            Assign All
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted">
          Add one or more referees, each with a panel role. They’re assigned all
          at once.
        </p>
        {rows.map((row, i) => {
          const options = [
            {
              value: "",
              label: staffQuery.isPending ? "Loading…" : "Select a referee…",
            },
            ...staff
              .filter(
                (s) => s.userId === row.refereeUserId || !chosen.has(s.userId),
              )
              .map((s) => ({
                value: s.userId,
                label: `${s.fullName}${s.assignedRaceCount != null ? ` (${s.assignedRaceCount} races)` : ""}`,
              })),
          ];
          return (
            <div
              key={i}
              className="flex flex-wrap items-end gap-2 rounded-xl border border-border p-3"
            >
              <div className="min-w-0 flex-1">
                <Select
                  label="Referee"
                  value={row.refereeUserId}
                  onChange={(e) => setRow(i, { refereeUserId: e.target.value })}
                  options={options}
                />
              </div>
              <div className="w-full sm:w-44">
                <Select
                  label="Panel role"
                  value={row.panelRole}
                  onChange={(e) => setRow(i, { panelRole: e.target.value })}
                  options={PANEL_ROLE_OPTIONS}
                />
              </div>
              {rows.length > 1 && (
                <Button
                  variant="ghost"
                  className="text-muted"
                  onClick={() => removeRow(i)}
                  aria-label="Remove row"
                >
                  <X size={16} />
                </Button>
              )}
            </div>
          );
        })}
        <div>
          <Button variant="secondary" size="sm" onClick={addRow}>
            <Plus size={14} /> Add another referee
          </Button>
        </div>
      </div>
    </Modal>
  );
}
