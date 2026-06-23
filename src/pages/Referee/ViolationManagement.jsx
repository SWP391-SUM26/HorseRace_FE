import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import PageHeader from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/StatCard";
import { getViolationList, updateViolationReport } from "../../services/referee";
import styles from "./ViolationManagement.module.css";

const variant = (value) => {
  if (value === "CRITICAL" || value === "HIGH") return "suspended";
  if (value === "MEDIUM") return "warning";
  return "ghost";
};

function formatDateTime(value) {
  if (!value) return "Not recorded";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function ViolationManagement() {
  const location = useLocation();
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ severityLevel: "MEDIUM", summary: "", decision: "" });

  function chooseReport(report) {
    setSelected(report);
  }

  function openUpdate() {
    if (!selected) return;
    setForm({
      severityLevel: selected.severityLevel || "MEDIUM",
      summary: selected.summary || "",
      decision: selected.decision || "",
    });
    setError("");
    setNotice("");
    setModalOpen(true);
  }

  useEffect(() => {
    let active = true;
    getViolationList({ status, page: 1, pageSize: 100 })
      .then((reports) => {
        if (!active) return;
        const preferredRaceId = location.state?.raceId;
        const nextSelected =
          reports.items.find((item) => item.raceId === preferredRaceId) ||
          reports.items[0] ||
          null;
        setItems(reports.items);
        setSelected(nextSelected);
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
  }, [location.state?.raceId, status]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) =>
      item.reportId?.toLowerCase().includes(query) ||
      item.summary?.toLowerCase().includes(query) ||
      item.race?.name?.toLowerCase().includes(query) ||
      item.raceId?.toLowerCase().includes(query),
    );
  }, [items, search]);

  function exportLog() {
    const lines = [
      ["Report ID", "Race", "Type", "Severity", "Status", "Created", "Summary"].join(","),
      ...filtered.map((item) => [
        item.reportId,
        item.race?.name || item.raceId,
        item.reportType,
        item.severityLevel || "",
        item.status || "",
        item.createdAt || "",
        `"${(item.summary || "").replaceAll('"', '""')}"`,
      ].join(",")),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "violation-log.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function submitUpdate(event) {
    event.preventDefault();
    if (!selected || !form.summary.trim()) return;
    setSubmitting(true);
    setError("");
    setNotice("");
    try {
      const updated = await updateViolationReport(selected.id, {
        severityLevel: form.severityLevel,
        summary: form.summary,
        decision: form.decision,
      });
      setNotice("Violation report updated.");
      setItems((current) =>
        current.map((item) => item.id === selected.id ? { ...item, ...updated, id: updated.reportId, status: updated.reportStatus } : item),
      );
      setSelected((current) => current ? { ...current, ...updated, id: updated.reportId, status: updated.reportStatus } : current);
      setModalOpen(false);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Violation Log & Management"
        subtitle="Review pending inquiries, analyze reports, and issue official rulings."
        actions={<Button variant="secondary" onClick={exportLog}>Export Log</Button>}
      />

      {error && <div className={styles.error}>{error}</div>}
      {notice && <div className={styles.success}>{notice}</div>}

      <Card className={styles.filters}>
        <div className={styles.filterLabel}>Filters:</div>
        <select
          value={status}
          onChange={(event) => {
            setLoading(true);
            setStatus(event.target.value);
          }}
        >
          <option value="">Status: All</option>
          <option value="DRAFT">Status: Draft</option>
          <option value="SUBMITTED">Status: Submitted</option>
          <option value="REVIEWED">Status: Reviewed</option>
          <option value="CLOSED">Status: Closed</option>
        </select>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search race ID, race, or summary..."
        />
      </Card>

      <div className={styles.workspace}>
        <Card className={styles.logCard}>
          <div className={styles.logHeader}>
            <span>Severity</span>
            <span>Race & Entity</span>
            <span>Infraction Type</span>
            <span>Time</span>
          </div>

          {loading ? (
            <div className={styles.empty}>Loading violation log...</div>
          ) : filtered.length === 0 ? (
            <div className={styles.empty}>No violation reports match the selected filters.</div>
          ) : filtered.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`${styles.logRow} ${selected?.id === item.id ? styles.selected : ""}`}
              onClick={() => chooseReport(item)}
            >
              <span><Badge variant={variant(item.severityLevel)}>{item.severityLevel || "N/A"}</Badge></span>
              <span>
                <strong>{item.race?.name || item.raceId}</strong>
                <small>{item.authorName || "Unknown referee"}</small>
              </span>
              <span>
                <strong>{item.reportType}</strong>
                <small>{item.status}</small>
              </span>
              <span>{formatDateTime(item.createdAt)}</span>
            </button>
          ))}

          <div className={styles.logFooter}>
            Showing {filtered.length} of {items.length} violation reports
          </div>
        </Card>

        <Card className={styles.detail}>
          {!selected ? (
            <div className={styles.empty}>Select a violation report.</div>
          ) : (
            <>
              <div className={styles.detailHeader}>
                <h2>Inquiry Details</h2>
                <Badge variant={variant(selected.severityLevel)}>{selected.severityLevel || "NOT SET"}</Badge>
              </div>

              <section className={styles.mediaBox}>
                <div className={styles.mediaTitle}>
                  <strong>Incident Footage</strong>
                  <span>Not provided by API</span>
                </div>
                <div className={styles.videoPlaceholder}>
                  <span>&gt;</span>
                </div>
              </section>

              <section className={styles.noteBox}>
                <h3>Live Monitor Notes</h3>
                <p>{selected.summary || "No incident summary was recorded."}</p>
                <small>{selected.authorName || "Unknown referee"} / {formatDateTime(selected.createdAt)}</small>
              </section>

              <div className={styles.detailActions}>
                <Button onClick={openUpdate} disabled={selected.status !== "DRAFT"}>
                  {selected.status === "DRAFT" ? "Update Report" : "Update Locked"}
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>

      {modalOpen && (
        <div className={styles.overlay} role="presentation" onMouseDown={() => setModalOpen(false)}>
          <form className={styles.modal} onSubmit={submitUpdate} onMouseDown={(event) => event.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <p>Violation Report</p>
                <h2>Update Report</h2>
              </div>
              <button type="button" onClick={() => setModalOpen(false)} aria-label="Close update modal">x</button>
            </div>

            <label>
              Severity
              <select
                value={form.severityLevel}
                onChange={(event) => setForm({ ...form, severityLevel: event.target.value })}
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </label>

            <label>
              Summary
              <textarea
                rows="5"
                maxLength="5000"
                value={form.summary}
                onChange={(event) => setForm({ ...form, summary: event.target.value })}
                required
              />
            </label>

            <label>
              Decision / Notes
              <textarea
                rows="4"
                maxLength="5000"
                value={form.decision}
                onChange={(event) => setForm({ ...form, decision: event.target.value })}
              />
            </label>

            <div className={styles.modalActions}>
              <Button type="button" variant="secondary" onClick={() => setModalOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
