import { useCallback, useEffect, useMemo, useState } from "react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import PageHeader from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/StatCard";
import {
  AlertCircleIcon,
  CheckCircleIcon,
  HeartIcon,
} from "../../components/ui/Icons";
import {
  getInspectionDetail,
  getInspectionRoster,
  submitHorseHealthCheck,
} from "../../services/referee";
import styles from "./PreRaceInspection.module.css";

const FLAGGED_STORAGE_KEY = "equine_elite_flagged_health_reviews";

function getStoredFlaggedEntries() {
  try {
    const stored = JSON.parse(
      localStorage.getItem(FLAGGED_STORAGE_KEY) || "[]",
    );
    return new Set(Array.isArray(stored) ? stored : []);
  } catch {
    return new Set();
  }
}

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || error?.message || fallback;
}

function formatDateTime(value) {
  if (!value) return "Not yet recorded";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function raceSubtitle(race) {
  if (!race) return "Select an available race to inspect its roster.";
  return `${race.tournamentName || "Tournament"} · ${race.name} · ${formatDateTime(
    race.scheduledStartAt,
  )}`;
}

function statusVariant(status) {
  if (status === "HEALTHY") return "success";
  if (status === "QUARANTINE") return "warning";
  if (["INJURED", "UNFIT"].includes(status)) return "suspended";
  return "ghost";
}

export default function PreRaceInspection() {
  const [races, setRaces] = useState([]);
  const [selectedRaceId, setSelectedRaceId] = useState("");
  const [selectedRace, setSelectedRace] = useState(null);
  const [roster, setRoster] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [detail, setDetail] = useState(null);
  const [clearanceIds, setClearanceIds] = useState(new Set());
  const [flaggedIds, setFlaggedIds] = useState(getStoredFlaggedEntries);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const selectedEntry = useMemo(
    () => roster.find((entry) => entry.id === selectedId) || null,
    [roster, selectedId],
  );
  const selectedClearanceCount = clearanceIds.size;

  const loadDetail = useCallback(async (entry) => {
    if (!entry) {
      setDetail(null);
      setNotes("");
      return;
    }

    setDetailLoading(true);
    setError("");
    try {
      const data = await getInspectionDetail(entry.horseId);
      setDetail({ ...entry, ...data });
      setNotes(data.medicalNote || "");
    } catch (requestError) {
      setDetail(null);
      setError(
        getErrorMessage(requestError, "Unable to load horse inspection detail."),
      );
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const loadRoster = useCallback(async (raceId = "") => {
    setLoading(true);
    setError("");
    try {
      const result = await getInspectionRoster({ raceId });
      setRaces(result.races);
      setSelectedRace(result.race);
      setSelectedRaceId(result.race?.raceId || "");
      setRoster(result.items);
      // Checkboxes represent only the horses selected for the current submit.
      // Existing health checks are shown by Health Cert and must not be re-selected.
      setClearanceIds(new Set());

      const nextEntry = result.items[0] || null;
      setSelectedId(nextEntry?.id || "");
      await loadDetail(nextEntry);
    } catch (requestError) {
      setRoster([]);
      setSelectedRace(null);
      setSelectedId("");
      setDetail(null);
      setError(
        getErrorMessage(requestError, "Unable to load the inspection roster."),
      );
    } finally {
      setLoading(false);
    }
  }, [loadDetail]);

  useEffect(() => {
    const timer = window.setTimeout(() => loadRoster(), 0);
    return () => window.clearTimeout(timer);
  }, [loadRoster]);

  async function handleSelect(entry) {
    setSelectedId(entry.id);
    await loadDetail(entry);
  }

  function toggleClearance(entryId) {
    if (flaggedIds.has(entryId)) return;
    setClearanceIds((current) => {
      const next = new Set(current);
      if (next.has(entryId)) next.delete(entryId);
      else next.add(entryId);
      return next;
    });
  }

  async function submitAllClearances() {
    const selectedEntries = roster.filter((entry) =>
      clearanceIds.has(entry.id),
    );
    if (selectedEntries.length === 0) {
      setError("Select at least one horse to clear.");
      return;
    }

    setSubmitting(true);
    setError("");
    setNotice("");
    try {
      await Promise.all(
        selectedEntries.map((entry) =>
          submitHorseHealthCheck({
            horseId: entry.horseId,
            healthStatus: "HEALTHY",
            note: entry.id === selectedId ? notes : entry.medicalNote,
          }),
        ),
      );
      setClearanceIds(new Set());
      setNotice(
        `${selectedEntries.length} health clearance${
          selectedEntries.length > 1 ? "s" : ""
        } submitted successfully.`,
      );
      await loadRoster(selectedRaceId);
    } catch (requestError) {
      setError(
        getErrorMessage(requestError, "Unable to submit health clearances."),
      );
    } finally {
      setSubmitting(false);
    }
  }

  function printRoster() {
    window.print();
  }

  function flagForReview() {
    if (!selectedEntry || flaggedIds.has(selectedEntry.id)) return;

    setFlaggedIds((current) => {
      const next = new Set(current);
      next.add(selectedEntry.id);
      localStorage.setItem(FLAGGED_STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
    setClearanceIds((current) => {
      const next = new Set(current);
      next.delete(selectedEntry.id);
      return next;
    });
    setError("");
    setNotice(
      `${selectedEntry.horseName} was flagged for review locally. This mock status is not saved to the backend.`,
    );
  }

  return (
    <>
      <PageHeader
        title="Pre-Race Inspection"
        subtitle={raceSubtitle(selectedRace)}
        actions={
          <>
            <Button variant="outline" onClick={printRoster} disabled={loading}>
              Print Roster
            </Button>
            <Button
              onClick={submitAllClearances}
              disabled={
                loading ||
                submitting ||
                roster.length === 0 ||
                selectedClearanceCount === 0
              }
            >
              {submitting
                ? "Submitting..."
                : selectedClearanceCount > 0
                  ? `Submit ${selectedClearanceCount} Clearance${
                      selectedClearanceCount > 1 ? "s" : ""
                    }`
                  : "Submit All Clearances"}
            </Button>
          </>
        }
      />

      <div className={styles.raceToolbar}>
        <label>
          Race
          <select
            value={selectedRaceId}
            disabled={loading || races.length === 0}
            onChange={(event) => {
              setNotice("");
              loadRoster(event.target.value);
            }}
          >
            {races.length === 0 && <option value="">No available races</option>}
            {races.map((race) => (
              <option key={race.raceId} value={race.raceId}>
                {race.name} ({race.raceCode})
              </option>
            ))}
          </select>
        </label>
        <span>{roster.length} entries</span>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}
      {notice && <div className={styles.successMessage}>{notice}</div>}

      <div className={styles.inspectionLayout}>
        <Card className={styles.rosterCard} style={{ padding: 0 }}>
          <div className={styles.rosterHeader}>
            <h2 className={styles.rosterTitle}>Inspection Roster</h2>
            <Badge variant="ghost">{roster.length} ENTRIES</Badge>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.rosterTable}>
              <colgroup>
                <col className={styles.gateColumn} />
                <col className={styles.horseColumn} />
                <col className={styles.healthColumn} />
                <col className={styles.weightColumn} />
                <col className={styles.clearedColumn} />
              </colgroup>
              <thead>
                <tr>
                  <th>Gate</th>
                  <th>Horse / Jockey</th>
                  <th>Health Cert</th>
                  <th>Weight</th>
                  <th>Cleared</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className={styles.tableState}>
                      Loading inspection roster...
                    </td>
                  </tr>
                ) : roster.length === 0 ? (
                  <tr>
                    <td colSpan="5" className={styles.tableState}>
                      No race entries are available for inspection.
                    </td>
                  </tr>
                ) : (
                  roster.map((entry) => (
                    <tr
                      key={entry.id}
                      className={
                        selectedId === entry.id ? styles.selectedRow : ""
                      }
                      onClick={() => handleSelect(entry)}
                    >
                      <td>
                        <div className={styles.gateCircle}>{entry.gate}</div>
                      </td>
                      <td>
                        <div className={styles.horseName}>{entry.horseName}</div>
                        <div className={styles.jockeyName}>
                          J: {entry.jockeyName}
                        </div>
                        {flaggedIds.has(entry.id) && (
                          <span className={styles.flaggedBadge}>FLAGGED</span>
                        )}
                      </td>
                      <td className={styles.centerCell}>
                        <div
                          className={`${styles.healthStatusCell} ${
                            entry.lastHealthCheckAt
                              ? styles.healthChecked
                              : styles.healthPending
                          }`}
                        >
                          {entry.lastHealthCheckAt ? (
                            <CheckCircleIcon
                              className={styles.iconSuccess}
                              size={20}
                            />
                          ) : (
                            <AlertCircleIcon
                              className={styles.iconDanger}
                              size={20}
                            />
                          )}
                          <span>
                            <strong>
                              {entry.lastHealthCheckAt ? "CHECKED" : "PENDING"}
                            </strong>
                            <small>
                              {entry.lastHealthCheckAt
                                ? entry.healthStatus
                                : "Not inspected yet"}
                            </small>
                            {entry.lastHealthCheckAt && (
                              <time dateTime={entry.lastHealthCheckAt}>
                                {formatDateTime(entry.lastHealthCheckAt)}
                              </time>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className={styles.centerCell}>
                        <strong>
                          {entry.weight === null
                            ? "Not recorded"
                            : `${entry.weight} kg`}
                        </strong>
                      </td>
                      <td className={styles.centerCell}>
                        <input
                          type="checkbox"
                          className={styles.clearCheckbox}
                          checked={clearanceIds.has(entry.id)}
                          disabled={flaggedIds.has(entry.id)}
                          onChange={() => toggleClearance(entry.id)}
                          onClick={(event) => event.stopPropagation()}
                          aria-label={`Clear ${entry.horseName}`}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className={styles.detailsCard} style={{ padding: 0 }}>
          {!selectedEntry || !detail ? (
            <div className={styles.panelState}>
              {detailLoading
                ? "Loading horse details..."
                : "Select a horse from the inspection roster."}
            </div>
          ) : (
            <div
              className={styles.detailsContent}
              aria-busy={detailLoading}
            >
              <div className={styles.detailsHeader}>
                <div>
                  <h2 className={styles.detailsHorseName}>
                    {detail.horseName}
                  </h2>
                  <Badge variant="ghost">GATE {detail.gate}</Badge>
                  {flaggedIds.has(selectedEntry.id) && (
                    <span className={styles.flaggedHeaderBadge}>
                      FLAGGED FOR REVIEW
                    </span>
                  )}
                </div>
                <Badge variant={statusVariant(detail.healthStatus)}>
                  {detail.healthStatus}
                </Badge>
              </div>

              <div className={styles.detailsBody}>
                <h3 className={styles.sectionTitle}>Digital Passport</h3>
                <div className={styles.passportGrid}>
                  <div>
                    <span className={styles.infoLabel}>Microchip ID</span>
                    <strong>{detail.microchip}</strong>
                  </div>
                  <div>
                    <span className={styles.infoLabel}>Age</span>
                    <strong>
                      {detail.age === null ? "Not provided" : `${detail.age} years`}
                    </strong>
                  </div>
                  <div>
                    <span className={styles.infoLabel}>Sex</span>
                    <strong>{detail.gender}</strong>
                  </div>
                  <div>
                    <span className={styles.infoLabel}>Owner</span>
                    <strong>{detail.ownerName}</strong>
                  </div>
                </div>

                <h3 className={styles.sectionTitle}>Vet Clearance</h3>
                <div className={styles.vetList}>
                  <div className={styles.vetItem}>
                    <div className={styles.vetIconBox}>W</div>
                    <div>
                      <strong>
                        Weight Recorded:{" "}
                        {detail.weight === null
                          ? "Not recorded"
                          : `${detail.weight} kg`}
                      </strong>
                    </div>
                  </div>
                  <div className={styles.vetItem}>
                    <HeartIcon className={styles.vetIcon} />
                    <div>
                      <strong>Pre-Race Exam: {detail.healthStatus}</strong>
                      <span>
                        Last checked: {formatDateTime(detail.lastHealthCheckAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <label className={styles.notesLabel}>
                  Referee Notes
                  <textarea
                    className={styles.notesArea}
                    rows="5"
                    maxLength="2000"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Add inspection notes..."
                  />
                  <small>{notes.length}/2000</small>
                </label>
              </div>

              <div className={styles.detailsFooter}>
                <button
                  type="button"
                  className={`${styles.btnFlagReview} ${
                    flaggedIds.has(selectedEntry.id)
                      ? styles.btnFlagged
                      : ""
                  }`}
                  onClick={flagForReview}
                  disabled={flaggedIds.has(selectedEntry.id)}
                >
                  {flaggedIds.has(selectedEntry.id)
                    ? "Flagged for Review"
                    : "Flag for Review"}
                </button>
              </div>

              {detailLoading && (
                <div className={styles.loadingOverlay} role="status">
                  <span className={styles.loadingSpinner} />
                  Loading horse details...
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
