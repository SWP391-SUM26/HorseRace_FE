import { useCallback, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  acceptInvitation,
  getInvitationList,
  rejectInvitation,
} from "../../services/jockey";
import styles from "./InvitationList.module.css";

const PAGE_SIZE = 6;

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || error?.message || fallback;
}

function formatDate(value) {
  if (!value) return "Not scheduled";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: value.includes("T") ? "short" : undefined,
  }).format(date);
}

export default function InvitationList() {
  const { session } = useOutletContext();
  const [invitations, setInvitations] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState("");
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [notice, setNotice] = useState(null);

  const loadInvitations = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getInvitationList({
        search: debouncedSearch,
        status,
        jockeyId: session.user.id,
        page,
        pageSize: PAGE_SIZE,
        sortBy: "invitedAt",
        sortOrder: "desc",
      });
      setInvitations(result.items);
      setTotalPages(result.totalPages);
      setTotalItems(result.totalItems);
      if (result.page !== page) setPage(result.page);
    } catch (requestError) {
      setInvitations([]);
      setError(
        getErrorMessage(requestError, "Unable to load your invitations."),
      );
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page, session.user.id, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const timer = window.setTimeout(loadInvitations, 0);
    return () => window.clearTimeout(timer);
  }, [loadInvitations]);

  async function handleAccept(invitation) {
    const invitationId = invitation.assignmentId || invitation.id;
    setProcessingId(invitationId);
    setNotice(null);
    try {
      await acceptInvitation(invitationId);
      setNotice({ type: "success", text: "Invitation accepted successfully." });
      await loadInvitations();
    } catch (requestError) {
      setNotice({
        type: "error",
        text: getErrorMessage(requestError, "Unable to accept invitation."),
      });
    } finally {
      setProcessingId("");
    }
  }

  async function handleReject(event) {
    event.preventDefault();
    const invitationId = rejectTarget.assignmentId || rejectTarget.id;
    setProcessingId(invitationId);
    setNotice(null);
    try {
      await rejectInvitation(invitationId, { reason: rejectReason.trim() });
      setNotice({ type: "success", text: "Invitation rejected." });
      setRejectTarget(null);
      setRejectReason("");
      await loadInvitations();
    } catch (requestError) {
      setNotice({
        type: "error",
        text: getErrorMessage(requestError, "Unable to reject invitation."),
      });
    } finally {
      setProcessingId("");
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <span>Ride Opportunities</span>
          <h2>My Invitations</h2>
          <p>Review race invitations from horse owners.</p>
        </div>
        <div className={styles.invitationCount}>
          <strong>{totalItems}</strong>
          <span>Total Invitations</span>
        </div>
      </header>

      {notice && (
        <div
          className={`${styles.notice} ${
            notice.type === "success" ? styles.noticeSuccess : styles.noticeError
          }`}
          role="alert"
        >
          {notice.text}
        </div>
      )}

      <section className={styles.controlBar}>
        <label className={styles.searchField}>
          <span>Search</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search race, horse, or owner..."
          />
        </label>
        <label>
          <span>Status</span>
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            <option value="INVITED">Pending</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="DECLINED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </label>
      </section>

      <section className={styles.listCard}>
        <div className={styles.tableViewport}>
          <table>
            <thead>
              <tr>
                <th>Invitation ID</th>
                <th>Race</th>
                <th>Horse</th>
                <th>Owner</th>
                <th>Race Date</th>
                <th>Message</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <StateRow text="Loading invitations..." />
              ) : error ? (
                <StateRow text={error} error />
              ) : invitations.length === 0 ? (
                <StateRow text="No invitations match the selected criteria." />
              ) : (
                invitations.map((invitation) => {
                  const invitationId =
                    invitation.assignmentId || invitation.id;
                  const isPending = invitation.status === "INVITED";
                  const isProcessing = processingId === invitationId;
                  return (
                    <tr key={invitationId}>
                      <td>
                        <code>{invitationId}</code>
                        <small>Sent {formatDate(invitation.invitedAt)}</small>
                      </td>
                      <td>
                        <strong>{invitation.raceName}</strong>
                        <small>{invitation.raceCode || invitation.raceId}</small>
                      </td>
                      <td>{invitation.horseName}</td>
                      <td>{invitation.ownerName}</td>
                      <td>
                        {formatDate(
                          invitation.scheduledStartAt || invitation.raceDate,
                        )}
                      </td>
                      <td className={styles.messageCell}>
                        {invitation.message || "No message provided."}
                        {invitation.reason && (
                          <small>Reason: {invitation.reason}</small>
                        )}
                      </td>
                      <td>
                        <span
                          className={`${styles.statusBadge} ${
                            styles[`status${invitation.status}`]
                          }`}
                        >
                          {invitation.status === "INVITED"
                            ? "PENDING"
                            : invitation.status}
                        </span>
                      </td>
                      <td>
                        {isPending ? (
                          <div className={styles.actions}>
                            <button
                              type="button"
                              className={styles.acceptButton}
                              disabled={isProcessing}
                              onClick={() => handleAccept(invitation)}
                            >
                              {isProcessing ? "Working..." : "Accept"}
                            </button>
                            <button
                              type="button"
                              className={styles.rejectButton}
                              disabled={isProcessing}
                              onClick={() => {
                                setRejectTarget(invitation);
                                setRejectReason("");
                              }}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className={styles.noAction}>Completed</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.pagination}>
          <span>
            Page <strong>{page}</strong> of <strong>{totalPages}</strong>
          </span>
          <div>
            <button
              type="button"
              disabled={page === 1 || loading}
              onClick={() => setPage((current) => current - 1)}
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page === totalPages || loading}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {rejectTarget && (
        <div className={styles.overlay}>
          <section className={styles.modal} role="dialog" aria-modal="true">
            <header>
              <div>
                <span>Decline ride opportunity</span>
                <h3>Reject Invitation</h3>
              </div>
              <button
                type="button"
                disabled={Boolean(processingId)}
                onClick={() => setRejectTarget(null)}
              >
                x
              </button>
            </header>
            <form onSubmit={handleReject}>
              <div className={styles.rejectSummary}>
                <strong>{rejectTarget.raceName}</strong>
                <span>
                  {rejectTarget.horseName} / {rejectTarget.ownerName}
                </span>
              </div>
              <label className={styles.reasonField}>
                <span>Reason</span>
                <textarea
                  required
                  rows="4"
                  maxLength="400"
                  value={rejectReason}
                  onChange={(event) => setRejectReason(event.target.value)}
                  placeholder="Explain why you cannot accept this ride..."
                />
                <small>{rejectReason.length}/400</small>
              </label>
              <div className={styles.modalActions}>
                <button
                  type="button"
                  disabled={Boolean(processingId)}
                  onClick={() => setRejectTarget(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.confirmReject}
                  disabled={Boolean(processingId) || !rejectReason.trim()}
                >
                  {processingId ? "Rejecting..." : "Reject Invitation"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

function StateRow({ text, error = false }) {
  return (
    <tr>
      <td
        colSpan="8"
        className={`${styles.stateCell} ${error ? styles.stateError : ""}`}
      >
        {text}
      </td>
    </tr>
  );
}
