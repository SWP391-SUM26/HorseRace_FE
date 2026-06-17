import { useEffect, useMemo, useState } from "react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import DataTable from "../../components/ui/DataTable";
import PageHeader from "../../components/ui/PageHeader";
import SearchFilterBar from "../../components/ui/SearchFilterBar";
import StatCard, { Card } from "../../components/ui/StatCard";
import {
  CheckSquareIcon,
  ClipboardIcon,
  DownloadIcon,
  RefereeIcon,
  UsersIcon,
} from "../../components/ui/Icons";
import {
  approveRegistration,
  getRegistrationDetail,
  getRegistrationList,
  rejectRegistration,
} from "../../services/registration";
import horsePlaceholder from "../../assets/silver_streak.png";
import styles from "./RegistrationManagement.module.css";

const PAGE_SIZE = 5;
const EMPTY_FILTERS = {
  tournamentId: "",
  status: "",
};

const eligibilityLabels = {
  vaccinationRecords: "Vaccination Records",
  fitnessCertification: "Fitness Certification",
  passportScan: "Passport Scan",
  weightVerification: "Weight Verification",
  medicalExamination: "Medical Examination",
};

const reviewableStatuses = ["SUBMITTED", "UNDER_REVIEW"];

function statusVariant(status) {
  if (["APPROVED", "VALID"].includes(status)) return "success";
  if (["DRAFT", "SUBMITTED", "UNDER_REVIEW", "MISSING"].includes(status)) return "warning";
  if (["REJECTED", "FAILED"].includes(status)) return "suspended";
  if (status === "WITHDRAWN") return "ghost";
  return "ghost";
}

function formatDate(value) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || error?.message || fallback;
}

