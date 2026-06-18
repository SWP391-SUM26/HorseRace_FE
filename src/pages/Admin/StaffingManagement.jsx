import React, { useState } from 'react';
import styles from './StaffingManagement.module.css';

// Reuse UI components
import PageHeader from '../../components/ui/PageHeader';
import StatCard, { Card } from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import { getRaceAssignments, getStaffingDashboard, getStaffList, assignReferee, reassignReferee, removeAssignment, createStaff } from '../../services/staffing';
import {
  UserPlusIcon,
  CalendarIcon,
  CheckSquareIcon,
  AlertTriangleIcon,
  UsersIcon,
  SearchIcon,
  FilterIcon,
  LayoutIcon,
  TrophyIcon,
  BarChartIcon
} from '../../components/ui/Icons';

export default function StaffingManagement() {
  const [search, setSearch] = useState("");
  const [raceStatus, setRaceStatus] = useState("All Races");
  const [assignmentStatus, setAssignmentStatus] = useState("All Statuses");

  const [assignments, setAssignments] = useState([]);
  const [dashboard, setDashboard] = useState({
    totalScheduledRaces: 0,
    assignedReferees: 0,
    unassignedRaces: 0,
    availableReferees: 0
  });
  const [loading, setLoading] = useState(true);

  // Modal states
  const [staffList, setStaffList] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('ASSIGN'); // ASSIGN or REASSIGN
  const [selectedRace, setSelectedRace] = useState(null);
  const [assignmentForm, setAssignmentForm] = useState({ refereeUserId: '', panelRole: 'CHIEF' });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [confirmDelete, setConfirmDelete] = useState({ show: false, row: null });

  const [createStaffModal, setCreateStaffModal] = useState(false);
  const [newStaffForm, setNewStaffForm] = useState({ fullName: '', email: '', phone: '', password: '' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 2000);
  };

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const db = await getStaffingDashboard();
      if (db) setDashboard(db);

      const data = await getRaceAssignments({ page: 0, size: 50 });
      // The API returns an array or pagination object
      const items = Array.isArray(data) ? data : (data?.content ?? []);
      setAssignments(items);
    } catch (err) {
      console.error("Failed to fetch staffing data", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchStaff = async () => {
    if (staffList.length > 0) return;
    try {
      const res = await getStaffList({ size: 100 });
      setStaffList(Array.isArray(res) ? res : (res?.content || []));
    } catch (err) {}
  };

  const handleOpenAssign = (row) => {
    setSelectedRace(row);
    setModalMode('ASSIGN');
    setAssignmentForm({ refereeUserId: '', panelRole: 'CHIEF' });
    setModalOpen(true);
    fetchStaff();
  };

  const handleOpenReassign = (row) => {
    setSelectedRace(row);
    setModalMode('REASSIGN');
    setAssignmentForm({ refereeUserId: row.refereeUserId || '', panelRole: row.panelRole || 'CHIEF' });
    setModalOpen(true);
    fetchStaff();
  };

  const handleSaveAssignment = async () => {
    if (!assignmentForm.refereeUserId) return showToast("Please select a referee", "error");
    try {
      if (modalMode === 'ASSIGN') {
        await assignReferee({
          raceId: selectedRace.raceId,
          refereeUserId: assignmentForm.refereeUserId,
          panelRole: assignmentForm.panelRole
        });
        showToast('Referee assigned successfully!');
      } else {
        await reassignReferee(selectedRace.refAssignmentId, {
          newRefereeUserId: assignmentForm.refereeUserId,
          panelRole: assignmentForm.panelRole
        });
        showToast('Referee reassigned successfully!');
      }
      setModalOpen(false);
      fetchAssignments();
    } catch (err) {
      showToast('Error: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const confirmRemove = (row) => {
    setConfirmDelete({ show: true, row });
  };

  const handleRemove = async () => {
    const row = confirmDelete.row;
    setConfirmDelete({ show: false, row: null });
    if (row) {
      try {
        await removeAssignment(row.refAssignmentId);
        showToast('Assignment removed successfully!');
        fetchAssignments();
      } catch (err) {
        showToast('Error removing: ' + (err.response?.data?.message || err.message), 'error');
      }
    }
  };

  const handleNewRefereeClick = () => {
    setNewStaffForm({ fullName: '', email: '', phone: '', password: '' });
    setCreateStaffModal(true);
  };

  const handleCreateStaff = async () => {
    if (!newStaffForm.fullName || !newStaffForm.email || !newStaffForm.password) {
      return showToast("Name, Email, and Password are required!", "error");
    }
    if (newStaffForm.password.length < 8) {
      return showToast("Password must be at least 8 characters!", "error");
    }
    try {
      await createStaff(newStaffForm);
      showToast("Referee created successfully!");
      setCreateStaffModal(false);
      // Reload dashboard counts and staff list if open
      const db = await getStaffingDashboard();
      if (db) setDashboard(db);
      setStaffList([]); // invalidate cache
    } catch (err) {
      showToast('Error: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const tableColumns = [
    "RACE DETAILS",
    "RACE DATE",
    "CURRENT REFEREE",
    "ASSIGNMENT STATUS",
    "ACTIONS"
  ];

  return (
    <>
      <PageHeader
        title="Staffing Management"
        subtitle="Assign, reassign, and remove referees for scheduled races."
        actions={
          <Button onClick={handleNewRefereeClick} icon={UserPlusIcon} style={{ backgroundColor: '#022c22', color: '#fff' }}>
            New Referee
          </Button>
        }
      />

      <div className={styles.statsGrid}>
        <StatCard
          title="TOTAL SCHEDULED RACES"
          icon={CalendarIcon}
          value={dashboard.totalScheduledRaces.toString()}
        />
        
        <StatCard
          title="ASSIGNED REFEREES"
          icon={CheckSquareIcon}
          customContent={
            <>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}>
                {dashboard.assignedReferees}
              </div>
              <div className={styles.progressBarContainer}>
                <div className={styles.progressBarTrack}>
                  <div className={styles.progressBarFill} style={{ width: dashboard.totalScheduledRaces > 0 ? `${(dashboard.assignedReferees / dashboard.totalScheduledRaces) * 100}%` : '0%' }}></div>
                </div>
              </div>
            </>
          }
        />

        <StatCard
          title="UNASSIGNED RACES"
          icon={AlertTriangleIcon}
          customContent={
            <>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}>
                {dashboard.unassignedRaces}
              </div>
              <div className={styles.actionWarning}>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#ef4444' }}>!</span> Action required immediately
              </div>
            </>
          }
        />

        <StatCard
          title="AVAILABLE REFEREES"
          icon={UserPlusIcon}
          customContent={
            <>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}>
                {dashboard.availableReferees}
              </div>
              <div className={styles.availableNotice}>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#b45309' }}>ⓘ</span> Available for assignment
              </div>
            </>
          }
        />
      </div>

      <Card style={{ padding: '20px', marginBottom: '24px' }}>
        <div className={styles.filterControls}>
          <div className={styles.filterGroup} style={{ flexGrow: 1 }}>
            <label className={styles.filterLabel}>Search</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <SearchIcon style={{ position: 'absolute', left: '12px', color: '#94a3b8' }} />
              <input
                className={styles.filterSelect}
                style={{ width: '100%', paddingLeft: '36px' }}
                placeholder="Search by race name, referee name, or race ID"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Race Status</label>
            <select 
              className={styles.filterSelect}
              value={raceStatus}
              onChange={(e) => setRaceStatus(e.target.value)}
            >
              <option>All Races</option>
              <option>Upcoming</option>
              <option>Completed</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Assignment Status</label>
            <select 
              className={styles.filterSelect}
              value={assignmentStatus}
              onChange={(e) => setAssignmentStatus(e.target.value)}
            >
              <option>All Statuses</option>
              <option>Assigned</option>
              <option>Unassigned</option>
            </select>
          </div>

          <Button 
            style={{ 
              height: '42px', 
              padding: '0 32px',
              backgroundColor: '#8b6f3c', // gold color from mockup
              color: 'white',
              border: 'none',
              marginLeft: '8px'
            }}
            icon={FilterIcon}
          >
            Filter
          </Button>
        </div>
      </Card>

      <Card style={{ padding: 0 }}>
        <DataTable
          columns={tableColumns}
          data={assignments}
          loading={loading}
          totalItems={assignments.length}
          renderRow={(row) => (
            <tr key={row.raceId} className={styles.tableRow}>
              <td className={styles.td}>
                <div className={styles.raceCell}>
                  <div className={styles.raceIconWrapper}>
                    <LayoutIcon />
                  </div>
                  <div>
                    <div className={styles.raceName}>{row.raceName}</div>
                    <div className={styles.raceId}>ID: {row.raceCode}</div>
                  </div>
                </div>
              </td>
              <td className={styles.td}>
                <div className={styles.dateCell}>{row.scheduledStartAt ? new Date(row.scheduledStartAt).toLocaleDateString() : 'TBD'}</div>
                <div className={styles.timeCell}>{row.scheduledStartAt ? new Date(row.scheduledStartAt).toLocaleTimeString() : ''}</div>
              </td>
              <td className={styles.td}>
                {row.refereeName ? (
                  <div className={styles.refereeCell}>
                    <img src={row.refereeAvatarUrl || 'https://i.pravatar.cc/150'} alt="Avatar" className={styles.refereeAvatar} />
                    <span className={styles.refereeName}>{row.refereeName}</span>
                  </div>
                ) : (
                  <div className={styles.noReferee}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="2" y1="2" x2="22" y2="22"></line>
                      <path d="M10.41 10.41a2 2 0 1 1-2.83-2.83"></path>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                      <path d="M18.63 13A17.89 17.89 0 0 1 18 8"></path>
                      <path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14"></path>
                      <path d="M18 8a6 6 0 0 0-9.33-5"></path>
                    </svg>
                    Not Assigned
                  </div>
                )}
              </td>
              <td className={styles.td}>
                <Badge variant={row.assignmentStatus === "ASSIGNED" ? "success" : "danger"}>
                  {row.assignmentStatus}
                </Badge>
              </td>
              <td className={styles.td}>
                {row.assignmentStatus === "ASSIGNED" ? (
                  <div className={styles.actionsCell}>
                    <Button variant="outline" size="sm" onClick={() => handleOpenReassign(row)}>Reassign</Button>
                    <Button variant="outline" size="sm" style={{ color: '#ef4444', borderColor: '#ef4444' }} onClick={() => confirmRemove(row)}>Remove</Button>
                  </div>
                ) : (
                  <Button size="sm" style={{ backgroundColor: '#022c22', color: 'white' }} onClick={() => handleOpenAssign(row)}>Assign</Button>
                )}
              </td>
            </tr>
          )}
        />
      </Card>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', color: '#64748b', fontSize: '14px' }}>
        <div>Showing <strong>1</strong> to <strong>{assignments.length}</strong> of <strong>{dashboard.totalScheduledRaces}</strong> races</div>
      </div>

      {modalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <span>{modalMode === 'ASSIGN' ? 'Assign Referee' : 'Reassign Referee'}</span>
              <button className={styles.closeButton} onClick={() => setModalOpen(false)}>&times;</button>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Select Referee</label>
              <select className={styles.formSelect} value={assignmentForm.refereeUserId} onChange={e => setAssignmentForm({...assignmentForm, refereeUserId: e.target.value})}>
                <option value="">-- Choose Referee --</option>
                {staffList.map(staff => (
                  <option key={staff.userId || staff.id} value={staff.userId || staff.id}>
                    {staff.fullName || staff.name} ({staff.userCode || staff.role})
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Panel Role</label>
              <select className={styles.formSelect} value={assignmentForm.panelRole} onChange={e => setAssignmentForm({...assignmentForm, panelRole: e.target.value})}>
                <option value="CHIEF">CHIEF</option>
                <option value="JUDGE">JUDGE</option>
                <option value="STEWARD">STEWARD</option>
                <option value="TIMEKEEPER">TIMEKEEPER</option>
                <option value="OBSERVER">OBSERVER</option>
              </select>
            </div>
            <div className={styles.modalFooter}>
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button style={{ backgroundColor: '#022c22', color: 'white' }} onClick={handleSaveAssignment}>Save Assignment</Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Staff Modal */}
      {createStaffModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <span>Create New Referee</span>
              <button className={styles.closeButton} onClick={() => setCreateStaffModal(false)}>&times;</button>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Full Name <span style={{color: 'red'}}>*</span></label>
              <input type="text" className={styles.formSelect} value={newStaffForm.fullName} onChange={e => setNewStaffForm({...newStaffForm, fullName: e.target.value})} placeholder="e.g. John Doe" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Email <span style={{color: 'red'}}>*</span></label>
              <input type="email" className={styles.formSelect} value={newStaffForm.email} onChange={e => setNewStaffForm({...newStaffForm, email: e.target.value})} placeholder="email@example.com" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Phone Number</label>
              <input type="text" className={styles.formSelect} value={newStaffForm.phone} onChange={e => setNewStaffForm({...newStaffForm, phone: e.target.value})} placeholder="Optional" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Password <span style={{color: 'red'}}>*</span></label>
              <input type="password" className={styles.formSelect} value={newStaffForm.password} onChange={e => setNewStaffForm({...newStaffForm, password: e.target.value})} placeholder="Min 8 characters" />
            </div>
            <div className={styles.modalFooter}>
              <Button variant="outline" onClick={() => setCreateStaffModal(false)}>Cancel</Button>
              <Button style={{ backgroundColor: '#022c22', color: 'white' }} onClick={handleCreateStaff}>Create Referee</Button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirm Modal for Remove */}
      {confirmDelete.show && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} style={{ width: '360px', textAlign: 'center' }}>
            <div className={styles.toastIcon} style={{ margin: '0 auto 16px auto', backgroundColor: '#fee2e2', color: '#dc2626' }}>
              <AlertTriangleIcon size={32} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>Remove Assignment</h3>
            <p style={{ color: '#64748b', marginBottom: '24px' }}>Are you sure you want to remove the referee from this race?</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Button variant="outline" onClick={() => setConfirmDelete({ show: false, row: null })}>Cancel</Button>
              <Button style={{ backgroundColor: '#ef4444', color: 'white' }} onClick={handleRemove}>Yes, Remove</Button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Modal */}
      {toast.show && (
        <div className={styles.toastOverlay}>
          <div className={styles.toastModal}>
            <div className={`${styles.toastIcon} ${styles[toast.type]}`}>
              {toast.type === 'success' ? (
                <CheckSquareIcon size={32} />
              ) : (
                <AlertTriangleIcon size={32} />
              )}
            </div>
            <div className={styles.toastMessage}>{toast.message}</div>
          </div>
        </div>
      )}
    </>
  );
}
