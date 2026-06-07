import React from 'react';
import styles from './Badge.module.css';

export default function Badge({ variant = 'ghost', children, className = '' }) {
  const variantClass = styles[`badge_${variant.toLowerCase()}`] || styles.badge_ghost;
  return (
    <span className={`${styles.badge} ${variantClass} ${className}`}>
      {children}
    </span>
  );
}
