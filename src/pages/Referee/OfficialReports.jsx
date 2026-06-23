import { useEffect, useState } from "react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import PageHeader from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/StatCard";
import {
  getFinishedRaceList,
  getOfficialRaceCertification,
  getOfficialReportList,
  getViolationList,
  submitOfficialReport,
} from "../../services/referee";
import styles from "./OfficialReports.module.css";

function formatDateTime(value) {
  if (!value) return "Not recorded";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function reportStatus(report) {
  return report?.status || report?.reportStatus || "PENDING_CERTIFICATION";
}

export default function OfficialReports() {
  const [races, setRaces] = useState([]);
  const [reports, setReports] = useState([]);
  const [raceId, setRaceId] = useState("");
  const [raceDetail, setRaceDetail] = useState(null);
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState("");
  const [decision, setDecision] = useState("");
  const [violations, setViolations] = useState([]);
  const [certified, setCertified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function chooseRace(nextRaceId) {
    const report = reports.find((item) => item.raceId === nextRaceId);
    setRaceId(nextRaceId);
    setSummary(report?.summary || "");
    setDecision(report?.decision || "");
    setCertified(false);
    setDetailLoading(Boolean(nextRaceId));
  }

  useEffect(() => {
    let active = true;
    Promise.all([
      getFinishedRaceList(),
      getOfficialReportList({ page: 1, pageSize: 100 }),
      getViolationList({ page: 1, pageSize: 100 }),
    ])
      .then(([raceItems, reportResult, violationResult]) => {
        if (!active) return;
        setRaces(raceItems);
        setReports(reportResult.items);
        setViolations(violationResult.items);
        if (raceItems[0]) {
          const initialRaceId = raceItems[0].raceId;
          const initialReport = reportResult.items.find((item) => item.raceId === initialRaceId);
          setRaceId(initialRaceId);
          setSummary(initialReport?.summary || "");
          setDecision(initialReport?.decision || "");
          setDetailLoading(true);
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError?.response?.data?.message || requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!raceId) return undefined;
    let active = true;
    getOfficialRaceCertification(raceId)
      .then((result) => {
        if (!active) return;
        setRaceDetail(result.race);
        setEntries(result.entries);
      })
      .catch((requestError) => {
        if (active) setError(requestError?.response?.data?.message || requestError.message);
      })
      .finally(() => {
        if (active) setDetailLoading(false);
      });

    return () => {
      active = false;
    };
  }, [raceId, reports]);

  const current = reports.find((report) => report.raceId === raceId);
  const selectedRace = raceDetail || races.find((race) => race.raceId === raceId);
  const raceViolations = violations.filter((item) => item.raceId === raceId);
  const locked = current && reportStatus(current) !== "DRAFT";

  async function refreshReports() {
    const reportResult = await getOfficialReportList({ page: 1, pageSize: 100 });
    setReports(reportResult.items);
  }

  async function submit() {
    if (!raceId || !certified || !summary.trim()) return;
    setSubmitting(true);
    setError("");
    setNotice("");
    try {
      const result = await submitOfficialReport({
        reportId: reportStatus(current) === "DRAFT" ? current.id : undefined,
        raceId,
        summary,
        decision,
        severityLevel: "LOW",
      });
      setNotice(`Official report ${result.reportStatus.toLowerCase()} successfully.`);
      setCertified(false);
      await refreshReports();
    } catch (requestError) {
      setError(requestError?.response?.data?.message || requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  function openConfirm() {
    if (!raceId || !certified || !summary.trim() || submitting || locked) return;
    setError("");
    setNotice("");
    setConfirmOpen(true);
  }

  async function confirmSubmit() {
    await submit();
    setConfirmOpen(false);
  }

  return (
    <>
      <PageHeader
        title="Official Results Certification"
        subtitle="Certify completed race records and submit the official referee report."
      />

      {error && <div className={styles.error}>{error}</div>}
      {notice && <div className={styles.success}>{notice}</div>}

      {loading ? (
        <div className={styles.empty}>Loading official report data...</div>
      ) : (
        <div className={styles.page}>
          <div className={styles.racePicker}>
            <label>
              Race
              <select value={raceId} onChange={(event) => chooseRace(event.target.value)}>
                <option value="">Select completed race</option>
                {races.map((race) => (
                  <option key={race.raceId} value={race.raceId}>{race.name}</option>
                ))}
              </select>
            </label>
            <Badge>{reportStatus(current)}</Badge>
          </div>

          {!raceId ? (
            <div className={styles.empty}>No completed race selected.</div>
          ) : (
            <div className={styles.grid}>
              <main className={styles.mainColumn}>
                <Card className={styles.photoCard}>
                  <div className={styles.cardTitle}>
                    <h2>Race Certification Review</h2>
                    <span>{selectedRace?.raceCode || "Race"} / {selectedRace?.status || "Unknown status"}</span>
                  </div>
                  <div className={styles.photoPlaceholder}>
                    <strong>{selectedRace?.name}</strong>
                    <span>Photo finish image is not provided by the current API.</span>
                  </div>
                </Card>

                <Card className={styles.finishCard}>
                  <div className={styles.cardTitle}>
                    <h2>Registered Race Entries</h2>
                    <span>{entries.length} entries</span>
                  </div>
                  {detailLoading ? (
                    <div className={styles.empty}>Loading race entries...</div>
                  ) : entries.length === 0 ? (
                    <div className={styles.empty}>No race entries returned by API.</div>
                  ) : (
                    <table>
                      <thead>
                        <tr>
                          <th>Entry</th>
                          <th>Lane</th>
                          <th>Horse</th>
                          <th>Owner</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {entries.map((entry) => (
                          <tr key={entry.entryId}>
                            <td>{entry.entryNo ?? "-"}</td>
                            <td>{entry.laneNo ?? "-"}</td>
                            <td>{entry.horseName || entry.horseId}</td>
                            <td>{entry.ownerName || entry.ownerUserId}</td>
                            <td><Badge>{entry.status}</Badge></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </Card>

                <Card className={styles.reportCard}>
                  <div className={styles.cardTitle}>
                    <h2>Official Referee Report</h2>
                    <span>{current ? `Updated ${formatDateTime(current.updatedAt)}` : "New report"}</span>
                  </div>
                  <label>
                    Summary
                    <textarea
                      rows="7"
                      maxLength="5000"
                      value={summary}
                      disabled={locked}
                      onChange={(event) => setSummary(event.target.value)}
                      placeholder="Write the official race summary..."
                    />
                  </label>
                  <label>
                    Decision
                    <textarea
                      rows="4"
                      maxLength="5000"
                      value={decision}
                      disabled={locked}
                      onChange={(event) => setDecision(event.target.value)}
                      placeholder="Write the official decision..."
                    />
                  </label>
                </Card>
              </main>

              <aside className={styles.sideColumn}>
                <Card className={styles.alertCard}>
                  <div>
                    <h3>Active Inquiry</h3>
                    <Badge variant={raceViolations.length ? "warning" : "ghost"}>
                      {raceViolations.length ? "REVIEW REQUIRED" : "CLEAR"}
                    </Badge>
                  </div>
                  {raceViolations.length === 0 ? (
                    <p>No violation reports are linked to this race.</p>
                  ) : (
                    raceViolations.map((item) => (
                      <article key={item.reportId}>
                        <strong>{item.severityLevel || "NOT SET"}</strong>
                        <span>{item.summary || "No violation summary."}</span>
                      </article>
                    ))
                  )}
                </Card>

                <Card className={styles.telemetryCard}>
                  <h3>Race Metadata</h3>
                  <dl>
                    <div><dt>Scheduled</dt><dd>{formatDateTime(selectedRace?.scheduledStartAt)}</dd></div>
                    <div><dt>Actual Start</dt><dd>{formatDateTime(selectedRace?.actualStartAt)}</dd></div>
                    <div><dt>Actual End</dt><dd>{formatDateTime(selectedRace?.actualEndAt)}</dd></div>
                    <div><dt>Track</dt><dd>{selectedRace?.trackCondition || "Not provided"}</dd></div>
                    <div><dt>Weather</dt><dd>{selectedRace?.weatherCondition || "Not provided"}</dd></div>
                  </dl>
                </Card>

                <Card className={styles.certification}>
                  <h3>Final Certification</h3>
                  <p>By certifying, the referee confirms the official race report is ready for record.</p>
                  <label>
                    <input
                      type="checkbox"
                      checked={certified}
                      disabled={locked}
                      onChange={(event) => setCertified(event.target.checked)}
                    />
                    I acknowledge the report is complete.
                  </label>
                  <Button disabled={!raceId || !certified || !summary.trim() || submitting || locked} onClick={openConfirm}>
                    {submitting ? "Submitting..." : locked ? "Certified" : "Review & Certify"}
                  </Button>
                </Card>
              </aside>
            </div>
          )}
        </div>
      )}
      {confirmOpen && (
        <div className={styles.overlay} role="presentation" onMouseDown={() => setConfirmOpen(false)}>
          <div className={styles.modal} role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <p>Final confirmation</p>
                <h2>Submit Official Certification?</h2>
              </div>
              <button type="button" onClick={() => setConfirmOpen(false)} aria-label="Close confirmation modal">x</button>
            </div>

            <div className={styles.confirmGrid}>
              <div><span>Race</span><strong>{selectedRace?.name || raceId}</strong></div>
              <div><span>Status</span><strong>{selectedRace?.status || "Not provided"}</strong></div>
              <div><span>Entries</span><strong>{entries.length}</strong></div>
              <div><span>Violation Reports</span><strong>{raceViolations.length}</strong></div>
            </div>

            <section className={styles.confirmSection}>
              <h3>Official Summary</h3>
              <p>{summary}</p>
            </section>

            <section className={styles.confirmSection}>
              <h3>Official Decision</h3>
              <p>{decision || "No decision text provided."}</p>
            </section>

            {raceViolations.length > 0 && (
              <section className={styles.confirmSection}>
                <h3>Linked Violations</h3>
                {raceViolations.map((item) => (
                  <article key={item.reportId}>
                    <Badge variant={item.severityLevel === "CRITICAL" ? "suspended" : "warning"}>
                      {item.severityLevel || "NOT SET"}
                    </Badge>
                    <span>{item.summary || "No violation summary."}</span>
                  </article>
                ))}
              </section>
            )}

            <div className={styles.modalActions}>
              <Button type="button" variant="secondary" onClick={() => setConfirmOpen(false)} disabled={submitting}>
                Back to Review
              </Button>
              <Button type="button" onClick={confirmSubmit} disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Certification"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
