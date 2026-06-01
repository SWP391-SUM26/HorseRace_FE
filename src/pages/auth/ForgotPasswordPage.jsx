import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ForgotPasswordPage.module.css';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSend = (e) => {
    e.preventDefault(); // Chống reload trang khi submit form
    if (!email) return;

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1000);
  };

  return (
    <div className={styles.page}>
      {/* NAVBAR */}
      <header className={styles.navbar}>
        <button className={styles.navBrand} type="button" onClick={() => navigate('/')}>
          Equine Elite
        </button>
        
      </header>

      {/* MAIN CONTENT */}
      <main className={styles.main}>
        <div className={styles.container}>
          {/* LEFT PANEL */}
          <aside className={styles.leftPanel}>
            <div className={styles.leftContent}>
              <div className={styles.brandIconBox}>
                <LockIcon />
              </div>
              <h2 className={styles.leftTitle}>Forgot Password</h2>
              <p className={styles.leftDesc}>
                Enter your registered email to receive a secure reset code.
              </p>

              <ul className={styles.featureList}>
                <li className={styles.featureItem}>
                  <CheckCircleIcon />
                  Direct access to Jockey Market
                </li>
                <li className={styles.featureItem}>
                  <CheckCircleIcon />
                  Real-time Performance Analytics
                </li>
                <li className={styles.featureItem}>
                  <CheckCircleIcon />
                  Global Race Entry Management
                </li>
              </ul>
            </div>

            <p className={styles.leftQuote}>
              "Precision in data, prestige in management."
            </p>
          </aside>

          {/* RIGHT PANEL - FORM */}
          <section className={styles.rightPanel}>
            {!sent ? (
              <>
                <div className={styles.formHeader}>
                  <h1 className={styles.formTitle}>Forgot Password</h1>
                </div>

                <p className={styles.subtitle}>
                  Enter your registered email address to receive a secure reset code.
                </p>

                <form onSubmit={handleSend}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Email Address</label>
                    <input
                      className={styles.input}
                      type="email"
                      placeholder="owner@stable.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  {/* SUBMIT BUTTON */}
                  <button
                    className={styles.submitBtn}
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Sending...' : 'Send Reset Code ▷'}
                  </button>
                </form>

                {/* BACK TO LOGIN LINK */}
                <div className={styles.signinPrompt}>
                  <button 
                    type="button" 
                    className={styles.backBtn} 
                    onClick={() => navigate('/login')}
                  >
                    ← Back to Login
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className={styles.successWrapper}>
                  <div className={styles.successIcon}>📬</div>
                  <h2 className={styles.successTitle}>Check Your Email</h2>
                  <p className={styles.successText}>
                    We've sent a reset code to <strong>{email}</strong>
                  </p>

                  <button
                    className={styles.submitBtn}
                    type="button"
                    onClick={() => navigate('/reset-password')}
                  >
                    Enter Reset Code
                  </button>

                  <button
                    type="button"
                    className={styles.backBtn}
                    style={{ marginTop: '24px' }}
                    onClick={() => navigate('/login')}
                  >
                    ← Back to Login
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      </main>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerLeft}>
            <div className={styles.footerBrand}>Equine Elite</div>
            <p className={styles.footerCopy}>© 2024 Equine Elite Analytics. All rights reserved.</p>
          </div>
          <div className={styles.footerLinks}>
            <button type="button" className={styles.footerLink}>Terms of Service</button>
            <button type="button" className={styles.footerLink}>Privacy Policy</button>
            <button type="button" className={styles.footerLink}>Help Center</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* SVG ICON COMPONENTS */
function CheckCircleIcon() {
  return (
    <svg className="check-circle-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}