export default function RegistrationManagement() {
  const [registrations, setRegistrations] = useState([]);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [draftFilters, setDraftFilters] = useState(EMPTY_FILTERS);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [allRegistrations, setAllRegistrations] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [modal, setModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setError("");
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [search]);

  async function loadDetail(id) {
    if (!id) {
      setSelectedRegistration(null);
      setNotes("");
      return;
    }

    setDetailLoading(true);
    try {
      const detail = await getRegistrationDetail(id);
      setSelectedRegistration(detail);
      setNotes(detail?.refereeNotes || "");
    } catch (loadError) {
      setError(
        getErrorMessage(loadError, "Unable to load registration detail."),
      );
    } finally {
      setDetailLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;

    getRegistrationList({
      search: debouncedSearch,
      ...filters,
      page,
      pageSize: PAGE_SIZE,
    })
      .then(async (response) => {
        if (ignore) return;
        setRegistrations(response.items);
        setTotalItems(response.totalItems);
        setTotalPages(response.totalPages);

        const nextId = response.items[0]?.id;
        if (!nextId) {
          setSelectedRegistration(null);
          setNotes("");
          return;
        }

        const detail = await getRegistrationDetail(nextId);
        if (!ignore) {
          setSelectedRegistration(detail);
          setNotes(detail?.refereeNotes || "");
        }
      })
      .catch((loadError) => {
        if (ignore) return;
        setRegistrations([]);
        setSelectedRegistration(null);
        setTotalItems(0);
        setTotalPages(1);
        setError(getErrorMessage(loadError, "Unable to load registrations."));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    getRegistrationList({ page: 1, pageSize: 1000 })
      .then((response) => {
        if (ignore) return;
        setAllRegistrations(response.items);
        setStats({
          total: response.totalItems,
          pending: response.items.filter((item) => reviewableStatuses.includes(item.status)).length,
          approved: response.items.filter((item) => item.status === "APPROVED")
            .length,
          rejected: response.items.filter((item) => item.status === "REJECTED")
            .length,
        });
      })
      .catch(() => {
        // The filtered list request provides the user-facing error.
      });

    return () => {
      ignore = true;
    };
  }, [debouncedSearch, filters, page, refreshKey]);

  const filterOptions = useMemo(() => {
    const tournamentMap = new Map();
    const raceMap = new Map();
    allRegistrations.forEach((item) => {
      tournamentMap.set(item.tournament.id, item.tournament.name);
      raceMap.set(item.race.id, item.race.name);
    });
    return {
      tournaments: [...tournamentMap.entries()],
      races: [...raceMap.entries()],
    };
  }, [allRegistrations]);

  function applyFilters() {
    setLoading(true);
    setError("");
    setFilters(draftFilters);
    setPage(1);
  }

  function refreshData() {
    setNotice("");
    setLoading(true);
    setError("");
    setRefreshKey((current) => current + 1);
  }

  async function selectRegistration(item) {
    setError("");
    await loadDetail(item.id);
  }

  async function confirmApprove() {
    if (!selectedRegistration) return;
    setSubmitting(true);
    setError("");
    try {
      await approveRegistration(selectedRegistration.id, {
        notes: notes.trim(),
      });
      setModal(null);
      setNotice("Registration approved successfully.");
      refreshData();
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Unable to approve registration."));
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmReject() {
    if (!selectedRegistration || !rejectReason.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      await rejectRegistration(selectedRegistration.id, {
        reason: rejectReason.trim(),
        notes: notes.trim(),
      });
      setModal(null);
      setRejectReason("");
      setNotice("Registration rejected.");
      refreshData();
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Unable to reject registration."));
    } finally {
      setSubmitting(false);
    }
  }

  function exportRegistrations() {
    const rows = [
      [
        "Registration ID",
        "Horse",
        "Owner",
        "Tournament",
        "Race",
        "Status",
        "Submitted Date",
      ],
      ...registrations.map((item) => [
        item.id,
        item.horse.name,
        item.owner.name,
        item.tournament.name,
        item.race.name,
        item.status,
        formatDate(item.submittedAt),
      ]),
    ];
    const csv = rows
      .map((row) =>
        row
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "registrations.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  const isReviewable = reviewableStatuses.includes(selectedRegistration?.status);

  return (
    <>
      <PageHeader
        title="Registration Management"
        subtitle="Review horse eligibility and approve registrations."
        actions={
          <>
            <Button
              variant="ghost"
              icon={DownloadIcon}
              onClick={exportRegistrations}
            >
              Export Registrations
            </Button>
            <Button onClick={refreshData} disabled={loading}>
              {loading ? "Refreshing..." : "Refresh Data"}
            </Button>
          </>
        }
      />

      {error && <div className={styles.alertError}>{error}</div>}
      {notice && <div className={styles.alertSuccess}>{notice}</div>}

      <div className={styles.statsGrid}>
        <StatCard
          title="TOTAL REGISTRATIONS"
          icon={UsersIcon}
          value={stats.total}
        />
        <StatCard
          title="AWAITING REVIEW"
          icon={ClipboardIcon}
          value={stats.pending}
        />
        <StatCard
          title="APPROVED"
          icon={CheckSquareIcon}
          value={stats.approved}
        />
        <StatCard title="REJECTED" icon={RefereeIcon} value={stats.rejected} />
      </div>

      <Card className={styles.filterCard}>
        <SearchFilterBar
          searchPlaceholder="Search horse, owner, or registration ID..."
          searchValue={search}
          onSearchChange={(event) => setSearch(event.target.value)}
          onFilterClick={applyFilters}
        />
        <div className={styles.filterGrid}>
          <label>
            Tournament
            <select
              value={draftFilters.tournamentId}
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  tournamentId: event.target.value,
                }))
              }
            >
              <option value="">All Tournaments</option>
              {filterOptions.tournaments.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Status
            <select
              value={draftFilters.status}
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  status: event.target.value,
                }))
              }
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="WITHDRAWN">Withdrawn</option>
            </select>
          </label>
        </div>
      </Card>

      <div className={styles.workspace}>
        <Card className={styles.tableCard}>
          <DataTable
            columns={[
              "REGISTRATION ID",
              "HORSE",
              "OWNER",
              "TOURNAMENT",
              "RACE",
              "STATUS",
              "SUBMITTED DATE",
            ]}
            data={registrations}
            loading={loading}
            totalItems={totalItems}
            currentPage={page}
            onPageChange={(nextPage) => {
              if (nextPage >= 1 && nextPage <= totalPages) {
                setLoading(true);
                setError("");
                setPage(nextPage);
              }
            }}
            renderRow={(item) => (
              <tr
                key={item.id}
                onClick={() => selectRegistration(item)}
                className={`${styles.tableRow} ${
                  selectedRegistration?.id === item.id ? styles.selectedRow : ""
                }`}
              >
                <td>{item.id}</td>
                <td>
                  <strong>{item.horse.name}</strong>
                  <span>{item.horse.id}</span>
                </td>
                <td>{item.owner.name}</td>
                <td>{item.tournament.name}</td>
                <td>{item.race.name}</td>
                <td>
                  <Badge variant={statusVariant(item.status)}>
                    {item.status}
                  </Badge>
                </td>
                <td>{formatDate(item.submittedAt)}</td>
              </tr>
            )}
          />
        </Card>

        <Card className={styles.verificationPanel}>
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.eyebrow}>Registration Review</span>
              <h2>Horse Verification</h2>
            </div>
            {selectedRegistration && (
              <Badge variant={statusVariant(selectedRegistration.status)}>
                {selectedRegistration.status}
              </Badge>
            )}
          </div>

          {detailLoading ? (
            <div className={styles.panelEmpty}>
              Loading verification details...
            </div>
          ) : !selectedRegistration ? (
            <div className={styles.panelEmpty}>
              Select a registration to review.
            </div>
          ) : (
            <>
              <div className={styles.horseProfile}>
                <img
                  src={selectedRegistration.horse.image || horsePlaceholder}
                  onError={(event) => {
                    event.currentTarget.src = horsePlaceholder;
                  }}
                  alt={selectedRegistration.horse.name}
                />
                <div>
                  <h3>{selectedRegistration.horse.name}</h3>
                  <span>{selectedRegistration.horse.id}</span>
                </div>
              </div>

              <dl className={styles.detailGrid}>
                <div>
                  <dt>Age</dt>
                  <dd>{selectedRegistration.horse.age} years</dd>
                </div>
                <div>
                  <dt>Stable</dt>
                  <dd>{selectedRegistration.horse.stable}</dd>
                </div>
                <div>
                  <dt>Breed</dt>
                  <dd>{selectedRegistration.horse.breed}</dd>
                </div>
                <div>
                  <dt>Sire</dt>
                  <dd>{selectedRegistration.horse.sire}</dd>
                </div>
                <div>
                  <dt>Dam</dt>
                  <dd>{selectedRegistration.horse.dam}</dd>
                </div>
              </dl>

              <div className={styles.section}>
                <h3>Eligibility Checklist</h3>
                <div className={styles.checklist}>
                  {Object.entries(eligibilityLabels).map(([key, label]) => {
                    const value =
                      selectedRegistration.eligibility?.[key] || "MISSING";
                    return (
                      <div key={key}>
                        <span>{label}</span>
                        <Badge variant={statusVariant(value)}>{value}</Badge>
                      </div>
                    );
                  })}
                </div>
              </div>

              <label className={styles.notes}>
                Referee Notes
                <textarea
                  rows="4"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Add observations for this registration..."
                  disabled={!isReviewable}
                />
              </label>

              {selectedRegistration.rejectionReason && (
                <div className={styles.rejectionReason}>
                  <strong>Rejection reason</strong>
                  <span>{selectedRegistration.rejectionReason}</span>
                </div>
              )}

              <div className={styles.panelActions}>
                <Button
                  variant="danger"
                  disabled={!isReviewable || submitting}
                  onClick={() => setModal("reject")}
                >
                  Reject
                </Button>
                <Button
                  disabled={!isReviewable || submitting}
                  onClick={() => setModal("approve")}
                >
                  Approve Registration
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>

      {modal && (
        <div className={styles.modalOverlay} role="presentation">
          <div className={styles.modal} role="dialog" aria-modal="true">
            <h2>
              {modal === "approve"
                ? "Approve Registration"
                : "Reject Registration"}
            </h2>
            <p>
              {modal === "approve"
                ? `Confirm that ${selectedRegistration.horse.name} meets all eligibility requirements.`
                : `Provide a reason for rejecting ${selectedRegistration.horse.name}.`}
            </p>
            {modal === "reject" && (
              <label className={styles.notes}>
                Rejection Reason
                <textarea
                  rows="4"
                  value={rejectReason}
                  onChange={(event) => setRejectReason(event.target.value)}
                  placeholder="Reason is required..."
                  autoFocus
                />
              </label>
            )}
            <div className={styles.modalActions}>
              <Button
                variant="ghost"
                disabled={submitting}
                onClick={() => {
                  setModal(null);
                  setRejectReason("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant={modal === "approve" ? "primary" : "danger"}
                disabled={
                  submitting || (modal === "reject" && !rejectReason.trim())
                }
                onClick={modal === "approve" ? confirmApprove : confirmReject}
              >
                {submitting
                  ? "Submitting..."
                  : modal === "approve"
                    ? "Confirm Approval"
                    : "Confirm Rejection"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
