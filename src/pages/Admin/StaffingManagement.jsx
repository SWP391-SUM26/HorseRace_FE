import React, { useState, useEffect, useCallback } from 'react';
import styles from './StaffingManagement.module.css';
import { getStaffingDashboard, getRaceAssignments, createStaff, getStaffList, assignReferee, reassignReferee, removeAssignment } from '../../services/staffing';

// Reuse UI components
import PageHeader from '../../components/ui/PageHeader';
import StatCard, { Card } from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import PopupModal from '../../components/ui/PopupModal';
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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [newReferee, setNewReferee] = useState({ fullName: '', email: '', phone: '', password: '' });
  const [popup, setPopup] = useState({ isOpen: false, type: 'success', title: '', message1: '' });
  
  const [staffList, setStaffList] = useState([]);
  const [assignForm, setAssignForm] = useState({ raceId: '', refereeUserId: '', panelRole: 'CHIEF' });

  const [showReassignModal, setShowReassignModal] = useState(false);
  const [reassignForm, setReassignForm] = useState({ refAssignmentId: '', newRefereeUserId: '', panelRole: 'CHIEF' });

  const [stats, setStats] = useState({
    totalScheduledRaces: 0,
    assignedReferees: 0,
    unassignedRaces: 0,
    availableReferees: 0
  });
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const dashboardData = await getStaffingDashboard();
      if (dashboardData) {
        setStats(prev => ({ ...prev, ...dashboardData }));
      }

      const assignmentsData = await getRaceAssignments({ size: 50 });
      if (Array.isArray(assignmentsData)) {
        setAssignments(assignmentsData);
      } else if (assignmentsData?.content) {
        setAssignments(assignmentsData.content);
      }
    } catch (err) {
      console.error("Failed to fetch staffing data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleOpenAssignModal = async (raceId) => {
    setAssignForm({ raceId, refereeUserId: '', panelRole: 'CHIEF' });
    setShowAssignModal(true);
    try {
      const staffs = await getStaffList({ size: 100, status: 'ACTIVE' });
      if (staffs) setStaffList(staffs);
    } catch (err) {
      console.error("Failed to load staff list", err);
    }
  };

  const handleOpenReassignModal = async (row) => {
    setReassignForm({ refAssignmentId: row.refAssignmentId, newRefereeUserId: row.refereeUserId || '', panelRole: row.panelRole || 'CHIEF' });
    setShowReassignModal(true);
    try {
      const staffs = await getStaffList({ size: 100, status: 'ACTIVE' });
      if (staffs) setStaffList(staffs);
    } catch (err) {
      console.error("Failed to load staff list", err);
    }
  };

  const submitAssignReferee = async () => {
    if (!assignForm.refereeUserId) {
      setPopup({ isOpen: true, type: 'error', title: 'Error', message1: 'Please select a referee.' });
      return;
    }
    try {
      await assignReferee(assignForm);
      setShowAssignModal(false);
      setPopup({ isOpen: true, type: 'success', title: 'Success', message1: 'Referee assigned successfully!' });
      refreshData();
    } catch (err) {
      setPopup({ isOpen: true, type: 'error', title: 'Error', message1: err.response?.data?.message || err.message });
    }
  };

  const submitReassignReferee = async () => {
    if (!reassignForm.newRefereeUserId) {
      setPopup({ isOpen: true, type: 'error', title: 'Error', message1: 'Please select a new referee.' });
      return;
    }
    try {
      await reassignReferee(reassignForm.refAssignmentId, {
        newRefereeUserId: reassignForm.newRefereeUserId,
        panelRole: reassignForm.panelRole
      });
      setShowReassignModal(false);
      setPopup({ isOpen: true, type: 'success', title: 'Success', message1: 'Referee reassigned successfully!' });
      refreshData();
    } catch (err) {
      setPopup({ isOpen: true, type: 'error', title: 'Error', message1: err.response?.data?.message || err.message });
    }
  };

  const handleRemoveAssignment = async (refAssignmentId) => {
    if (!window.confirm("Are you sure you want to remove this referee assignment?")) return;
    try {
      await removeAssignment(refAssignmentId);
      setPopup({ isOpen: true, type: 'success', title: 'Success', message1: 'Referee assignment removed.' });
      refreshData();
    } catch (err) {
      setPopup({ isOpen: true, type: 'error', title: 'Error', message1: err.response?.data?.message || err.message });
    }
  };

  const handleNewReferee = () => {
    setNewReferee({ fullName: '', email: '', phone: '', password: '' });
    setShowCreateModal(true);
  };

  const submitNewReferee = async () => {
    if (!newReferee.fullName || !newReferee.email || !newReferee.password) {
      setPopup({ isOpen: true, type: 'error', title: 'Error', message1: 'Full name, email, and password are required.' });
      return;
    }
    try {
      await createStaff(newReferee);
      setShowCreateModal(false);
      setPopup({ isOpen: true, type: 'success', title: 'Success!', message1: 'New referee created successfully.' });
      refreshData();
    } catch (err) {
      setPopup({ isOpen: true, type: 'error', title: 'Error', message1: err.response?.data?.message || err.message });
    }
  };

  useEffect(() => {
    refreshData();
  }, [refreshData]);

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
          <Button icon={UserPlusIcon} style={{ backgroundColor: '#022c22', color: '#fff' }} onClick={handleNewReferee}>
            New Referee
          </Button>
        }
      />

      <div className={styles.statsGrid}>
        <StatCard
          title="TOTAL SCHEDULED RACES"
          icon={CalendarIcon}
          value={(stats.totalScheduledRaces || 0).toString()}
          growth="+8% from last month"
        />
        
        <StatCard
          title="ASSIGNED REFEREES"
          icon={CheckSquareIcon}
          customContent={
            <>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}>{stats.assignedReferees || 0}</div>
              <div className={styles.progressBarContainer}>
                <div className={styles.progressBarTrack}>
                  <div className={styles.progressBarFill} style={{ width: stats.totalScheduledRaces > 0 ? `${((stats.assignedReferees || 0) / stats.totalScheduledRaces) * 100}%` : '0%' }}></div>
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
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}>{stats.unassignedRaces || 0}</div>
              {stats.unassignedRaces > 0 ? (
                <div className={styles.actionWarning}>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#ef4444' }}>!</span> Action required immediately
                </div>
              ) : (
                <div style={{ color: '#10b981', fontSize: '14px' }}>All caught up!</div>
              )}
            </>
          }
        />

        <StatCard
          title="AVAILABLE REFEREES"
          icon={UserPlusIcon}
          customContent={
            <>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}>{stats.availableReferees || 0}</div>
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
          totalItems={stats.totalScheduledRaces}
          renderRow={(row) => {
            const startDate = new Date(row.scheduledStartAt);
            const dateStr = startDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            const timeStr = startDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });
            
            return (
            <tr key={row.raceId} className={styles.tableRow}>
              <td className={styles.td}>
                <div className={styles.raceCell}>
                  <div className={styles.raceIconWrapper}>
                    <LayoutIcon />
                  </div>
                  <div>
                    <div className={styles.raceName}>{row.raceName}</div>
                    <div className={styles.raceId}>ID: {row.raceCode || row.raceId?.split('-')[0] || "N/A"}</div>
                  </div>
                </div>
              </td>
              <td className={styles.td}>
                <div className={styles.dateCell}>{dateStr}</div>
                <div className={styles.timeCell}>{timeStr}</div>
              </td>
              <td className={styles.td}>
                {row.refereeName ? (
                  <div className={styles.refereeCell}>
                    <img src={row.refereeAvatarUrl || "https://i.pravatar.cc/150"} alt="Avatar" className={styles.refereeAvatar} />
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
                  {row.assignmentStatus || "UNASSIGNED"}
                </Badge>
              </td>
              <td className={styles.td}>
                {row.assignmentStatus === "ASSIGNED" ? (
                  <div className={styles.actionsCell}>
                    <Button variant="outline" size="sm" onClick={() => handleOpenReassignModal(row)}>Reassign</Button>
                    <Button variant="outline" size="sm" style={{ color: '#ef4444', borderColor: '#ef4444' }} onClick={() => handleRemoveAssignment(row.refAssignmentId)}>Remove</Button>
                  </div>
                ) : (
                  <Button 
                    size="sm" 
                    style={{ backgroundColor: '#022c22', color: 'white' }}
                    onClick={() => handleOpenAssignModal(row.raceId)}
                  >
                    Assign
                  </Button>
                )}
              </td>
            </tr>
          )}}
        />
      </Card>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', color: '#64748b', fontSize: '14px' }}>
        <div>Showing <strong>1</strong> to <strong>10</strong> of <strong>{stats.totalScheduledRaces || 0}</strong> races</div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Button variant="outline" disabled style={{ padding: '6px 12px' }}>&lt; Previous</Button>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <span style={{ backgroundColor: '#022c22', color: 'white', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', fontWeight: 'bold' }}>1</span>
          </div>
          <Button variant="outline" disabled style={{ padding: '6px 12px' }}>Next &gt;</Button>
        </div>
      </div>

      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '32px', width: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', color: '#0f172a' }}>Create New Referee</h2>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Full Name *</label>
              <input type="text" value={newReferee.fullName} onChange={e => setNewReferee({...newReferee, fullName: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} />
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Email Address *</label>
              <input type="email" value={newReferee.email} onChange={e => setNewReferee({...newReferee, email: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} />
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Phone Number</label>
              <input type="tel" value={newReferee.phone} onChange={e => setNewReferee({...newReferee, phone: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Password *</label>
              <input type="password" value={newReferee.password} onChange={e => setNewReferee({...newReferee, password: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} placeholder="Min 8 characters" />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
              <Button style={{ backgroundColor: '#022c22', color: 'white' }} onClick={submitNewReferee}>Create Referee</Button>
            </div>
          </div>
        </div>
      )}

      {showAssignModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '32px', width: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', color: '#0f172a' }}>Assign Referee</h2>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Select Referee *</label>
              <select 
                value={assignForm.refereeUserId} 
                onChange={e => setAssignForm({...assignForm, refereeUserId: e.target.value})} 
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: 'white' }}
              >
                <option value="">-- Choose a referee --</option>
                {staffList.map(staff => (
                  <option key={staff.userId} value={staff.userId}>{staff.fullName} ({staff.userCode})</option>
                ))}
              </select>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Panel Role</label>
              <select 
                value={assignForm.panelRole} 
                onChange={e => setAssignForm({...assignForm, panelRole: e.target.value})} 
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: 'white' }}
              >
                <option value="CHIEF">Chief Referee</option>
                <option value="JUDGE">Judge</option>
                <option value="STEWARD">Steward</option>
                <option value="TIMEKEEPER">Timekeeper</option>
                <option value="OBSERVER">Observer</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <Button variant="outline" onClick={() => setShowAssignModal(false)}>Cancel</Button>
              <Button style={{ backgroundColor: '#022c22', color: 'white' }} onClick={submitAssignReferee}>Confirm Assignment</Button>
            </div>
          </div>
        </div>
      )}

      {showReassignModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '32px', width: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', color: '#0f172a' }}>Reassign Referee</h2>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Select New Referee *</label>
              <select 
                value={reassignForm.newRefereeUserId} 
                onChange={e => setReassignForm({...reassignForm, newRefereeUserId: e.target.value})} 
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: 'white' }}
              >
                <option value="">-- Choose a referee --</option>
                {staffList.map(staff => (
                  <option key={staff.userId} value={staff.userId}>{staff.fullName} ({staff.userCode})</option>
                ))}
              </select>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Panel Role</label>
              <select 
                value={reassignForm.panelRole} 
                onChange={e => setReassignForm({...reassignForm, panelRole: e.target.value})} 
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: 'white' }}
              >
                <option value="CHIEF">Chief Referee</option>
                <option value="JUDGE">Judge</option>
                <option value="STEWARD">Steward</option>
                <option value="TIMEKEEPER">Timekeeper</option>
                <option value="OBSERVER">Observer</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <Button variant="outline" onClick={() => setShowReassignModal(false)}>Cancel</Button>
              <Button style={{ backgroundColor: '#022c22', color: 'white' }} onClick={submitReassignReferee}>Confirm Reassignment</Button>
            </div>
          </div>
        </div>
      )}

      {popup.isOpen && (
        <PopupModal
          type={popup.type}
          title={popup.title}
          message1={popup.message1}
          buttonText="OK"
          onButtonClick={() => setPopup({ ...popup, isOpen: false })}
        />
      )}
    </>
  );
}
