import React from 'react';
import styles from './StatCard.module.css';

export function Card({ children, style, className = '' }) {
  return (
    <div className={`${styles.card} ${className}`} style={style}>
      {children}
    </div>
  );
}

export default function StatCard({ title, icon: Icon, value, note, growth, customContent, live }) {
  return (
    <Card>
      <div className={styles.statHeader}>
        <span className={styles.statLabel}>{title}</span>
        {live ? (
          <div className={styles.liveIndicator} />
        ) : (
          Icon && <Icon className={styles.statIcon} />
        )}
      </div>
      
      {customContent ? (
        customContent
      ) : (
        <>
          <div className={styles.statValue}>{value}</div>
          <div>
            {growth && <span className={styles.statGrowth}>{growth}</span>}
            {note && <span className={styles.statNote}>{note}</span>}
          </div>
        </>
      )}
    </Card>
  );
}
