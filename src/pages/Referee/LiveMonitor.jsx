import React, { useState } from 'react';
import styles from './LiveMonitor.module.css';

export default function LiveMonitor() {
  const [logs] = useState([
    {
      id: 1,
      time: "13:42:05",
      turn: "Turn 1",
      desc: "Possible interference. Horse #4 shifted path significantly.",
      flagged: true,
      review: true
    },
    {
      id: 2,
      time: "13:41:10",
      turn: "Start",
      desc: "Clean break. All horses away.",
      flagged: false,
      review: false
    }
  ]);

  const horses = [
    { num: 4, color: "#16a34a", progress: 92 },
    { num: 9, color: "#0ea5e9", progress: 85 },
    { num: 2, color: "#94a3b8", progress: 60 }
  ];

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.headerTitle}>Race 4: Golden Slipper Stakes</h1>
          <p className={styles.headerSub}>Turf • 1200m • Dist: Good</p>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.liveBadge}>LIVE</span>
          <span className={styles.timer}>01:14.22</span>
        </div>
      </div>

      <div className={styles.mainLayout}>
        {/* Video Area */}
        <div className={styles.videoArea}>
          <div className={styles.videoWrapper}>
            <img 
              src="https://images.unsplash.com/photo-1598449356475-b9f71db7d847?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
              alt="Live Race" 
              className={styles.videoImage}
            />
            
            <div className={styles.camControls}>
              <button className={`${styles.camBtn} ${styles.active}`}>CAM 1: WIDE</button>
              <button className={styles.camBtn}>PAN: 14°</button>
            </div>

            <div className={styles.metricsOverlay}>
              <div className={styles.metricItem}>
                <span className={styles.metricLabel}>Current Speed</span>
                <div><span className={styles.metricValue}>64.2</span><span className={styles.metricUnit}>km/h</span></div>
              </div>
              <div className={styles.metricItem}>
                <span className={styles.metricLabel}>Wind</span>
                <div><span className={styles.metricValue}>12</span><span className={styles.metricUnit}>km/h E</span></div>
              </div>
            </div>
          </div>

          <div className={styles.runningOrder}>
            <div className={styles.runningOrderHeader}>
              <span>Live Running Order</span>
              <span className={styles.distanceLeft}>300m to go</span>
            </div>
            <div className={styles.trackVisual}>
              {horses.map((h, idx) => (
                <div 
                  key={idx} 
                  className={styles.horseDot} 
                  style={{ left: `${h.progress}%`, backgroundColor: h.color, zIndex: h.progress }}
                >
                  {h.num}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Sidebar */}
        <div className={styles.actionSidebar}>
          <button className={styles.recordBtn}>
            ⚠️ Record Violation
          </button>

          <div className={styles.actionLog}>
            <div className={styles.logHeader}>
              <span className="icon">≡</span> Quick Action Log
            </div>
            <div className={styles.logList}>
              {logs.map(log => (
                <div key={log.id} className={`${styles.logItem} ${log.flagged ? styles.flagged : ''}`}>
                  <div className={styles.logItemTop}>
                    <span className={styles.logTime}>{log.time}</span>
                    <span className={styles.logTurn}>{log.turn}</span>
                  </div>
                  <div className={styles.logDesc}>{log.desc}</div>
                  {log.review && <span className={styles.reviewBadge}>Review Flagged</span>}
                </div>
              ))}
            </div>
          </div>

          <div className={styles.quickButtons}>
            <button className={styles.quickBtn}>Bumping</button>
            <button className={styles.quickBtn}>Interference</button>
            <button className={styles.quickBtn}>Whip Usage</button>
          </div>
        </div>
      </div>
    </div>
  );
}
