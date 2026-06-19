import { useState, useEffect } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import StatCard, { Card } from '../../components/ui/StatCard';
import {
  CheckSquareIcon,
  ClipboardIcon,
  RefereeIcon,
} from '../../components/ui/Icons';
import styles from './RegistrationApproval.module.css';
import { getPendingUsers, approveUserKyc, rejectUserKyc } from '../../services/adminApproval';

export default function RegistrationApproval() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState({ pending: 0, approvedToday: 0, rejectedToday: 0 });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getPendingUsers({ kycStatus: 'PENDING' });
      setUsers(response.items || []);
      setStats(prev => ({ ...prev, pending: response.totalItems || 0 }));
      if (response.items && response.items.length > 0 && !selectedUser) {
        setSelectedUser(response.items[0]);
      } else if (!response.items || response.items.length === 0) {
        setSelectedUser(null);
      }
    } catch (err) {
      console.error('Failed to fetch pending users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApprove = async () => {
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      await approveUserKyc(selectedUser.userId || selectedUser.id);
      setStats(prev => ({ ...prev, approvedToday: prev.approvedToday + 1 }));
      setSelectedUser(null);
      await fetchUsers();
    } catch (err) {
      console.error('Approval failed', err);
      alert('Failed to approve user. See console for details.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedUser) return;
    const reason = window.prompt("Please enter rejection reason:");
    if (!reason) return;

    setSubmitting(true);
    try {
      await rejectUserKyc(selectedUser.userId || selectedUser.id, { reason });
      setStats(prev => ({ ...prev, rejectedToday: prev.rejectedToday + 1 }));
      setSelectedUser(null);
      await fetchUsers();
    } catch (err) {
      console.error('Rejection failed', err);
      alert('Failed to reject user. See console for details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Registration Approval"
        action={
          <Button variant="primary" onClick={fetchUsers}>Refresh Queue</Button>
        }
      />

      <div className={styles.statsGrid}>
        <StatCard title="PENDING APPROVALS" icon={ClipboardIcon} value={stats.pending.toString().padStart(2, '0')} />
        <StatCard title="APPROVED TODAY" icon={CheckSquareIcon} value={stats.approvedToday.toString().padStart(2, '0')} />
        <StatCard title="REJECTED TODAY" icon={RefereeIcon} value={stats.rejectedToday.toString().padStart(2, '0')} />
      </div>

      <div className={styles.queueLayout}>
        {/* Left Queue Panel */}
        <div>
          <div className={styles.queueHeader}>
            <span>Queue ({stats.pending})</span>
          </div>

          <div className={styles.queueList}>
            {loading && <div style={{padding: '16px'}}>Loading users...</div>}
            {!loading && users.length === 0 && (
              <div style={{padding: '16px', color: '#64748b'}}>No pending approvals.</div>
            )}
            
            {!loading && users.map((user) => {
              const isActive = selectedUser && (selectedUser.userId === user.userId || selectedUser.id === user.id);
              return (
                <div 
                  key={user.userId || user.id} 
                  className={`${styles.queueCard} ${isActive ? styles.queueCardActive : ''}`}
                  onClick={() => setSelectedUser(user)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={styles.queueCardTop}>
                    <h3 className={styles.queueName}>{user.fullName || 'Unknown User'}</h3>
                    <span className={styles.badgeNew}>New</span>
                  </div>
                  <div className={styles.queueRole}>{user.roleName || user.roleCode || 'User'} • Register ID: #{user.userCode || 'N/A'}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Details Panel */}
        <Card style={{padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column'}}>
          {!selectedUser ? (
            <div style={{padding: '40px', textAlign: 'center', color: '#64748b'}}>
              Select a user from the queue to view details.
            </div>
          ) : (
            <>
              <div className={styles.userProfile}>
                <div className={styles.profileInfo}>
                  <img src={selectedUser.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.fullName || 'User')}`} alt={selectedUser.fullName || 'User'} className={styles.profileAvatar} />
                  <div>
                    <h2 className={styles.profileName}>{selectedUser.fullName || 'Unknown User'}</h2>
                    <p className={styles.profileMeta}>{selectedUser.email}</p>
                    <div className={styles.profileTags}>
                      <span className={styles.tagBlue}>{selectedUser.roleName || selectedUser.roleCode || 'User'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.detailsGrid}>
                {/* Left Col */}
                <div>
                  <h3 className={styles.sectionTitle}>👤 Identity Details</h3>
                  <div className={styles.infoBox} style={{marginBottom: '24px'}}>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Full Name</span>
                      <span className={styles.infoVal}>{selectedUser.fullName || 'N/A'}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>User Code</span>
                      <span className={styles.infoVal}>{selectedUser.userCode || 'N/A'}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Contact</span>
                      <span className={styles.infoVal}>{selectedUser.phone || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                {/* Right Col */}
                <div>
                  <div className={styles.checklistPanel}>
                    <h3 className={styles.sectionTitle}>Eligibility Checklist</h3>
                    <p style={{fontSize: '13px', color: '#64748b', marginBottom: '16px'}}>Please verify external documents before approval.</p>
                    
                    <div className={styles.checklistItem}>
                      <div className={styles.checkInfo}>
                        <div className={styles.checkIcon}>?</div>
                        <div>
                          <h4 className={styles.checkName}>ID Verification</h4>
                          <p className={styles.checkMeta}>Pending Manual Check</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{flexGrow: 1}}></div>

              <div className={styles.bottomBar}>
                <button className={`${styles.actionBtn} ${styles.btnRejectLg}`} onClick={handleReject} disabled={submitting}>
                  {submitting ? 'PROCESSING...' : 'REJECT APPLICANT'}
                </button>
                <button className={`${styles.actionBtn} ${styles.btnApproveLg}`} onClick={handleApprove} disabled={submitting}>
                  {submitting ? 'PROCESSING...' : 'APPROVE & ONBOARD'}
                </button>
              </div>
            </>
          )}
        </Card>
      </div>
    </>
  );
}
