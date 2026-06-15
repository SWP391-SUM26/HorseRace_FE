import React from 'react';
import styles from './PopupModal.module.css';

export default function PopupModal({ type, title, message1, message2, message3, buttonText, onButtonClick }) {
  const isSuccess = type === 'success';

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.iconContainer}>
          {isSuccess ? (
            <svg className={styles.iconSuccess} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 12l3 3 5-6" />
            </svg>
          ) : (
            <svg className={styles.iconError} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="8" y1="9" x2="8.01" y2="9" strokeWidth="3" />
              <line x1="16" y1="9" x2="16.01" y2="9" strokeWidth="3" />
              <path d="M8 16c1.5-2 6.5-2 8 0" />
            </svg>
          )}
        </div>
        <h2 className={isSuccess ? styles.titleSuccess : styles.titleError}>{title}</h2>
        <div className={styles.messageContainer}>
          {message1 && <p className={styles.message1}>{message1}</p>}
          {message2 && <p className={styles.message2}>{message2}</p>}
          {message3 && <p className={styles.message3}>{message3}</p>}
        </div>
        <button 
          className={isSuccess ? styles.btnSuccess : styles.btnError}
          onClick={onButtonClick}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}
