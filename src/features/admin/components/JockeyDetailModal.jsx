import { Avatar, Badge, Modal } from "@/common/ui";
import { humanize } from "../api";
import { useAdminJockey } from "../hooks";
import { USER_STATUS_TONE } from "../constants";
function Field({ label, value }) {
  return <div>
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-0.5 text-sm text-ink">{value ?? "\u2014"}</p>
    </div>;
}
function JockeyDetailModal({ fallback, onClose }) {
  const query = useAdminJockey(fallback.userId);
  const j = query.data ?? fallback;
  return <Modal open onClose={onClose} size="lg" title={j.fullName ?? "Jockey detail"}>
      {
    /* `fallback` (the row data) always seeds initial data, so there is no loading state to gate on. */
  }
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <Avatar name={j.fullName ?? "\u2014"} src={j.avatarUrl} size={48} />
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-ink">{j.fullName ?? "\u2014"}</p>
            <p className="truncate text-xs text-muted">{j.userCode ?? "\u2014"} · {j.email ?? "\u2014"}</p>
          </div>
          {j.status && <span className="ml-auto"><Badge tone={USER_STATUS_TONE[j.status] ?? "neutral"}>{humanize(j.status)}</Badge></span>}
        </div>

        {
    /* Licence + physicals */
  }
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field label="Licence" value={j.licenseNo} />
          <Field label="Phone" value={j.phone} />
          <Field label="Riding style" value={j.ridingStyle} />
          <Field label="Body weight" value={j.bodyWeight != null ? `${j.bodyWeight} kg` : null} />
          <Field label="Height" value={j.heightCm != null ? `${j.heightCm} cm` : null} />
          <Field label="Experience" value={j.experienceYrs != null ? `${j.experienceYrs} yr${j.experienceYrs === 1 ? "" : "s"}` : null} />
        </div>

        {
    /* Career stats */
  }
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Career Stats</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Field label="Wins" value={j.winCount ?? 0} />
            <Field label="Win rate" value={j.winRate != null ? `${Math.round(j.winRate * 100)}%` : null} />
            <Field label="Rating" value={j.rating != null ? j.rating.toFixed(1) : null} />
            <Field label="Last trophy" value={j.lastTrophy} />
          </div>
          {j.recentForm && j.recentForm.length > 0 && <div className="mt-3">
              <p className="mb-1.5 text-xs uppercase tracking-wide text-muted">Recent form</p>
              <div className="flex flex-wrap gap-1.5">
                {j.recentForm.map((f, i) => <span
    key={i}
    className={`flex h-6 w-6 items-center justify-center rounded text-xs font-bold ${f === "W" ? "bg-brand-50 text-success" : "bg-subtle text-muted"}`}
  >
                    {f}
                  </span>)}
              </div>
            </div>}
        </div>

        {j.bio && <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">Bio</p>
            <p className="text-sm text-ink">{j.bio}</p>
          </div>}
      </div>
    </Modal>;
}
export {
  JockeyDetailModal
};
