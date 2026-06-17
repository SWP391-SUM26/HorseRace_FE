import React, { useState } from 'react';
import styles from './RefereeDashboard.module.css';

export default function RefereeDashboard() {
  const [stats] = useState([
    { id: 1, label: "Upcoming Inspections", value: "12", sub: "NEXT 2H", urgent: false },
    { id: 2, label: "Pending Violations", value: "04", sub: "URGENT", urgent: true },
    { id: 3, label: "Races to Certify", value: "08", sub: "TODAY", urgent: false },
    { id: 4, label: "Recent Reports", value: "21", sub: "NEW", urgent: false }
  ]);

  const [alerts] = useState([
    {
      id: 1,
      type: "Interference Inquiry",
      time: "2m ago",
      desc: "Race 7: Possible interference at the final turn between #4 and #9.",
      status: "urgent",
      actions: [{ label: "REVIEW FILM", primary: true }, { label: "DISMISS", primary: false }]
    },
    {
      id: 2,
      type: "Weight Verification",
      time: "15m ago",
      desc: "Jockey R. Miller pending post-race scale certification.",
      status: "warning",
      actions: [{ label: "CERTIFY", primary: true, dark: true }]
    },
    {
      id: 3,
      type: "Schedule Update",
      time: "1h ago",
      desc: "Race 9 delayed by 10 minutes due to track maintenance.",
      status: "info",
      actions: []
    }
  ]);

  const [rosters] = useState([
    {
      id: 1,
      horse: "Velvet Shadow",
      owner: "Belmont Stables",
      time: "14:30 EST",
      type: "Pre-Race Vet Check",
      status: "READY"
    },
    {
      id: 2,
      horse: "King's Gambit",
      owner: "Empire Racing",
      time: "15:00 EST",
      type: "Doping Control",
      status: "WAITING"
    }
  ]);

  return (
    <div className={styles.container}>
      {/* Stats */}
      <div className={styles.statsGrid}>
        {stats.map(s => (
          <div key={s.id} className={styles.statCard}>
            <div className={styles.statHeader}>
              <span>{s.sub}</span>
              <span className={styles.statIcon}>{s.urgent ? '⚠️' : s.id === 1 ? '📅' : s.id === 3 ? '✅' : '📄'}</span>
            </div>
            <div>
              <div className={`${styles.statValue} ${s.urgent ? styles.statValueUrgent : ''}`}>{s.value}</div>
              <div className={styles.statLabel}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className={styles.mainGrid}>
        {/* Left: Video */}
        <div className={styles.videoSection}>
          <div className={styles.videoHeader}>
            <div className={styles.liveIndicator}>
              <span className={styles.redDot}></span>
              LIVE TRACK STATUS: CHURCHILL DOWNS
            </div>
            <div className={styles.videoControls}>
              <span>📹</span>
              <span>⛶</span>
            </div>
          </div>
          <div className={styles.videoContainer}>
            <img 
              src="https://images.unsplash.com/photo-1598449356475-b9f71db7d847?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
              alt="Track" 
              className={styles.videoImage} 
            />
            <div className={styles.videoOverlay}>
              <span className={styles.redDot}></span>
              POS 1: MIDNIGHT RUN
            </div>
          </div>
          <div className={styles.videoActions}>
            <button className={styles.btnPrimary}>
              <span className={styles.btnIcon}>🩺</span>
              Start New Inspection
            </button>
            <button className={styles.btnOutline}>
              <span className={styles.btnIcon}>📋</span>
              Record Result
            </button>
          </div>
        </div>

        {/* Right: Alerts */}
        <div className={styles.alertsSection}>
          <div className={styles.alertsHeader}>
            <span className={styles.alertsTitle}>STEWARD ALERTS</span>
            <span className={styles.alertsBadge}>3 ACTIVE</span>
          </div>
          <ul className={styles.alertsList}>
            {alerts.map(a => (
              <li key={a.id} className={`${styles.alertItem} ${styles[a.status]}`}>
                <div className={styles.alertTop}>
                  <span className={styles.alertType}>{a.type}</span>
                  <span className={styles.alertTime}>{a.time}</span>
                </div>
                <div className={styles.alertDesc}>{a.desc}</div>
                {a.actions.length > 0 && (
                  <div className={styles.alertActions}>
                    {a.actions.map((act, i) => (
                      <button 
                        key={i} 
                        className={act.primary ? `${styles.btnActionPrimary} ${act.dark ? styles.dark : ''}` : styles.btnActionSecondary}
                      >
                        {act.label}
                      </button>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
          <div className={styles.alertsFooter}>
            <a href="#" className={styles.viewAll}>View Historical Feed</a>
          </div>
        </div>
      </div>

      {/* Roster Table */}
      <div className={styles.rosterSection}>
        <div className={styles.rosterHeader}>
          <div>
            <h3 className={styles.rosterTitle}>Upcoming Inspection Roster</h3>
            <p className={styles.rosterSubtitle}>Mandatory pre-race safety and compliance checks</p>
          </div>
          <a href="#" className={styles.downloadLink}>Download Schedule (PDF)</a>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>HORSE / OWNER</th>
              <th>RACE TIME</th>
              <th>INSPECTION TYPE</th>
              <th>STATUS</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {rosters.map(r => (
              <tr key={r.id}>
                <td>
                  <div className={styles.horseInfo}>
                    <span className={styles.horseName}>{r.horse}</span>
                    <span className={styles.ownerName}>{r.owner}</span>
                  </div>
                </td>
                <td>{r.time}</td>
                <td>{r.type}</td>
                <td>
                  <span className={r.status === 'READY' ? styles.statusReady : styles.statusWaiting}>
                    {r.status === 'READY' ? '● READY' : '● WAITING'}
                  </span>
                </td>
                <td>
                  <span className={styles.actionLink}>Begin Audit</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
