import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import {
  cancelInvitation,
  getInvitationList,
  getJockeyList,
  sendInvitation,
} from "../../services/jockey";
import styles from "./JockeyMarket.module.css";

const PAGE_SIZE = 4;

const SORT_OPTIONS = {
  bestMatch: { sortBy: "compatibility", sortOrder: "desc" },
  winRate: { sortBy: "winRate", sortOrder: "desc" },
  experience: { sortBy: "experience", sortOrder: "desc" },
  baseFee: { sortBy: "baseFee", sortOrder: "asc" },
};

function getInitials(name = "") {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || error?.message || fallback;
}

export default function JockeyMarket() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useOutletContext();
  const [jockeys, setJockeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [ridingStyle, setRidingStyle] = useState("");
  const [minWinRate, setMinWinRate] = useState("");
  const [sortOption, setSortOption] = useState("bestMatch");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedHorseId] = useState(location.state?.selectedHorseId || "");
  const [selectedJockey, setSelectedJockey] = useState(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState(null);
  const [sentInvitations, setSentInvitations] = useState([]);
  const [invitationLoading, setInvitationLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState("");

  const selectedHorse = useMemo(
    () => location.state?.selectedEntry || null,
    [location.state?.selectedEntry],
  );
  const requestedJockey = useMemo(
    () =>
      jockeys.find((jockey) => jockey.id === location.state?.inviteJockeyId) ||
      null,
    [jockeys, location.state?.inviteJockeyId],
  );
  const invitationJockey =
    selectedJockey || (selectedHorse?.entryId ? requestedJockey : null);

  const loadSentInvitations = useCallback(async () => {
    setInvitationLoading(true);
    try {
      const result = await getInvitationList({
        ownerId: session.user.id,
        page: 1,
        pageSize: 5,
        sortBy: "invitedAt",
        sortOrder: "desc",
      });
      setSentInvitations(result.items);
    } catch {
      setSentInvitations([]);
    } finally {
      setInvitationLoading(false);
    }
  }, [session.user.id]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setCurrentPage(1);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let active = true;

    async function loadJockeys() {
      setLoading(true);
      setLoadError("");
      const sorting = SORT_OPTIONS[sortOption];

      try {
        const result = await getJockeyList({
          search: debouncedSearch,
          status,
          ridingStyle,
          minWinRate,
          sortBy: sorting.sortBy,
          sortOrder: sorting.sortOrder,
          page: currentPage,
          pageSize: PAGE_SIZE,
        });

        if (!active) return;
        setJockeys(result.items);
        setTotalPages(result.totalPages);
        setTotalItems(result.totalItems);
        if (result.page !== currentPage) setCurrentPage(result.page);
      } catch (error) {
        if (!active) return;
        setJockeys([]);
        setLoadError(getErrorMessage(error, "Unable to load jockeys."));
      } finally {
        if (active) setLoading(false);
      }
    }

    loadJockeys();
    return () => {
      active = false;
    };
  }, [
    currentPage,
    debouncedSearch,
    minWinRate,
    ridingStyle,
    sortOption,
    status,
  ]);

  useEffect(() => {
    const timer = window.setTimeout(loadSentInvitations, 0);
    return () => window.clearTimeout(timer);
  }, [loadSentInvitations]);

  function resetPageAndSet(setter, value) {
    setter(value);
    setCurrentPage(1);
  }

  function openInvitation(jockey) {
    setNotice(null);
    if (!selectedHorse?.entryId) {
      setNotice({
        type: "error",
        text: "Please select a real race entry before sending an invitation.",
      });
      return;
    }
    if (jockey.status === "UNAVAILABLE") {
      setNotice({
        type: "error",
        text: `${jockey.name} is currently unavailable.`,
      });
      return;
    }
    setSelectedJockey(jockey);
    setMessage("");
  }

  function closeInvitation() {
    if (sending) return;
    setSelectedJockey(null);
    setMessage("");
    if (location.state?.inviteJockeyId) {
      navigate(location.pathname, {
        replace: true,
        state: { selectedHorseId },
      });
    }
  }

  async function handleSendInvitation(event) {
    event.preventDefault();
    if (!selectedHorse || !invitationJockey) return;

    setSending(true);
    try {
      await sendInvitation({
        entryId: selectedHorse.entryId,
        horseId: selectedHorse.id,
        raceId: selectedHorse.raceId,
        jockeyId: invitationJockey.id,
        ownerId: session.user.id,
        message: message.trim(),
      });
      setNotice({
        type: "success",
        text: `Invitation sent to ${invitationJockey.name} for ${selectedHorse.name}.`,
      });
      setSelectedJockey(null);
      setMessage("");
      if (location.state?.inviteJockeyId) {
        navigate(location.pathname, {
          replace: true,
          state: { selectedHorseId },
        });
      }
      await loadSentInvitations();
    } catch (error) {
      setNotice({
        type: "error",
        text: getErrorMessage(error, "Unable to send the invitation."),
      });
    } finally {
      setSending(false);
    }
  }

  async function handleCancelInvitation(invitation) {
    if (!window.confirm(`Cancel invitation for ${invitation.horseName}?`))
      return;
    const invitationId = invitation.assignmentId || invitation.id;
    setCancellingId(invitationId);
    try {
      await cancelInvitation(invitationId);
      setNotice({
        type: "success",
        text: "Invitation cancelled successfully.",
      });
      await loadSentInvitations();
    } catch (error) {
      setNotice({
        type: "error",
        text: getErrorMessage(error, "Unable to cancel the invitation."),
      });
    } finally {
      setCancellingId("");
    }
  }

  return (
    <div className={styles.marketPage}>
      <header className={styles.pageHeader}>
        <div>
          <span className={styles.eyebrow}>Marketplace / Assign Jockey</span>
          <h2>Jockey Selection</h2>
          <p>
            Review available jockeys and invite elite jockeys to ride your
            stable&apos;s champions.
          </p>
        </div>
      </header>

      {notice && (
        <div
          className={`${styles.notice} ${
            notice.type === "success"
              ? styles.noticeSuccess
              : styles.noticeError
          }`}
          role="alert"
        >
          <span>{notice.text}</span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            aria-label="Dismiss"
          >
            x
          </button>
        </div>
      )}

      <div className={styles.marketGrid}>
        <aside className={styles.leftColumn}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h3>Unassigned Horses</h3>
              <span>0</span>
            </div>
            <div className={styles.horseList}>
              <p className={styles.emptySelection}>
                No real race entry API is connected yet. Open this page with a
                selected entry containing entryId to send invitations.
              </p>
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h3>Selected Race Details</h3>
            </div>
            {selectedHorse ? (
              <dl className={styles.raceDetails}>
                <div>
                  <dt>Race</dt>
                  <dd>{selectedHorse.raceName || "Not available"}</dd>
                </div>
                <div>
                  <dt>Venue</dt>
                  <dd>{selectedHorse.raceVenue || "Not available"}</dd>
                </div>
                <div>
                  <dt>Date</dt>
                  <dd>{selectedHorse.raceDate || "Not available"}</dd>
                </div>
                <div>
                  <dt>Distance</dt>
                  <dd>
                    {selectedHorse.raceDistance || "Not available"}
                    {selectedHorse.raceSurface
                      ? ` (${selectedHorse.raceSurface})`
                      : ""}
                  </dd>
                </div>
                <div>
                  <dt>Grade</dt>
                  <dd>{selectedHorse.raceGrade || "Not available"}</dd>
                </div>
                <div>
                  <dt>Purse</dt>
                  <dd>
                    {selectedHorse.racePurse
                      ? formatCurrency(selectedHorse.racePurse)
                      : "Not available"}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className={styles.emptySelection}>
                Select a horse to review its upcoming race.
              </p>
            )}
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h3>Sent Invitations</h3>
              <span>{sentInvitations.length}</span>
            </div>
            <div className={styles.sentInvitationList}>
              {invitationLoading ? (
                <p className={styles.emptySelection}>Loading invitations...</p>
              ) : sentInvitations.length === 0 ? (
                <p className={styles.emptySelection}>
                  No invitations sent yet.
                </p>
              ) : (
                sentInvitations.map((invitation) => {
                  const invitationId = invitation.assignmentId || invitation.id;
                  return (
                    <article
                      className={styles.sentInvitation}
                      key={invitationId}
                    >
                      <div>
                        <strong>{invitation.jockeyName}</strong>
                        <span>
                          {invitation.horseName} / {invitation.raceName}
                        </span>
                      </div>
                      <div className={styles.invitationStatusRow}>
                        <span
                          className={`${styles.invitationStatus} ${
                            styles[`invitation${invitation.status}`]
                          }`}
                        >
                          {invitation.status}
                        </span>
                        {invitation.status === "INVITED" && (
                          <button
                            type="button"
                            disabled={cancellingId === invitationId}
                            onClick={() => handleCancelInvitation(invitation)}
                          >
                            {cancellingId === invitationId
                              ? "Cancelling..."
                              : "Cancel"}
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>
        </aside>

        <section className={styles.jockeySection}>
          <div className={styles.controls}>
            <label className={styles.searchField}>
              <span>Search</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search jockey or riding style..."
              />
            </label>

            <label>
              <span>Sort</span>
              <select
                value={sortOption}
                onChange={(event) =>
                  resetPageAndSet(setSortOption, event.target.value)
                }
              >
                <option value="bestMatch">Best Match</option>
                <option value="winRate">Highest Win Rate</option>
                <option value="experience">Most Experienced</option>
                <option value="baseFee">Lowest Base Fee</option>
              </select>
            </label>

            <label>
              <span>Status</span>
              <select
                value={status}
                onChange={(event) =>
                  resetPageAndSet(setStatus, event.target.value)
                }
              >
                <option value="">All statuses</option>
                <option value="AVAILABLE">Available</option>
                <option value="LIMITED">Limited</option>
                <option value="UNAVAILABLE">Unavailable</option>
              </select>
            </label>

            <label>
              <span>Riding Style</span>
              <select
                value={ridingStyle}
                onChange={(event) =>
                  resetPageAndSet(setRidingStyle, event.target.value)
                }
              >
                <option value="">All styles</option>
                <option value="Closer">Closer</option>
                <option value="Front Runner">Front Runner</option>
                <option value="Stalker">Stalker</option>
                <option value="Versatile">Versatile</option>
              </select>
            </label>

            <label>
              <span>Minimum Win Rate</span>
              <select
                value={minWinRate}
                onChange={(event) =>
                  resetPageAndSet(setMinWinRate, event.target.value)
                }
              >
                <option value="">Any win rate</option>
                <option value="15">15%+</option>
                <option value="20">20%+</option>
                <option value="25">25%+</option>
              </select>
            </label>
          </div>

          <div className={styles.resultsHeader}>
            <strong>Available Jockeys</strong>
            <span>{totalItems} results</span>
          </div>

          <div className={styles.jockeyListViewport}>
            {loading ? (
              <div className={styles.stateCard}>Loading jockeys...</div>
            ) : loadError ? (
              <div className={`${styles.stateCard} ${styles.stateError}`}>
                {loadError}
              </div>
            ) : jockeys.length === 0 ? (
              <div className={styles.stateCard}>
                No jockeys match the selected criteria.
              </div>
            ) : (
              <div className={styles.jockeyList}>
                {jockeys.map((jockey) => (
                  <article className={styles.jockeyCard} key={jockey.id}>
                    <div className={styles.jockeyIdentity}>
                      <button
                        type="button"
                        className={styles.avatarButton}
                        onClick={() =>
                          navigate(`/owner/jockey-market/${jockey.id}`, {
                            state: { selectedHorseId },
                          })
                        }
                        aria-label={`View ${jockey.name} profile`}
                      >
                        {jockey.avatar ? (
                          <img src={jockey.avatar} alt="" />
                        ) : (
                          getInitials(jockey.name)
                        )}
                      </button>
                      <div>
                        <button
                          type="button"
                          className={styles.nameButton}
                          onClick={() =>
                            navigate(`/owner/jockey-market/${jockey.id}`, {
                              state: { selectedHorseId },
                            })
                          }
                        >
                          {jockey.name}
                        </button>
                        <div className={styles.rating}>
                          <span>Rating {jockey.rating}</span>
                          <span>{jockey.careerWins} career wins</span>
                        </div>
                        <span
                          className={`${styles.statusBadge} ${
                            styles[`status${jockey.status}`]
                          }`}
                        >
                          {jockey.status}
                        </span>
                      </div>
                    </div>

                    <div className={styles.winRate}>
                      <span>Win Rate</span>
                      <strong>{jockey.winRate}%</strong>
                      <small>{jockey.compatibility}% compatibility</small>
                    </div>

                    <dl className={styles.jockeyStats}>
                      <div>
                        <dt>Riding Style</dt>
                        <dd>{jockey.ridingStyle}</dd>
                      </div>
                      <div>
                        <dt>Min Weight</dt>
                        <dd>{jockey.minWeight}</dd>
                      </div>
                      <div>
                        <dt>Stable Status</dt>
                        <dd>{jockey.stableStatus}</dd>
                      </div>
                      <div>
                        <dt>Base Riding Fee</dt>
                        <dd>{formatCurrency(jockey.baseFee)}</dd>
                      </div>
                      <div>
                        <dt>Prize Percentage</dt>
                        <dd>{jockey.prizePercentage}% of purse</dd>
                      </div>
                      <div>
                        <dt>Trophy Cabinet</dt>
                        <dd>{jockey.trophies.join(", ")}</dd>
                      </div>
                    </dl>

                    <div className={styles.cardActions}>
                      <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={() =>
                          navigate(`/owner/jockey-market/${jockey.id}`, {
                            state: { selectedHorseId },
                          })
                        }
                      >
                        View Profile
                      </button>
                      <button
                        type="button"
                        className={styles.primaryButton}
                        onClick={() => openInvitation(jockey)}
                        disabled={jockey.status === "UNAVAILABLE"}
                      >
                        Invite to Ride
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <div className={styles.pagination}>
            <button
              type="button"
              disabled={currentPage === 1 || loading}
              onClick={() => setCurrentPage((page) => page - 1)}
            >
              Previous
            </button>
            <span>
              Page <strong>{currentPage}</strong> of{" "}
              <strong>{totalPages}</strong>
            </span>
            <button
              type="button"
              disabled={currentPage === totalPages || loading}
              onClick={() => setCurrentPage((page) => page + 1)}
            >
              Next
            </button>
          </div>
        </section>
      </div>

      {invitationJockey && selectedHorse && (
        <div className={styles.modalOverlay} role="presentation">
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="invitation-title"
          >
            <div className={styles.modalHeader}>
              <div>
                <span>Confirm assignment request</span>
                <h3 id="invitation-title">Invite to Ride</h3>
              </div>
              <button
                type="button"
                onClick={closeInvitation}
                disabled={sending}
              >
                x
              </button>
            </div>

            <form onSubmit={handleSendInvitation}>
              <dl className={styles.invitationSummary}>
                <div>
                  <dt>Horse</dt>
                  <dd>{selectedHorse.name}</dd>
                </div>
                <div>
                  <dt>Race</dt>
                  <dd>{selectedHorse.raceName || "Not available"}</dd>
                </div>
                <div>
                  <dt>Jockey</dt>
                  <dd>{invitationJockey.name}</dd>
                </div>
              </dl>

              <label className={styles.messageField}>
                <span>Message (optional)</span>
                <textarea
                  rows="4"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Add race strategy, schedule, or contract notes..."
                  maxLength="500"
                />
                <small>{message.length}/500</small>
              </label>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={closeInvitation}
                  disabled={sending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={sending}
                >
                  {sending ? "Sending..." : "Send Invitation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
