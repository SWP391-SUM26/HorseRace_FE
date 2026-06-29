import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './NotificationsCenter.module.css';

export default function NotificationsCenter() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');

  const tabs = ['All', 'Race', 'System', 'Financial'];

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      unread: true,
      title: "Entry Validation Required: Race #104",
      desc: "A trainer has requested a late scratch for 'Silver Bullet' (Gate 4) due to a veterinary concern. Review required by 14:00.",
      type: "RACE",
      time: "2 mins ago",
      link: "/referee/inspection"
    },
    {
      id: 2,
      unread: false,
      title: "System Update Completed",
      desc: "v2.4.1 maintenance complete. Real-time parity with Ascot data streams is now active. No action needed.",
      type: "SYSTEM",
      time: "1 hour ago",
      link: null
    },
    {
      id: 3,
      unread: true,
      title: "Stake Disbursement Failure",
      desc: "Payout for Owner ID #9901 (Starlight Stables) was returned by the merchant bank. Verification of account details is necessary.",
      type: "FINANCIAL",
      time: "3 hours ago",
      link: null
    },
    {
      id: 4,
      unread: true,
      title: "Steward Inquiry Logged",
      desc: "A formal inquiry has been opened regarding the interference in the final furlong of the Churchill Downs Handicap.",
      type: "RACE",
      time: "5 hours ago",
      link: "/referee/violations"
    },
    {
      id: 5,
      unread: false,
      title: "Race Results Confirmed",
      desc: "Final photo finish confirmed for Meydan Race 3. Winning margin: 0.1 lengths. Official results published.",
      type: "RACE",
      time: "Yesterday",
      link: "/referee/reports"
    }
  ]);

  const filtered = activeTab === 'All' ? notifications : notifications.filter(n => n.type === activeTab.toUpperCase());

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const handleRowClick = (n) => {
    // Mark as read when clicked
    setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, unread: false } : item));
    if (n.link) {
      navigate(n.link);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Notifications Center</h1>
        <div className={styles.headerRight}>
          <button className={styles.markReadBtn} onClick={handleMarkAllRead}>
            <span style={{color: '#16a34a'}}>✓</span> Mark all as read
          </button>
          <button className={styles.settingsBtn}>⚙️</button>
        </div>
      </div>

      <div className={styles.controlsBar}>
        <div className={styles.tabs}>
          {tabs.map(t => (
            <button 
              key={t}
              className={`${styles.tabBtn} ${activeTab === t ? styles.active : ''}`}
              onClick={() => setActiveTab(t)}
            >
              {t}
            </button>
          ))}
        </div>
        <div>
          <input type="text" placeholder="🔍 Search notifications..." className={styles.searchBox} />
        </div>
      </div>

      <div className={styles.listContainer}>
        <div className={styles.listHeader}>
          <div>STATUS</div>
          <div>DETAILS</div>
          <div>TYPE</div>
          <div style={{textAlign: 'right'}}>TIME & ACTIONS</div>
        </div>
        
        <div>
          {filtered.map(n => (
            <div 
              key={n.id} 
              className={`${styles.listItem} ${n.link ? styles.clickable : ''}`}
              onClick={() => handleRowClick(n)}
            >
              <div className={styles.statusCol}>
                {n.unread && <div className={styles.unreadDot}></div>}
              </div>
              <div className={styles.detailsCol}>
                <div className={styles.notifTitle}>{n.title}</div>
                <div className={styles.notifDesc}>{n.desc}</div>
              </div>
              <div>
                <span className={`${styles.typeBadge} ${n.type === 'FINANCIAL' ? styles.financial : ''}`}>
                  {n.type}
                </span>
              </div>
              <div className={styles.timeCol}>
                {n.time}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.pagination}>
          <span>Showing 5 of 124 notifications</span>
          <div className={styles.pageControls}>
            <button className={styles.pageBtn}>Previous</button>
            <button className={styles.pageBtn}>Next</button>
          </div>
        </div>
      </div>

      <div className={styles.footerCards}>
        <div className={styles.card}>
          <div className={`${styles.cardIcon} ${styles.urgent}`}>⚡</div>
          <div>
            <div className={styles.cardLabel}>PENDING ACTIONS</div>
            <div className={styles.cardValue}>12 Urgent</div>
          </div>
        </div>
        <div className={styles.card}>
          <div className={`${styles.cardIcon} ${styles.avg}`}>👁️</div>
          <div>
            <div className={styles.cardLabel}>AVG RESPONSE</div>
            <div className={styles.cardValue}>14.2 min</div>
          </div>
        </div>
        <div className={styles.card}>
          <div className={`${styles.cardIcon} ${styles.security}`}>🛡️</div>
          <div>
            <div className={styles.cardLabel}>SECURITY ALERTS</div>
            <div className={styles.cardValue}>0 Flags</div>
          </div>
        </div>
      </div>
    </div>
  );
}
