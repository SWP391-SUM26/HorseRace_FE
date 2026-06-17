import { useCallback, useEffect, useMemo, useState } from "react";
import { getRegistrationList } from "../../services/registration";
import {
  assignParticipants,
  cancelRace,
  createRace,
  deleteRace,
  getRaceDetail,
  getRaceList,
  scheduleRace,
  updateRace,
} from "../../services/race";
import { getTournaments } from "../../services/tournament";
import styles from "./RaceManagement.module.css";

const PAGE_SIZE = 5;
const RACE_STATUS_OPTIONS = [
  "SCHEDULED",
  "OPEN",
  "CLOSED",
  "RUNNING",
  "FINISHED",
  "OFFICIAL",
  "CANCELLED",
];
const EMPTY_FORM = {
  tournamentId: "",
  name: "",
  raceType: "",
  distanceMeter: "",
  date: "",
  time: "",
  predictionCutoffAt: "",
  trackCondition: "",
  weatherCondition: "",
  maxParticipants: 12,
};

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || error?.message || fallback;
}

function formatDateTime(race) {
  if (!race.date) return "Not scheduled";
  const date = new Date(`${race.date}T${race.time || "00:00"}`);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function statusClass(status) {
  return styles[`status${status}`] || styles.statusDRAFT;
}

function unwrapApiPayload(response) {
  return response?.data?.data ?? response?.data ?? response;
}

function normalizeTournaments(response) {
  const data = unwrapApiPayload(response);
  const items = Array.isArray(data)
    ? data
    : data?.items ?? data?.content ?? data?.tournaments ?? [];

  return items
    .map((item) => ({
      id: item.tournamentId || item.id,
      name: item.name || item.tournamentName || "Unnamed Tournament",
    }))
    .filter((item) => item.id);
}

function mapRegistrationOption(registration) {
  return {
    id: registration.id || registration.registrationId,
    name: registration.horse?.name || registration.horseName || "Unknown Horse",
    owner: registration.owner?.name || registration.ownerName || "Unknown Owner",
  };
}

export default function RaceManagement() {
  const [races, setRaces] = useState([]);
  const [summaryRaces, setSummaryRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [tournamentId, setTournamentId] = useState("");
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [appliedDates, setAppliedDates] = useState({ dateFrom: "", dateTo: "" });
  const [sort, setSort] = useState("date-asc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [modal, setModal] = useState(null);
  const [selectedRace, setSelectedRace] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [scheduleForm, setScheduleForm] = useState({
    raceId: "",
    date: "",
    time: "",
    predictionCutoffAt: "",
  });
  const [cancelReason, setCancelReason] = useState("");
  const [participantIds, setParticipantIds] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [participantOptions, setParticipantOptions] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState(null);
  const [openActionId, setOpenActionId] = useState(null);

  const [sortBy, sortOrder] = sort.split("-");

  const loadRaces = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [listResult, summaryResult] = await Promise.all([
        getRaceList({
          search: debouncedSearch,
          tournamentId,
          status,
          ...appliedDates,
          sortBy,
          sortOrder,
          page,
          pageSize: PAGE_SIZE,
        }),
        getRaceList({ page: 1, pageSize: 1000 }),
      ]);
      setRaces(listResult.items);
      setTotalPages(listResult.totalPages);
      setTotalItems(listResult.totalItems);
      setSummaryRaces(summaryResult.items);
      setPage((currentPage) =>
        currentPage === listResult.page ? currentPage : listResult.page,
      );
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to load races."));
    } finally {
      setLoading(false);
    }
  }, [
    appliedDates,
    debouncedSearch,
    page,
    sortBy,
    sortOrder,
    status,
    tournamentId,
  ]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const timer = window.setTimeout(loadRaces, 0);
    return () => window.clearTimeout(timer);
  }, [loadRaces]);

  useEffect(() => {
    let ignore = false;

    async function loadReferenceData() {
      try {
        const [tournamentResponse, registrationResponse] = await Promise.all([
          getTournaments({ page: 0, size: 1000 }),
          getRegistrationList({ status: "APPROVED", page: 1, pageSize: 1000 }),
        ]);

        if (ignore) return;
        setTournaments(normalizeTournaments(tournamentResponse));
        setParticipantOptions(
          (registrationResponse.items || [])
            .map(mapRegistrationOption)
            .filter((item) => item.id),
        );
      } catch (requestError) {
        console.warn("Unable to load race reference data.", requestError);
      }
    }

    loadReferenceData();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!openActionId) return undefined;

    function closeActionMenu(event) {
      if (
        event.type === "keydown" &&
        event.key !== "Escape"
      ) {
        return;
      }
      if (
        event.type === "click" &&
        event.target.closest("[data-race-actions]")
      ) {
        return;
      }
      setOpenActionId(null);
    }

    document.addEventListener("click", closeActionMenu);
    document.addEventListener("keydown", closeActionMenu);
    return () => {
      document.removeEventListener("click", closeActionMenu);
      document.removeEventListener("keydown", closeActionMenu);
    };
  }, [openActionId]);

  const stats = useMemo(
    () => ({
      total: summaryRaces.length,
      scheduled: summaryRaces.filter((race) => race.status === "SCHEDULED").length,
      active: summaryRaces.filter((race) =>
        ["OPEN", "RUNNING"].includes(race.status),
      ).length,
      cancelled: summaryRaces.filter((race) => race.status === "CANCELLED").length,
    }),
    [summaryRaces],
  );

  function setFilter(setter, value) {
    setter(value);
    setPage(1);
  }

  function closeModal(force = false) {
    if (submitting && !force) return;
    setModal(null);
    setSelectedRace(null);
    setForm(EMPTY_FORM);
    setCancelReason("");
    setParticipantIds([]);
  }

  function showNotice(text, type = "success") {
    setNotice({ text, type });
    window.setTimeout(() => setNotice(null), 3500);
  }

  function openCreate() {
    setSelectedRace(null);
    setForm(EMPTY_FORM);
    setModal("form");
  }

  function openEdit(race) {
    setSelectedRace(race);
    setForm({
      tournamentId: race.tournamentId || "",
      name: race.name || "",
      raceType: race.raceType || "",
      distanceMeter: race.distanceMeter || "",
      date: race.date || "",
      time: race.time || "",
      predictionCutoffAt: race.predictionCutoffAt ? race.predictionCutoffAt.slice(0, 16) : "",
      trackCondition: race.trackCondition || "",
      weatherCondition: race.weatherCondition || "",
      maxParticipants: race.maxParticipants || 12,
    });
    setModal("form");
  }

  async function openDetail(race) {
    setSubmitting(true);
    try {
      setSelectedRace((await getRaceDetail(race.id)) || race);
      setModal("detail");
    } catch (requestError) {
      showNotice(getErrorMessage(requestError, "Unable to load race details."), "error");
    } finally {
      setSubmitting(false);
    }
  }

  function openSchedule(race = null) {
    setSelectedRace(race);
    setScheduleForm({
      raceId: race?.id || "",
      date: race?.date || "",
      time: race?.time || "",
      predictionCutoffAt: race?.predictionCutoffAt ? race.predictionCutoffAt.slice(0, 16) : "",
    });
    setModal("schedule");
  }

  function openCancel(race) {
    setSelectedRace(race);
    setCancelReason("");
    setModal("cancel");
  }

  function openParticipants(race) {
    setSelectedRace(race);
    setParticipantIds(race.participantIds || []);
    setModal("participants");
  }

  async function refreshAfter(message) {
    closeModal(true);
    await loadRaces();
    showNotice(message);
  }

  async function handleSaveRace(event) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form, maxParticipants: Number(form.maxParticipants) };
      if (selectedRace) {
        await updateRace(selectedRace.id, payload);
        await refreshAfter("Race updated successfully.");
      } else {
        await createRace(payload);
        await refreshAfter("Race created successfully.");
      }
    } catch (requestError) {
      showNotice(getErrorMessage(requestError, "Unable to save race."), "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSchedule(event) {
    event.preventDefault();
    const raceId = selectedRace?.id || scheduleForm.raceId;
    if (!raceId) {
      showNotice("Please select a race.", "error");
      return;
    }
    setSubmitting(true);
    try {
      await scheduleRace(raceId, {
        date: scheduleForm.date,
        time: scheduleForm.time,
        predictionCutoffAt: scheduleForm.predictionCutoffAt,
      });
      await refreshAfter("Race scheduled successfully.");
    } catch (requestError) {
      showNotice(getErrorMessage(requestError, "Unable to schedule race."), "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel(event) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await cancelRace(selectedRace.id);
      await refreshAfter("Race cancelled successfully.");
    } catch (requestError) {
      showNotice(getErrorMessage(requestError, "Unable to cancel race."), "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAssign(event) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await assignParticipants(selectedRace.id, { participantIds });
      await refreshAfter("Participants assigned successfully.");
    } catch (requestError) {
      showNotice(
        getErrorMessage(requestError, "Unable to assign participants."),
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(race) {
    if (!window.confirm(`Delete ${race.name}? This action cannot be undone.`)) return;
    try {
      await deleteRace(race.id);
      await loadRaces();
      showNotice("Race deleted successfully.");
    } catch (requestError) {
      showNotice(getErrorMessage(requestError, "Unable to delete race."), "error");
    }
  }

  function toggleParticipant(id) {
    setParticipantIds((current) =>
      current.includes(id)
        ? current.filter((participantId) => participantId !== id)
        : [...current, id],
    );
  }

  function runAction(action) {
    setOpenActionId(null);
    action();
  }

  return (
    <div className={styles.page}>
      {notice && (
        <div className={`${styles.notice} ${styles[`notice${notice.type}`]}`}>
          {notice.text}
        </div>
      )}

      <header className={styles.pageHeader}>
        <div>
          <h1>Race Management</h1>
          <p>Manage races, schedules, and participants across tournaments.</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.secondaryButton} onClick={() => openSchedule()}>
            Schedule Race
          </button>
          <button className={styles.primaryButton} onClick={openCreate}>
            + Create Race
          </button>
        </div>
      </header>

      <section className={styles.statsGrid}>
        <StatCard label="Total Races" value={stats.total} accent="green" />
        <StatCard label="Scheduled" value={stats.scheduled} accent="blue" />
        <StatCard label="Active" value={stats.active} accent="red" />
        <StatCard label="Cancelled" value={stats.cancelled} accent="gray" />
      </section>

      <section className={styles.filterCard}>
        <label className={styles.searchField}>
          <span>Search Race</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Race name or ID"
          />
        </label>
        <label>
          <span>Tournament</span>
          <select
            value={tournamentId}
            onChange={(event) => setFilter(setTournamentId, event.target.value)}
          >
            <option value="">All Tournaments</option>
            {tournaments.map((tournament) => (
              <option key={tournament.id} value={tournament.id}>
                {tournament.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Status</span>
          <select
            value={status}
            onChange={(event) => setFilter(setStatus, event.target.value)}
          >
            <option value="">All Statuses</option>
            {RACE_STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Date From</span>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </label>
        <label>
          <span>Date To</span>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </label>
        <label>
          <span>Sort</span>
          <select value={sort} onChange={(event) => setFilter(setSort, event.target.value)}>
            <option value="date-asc">Date: Earliest</option>
            <option value="date-desc">Date: Latest</option>
            <option value="name-asc">Name: A-Z</option>
            <option value="name-desc">Name: Z-A</option>
            <option value="createdAt-desc">Newest Created</option>
          </select>
        </label>
        <button
          className={styles.filterButton}
          onClick={() => {
            setAppliedDates({ dateFrom, dateTo });
            setPage(1);
          }}
        >
          Filter
        </button>
      </section>

      <section className={styles.tableCard}>
        <div className={styles.tableViewport}>
          <table>
            <thead>
              <tr>
                <th>Race Details</th>
                <th>Tournament</th>
                <th>Date/Time</th>
                <th>Race Info</th>
                <th>Participants</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <StateRow text="Loading races..." />
              ) : error ? (
                <StateRow text={error} error />
              ) : races.length === 0 ? (
                <StateRow text="No races match the selected filters." />
              ) : (
                races.map((race, raceIndex) => (
                  <tr key={race.id}>
                    <td>
                      <button className={styles.raceName} onClick={() => openDetail(race)}>
                        {race.name}
                      </button>
                      <small>{race.raceCode}</small>
                    </td>
                    <td>{race.tournamentName}</td>
                    <td>{formatDateTime(race)}</td>
                    <td>
                      <strong>{race.raceType || "N/A"}</strong>
                      <small>
                        {race.distanceMeter ? `${race.distanceMeter}m` : "Distance N/A"}
                      </small>
                      <small>{race.trackCondition || "Track condition N/A"}</small>
                    </td>
                    <td>
                      <div className={styles.participantCount}>
                        <span>
                          {(race.participantIds || []).length}/{race.maxParticipants}
                        </span>
                        <div>
                          <i
                            style={{
                              width: `${Math.min(
                                100,
                                ((race.participantIds || []).length /
                                  race.maxParticipants) *
                                  100,
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${statusClass(race.status)}`}>
                        {race.status}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionMenuWrap} data-race-actions>
                        <button
                          type="button"
                          className={styles.actionMenuTrigger}
                          aria-label={`Actions for ${race.name}`}
                          aria-expanded={openActionId === race.id}
                          onClick={() =>
                            setOpenActionId((current) =>
                              current === race.id ? null : race.id,
                            )
                          }
                        >
                          <span></span>
                          <span></span>
                          <span></span>
                        </button>
                        {openActionId === race.id && (
                          <div
                            className={`${styles.actionMenu} ${
                              raceIndex >= races.length - 2
                                ? styles.actionMenuUp
                                : ""
                            }`}
                            role="menu"
                          >
                            <button type="button" onClick={() => runAction(() => openDetail(race))}>
                              View Details
                            </button>
                            <button type="button" onClick={() => runAction(() => openEdit(race))}>
                              Edit Race
                            </button>
                            <button type="button" onClick={() => runAction(() => openSchedule(race))}>
                              Schedule Race
                            </button>
                            <button type="button" onClick={() => runAction(() => openParticipants(race))}>
                              Assign Participants
                            </button>
                            <button
                              type="button"
                              disabled={race.status === "CANCELLED"}
                              onClick={() => runAction(() => openCancel(race))}
                            >
                              Cancel Race
                            </button>
                            <button
                              type="button"
                              className={styles.dangerAction}
                              onClick={() => runAction(() => handleDelete(race))}
                            >
                              Delete Race
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.pagination}>
          <span>
            Showing {races.length ? (page - 1) * PAGE_SIZE + 1 : 0} to{" "}
            {Math.min(page * PAGE_SIZE, totalItems)} of {totalItems} results
          </span>
          <div>
            <button disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
              Previous
            </button>
            <strong>
              {page} / {totalPages}
            </strong>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {modal === "detail" && selectedRace && (
        <DetailDrawer
          race={selectedRace}
          participants={participantOptions}
          onClose={closeModal}
          onEdit={() => openEdit(selectedRace)}
        />
      )}

      {modal === "form" && (
        <Modal title={selectedRace ? "Edit Race" : "Create Race"} onClose={closeModal}>
          <form className={styles.form} onSubmit={handleSaveRace}>
            <div className={styles.formGrid}>
              <Field label="Tournament">
                <select
                  required
                  value={form.tournamentId}
                  onChange={(e) => setForm({ ...form, tournamentId: e.target.value })}
                >
                  <option value="">Select tournament</option>
                  {tournaments.map((tournament) => (
                    <option key={tournament.id} value={tournament.id}>
                      {tournament.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Race Name">
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </Field>
              <Field label="Race Type">
                <input required value={form.raceType} onChange={(e) => setForm({ ...form, raceType: e.target.value })} />
              </Field>
              <Field label="Distance Meter">
                <input type="number" min="1" required value={form.distanceMeter} onChange={(e) => setForm({ ...form, distanceMeter: e.target.value })} />
              </Field>
              <Field label="Max Participants">
                <input type="number" min="1" required value={form.maxParticipants} onChange={(e) => setForm({ ...form, maxParticipants: e.target.value })} />
              </Field>
              <Field label="Date">
                <input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </Field>
              <Field label="Time">
                <input type="time" required value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
              </Field>
              <Field label="Prediction Cutoff">
                <input type="datetime-local" value={form.predictionCutoffAt} onChange={(e) => setForm({ ...form, predictionCutoffAt: e.target.value })} />
              </Field>
              <Field label="Track Condition">
                <input value={form.trackCondition} onChange={(e) => setForm({ ...form, trackCondition: e.target.value })} />
              </Field>
              <Field label="Weather Condition">
                <input value={form.weatherCondition} onChange={(e) => setForm({ ...form, weatherCondition: e.target.value })} />
              </Field>
            </div>
            <ModalActions submitting={submitting} onCancel={closeModal} submitLabel={selectedRace ? "Update Race" : "Create Race"} />
          </form>
        </Modal>
      )}

      {modal === "schedule" && (
        <Modal title="Schedule Race" onClose={closeModal}>
          <form className={styles.form} onSubmit={handleSchedule}>
            {!selectedRace && (
              <Field label="Race">
                <select required value={scheduleForm.raceId} onChange={(e) => setScheduleForm({ ...scheduleForm, raceId: e.target.value })}>
                  <option value="">Select race</option>
                  {summaryRaces.filter((race) => race.status !== "CANCELLED").map((race) => (
                    <option key={race.id} value={race.id}>{race.name} ({race.raceCode})</option>
                  ))}
                </select>
              </Field>
            )}
            <div className={styles.formGrid}>
              <Field label="Date">
                <input type="date" required value={scheduleForm.date} onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })} />
              </Field>
              <Field label="Time">
                <input type="time" required value={scheduleForm.time} onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })} />
              </Field>
            </div>
            <Field label="Prediction Cutoff">
              <input
                type="datetime-local"
                value={scheduleForm.predictionCutoffAt}
                onChange={(e) =>
                  setScheduleForm({
                    ...scheduleForm,
                    predictionCutoffAt: e.target.value,
                  })
                }
              />
            </Field>
            <ModalActions submitting={submitting} onCancel={closeModal} submitLabel="Schedule Race" />
          </form>
        </Modal>
      )}

      {modal === "cancel" && selectedRace && (
        <Modal title={`Cancel ${selectedRace.name}`} onClose={closeModal}>
          <form className={styles.form} onSubmit={handleCancel}>
            <p className={styles.warningText}>Cancelling a race will notify all assigned participants.</p>
            <Field label="Cancellation Reason">
              <textarea required rows="4" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} />
            </Field>
            <ModalActions submitting={submitting} onCancel={closeModal} submitLabel="Cancel Race" danger />
          </form>
        </Modal>
      )}

      {modal === "participants" && selectedRace && (
        <Modal title="Assign Participants" onClose={closeModal}>
          <form className={styles.form} onSubmit={handleAssign}>
            <p className={styles.selectionInfo}>
              Selected {participantIds.length} of {selectedRace.maxParticipants} available slots
            </p>
            <div className={styles.participantList}>
              {participantOptions.length === 0 && (
                <p className={styles.selectionInfo}>
                  No approved registrations are available to assign.
                </p>
              )}
              {participantOptions.map((participant) => (
                <label key={participant.id}>
                  <input
                    type="checkbox"
                    checked={participantIds.includes(participant.id)}
                    disabled={
                      !participantIds.includes(participant.id) &&
                      participantIds.length >= selectedRace.maxParticipants
                    }
                    onChange={() => toggleParticipant(participant.id)}
                  />
                  <span>
                    <strong>{participant.name}</strong>
                    <small>{participant.owner}</small>
                  </span>
                </label>
              ))}
            </div>
            <ModalActions submitting={submitting} onCancel={closeModal} submitLabel="Assign Participants" />
          </form>
        </Modal>
      )}
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <article className={`${styles.statCard} ${styles[`accent${accent}`]}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>Live race data</small>
    </article>
  );
}

function StateRow({ text, error = false }) {
  return (
    <tr>
      <td colSpan="7" className={`${styles.stateCell} ${error ? styles.errorText : ""}`}>
        {text}
      </td>
    </tr>
  );
}

function Field({ label, children }) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className={styles.overlay}>
      <section className={styles.modal} role="dialog" aria-modal="true">
        <header>
          <h2>{title}</h2>
          <button type="button" onClick={onClose}>x</button>
        </header>
        <div className={styles.modalBody}>{children}</div>
      </section>
    </div>
  );
}

function ModalActions({ submitting, onCancel, submitLabel, danger = false }) {
  return (
    <div className={styles.modalActions}>
      <button type="button" className={styles.secondaryButton} disabled={submitting} onClick={onCancel}>
        Cancel
      </button>
      <button type="submit" className={danger ? styles.dangerButton : styles.primaryButton} disabled={submitting}>
        {submitting ? "Saving..." : submitLabel}
      </button>
    </div>
  );
}

function DetailDrawer({ race, participants = [], onClose, onEdit }) {
  const participantNames = participants.filter((participant) =>
    (race.participantIds || []).includes(participant.id),
  );
  return (
    <div className={styles.overlay}>
      <aside className={styles.drawer}>
        <header>
          <div>
            <span>{race.raceCode}</span>
            <h2>{race.name}</h2>
          </div>
          <button onClick={onClose}>x</button>
        </header>
        <div className={styles.drawerBody}>
          <span className={`${styles.statusBadge} ${statusClass(race.status)}`}>{race.status}</span>
          <dl className={styles.detailGrid}>
            <div><dt>Tournament</dt><dd>{race.tournamentName}</dd></div>
            <div><dt>Date & Time</dt><dd>{formatDateTime(race)}</dd></div>
            <div><dt>Race Type</dt><dd>{race.raceType || "N/A"}</dd></div>
            <div><dt>Distance</dt><dd>{race.distanceMeter ? `${race.distanceMeter}m` : "N/A"}</dd></div>
            <div><dt>Track Condition</dt><dd>{race.trackCondition || "N/A"}</dd></div>
            <div><dt>Weather Condition</dt><dd>{race.weatherCondition || "N/A"}</dd></div>
            <div><dt>Capacity</dt><dd>{(race.participantIds || []).length}/{race.maxParticipants}</dd></div>
            <div><dt>Prediction Cutoff</dt><dd>{race.predictionCutoffAt ? new Date(race.predictionCutoffAt).toLocaleString() : "N/A"}</dd></div>
          </dl>
          <section className={styles.detailSection}>
            <h3>Assigned Participants</h3>
            {participantNames.length ? (
              participantNames.map((participant) => (
                <div className={styles.detailParticipant} key={participant.id}>
                  <strong>{participant.name}</strong><span>{participant.owner}</span>
                </div>
              ))
            ) : <p>No participants assigned.</p>}
          </section>
          {race.cancelReason && (
            <section className={styles.cancelBox}>
              <strong>Cancellation reason</strong>
              <p>{race.cancelReason}</p>
            </section>
          )}
        </div>
        <footer>
          <button className={styles.secondaryButton} onClick={onClose}>Close</button>
          <button className={styles.primaryButton} onClick={onEdit}>Edit Race</button>
        </footer>
      </aside>
    </div>
  );
}
