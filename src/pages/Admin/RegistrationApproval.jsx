import { useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import StatCard, { Card } from '../../components/ui/StatCard';
import {
  CheckSquareIcon,
  ClipboardIcon,
  RefereeIcon,
} from '../../components/ui/Icons';
import styles from './RegistrationApproval.module.css';

export default function RegistrationApproval() {
  return (
    <>
      <PageHeader
        title="Registration Approval"
        action={
          <Button variant="primary">Confirm Results</Button>
        }
      />

      <div className={styles.statsGrid}>
        <StatCard title="PENDING APPROVALS" icon={ClipboardIcon} value="24" />
        <StatCard title="APPROVED TODAY" icon={CheckSquareIcon} value="158" />
        <StatCard title="REJECTED TODAY" icon={RefereeIcon} value="09" />
      </div>

      <div className={styles.queueLayout}>
        {/* Left Queue Panel */}
        <div>
          <div className={styles.queueHeader}>
            <span>Queue (24)</span>
            <div style={{display: 'flex', gap: '8px'}}>
              <span style={{cursor: 'pointer'}}>↧</span>
              <span style={{cursor: 'pointer'}}>▤</span>
            </div>
          </div>

          <div className={styles.queueList}>
            {/* Active Card */}
            <div className={`${styles.queueCard} ${styles.queueCardActive}`}>
              <div className={styles.queueCardTop}>
                <h3 className={styles.queueName}>Jonathan Sterling</h3>
                <span className={styles.badgeUrgent}>Urgent</span>
              </div>
              <div className={styles.queueRole}>Owner • Register ID: #8832</div>
              <div className={styles.queueActions}>
                <button className={styles.btnQReject}>Reject</button>
                <button className={styles.btnQApprove}>Approve</button>
              </div>
            </div>

            {/* Other Cards */}
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
  );
}
