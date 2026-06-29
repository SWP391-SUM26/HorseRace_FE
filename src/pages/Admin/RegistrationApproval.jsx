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
import { getRegistrations, approveRegistration, rejectRegistration } from '../../services/registration';
import { getHorseDetail, getHorseMedicalStatus } from '../../services/horse';

export default function RegistrationApproval() {
  const [registrations, setRegistrations] = useState([]);
  const [selectedReg, setSelectedReg] = useState(null);
  const [horseDetail, setHorseDetail] = useState(null);
  const [medicalStatus, setMedicalStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState({ pending: 0, approvedToday: 0, rejectedToday: 0 });

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const response = await getRegistrations({ status: 'SUBMITTED' });
      setRegistrations(response.items || []);
      setStats(prev => ({ ...prev, pending: response.totalItems || response.items?.length || 0 }));
      if (response.items && response.items.length > 0 && !selectedReg) {
        handleSelectReg(response.items[0]);
      } else if (!response.items || response.items.length === 0) {
        setSelectedReg(null);
      }
    } catch (err) {
      console.error('Failed to fetch pending registrations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleSelectReg = async (reg) => {
    setSelectedReg(reg);
    setHorseDetail(null);
    setMedicalStatus(null);
    try {
      const horseId = reg.horse?.id || reg.horseId;
      if (horseId) {
        const [horse, medical] = await Promise.all([
          getHorseDetail(horseId).catch(() => null),
          getHorseMedicalStatus(horseId).catch(() => null)
        ]);
        setHorseDetail(horse);
        setMedicalStatus(medical);
      }
    } catch (err) {
      console.error("Failed to load horse details", err);
    }
  };

  const handleApprove = async () => {
    if (!selectedReg) return;
    setSubmitting(true);
    try {
      await approveRegistration(selectedReg.registrationId || selectedReg.id);
      setStats(prev => ({ ...prev, approvedToday: prev.approvedToday + 1 }));
      setSelectedReg(null);
      await fetchRegistrations();
    } catch (err) {
      console.error('Approval failed', err);
      alert('Failed to approve registration. See console for details.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedReg) return;
    const reason = window.prompt("Please enter rejection reason:");
    if (!reason) return;

    setSubmitting(true);
    try {
      await rejectRegistration(selectedReg.registrationId || selectedReg.id, reason);
      setStats(prev => ({ ...prev, rejectedToday: prev.rejectedToday + 1 }));
      setSelectedReg(null);
      await fetchRegistrations();
    } catch (err) {
      console.error('Rejection failed', err);
      alert('Failed to reject registration. See console for details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Tournament Approval"
        action={
          <Button variant="primary" onClick={fetchRegistrations}>Refresh Queue</Button>
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
            {loading && <div style={{padding: '16px'}}>Loading registrations...</div>}
            {!loading && registrations.length === 0 && (
              <div style={{padding: '16px', color: '#64748b'}}>No pending approvals.</div>
            )}
            
            {!loading && registrations.map((reg) => {
              const isActive = selectedReg && (selectedReg.registrationId === reg.registrationId || selectedReg.id === reg.id);
              return (
                <div 
                  key={reg.registrationId || reg.id} 
                  className={`${styles.queueCard} ${isActive ? styles.queueCardActive : ''}`}
                  onClick={() => handleSelectReg(reg)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={styles.queueCardTop}>
                    <h3 className={styles.queueName}>{reg.horse?.name || 'Unknown Horse'}</h3>
                    <span className={styles.badgeNew}>{reg.status}</span>
                  </div>
                  <div className={styles.queueRole}>
                    {reg.tournament?.name || 'Unknown Tournament'} • Owner: {reg.owner?.name || 'Unknown'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Details Panel */}
        <Card style={{padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column'}}>
          {!selectedReg ? (
            <div style={{padding: '40px', textAlign: 'center', color: '#64748b'}}>
              Select an entry from the queue to view details.
            </div>
          ) : (
            <>
              <div className={styles.userProfile}>
                <div className={styles.profileInfo}>
                  <img src={horseDetail?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedReg.horse?.name || 'Horse')}&background=0D8ABC&color=fff`} alt={selectedReg.horse?.name || 'Horse'} className={styles.profileAvatar} />
                  <div>
                    <h2 className={styles.profileName}>{selectedReg.horse?.name || 'Unknown Horse'}</h2>
                    <p className={styles.profileMeta}>Owner: {selectedReg.owner?.name || 'Unknown'}</p>
                    <div className={styles.profileTags}>
                      <span className={styles.tagBlue}>Tournament: {selectedReg.tournament?.name || 'N/A'}</span>
                      <span className={styles.tagBlue}>Race: {selectedReg.race?.name || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.detailsGrid}>
                {/* Left Col */}
                <div>
                  <h3 className={styles.sectionTitle}>🐎 Horse Details</h3>
                  <div className={styles.infoBox} style={{marginBottom: '24px'}}>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Horse Name</span>
                      <span className={styles.infoVal}>{selectedReg.horse?.name || 'N/A'}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Horse Code</span>
                      <span className={styles.infoVal}>{selectedReg.horse?.code || horseDetail?.horseCode || 'N/A'}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Breed</span>
                      <span className={styles.infoVal}>{horseDetail?.breed || 'N/A'}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Color</span>
                      <span className={styles.infoVal}>{horseDetail?.color || 'N/A'}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Age</span>
                      <span className={styles.infoVal}>{horseDetail?.age || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Right Col */}
                <div>
                  <div className={styles.checklistPanel}>
                    <h3 className={styles.sectionTitle}>Medical & Eligibility Checklist</h3>
                    <p style={{fontSize: '13px', color: '#64748b', marginBottom: '16px'}}>System auto-checks for race eligibility.</p>
                    
                    <div className={styles.checklistItem}>
                      <div className={styles.checkInfo}>
                        <div className={styles.checkIcon} style={{ background: medicalStatus?.healthStatus === 'HEALTHY' ? '#dcfce7' : '#fee2e2', color: medicalStatus?.healthStatus === 'HEALTHY' ? '#16a34a' : '#ef4444' }}>
                          {medicalStatus?.healthStatus === 'HEALTHY' ? '✓' : '⚠'}
                        </div>
                        <div>
                          <h4 className={styles.checkName}>Overall Health</h4>
                          <p className={styles.checkMeta}>{medicalStatus?.healthStatus || 'Pending Check'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className={styles.checklistItem}>
                      <div className={styles.checkInfo}>
                        <div className={styles.checkIcon} style={{ background: medicalStatus?.vaccinationsUpToDate ? '#dcfce7' : '#fee2e2', color: medicalStatus?.vaccinationsUpToDate ? '#16a34a' : '#ef4444' }}>
                          {medicalStatus?.vaccinationsUpToDate ? '✓' : '⚠'}
                        </div>
                        <div>
                          <h4 className={styles.checkName}>Vaccinations</h4>
                          <p className={styles.checkMeta}>{medicalStatus?.vaccinationsUpToDate ? 'Up To Date' : 'Missing or Expired'}</p>
                        </div>
                      </div>
                    </div>

                    <div className={styles.checklistItem}>
                      <div className={styles.checkInfo}>
                        <div className={styles.checkIcon} style={{ background: (medicalStatus?.recoveryPercent || 0) >= 90 ? '#dcfce7' : '#fef3c7', color: (medicalStatus?.recoveryPercent || 0) >= 90 ? '#16a34a' : '#d97706' }}>
                          {((medicalStatus?.recoveryPercent || 0) >= 90) ? '✓' : 'ℹ'}
                        </div>
                        <div>
                          <h4 className={styles.checkName}>Recovery Rate</h4>
                          <p className={styles.checkMeta}>{medicalStatus?.recoveryPercent || 0}% Ready</p>
                        </div>
                      </div>
                    </div>
                    
                  </div>
                </div>
              </div>

              <div style={{flexGrow: 1}}></div>

              <div className={styles.bottomBar}>
                <button className={`${styles.actionBtn} ${styles.btnRejectLg}`} onClick={handleReject} disabled={submitting}>
                  {submitting ? 'PROCESSING...' : 'REJECT REGISTRATION'}
                </button>
                <button className={`${styles.actionBtn} ${styles.btnApproveLg}`} onClick={handleApprove} disabled={submitting}>
                  {submitting ? 'PROCESSING...' : 'APPROVE FOR TOURNAMENT'}
                </button>
              </div>
            </>
          )}
        </Card>
      </div>
    </>
  );
}
