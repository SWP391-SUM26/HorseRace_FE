import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Mail, Search, Send } from "lucide-react";
import { PageHeader } from "@/common/components/PageHeader";
import { Badge, Button, Card, CardBody, CardHeader, EmptyState, Modal, Skeleton } from "@/common/ui";
import { useAuth } from "@/common/hooks/useAuth";
import {
  cancelInvitation,
  getInvitationList,
  getJockeyList,
  getOwnerUnassignedEntries,
  sendInvitation,
} from "@/services/jockey";

const PAGE_SIZE = 4;

function getUserId(user) {
  return user?.id || user?.userId || user?.user_id || "";
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function formatDate(value) {
  if (!value) return "TBA";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function initials(name = "") {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function JockeyMarket() {
  const { user } = useAuth();
  const ownerId = getUserId(user);
  const location = useLocation();
  const navigate = useNavigate();

  const [entries, setEntries] = useState([]);
  const [selectedEntryId, setSelectedEntryId] = useState(location.state?.selectedHorseId || "");
  const [jockeys, setJockeys] = useState([]);
  const [sentInvitations, setSentInvitations] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 });
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    ridingStyle: "",
    minWinRate: "",
    sortBy: "compatibility",
    sortOrder: "desc",
    page: 1,
    pageSize: PAGE_SIZE,
  });
  const [loading, setLoading] = useState(true);
  const [jockeyLoading, setJockeyLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [inviteTarget, setInviteTarget] = useState(null);
  const [message, setMessage] = useState("");

  const selectedEntry = useMemo(() => {
    if (entries.length === 0) return null;
    return entries.find((entry) => entry.id === selectedEntryId || entry.entryId === selectedEntryId) || entries[0];
  }, [entries, selectedEntryId]);

  useEffect(() => {
    if (selectedEntry && !selectedEntryId) {
      setSelectedEntryId(selectedEntry.id || selectedEntry.entryId);
    }
  }, [selectedEntry, selectedEntryId]);

  async function loadOwnerData() {
    if (!ownerId) return;
    setLoading(true);
    setError("");
    try {
      const [entryData, invitationData] = await Promise.all([
        getOwnerUnassignedEntries(ownerId),
        getInvitationList({ ownerId, page: 1, pageSize: 20 }),
      ]);
      setEntries(entryData || []);
      setSentInvitations(invitationData?.items || []);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || requestError.message || "Unable to load owner invitation data.");
    } finally {
      setLoading(false);
    }
  }

  async function loadJockeys() {
    setJockeyLoading(true);
    setError("");
    try {
      const result = await getJockeyList(filters);
      setJockeys(result.items || []);
      setPagination({
        page: result.page || filters.page,
        totalPages: result.totalPages || 1,
        totalItems: result.totalItems || 0,
      });
    } catch (requestError) {
      setError(requestError?.response?.data?.message || requestError.message || "Unable to load jockeys.");
    } finally {
      setJockeyLoading(false);
    }
  }

  useEffect(() => {
    loadOwnerData();
  }, [ownerId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(loadJockeys, 400);
    return () => window.clearTimeout(timeoutId);
  }, [filters]);

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value, page: key === "page" ? value : 1 }));
  }

  function openInvite(jockey) {
    if (!selectedEntry?.entryId) {
      setError("Please select a horse with a valid race entry first.");
      return;
    }
    setInviteTarget(jockey);
    setMessage("");
  }

  async function handleInvite() {
    if (!inviteTarget || !selectedEntry?.entryId) return;
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await sendInvitation({
        entryId: selectedEntry.entryId,
        jockeyUserId: inviteTarget.userId || inviteTarget.id,
        message,
      });
      setSuccess(`Invitation sent to ${inviteTarget.name} for ${selectedEntry.name}.`);
      setInviteTarget(null);
      await loadOwnerData();
    } catch (requestError) {
      setError(requestError?.response?.data?.message || requestError.message || "Unable to send invitation.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancelInvitation(invitationId) {
    setSubmitting(true);
    setError("");
    try {
      await cancelInvitation(invitationId);
      setSuccess("Invitation cancelled.");
      await loadOwnerData();
    } catch (requestError) {
      setError(requestError?.response?.data?.message || requestError.message || "Unable to cancel invitation.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jockey Selection"
        subtitle="Review available jockeys and invite elite jockeys to ride your stable's champions."
      />

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-danger">{error}</div>}
      {success && (
        <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-success">
          <span>{success}</span>
          <button type="button" onClick={() => setSuccess("")}>x</button>
        </div>
      )}

      <div className="grid min-w-0 gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <div className="min-w-0 space-y-6">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <h2 className="font-semibold uppercase tracking-wide text-ink">Unassigned Horses</h2>
              <Badge tone="success">{entries.length}</Badge>
            </CardHeader>
            <CardBody>
              {loading ? (
                <Skeleton className="h-52 rounded-xl" />
              ) : entries.length === 0 ? (
                <EmptyState title="No approved race entries are waiting for a jockey." />
              ) : (
                <div className="space-y-3">
                  {entries.map((entry) => {
                    const entryKey = entry.id || entry.entryId;
                    const active = entryKey === (selectedEntry?.id || selectedEntry?.entryId);
                    return (
                      <button
                        key={entryKey}
                        type="button"
                        onClick={() => setSelectedEntryId(entryKey)}
                        className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                          active ? "border-brand-700 bg-brand-50" : "border-border bg-surface hover:bg-subtle/50"
                        }`}
                      >
                        <div className="h-14 w-14 overflow-hidden rounded-xl bg-brand-900">
                          {entry.image ? <img src={entry.image} alt="" className="h-full w-full object-cover" /> : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-ink">{entry.name}</p>
                          <p className="truncate text-sm text-muted">{entry.breed || entry.gender || "Horse"}</p>
                          <p className="truncate text-xs text-muted">{entry.raceName}</p>
                        </div>
                        <span className="text-sm font-semibold text-success">{active ? "Selected" : "Select"}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="font-semibold uppercase tracking-wide text-ink">Selected Race Details</h2>
            </CardHeader>
            <CardBody>
              {selectedEntry ? (
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between gap-4"><dt className="text-muted">Race</dt><dd className="font-semibold text-ink">{selectedEntry.raceName}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-muted">Tournament</dt><dd className="font-semibold text-ink">{selectedEntry.tournamentName || "N/A"}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-muted">Date</dt><dd className="font-semibold text-ink">{formatDate(selectedEntry.scheduledStartAt)}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-muted">Race Type</dt><dd className="font-semibold text-ink">{selectedEntry.raceType || "N/A"}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-muted">Distance</dt><dd className="font-semibold text-ink">{selectedEntry.distanceMeter ? `${selectedEntry.distanceMeter}m` : "N/A"}</dd></div>
                </dl>
              ) : (
                <p className="text-sm text-muted">Select a horse to review its upcoming race.</p>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between">
              <h2 className="font-semibold uppercase tracking-wide text-ink">Sent Invitations</h2>
              <Badge tone="success">{sentInvitations.length}</Badge>
            </CardHeader>
            <CardBody>
              {sentInvitations.length === 0 ? (
                <EmptyState title="No invitations sent yet" />
              ) : (
                <div className="space-y-3">
                  {sentInvitations.slice(0, 5).map((invitation) => (
                    <div key={invitation.assignmentId || invitation.invitationId || invitation.id} className="rounded-xl border border-border p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-ink">{invitation.jockeyName || invitation.jockeyFullName || "Jockey"}</p>
                          <p className="text-sm text-muted">{invitation.horseName} / {invitation.raceName}</p>
                        </div>
                        <Badge tone={invitation.status === "ACCEPTED" ? "success" : invitation.status === "REJECTED" ? "danger" : "warning"}>{invitation.status}</Badge>
                      </div>
                      {invitation.status === "INVITED" && (
                        <button
                          type="button"
                          className="mt-2 text-sm font-semibold text-danger"
                          disabled={submitting}
                          onClick={() => handleCancelInvitation(invitation.assignmentId || invitation.invitationId || invitation.id)}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px_180px]">
              <label className="relative">
                <Search className="absolute left-3 top-3 text-muted" size={16} />
                <input
                  className="h-11 w-full rounded-lg border border-border bg-surface pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                  value={filters.search}
                  onChange={(event) => updateFilter("search", event.target.value)}
                  placeholder="Search jockey or riding style..."
                />
              </label>
              <select className="h-11 rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500" value={filters.sortBy} onChange={(event) => updateFilter("sortBy", event.target.value)}>
                <option value="compatibility">Best Match</option>
                <option value="winRate">Highest Win Rate</option>
                <option value="experience">Most Experienced</option>
                <option value="baseFee">Lowest Base Fee</option>
              </select>
              <select className="h-11 rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500" value={filters.status} onChange={(event) => updateFilter("status", event.target.value)}>
                <option value="">All statuses</option>
                <option value="AVAILABLE">Available</option>
                <option value="ACTIVE">Active</option>
              </select>
              <select className="h-11 rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500" value={filters.minWinRate} onChange={(event) => updateFilter("minWinRate", event.target.value)}>
                <option value="">Any win rate</option>
                <option value="10">10%+</option>
                <option value="20">20%+</option>
                <option value="30">30%+</option>
              </select>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="font-semibold text-ink">Available Jockeys</h2>
              <p className="text-sm text-muted">{pagination.totalItems} results</p>
            </div>

            {jockeyLoading ? (
              <div className="p-6"><Skeleton className="h-96 rounded-xl" /></div>
            ) : jockeys.length === 0 ? (
              <div className="p-6"><EmptyState title="No jockeys match your filters" /></div>
            ) : (
              <div className="w-full max-w-full overflow-x-auto">
                <div className="min-w-[980px] divide-y divide-border">
                {jockeys.map((jockey) => (
                  <div key={jockey.id} className="grid grid-cols-[280px_180px_1fr_180px] gap-6 px-6 py-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-brand-700 text-lg font-bold text-white">
                        {jockey.avatar ? <img src={jockey.avatar} alt="" className="h-full w-full object-cover" /> : initials(jockey.name)}
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-ink">{jockey.name}</p>
                        <p className="text-sm text-muted">Rating {jockey.rating} · {jockey.careerWins} career wins</p>
                        <Badge tone="success">{jockey.status}</Badge>
                      </div>
                    </div>

                    <div className="rounded-xl bg-brand-50 p-4 text-center">
                      <p className="text-xs font-semibold uppercase text-muted">Win Rate</p>
                      <strong className="block text-3xl text-success">{jockey.winRate}%</strong>
                      <p className="text-xs font-semibold text-muted">{jockey.compatibility}% compatibility</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <Info label="Riding Style" value={jockey.ridingStyle} />
                      <Info label="Min Weight" value={jockey.minWeight} />
                      <Info label="Stable Status" value={jockey.stableStatus} />
                      <Info label="Base Riding Fee" value={formatCurrency(jockey.baseFee)} />
                      <Info label="Prize Percentage" value={`${jockey.prizePercentage}% of purse`} />
                      <Info label="Trophy Cabinet" value={jockey.trophies?.join(", ") || "Not listed"} />
                    </div>

                    <div className="flex flex-col justify-center gap-3">
                      <Button type="button" variant="secondary" onClick={() => navigate(`/owner/jockey-market/${jockey.id}`, { state: { selectedHorseId: selectedEntry?.id || selectedEntry?.entryId } })}>
                        View Profile
                      </Button>
                      <Button type="button" onClick={() => openInvite(jockey)} leftIcon={<Send size={15} />}>
                        Invite to Ride
                      </Button>
                    </div>
                  </div>
                ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
              <Button type="button" variant="secondary" disabled={pagination.page <= 1} onClick={() => updateFilter("page", pagination.page - 1)}>Previous</Button>
              <span className="text-sm text-muted">Page {pagination.page} of {pagination.totalPages}</span>
              <Button type="button" variant="secondary" disabled={pagination.page >= pagination.totalPages} onClick={() => updateFilter("page", pagination.page + 1)}>Next</Button>
            </div>
          </CardBody>
        </Card>
      </div>

      <Modal
        open={!!inviteTarget}
        onClose={() => setInviteTarget(null)}
        title="Confirm Invitation"
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setInviteTarget(null)}>Cancel</Button>
            <Button type="button" loading={submitting} onClick={handleInvite} leftIcon={<Mail size={15} />}>Send Invitation</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="rounded-xl bg-subtle p-4 text-sm">
            <p><strong>Horse:</strong> {selectedEntry?.name}</p>
            <p><strong>Race:</strong> {selectedEntry?.raceName}</p>
            <p><strong>Jockey:</strong> {inviteTarget?.name}</p>
          </div>
          <label className="block text-sm font-semibold text-ink">
            Optional Message
            <textarea
              className="mt-2 min-h-28 w-full rounded-lg border border-border p-3 outline-none focus:ring-2 focus:ring-brand-500"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Add a note for the jockey..."
            />
          </label>
        </div>
      </Modal>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-muted">{label}</p>
      <p className="mt-1 truncate font-semibold text-ink" title={String(value || "")}>{value || "N/A"}</p>
    </div>
  );
}
