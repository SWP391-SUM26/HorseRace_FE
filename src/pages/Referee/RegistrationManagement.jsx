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
  if (['APPROVED', 'VALID'].includes(status)) return 'success';
  if (['PENDING', 'MISSING'].includes(status)) return 'warning';
  if (['REJECTED', 'FAILED'].includes(status)) return 'suspended';
  return 'ghost';
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
  const [activeTab, setActiveTab] = useState('users');
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
          pending: response.items.filter((item) => item.status === 'PENDING').length,
          approved: response.items.filter((item) => item.status === 'APPROVED').length,
          rejected: response.items.filter((item) => item.status === 'REJECTED').length,
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
    allRegistrations.forEach((item) => {
      if (item?.tournament?.id) {
        tournamentMap.set(item.tournament.id, item.tournament.name);
      }
    });
    return {
      tournaments: [...tournamentMap.entries()],
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
        "Status",
        "Submitted Date",
      ],
      ...registrations.map((item) => [
        item?.code || '',
        item?.horse?.name || 'Unknown',
        item?.owner?.name || 'Unknown',
        item?.tournament?.name || 'Unknown',
        item?.status || '',
        formatDate(item?.submittedAt),
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

  const isPending = selectedRegistration?.status === 'PENDING';

  return (
    <>
      <PageHeader
        title="Registration Approval"
        subtitle="Review and approve platform members and race registrations."
        actions={
          <>
            <Button variant="ghost" icon={DownloadIcon} onClick={exportRegistrations}>
              Export Registrations
            </Button>
            <Button onClick={refreshData} disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </Button>
          </>
        }
      />

      <div className={styles.tabsContainer}>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'users' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('users')}
        >
          User Approvals
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'horses' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('horses')}
        >
          Race Registrations
        </button>
      </div>

      {activeTab === 'users' ? (
        <>
          <div className={styles.statsGrid}>
            <StatCard title="PENDING APPROVALS" icon={ClipboardIcon} value="24" />
            <StatCard title="APPROVED TODAY" icon={CheckSquareIcon} value="158" />
            <StatCard title="REJECTED TODAY" icon={RefereeIcon} value="09" />
          </div>

          <div className={styles.queueLayout}>
            {/* Left Queue List */}
            <div>
              <div className={styles.queueHeader}>
                <span>Queue (24)</span>
                <div>
                  <button className={styles.btnGhost}>=</button>
                </div>
              </div>
              <div className={styles.queueList}>
                <div className={`${styles.queueCard} ${styles.queueCardActive}`}>
                  <div className={styles.queueCardTop}>
                    <h3 className={styles.queueName}>Jonathan Sterling</h3>
                    <span className={styles.badgeUrgent}>Urgent</span>
                  </div>
                  <div className={styles.queueRole}>Owner • Register ID: #8832</div>
                  <div className={styles.queueTime}>
                    <button className={styles.btnQReject}>Reject</button>
                    <button className={styles.btnQApprove}>Approve</button>
                  </div>
                </div>

                <div className={styles.queueCard}>
                  <div className={styles.queueCardTop}>
                    <h3 className={styles.queueName}>Elena Rodriguez</h3>
                    <span className={styles.badgeNew}>New</span>
                  </div>
                  <div className={styles.queueRole}>Trainer • Register ID: #8835</div>
                  <div className={styles.queueTime}>Submitted 4 hours ago</div>
                </div>

                <div className={styles.queueCard}>
                  <div className={styles.queueCardTop}>
                    <h3 className={styles.queueName}>Marcus Vane</h3>
                    <span className={styles.badgeNew}>New</span>
                  </div>
                  <div className={styles.queueRole}>Vet • Register ID: #8836</div>
                  <div className={styles.queueTime}>Submitted 6 hours ago</div>
                </div>

                <div className={styles.queueCard}>
                  <div className={styles.queueCardTop}>
                    <h3 className={styles.queueName}>Sarah Whitmore</h3>
                    <span className={styles.badgeNew}>New</span>
                  </div>
                  <div className={styles.queueRole}>Owner • Register ID: #8839</div>
                  <div className={styles.queueTime}>Submitted 12 hours ago</div>
                </div>
              </div>
              <Button className={styles.actionBtn} style={{marginTop: '16px', width: '100%'}}>
                Start New Session
              </Button>
            </div>

            {/* Right Details Panel */}
            <Card style={{padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column'}}>
              <div className={styles.userProfile}>
                <div className={styles.profileInfo}>
                  <img src="https://i.pravatar.cc/150?img=11" alt="Jonathan Sterling" className={styles.profileAvatar} />
                  <div>
                    <h2 className={styles.profileName}>Jonathan Sterling</h2>
                    <p className={styles.profileMeta}>📍 Lexington, Kentucky • Member since 2024</p>
                    <div className={styles.profileTags}>
                      <span className={styles.tagBlue}>Owner</span>
                      <span className={styles.tagBlue}>Class A License</span>
                    </div>
                  </div>
                </div>
                <div className={styles.profileActions}>
                  <button className={styles.btnGhost}>↓ Download Full Dossier</button>
                  <button className={styles.btnGhost}>⏱ View Previous Applications</button>
                </div>
              </div>

              <div className={styles.detailsGrid}>
                {/* Left Col */}
                <div>
                  <h3 className={styles.sectionTitle}>👤 Identity Details</h3>
                  <div className={styles.infoBox} style={{marginBottom: '24px'}}>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Full Name</span>
                      <span className={styles.infoVal}>Jonathan Pierce Sterling</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Date of Birth</span>
                      <span className={styles.infoVal}>12 May 1978</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Tax ID</span>
                      <span className={styles.infoVal}>XXX-XX-4421</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Contact</span>
                      <span className={styles.infoVal}>+1 (555) 012-9932</span>
                    </div>
                  </div>

                  <h3 className={styles.sectionTitle}>🏢 Business Affiliations</h3>
                  <div className={styles.businessBox}>
                    <div className={styles.bizIcon}>S</div>
                    <div>
                      <h4 className={styles.bizName}>Sterling Equine Holdings</h4>
                      <p className={styles.bizMeta}>12 Horses Registered</p>
                    </div>
                  </div>
                </div>

                {/* Right Col */}
                <div>
                  <div className={styles.checklistPanel}>
                    <h3 className={styles.sectionTitle}>Eligibility Checklist</h3>
                    <p style={{fontSize: '13px', color: '#64748b', marginBottom: '16px'}}>All automated checks must be manually verified before approval.</p>
                    
                    <div className={styles.checklistItem}>
                      <div className={styles.checkInfo}>
                        <div className={styles.checkIcon}>✓</div>
                        <div>
                          <h4 className={styles.checkName}>ID Verification</h4>
                          <p className={styles.checkMeta}>Passport #A2399201 Valid</p>
                        </div>
                      </div>
                      <button className={styles.btnGhost}>👁</button>
                    </div>

                    <div className={styles.checklistItem}>
                      <div className={styles.checkInfo}>
                        <div className={styles.checkIcon}>✓</div>
                        <div>
                          <h4 className={styles.checkName}>License Check</h4>
                          <p className={styles.checkMeta}>Class A - Active 2024</p>
                        </div>
                      </div>
                      <button className={styles.btnGhost}>👁</button>
                    </div>

                    <div className={styles.checklistItem}>
                      <div className={styles.checkInfo}>
                        <div className={styles.checkIcon}>✓</div>
                        <div>
                          <h4 className={styles.checkName}>Background</h4>
                          <p className={styles.checkMeta}>Clear</p>
                        </div>
                      </div>
                      <button className={styles.btnGhost}>👁</button>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{flexGrow: 1}}></div>

              <div className={styles.bottomBar}>
                <button className={`${styles.actionBtn} ${styles.btnInfo}`}>✎ Request More Info</button>
                <button className={`${styles.actionBtn} ${styles.btnRejectLg}`}>REJECT APPLICANT</button>
                <button className={`${styles.actionBtn} ${styles.btnApproveLg}`}>APPROVE & ONBOARD</button>
              </div>
            </Card>
          </div>
        </>
      ) : (
        <>
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
              <option value="PENDING">Pending</option>
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
                <td>{item?.code}</td>
                <td>
                  <strong>{item?.horse?.name || 'Unknown Horse'}</strong>
                  <span>{item?.horse?.code}</span>
                </td>
                <td>{item?.owner?.name || 'Unknown Owner'}</td>
                <td>{item?.tournament?.name || 'Unknown Tournament'}</td>
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
                  <span>{selectedRegistration.horse.code}</span>
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
        </>
      )}

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