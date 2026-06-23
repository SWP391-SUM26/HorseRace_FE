import { useEffect, useState } from "react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import PageHeader from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/StatCard";
import { createViolationReport, getLiveRaceMonitor } from "../../services/referee";
import styles from "./LiveRaceMonitor.module.css";

function message(error) {
  return error?.response?.data?.message || error?.message || "Unable to load live races.";
}

function elapsed(start, now = Date.now()) {
  if (!start) return "00:00";
  const seconds = Math.max(0, Math.floor((now - new Date(start).getTime()) / 1000));
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function getStreamUrl(race) {
  return race?.streamUrl || race?.videoUrl || race?.broadcastUrl || race?.liveStreamUrl || "";
}

function formatRaceTime(value) {
  if (!value) return "Not recorded";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function LiveRaceMonitor() {
  const [data, setData] = useState({ races: [], race: null, entries: [], incidents: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [now, setNow] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [violationForm, setViolationForm] = useState({
    severityLevel: "MEDIUM",
    summary: "",
    decision: "",
  });

  async function load(raceId) {
    setLoading(true);
    setError("");
    try {
      setData(await getLiveRaceMonitor({ raceId }));
    } catch (requestError) {
      setError(message(requestError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    getLiveRaceMonitor()
      .then((result) => {
        if (active) setData(result);
      })
      .catch((requestError) => {
        if (active) setError(message(requestError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const timer = elapsed(data.race?.actualStartAt, now);
  const streamUrl = getStreamUrl(data.race);
  const raceMeta = [
    data.race?.raceType,
    data.race?.distanceMeter ? `${data.race.distanceMeter}m` : null,
    data.race?.trackCondition ? `Track: ${data.race.trackCondition}` : null,
  ].filter(Boolean).join(" / ");

  function openViolationModal() {
    setError("");
    setSuccess("");
    setViolationForm({
      severityLevel: "MEDIUM",
      summary: "",
      decision: "",
    });
    setModalOpen(true);
  }

  async function submitViolation(event) {
    event.preventDefault();
    if (!data.race) return;
    if (!violationForm.summary.trim()) {
      setError("Please describe the violation before submitting.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await createViolationReport({
        raceId: data.race.raceId,
        severityLevel: violationForm.severityLevel,
        summary: violationForm.summary.trim(),
        decision: violationForm.decision.trim(),
      });
      setModalOpen(false);
      setSuccess("Violation recorded successfully.");
      await load(data.race.raceId);
    } catch (requestError) {
      setError(message(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Live Race Monitor"
        subtitle="Monitor active races, participants, and referee incidents."
      />
      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}
      {loading ? (
        <div className={styles.state}>Loading live race data...</div>
      ) : !data.race ? (
        <div className={styles.state}>No race is currently in RUNNING status.</div>
      ) : (
        <div className={styles.page}>
          <div className={styles.monitorHeader}>
            <div>
              <label htmlFor="live-race-select">Active Race</label>
              <select id="live-race-select" value={data.race.raceId} onChange={(event) => load(event.target.value)}>
                {data.races.map((race) => (
                  <option key={race.raceId} value={race.raceId}>{race.name}</option>
                ))}
              </select>
            </div>
            <div className={styles.timerBox}>
              <span>LIVE</span>
              <strong>{timer}</strong>
            </div>
          </div>

          <div className={styles.raceTitle}>
            <div>
              <p>{data.race.raceCode || "Race"}</p>
              <h2>{data.race.name}</h2>
              <span>{raceMeta}</span>
            </div>
            <Badge variant="suspended">{data.race.status}</Badge>
          </div>

          <div className={styles.grid}>
            <section>
              <div className={styles.videoFrame}>
                {streamUrl ? (
                  <video className={styles.video} src={streamUrl} controls autoPlay muted playsInline>
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className={styles.noStream}>
                    <div className={styles.cameraTags}>
                      <span>CAM 1: WIDE</span>
                      <span>PAN: 14</span>
                    </div>
                    <div className={styles.playIcon}>&gt;</div>
                    <h2>{data.race.name}</h2>
                    <p>{raceMeta}</p>
                    <small>No stream URL is provided by the current race API.</small>
                    <div className={styles.videoStats}>
                      <span>Current Speed</span>
                      <strong>Waiting for telemetry</strong>
                    </div>
                  </div>
                )}
              </div>

              <Card className={styles.participants}>
                <div className={styles.cardHeader}>
                  <h3>Live Running Order</h3>
                  <span>{data.entries.length} entries</span>
                </div>
                {data.entries.map((entry) => (
                  <div key={entry.entryId}>
                    <span className={styles.gate}>{entry.laneNo ?? entry.entryNo ?? "-"}</span>
                    <strong>{entry.horseName}</strong>
                    <span>J: {entry.jockeyName}</span>
                    <Badge>{entry.status}</Badge>
                  </div>
                ))}
              </Card>
            </section>

            <aside className={styles.sidePanel}>
              <Button
                className={styles.recordButton}
                variant="danger"
                disabled={!data.race}
                onClick={openViolationModal}
              >
                Record Violation
              </Button>
              <Card className={styles.incidents}>
                <h3>Quick Action Log</h3>
                {data.incidents.length === 0 ? (
                  <p>No incidents reported for this race.</p>
                ) : data.incidents.map((incident) => (
                  <article key={incident.reportId}>
                    <time>{formatRaceTime(incident.createdAt)}</time>
                    <Badge variant={incident.severityLevel === "CRITICAL" ? "suspended" : "warning"}>
                      {incident.severityLevel || incident.reportType}
                    </Badge>
                    <strong>{incident.reportType}</strong>
                    <p>{incident.summary || "No summary provided."}</p>
                  </article>
                ))}
              </Card>
            </aside>
          </div>
        </div>
      )}
      {modalOpen && (
        <div className={styles.modalBackdrop} role="presentation" onMouseDown={() => setModalOpen(false)}>
          <form className={styles.modal} onSubmit={submitViolation} onMouseDown={(event) => event.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <p>Race Incident</p>
                <h3>Record Violation</h3>
              </div>
              <button type="button" onClick={() => setModalOpen(false)} aria-label="Close violation modal">x</button>
            </div>

            <div className={styles.raceContext}>
              <span>Current race</span>
              <strong>{data.race?.name}</strong>
              <small>{data.race?.raceCode} / {raceMeta}</small>
            </div>

            <div className={styles.formGrid}>
              <label>
                Report Type
                <input value="VIOLATION" disabled />
              </label>
              <label>
                Severity
                <select
                  value={violationForm.severityLevel}
                  onChange={(event) => setViolationForm({ ...violationForm, severityLevel: event.target.value })}
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </label>
            </div>

            <label className={styles.field}>
              Incident Description
              <textarea
                rows="4"
                value={violationForm.summary}
                onChange={(event) => setViolationForm({ ...violationForm, summary: event.target.value })}
                placeholder="Describe what happened, who was involved, and where it occurred..."
              />
            </label>

            <label className={styles.field}>
              Referee Decision / Notes
              <textarea
                rows="3"
                value={violationForm.decision}
                onChange={(event) => setViolationForm({ ...violationForm, decision: event.target.value })}
                placeholder="Optional decision or immediate steward note..."
              />
            </label>

            <div className={styles.modalActions}>
              <Button type="button" variant="secondary" onClick={() => setModalOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" variant="danger" disabled={submitting}>
                {submitting ? "Recording..." : "Submit Violation"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
