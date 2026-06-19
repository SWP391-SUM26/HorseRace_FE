import { useState, useMemo, useEffect } from "react";
import styles from "./StableManagement.module.css";
import ownerMock from "../../data/ownerMock.json";
import {
  getHorses,
  createHorse,
  updateHorse,
  deleteHorse,
  assignHorseToRace,
  toggleMedicalStatus,
} from "../../services/horse";
import { getTournaments } from "../../services/tournament";
import { submitRegistration } from "../../services/registration";

// Tournaments will be loaded from API

export default function StableManagement() {
  const { stableOverview } = ownerMock;

  // React State for Roster loaded from local service
  const [horses, setHorses] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Table control state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("name-asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Selected horse state for detail/edit
  const [selectedHorse, setSelectedHorse] = useState(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formAge, setFormAge] = useState("3yo");
  const [formBreed, setFormBreed] = useState("Colt");
  const [formStatus, setFormStatus] = useState("FIT TO RACE");
  //const [formImage, setFormImage] = useState(null);
  const [formImagePreview, setFormImagePreview] = useState("");

  // Race assignment state
  const [selectedRaceId, setSelectedRaceId] = useState("");

  // Notifications state
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const triggerToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  // Load horses on mount
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await getHorses();
        setHorses(data);
        const tourneys = await getTournaments({ status: "REGISTRATION_OPEN" });
        setTournaments(tourneys?.data?.content || tourneys?.items || []);
      } catch (err) {
        console.error("Failed to load stable data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Calculations derived from current state
  const totalHorses = horses.length;
  const fitCount = horses.filter((h) => h.status === "FIT TO RACE").length;
  const restingCount = totalHorses - fitCount;

  // Image Upload helper
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      //setFormImage(file);
      setFormImagePreview(URL.createObjectURL(file));
    }
  };

  // CREATE HORSE ACTION
  const handleOpenCreate = () => {
    setFormName("");
    setFormAge("3yo");
    setFormBreed("Colt");
    setFormStatus("FIT TO RACE");
    //setFormImage(null);
    setFormImagePreview("");
    setIsCreateOpen(true);
  };

  const handleCreateHorse = async (e) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const data = await createHorse({
      name: formName.trim(),
      age: formAge,
      breed: formBreed,
      status: formStatus,
      image: formImagePreview || "/assets/dashboard_monitor.png",
    });

    setHorses((prev) => [data, ...prev]);
    setIsCreateOpen(false);
    triggerToast(`Successfully registered ${data.name}!`);
  };

  // EDIT HORSE ACTION
  const handleOpenEdit = (horse, e) => {
    e.stopPropagation();
    setSelectedHorse(horse);
    setFormName(horse.name);
    setFormAge(horse.age);
    setFormBreed(horse.breed);
    setFormStatus(horse.status);
    setFormImagePreview(horse.image);
    setIsEditOpen(true);
  };

  const handleUpdateHorse = async (e) => {
    e.preventDefault();
    if (!selectedHorse || !formName.trim()) return;

    const data = await updateHorse(selectedHorse.id, {
      name: formName.trim(),
      age: formAge,
      breed: formBreed,
      status: formStatus,
      image: formImagePreview,
    });

    setHorses((prev) => prev.map((h) => (h.id === data.id ? data : h)));
    setIsEditOpen(false);
    if (selectedHorse && selectedHorse.id === data.id) {
      setSelectedHorse(data);
    }
    triggerToast(`Updated profile for ${data.name}!`);
  };

  // DELETE HORSE ACTION
  const handleDeleteHorse = async (id, name, e) => {
    e.stopPropagation();
    if (
      window.confirm(
        `Are you sure you want to retire/delete ${name} from your stable?`,
      )
    ) {
      await deleteHorse(id);
      setHorses((prev) => prev.filter((h) => h.id !== id));
      if (selectedHorse && selectedHorse.id === id) {
        setIsDetailOpen(false);
      }
      triggerToast(`${name} has been removed from stable roster.`);
    }
  };

  // REGISTER HORSE FOR TOURNAMENT
  const handleAssignRace = async (e) => {
    e.preventDefault();
    if (!selectedHorse || !selectedRaceId) return;

    try {
      await submitRegistration({
        tournamentId: selectedRaceId,
        horseId: selectedHorse.id,
      });
      setSelectedRaceId("");
      triggerToast(`${selectedHorse.name} registered for tournament successfully!`);
    } catch (err) {
      triggerToast("Registration failed: " + (err.response?.data?.message || err.message), "error");
    }
  };

  // UPDATE MEDICAL STATUS FROM DETAILS DIRECTLY
  const handleToggleMedical = async (horse) => {
    const data = await toggleMedicalStatus(horse.id);
    setHorses((prev) => prev.map((h) => (h.id === data.id ? data : h)));
    setSelectedHorse(data);
    triggerToast(`Medical logs updated for ${data.name}.`);
  };

  // VIEW HORSE DETAILS
  const handleOpenDetail = (horse) => {
    setSelectedHorse(horse);
    setIsDetailOpen(true);
  };

  // Filter, search, and sort roster
  const filteredHorses = useMemo(() => {
    return horses
      .filter((h) => {
        const matchesSearch =
          h.name.toLowerCase().includes(search.toLowerCase()) ||
          h.breed.toLowerCase().includes(search.toLowerCase());
        const matchesFilter =
          statusFilter === "ALL" || h.status === statusFilter;
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        if (sortBy === "name-asc") return a.name.localeCompare(b.name);
        if (sortBy === "name-desc") return b.name.localeCompare(a.name);
        if (sortBy === "status") return a.status.localeCompare(b.status);
        return 0;
      });
  }, [horses, search, statusFilter, sortBy]);

  // Pagination calculations
  const totalItems = filteredHorses.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedHorses = filteredHorses.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className={styles.stableContainer}>
      {/* Modal Alert Notification */}
      {toast.show && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalBox} ${styles[`modal_${toast.type}`]}`}>
            <div className={styles.modalContent}>
              <span className={styles.modalIcon}>
                {toast.type === "success" ? "✓" : "❌"}
              </span>
              <div className={styles.modalText}>
                <h3 className={styles.modalTitle}>
                  {toast.type === "success" ? "Thành công" : "Thất bại"}
                </h3>
                <p className={styles.modalMessage}>{toast.message}</p>
              </div>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.saveBtn} onClick={() => setToast({ ...toast, show: false })}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Owner Dashboard</h1>
          <p className={styles.pageSubtitle}>
            Welcome back, Mr. Sterling. Your stable is performing well.
          </p>
        </div>
        <button className={styles.btnPrimary} onClick={handleOpenCreate}>
          <span className={styles.btnIcon}>+</span> Register New Horse
        </button>
      </div>

      {/* Overview Cards Row */}
      <div className={styles.statsRow}>
        {/* Stable Overview Card */}
        <div className={styles.statCard}>
          <div className={styles.cardHeader}>
            <span className={styles.cardHeaderIcon}>🏚️</span>
            <span className={styles.cardHeaderTitle}>Stable Overview</span>
          </div>
          <div className={styles.statsWrapper}>
            <div className={styles.statBox}>
              <span className={styles.statLabel}>TOTAL HORSES</span>
              <strong className={styles.statNumber}>
                {loading ? "..." : totalHorses}
              </strong>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statBox}>
              <span className={styles.statLabel}>FIT FOR RACING</span>
              <strong
                className={styles.statNumber}
                style={{ color: "#16a34a" }}
              >
                {loading ? "..." : fitCount}
              </strong>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statBox}>
              <span className={styles.statLabel}>WIN RATE</span>
              <strong
                className={styles.statNumber}
                style={{ color: "#d97706" }}
              >
                {stableOverview.winRate}
              </strong>
            </div>
          </div>
          <div className={styles.cardFooter}>
            <span>
              {loading ? "..." : restingCount} Horses currently unfit/resting
            </span>
            <a href="#medical" className={styles.footerLink}>
              View Medical Reports
            </a>
          </div>
        </div>

        {/* YTD Earnings Card */}
        <div className={styles.earningsCard}>
          <span className={styles.earningsLabel}>YTD EARNINGS</span>
          <h2 className={styles.earningsValue}>{stableOverview.ytdEarnings}</h2>
          <div className={styles.earningsTrendWrap}>
            <span className={styles.earningsTrend}>vs Last Year</span>
            <span className={styles.trendPercent}>
              ↑{stableOverview.ytdEarningsTrend}
            </span>
          </div>
          <div className={styles.progressBarBg}>
            <div className={styles.progressBarFill} style={{ width: "75%" }} />
          </div>
        </div>
      </div>

      {/* Main content grid split */}
      <div className={styles.layoutSplit}>
        {/* Left Section: Active Roster */}
        <div className={styles.rosterSection}>
          <div className={styles.rosterCard}>
            <div className={styles.rosterHeader}>
              <h3 className={styles.rosterTitle}>Active Roster</h3>
              <button
                className={styles.viewAllBtn}
                onClick={() => {
                  setSearch("");
                  setStatusFilter("ALL");
                  setCurrentPage(1);
                }}
              >
                View All
              </button>
            </div>

            {/* Filter and control bar */}
            <div className={styles.controlBar}>
              <div className={styles.searchWrap}>
                <span className={styles.searchIcon}>🔍</span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search horse..."
                  className={styles.searchInput}
                />
              </div>

              <div className={styles.filtersGroup}>
                <select
                  className={styles.selectFilter}
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="FIT TO RACE">Fit to Race</option>
                  <option value="RESTING">Resting</option>
                </select>

                <select
                  className={styles.selectFilter}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="name-asc">Sort: A-Z</option>
                  <option value="name-desc">Sort: Z-A</option>
                  <option value="status">Sort: Status</option>
                </select>
              </div>
            </div>

            {/* Horse Roster Table */}
            <table className={styles.rosterTable}>
              <thead>
                <tr>
                  <th>HORSE</th>
                  <th>STATUS</th>
                  <th>NEXT RACE</th>
                  <th style={{ textAlign: "right" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className={styles.emptyTable}>
                      Loading stable data...
                    </td>
                  </tr>
                ) : paginatedHorses.length > 0 ? (
                  paginatedHorses.map((horse) => (
                    <tr
                      key={horse.id}
                      className={styles.rosterRow}
                      onClick={() => handleOpenDetail(horse)}
                    >
                      <td>
                        <div className={styles.horseCell}>
                          <img
                            src={horse.image}
                            alt={horse.name}
                            className={styles.horseThumb}
                          />
                          <div>
                            <span className={styles.horseName}>
                              {horse.name}
                            </span>
                            <span className={styles.horseDesc}>
                              {horse.details}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`${styles.statusBadge} ${horse.status === "FIT TO RACE" ? styles.statusFit : styles.statusResting}`}
                        >
                          {horse.status === "FIT TO RACE"
                            ? "FIT TO RACE"
                            : "RESTING"}
                        </span>
                      </td>
                      <td>
                        <div className={styles.nextRaceCell}>
                          <strong className={styles.nextRaceDate}>
                            {horse.nextRace}
                          </strong>
                          {horse.track && (
                            <span className={styles.nextRaceTrack}>
                              {horse.track}
                            </span>
                          )}
                        </div>
                      </td>
                      <td
                        style={{ textAlign: "right" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className={styles.actionsWrap}>
                          <button
                            className={styles.actionBtnIcon}
                            onClick={() => handleOpenDetail(horse)}
                            title="View Details"
                          >
                            👁️
                          </button>
                          <button
                            className={styles.actionBtnIcon}
                            onClick={(e) => handleOpenEdit(horse, e)}
                            title="Edit Profile"
                          >
                            ✏️
                          </button>
                          <button
                            className={styles.actionBtnIcon}
                            onClick={(e) =>
                              handleDeleteHorse(horse.id, horse.name, e)
                            }
                            style={{ color: "#ef4444" }}
                            title="Retire Horse"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className={styles.emptyTable}>
                      No horses found matching current criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {!loading && totalItems > 0 && (
              <div className={styles.paginationBar}>
                <span className={styles.paginationInfo}>
                  Showing {startIndex + 1} to{" "}
                  {Math.min(startIndex + itemsPerPage, totalItems)} of{" "}
                  {totalItems} entries
                </span>
                <div className={styles.paginationBtns}>
                  <button
                    className={styles.pageBtn}
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    &lt; Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        className={`${styles.pageBtn} ${currentPage === page ? styles.pageBtnActive : ""}`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    ),
                  )}
                  <button
                    className={styles.pageBtn}
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next &gt;
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Sidebar Cards */}
        <div className={styles.sidebarSection}>
          {/* Jockey Invites Widget */}
          <div className={styles.widgetCard}>
            <div className={styles.widgetHeader}>
              <span className={styles.widgetIcon}>✉️</span>
              <h4 className={styles.widgetTitle}>Jockey Invites</h4>
            </div>
            <div className={styles.widgetBody}>
              {stableOverview.jockeyInvites.map((invite) => (
                <div key={invite.id} className={styles.inviteItem}>
                  <div className={styles.inviteHeader}>
                    <strong>{invite.horseName}</strong>
                    <span className={styles.inviteBadge}>{invite.status}</span>
                  </div>
                  <p className={styles.inviteText}>
                    Invited {invite.jockeyName} for {invite.race}
                  </p>
                  <button
                    className={styles.resendBtn}
                    onClick={() =>
                      triggerToast(
                        `Resent invitation to ${invite.jockeyName} for ${invite.race}`,
                      )
                    }
                  >
                    Resend
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Health Docs Widget */}
          <div className={styles.widgetCard}>
            <div className={styles.widgetHeader}>
              <span className={styles.widgetIcon}>💼</span>
              <h4 className={styles.widgetTitle}>Health Docs</h4>
            </div>
            <div className={styles.widgetBody}>
              {stableOverview.healthDocs.map((doc) => {
                const isWarning = doc.type === "warning";
                return (
                  <div key={doc.id} className={styles.docItem}>
                    <span
                      className={
                        isWarning
                          ? styles.docIconWarning
                          : styles.docIconSuccess
                      }
                    >
                      {isWarning ? "⚠️" : "✅"}
                    </span>
                    <div className={styles.docInfo}>
                      <span className={styles.docHorse}>{doc.horseName}</span>
                      <span
                        className={
                          isWarning
                            ? styles.docStatusWarning
                            : styles.docStatusSuccess
                        }
                      >
                        {doc.document} {doc.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className={styles.widgetFooter}>
              <a href="#documents" className={styles.widgetFooterLink}>
                Manage Documents
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================
         INTERACTIVE MODAL: CREATE HORSE
         ========================================== */}
      {isCreateOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Register New Horse</h3>
              <button
                className={styles.modalCloseBtn}
                onClick={() => setIsCreateOpen(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateHorse} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>HORSE NAME</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Thunder Dash"
                  className={styles.formInput}
                  required
                />
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>AGE</label>
                  <select
                    value={formAge}
                    onChange={(e) => setFormAge(e.target.value)}
                    className={styles.formSelect}
                  >
                    <option value="2yo">2yo (Two years old)</option>
                    <option value="3yo">3yo (Three years old)</option>
                    <option value="4yo">4yo (Four years old)</option>
                    <option value="5yo">5yo (Five years old)</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>BREED/GENDER</label>
                  <select
                    value={formBreed}
                    onChange={(e) => setFormBreed(e.target.value)}
                    className={styles.formSelect}
                  >
                    <option value="Colt">Colt (Young Male)</option>
                    <option value="Filly">Filly (Young Female)</option>
                    <option value="Stallion">Stallion (Adult Male)</option>
                    <option value="Gelding">Gelding (Castrated Male)</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  INITIAL READINESS STATUS
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className={styles.formSelect}
                >
                  <option value="FIT TO RACE">Fit for Racing</option>
                  <option value="RESTING">Resting / Inactive</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>UPLOAD HORSE IMAGE</label>
                <div className={styles.imageUploadWrapper}>
                  {formImagePreview ? (
                    <img
                      src={formImagePreview}
                      alt="Preview"
                      className={styles.uploadPreview}
                    />
                  ) : (
                    <div className={styles.imagePlaceholder}>
                      🐎 No Image Chosen
                    </div>
                  )}
                  <label className={styles.imageUploadBtn}>
                    Choose File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: "none" }}
                    />
                  </label>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.btnGhost}
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.btnPrimary}>
                  Register Horse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
         INTERACTIVE MODAL: EDIT HORSE
         ========================================== */}
      {isEditOpen && selectedHorse && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Edit Horse Profile</h3>
              <button
                className={styles.modalCloseBtn}
                onClick={() => setIsEditOpen(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleUpdateHorse} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>HORSE NAME</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className={styles.formInput}
                  required
                />
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>AGE</label>
                  <select
                    value={formAge}
                    onChange={(e) => setFormAge(e.target.value)}
                    className={styles.formSelect}
                  >
                    <option value="2yo">2yo</option>
                    <option value="3yo">3yo</option>
                    <option value="4yo">4yo</option>
                    <option value="5yo">5yo</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>BREED/GENDER</label>
                  <select
                    value={formBreed}
                    onChange={(e) => setFormBreed(e.target.value)}
                    className={styles.formSelect}
                  >
                    <option value="Colt">Colt</option>
                    <option value="Filly">Filly</option>
                    <option value="Stallion">Stallion</option>
                    <option value="Gelding">Gelding</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>READINESS STATUS</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className={styles.formSelect}
                >
                  <option value="FIT TO RACE">Fit for Racing</option>
                  <option value="RESTING">Resting / Inactive</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>HORSE IMAGE</label>
                <div className={styles.imageUploadWrapper}>
                  <img
                    src={formImagePreview}
                    alt="Preview"
                    className={styles.uploadPreview}
                  />
                  <label className={styles.imageUploadBtn}>
                    Replace Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: "none" }}
                    />
                  </label>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.btnGhost}
                  onClick={() => setIsEditOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.btnPrimary}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
         INTERACTIVE DRAWER: HORSE DETAILS
         ========================================== */}
      {isDetailOpen && selectedHorse && (
        <div
          className={styles.modalOverlay}
          onClick={() => setIsDetailOpen(false)}
        >
          <div
            className={styles.drawerContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.drawerHeader}>
              <h3 className={styles.drawerTitle}>Horse Security Profile</h3>
              <button
                className={styles.drawerCloseBtn}
                onClick={() => setIsDetailOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className={styles.drawerBody}>
              {/* Image & Basic Details */}
              <div className={styles.detailHero}>
                <img
                  src={selectedHorse.image}
                  alt={selectedHorse.name}
                  className={styles.detailLargeImage}
                />
                <h2 className={styles.detailName}>{selectedHorse.name}</h2>
                <div className={styles.detailPills}>
                  <span className={styles.detailPill}>{selectedHorse.age}</span>
                  <span className={styles.detailPill}>
                    {selectedHorse.breed}
                  </span>
                  <span
                    className={`${styles.statusBadge} ${selectedHorse.status === "FIT TO RACE" ? styles.statusFit : styles.statusResting}`}
                  >
                    {selectedHorse.status}
                  </span>
                </div>
              </div>

              {/* Action buttons inside drawer */}
              <div className={styles.drawerInlineActions}>
                <button
                  className={styles.btnGhost}
                  onClick={(e) => {
                    setIsDetailOpen(false);
                    handleOpenEdit(selectedHorse, e);
                  }}
                  style={{ flex: 1 }}
                >
                  ✏️ Edit Profile
                </button>
                <button
                  className={styles.btnGhost}
                  onClick={(e) =>
                    handleDeleteHorse(selectedHorse.id, selectedHorse.name, e)
                  }
                  style={{ flex: 1, borderColor: "#fee2e2", color: "#ef4444" }}
                >
                  🗑️ Retire Horse
                </button>
              </div>

              {/* Medical Section (Get Medical Status & Update Medical Status) */}
              <div className={styles.detailSection}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionTitleIcon}>🏥</span>
                  <h4 className={styles.sectionTitle}>
                    Medical Records & Status
                  </h4>
                </div>
                <div className={styles.medicalBox}>
                  <div className={styles.medicalField}>
                    <span>READINESS:</span>
                    <strong>{selectedHorse.medicalStatus}</strong>
                  </div>
                  <div className={styles.medicalField}>
                    <span>COGGINS TEST:</span>
                    <strong
                      style={{
                        color:
                          selectedHorse.cogginsTest === "Up to date"
                            ? "#16a34a"
                            : "#ef4444",
                      }}
                    >
                      {selectedHorse.cogginsTest}
                    </strong>
                  </div>
                  <div className={styles.medicalField}>
                    <span>VACCINATIONS:</span>
                    <strong style={{ color: "#16a34a" }}>
                      {selectedHorse.vaccines}
                    </strong>
                  </div>

                  <button
                    type="button"
                    className={styles.medicalToggleBtn}
                    onClick={() => handleToggleMedical(selectedHorse)}
                  >
                    Toggle Fitness Status (Mark as{" "}
                    {selectedHorse.status === "FIT TO RACE"
                      ? "RESTING"
                      : "FIT FOR RACING"}
                    )
                  </button>
                </div>
              </div>

              {/* Registration Section */}
              <div className={styles.detailSection}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionTitleIcon}>🏁</span>
                  <h4 className={styles.sectionTitle}>
                    Register for Tournament
                  </h4>
                </div>
                <form onSubmit={handleAssignRace} className={styles.assignForm}>
                  <select
                    value={selectedRaceId}
                    onChange={(e) => setSelectedRaceId(e.target.value)}
                    className={styles.formSelect}
                    required
                  >
                    <option value="">-- Choose Open Tournament --</option>
                    {tournaments.map((tournament) => (
                      <option key={tournament.tournamentId || tournament.id} value={tournament.tournamentId || tournament.id}>
                        {tournament.name || tournament.tournamentName} ({tournament.location || 'Unknown'})
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className={styles.btnPrimary}
                    style={{ width: "100%", marginTop: "10px" }}
                  >
                    Submit Registration
                  </button>
                </form>
              </div>

              {/* Race History Section (Get Horse Race History) */}
              <div className={styles.detailSection}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionTitleIcon}>🏆</span>
                  <h4 className={styles.sectionTitle}>Race History Log</h4>
                </div>
                <div className={styles.historyList}>
                  {selectedHorse.raceHistory &&
                  selectedHorse.raceHistory.length > 0 ? (
                    selectedHorse.raceHistory.map((hist, idx) => (
                      <div key={idx} className={styles.historyRow}>
                        <div className={styles.historyMeta}>
                          <strong>{hist.race}</strong>
                          <span>
                            {hist.date} • Jockey: {hist.jockey}
                          </span>
                        </div>
                        <div className={styles.historyStats}>
                          <span className={styles.historyPlace}>
                            {hist.place}
                          </span>
                          <span className={styles.historyPrize}>
                            {hist.prize}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className={styles.emptyHistory}>
                      This horse has no recorded past race entries.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
