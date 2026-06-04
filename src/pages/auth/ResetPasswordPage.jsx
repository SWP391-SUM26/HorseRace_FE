import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ResetPasswordPage.module.css';

export default function ResetPasswordPage() {
  const navigate = useNavigate();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 1. Tạo State quản lý ẩn/hiện cho từng ô mật khẩu
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const refs = useRef([]);

  const handleOtp = (val, idx) => {
    if (val && !/^[0-9]$/.test(val.slice(-1))) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 5) refs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      const next = [...otp];
      next[idx - 1] = '';
      setOtp(next);
      refs.current[idx - 1]?.focus();
    }
  };

  const strength = newPass.length === 0 ? 0 : newPass.length < 6 ? 1 : newPass.length < 10 ? 2 : 3;
  const LABELS = ['', 'Weak', 'Good', 'Strong'];

  const handleReset = (e) => {
    e.preventDefault();
    const email = sessionStorage.getItem('reset_password_email');
    if (!email) {
      alert("Session expired or invalid email. Please start over from Forgot Password page.");
      navigate('/forgot-password');
      return;
    }

    if (!newPass || newPass !== confirm) {
      alert("Passwords do not match or are empty.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      // Load and update password in localStorage mock DB
      const raw = localStorage.getItem("equine_elite_mock_users");
      let users = raw ? JSON.parse(raw) : [];
      
      let userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
      if (userIndex !== -1) {
        users[userIndex].password = newPass;
        localStorage.setItem("equine_elite_mock_users", JSON.stringify(users));
        
        // Also update equine_elite_edited_users to sync profile details if edited before
        const editedRaw = localStorage.getItem("equine_elite_edited_users");
        if (editedRaw) {
          try {
            const edited = JSON.parse(editedRaw);
            const targetId = users[userIndex].id;
            if (edited[targetId]) {
              edited[targetId].password = newPass;
              localStorage.setItem("equine_elite_edited_users", JSON.stringify(edited));
            }
          } catch (err) {}
        }
      }

      setLoading(false);
      alert("Password has been reset successfully! You can now log in.");
      sessionStorage.removeItem('reset_password_email');
      navigate('/login');
    }, 900);
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
              <h2 className={styles.leftTitle}>Secure Your Access</h2>
              <p className={styles.leftDesc}>
                Protecting sensitive performance data and stable financials requires robust security protocols.
              </p>
            </div>
          </aside>

          {/* RIGHT PANEL - FORM */}
          <section className={styles.rightPanel}>
            <div className={styles.formHeader}>
              <h1 className={styles.formTitle}>Reset Password</h1>
            </div>

            <form onSubmit={handleReset}>
              {/* OTP SECTION */}
              <div className={styles.otpSection}>
                <div className={styles.otpHeader}>
                  <span className={styles.otpLabel}>VERIFICATION CODE</span>
                </div>
                <div className={styles.otpRow}>
                  {otp.map((d, i) => (
                    <input
                      key={i}
                      ref={el => (refs.current[i] = el)}
                      className={styles.otpInput}
                      value={d}
                      onChange={e => handleOtp(e.target.value, i)}
                      onKeyDown={e => handleKeyDown(e, i)}
                      maxLength={1}
                      type="text" 
                      placeholder="·"
                    />
                  ))}
                </div>
              </div>

              {/* FORM FIELDS */}
              <div className={styles.fields}>
                
                {/* TRƯỜNG NEW PASSWORD */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>NEW PASSWORD</label>
                  <div className={styles.inputContainer}>
                    <span className={styles.inputIcon}>🔒</span>
                    <input
                      className={styles.inputWithIcon}
                      // 2. Thay đổi type động dựa trên State showNewPass
                      type={showNewPass ? 'text' : 'password'}
                      placeholder="Enter new password"
                      value={newPass}
                      onChange={e => setNewPass(e.target.value)}
                      required
                    />
                    {/* 3. Nút bấm Icon Con Mắt thay đổi giao diện tương ứng */}
                    <button
                      type="button"
                      className={styles.eyeButton}
                      onClick={() => setShowNewPass(!showNewPass)}
                    >
                      {showNewPass ? <EyeIcon /> : <EyeOffIcon />}
                    </button>
                  </div>
                  
                  {/* Password Strength */}
                  {newPass && (
                    <>
                      <div className={styles.strengthBar}>
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className={`${styles.strengthSeg} ${i <= strength ? (strength === 1 ? styles.weak : strength === 2 ? styles.medium : styles.strong) : ''}`} />
                        ))}
                      </div>
                      <div className={styles.strengthRow}>
                        <span className={`${styles.strengthLabel} ${strength === 1 ? styles.textWeak : strength === 2 ? styles.textMedium : styles.textStrong}`}>{LABELS[strength]}</span>
                        <span className={styles.strengthHint}>8+ characters, 1 number, 1 symbol</span>
                      </div>
                    </>
                  )}
                </div>

                {/* TRƯỜNG CONFIRM PASSWORD */}
                <div className={styles.fieldGroup} style={{ marginTop: '20px' }}>
                  <label className={styles.fieldLabel}>CONFIRM PASSWORD</label>
                  <div className={styles.inputContainer}>
                    <span className={styles.inputIcon}>🔒</span>
                    <input
                      className={styles.inputWithIcon}
                      // Thay đổi type động dựa trên State showConfirm
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Confirm new password"
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className={styles.eyeButton}
                      onClick={() => setShowConfirm(!showConfirm)}
                    >
                      {showConfirm ? <EyeIcon /> : <EyeOffIcon />}
                    </button>
                  </div>
                  {confirm && confirm !== newPass && (
                    <span className={styles.errorText}>Passwords don't match</span>
                  )}
                </div>

              </div>

              <button className={styles.submitBtn} type="submit" disabled={loading || !newPass || confirm !== newPass} style={{ marginTop: '32px' }}>
                {loading ? 'Resetting...' : '✓ Reset Password'}
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}

/* --- SVG COMPONENT CON MẮT (Dùng chuẩn nét mảnh sắc sảo) --- */
function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-7-10-7a19.16 19.16 0 0 1 3.52-4.65M0 0l24 24M1 1l22 22M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    </svg>
  );
}
