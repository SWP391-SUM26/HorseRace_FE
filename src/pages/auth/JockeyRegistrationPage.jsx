import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import jockeyImage from '../../assets/Jockey preparing for race.png';
import { loginWithRole, registerOfflineUser, loginWithCredentials } from '../../services/auth';
import styles from './JockeyRegistrationPage.module.css';

export default function JockeyRegistrationPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    age: '',
    weight: '',
    nationality: '',
    yearsActive: '',
    ridingStyle: '',
  });

  const [loading, setLoading] = useState(false);

  const set = (k, v) =>
    setForm((f) => ({
      ...f,
      [k]: v,
    }));

  const handleRegister = (event) => {
    event.preventDefault();
    if (!form.email || !form.password) {
      alert("Please fill in email and password");
      return;
    }
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      console.log(form);
      
      // Register offline to localStorage
      registerOfflineUser({
        email: form.email,
        password: form.password,
        fullName: `${form.firstName} ${form.lastName}`.trim(),
        role: 'Jockey',
        stable: 'Flemington Pro Circuit'
      });

      // Auto login with the registered credentials
      loginWithCredentials(form.email, form.password)
        .then(() => {
          navigate('/jockey-dashboard');
        })
        .catch(err => {
          console.error(err);
          // fallback
          loginWithRole('Jockey');
          navigate('/jockey-dashboard');
        });
    }, 900);
  };

  return (
    <main className={styles.registrationPage}>
      {/* CỘT TRÁI - PANEL ẢNH NỀN THẨM MỸ */}
      <section className={styles.visualPanel} aria-label="Elite Performance">
        <img src={jockeyImage} alt="Professional Jockey" className={styles.jockeyImage} />
        <div className={styles.visualShade}></div>
        <div className={styles.brandCard}>
          <div className={styles.brandName}>
            <CheckeredFlagIcon />
            Equine Elite
          </div>
          <p className={styles.brandDesc}>
            Join the premier platform for elite racing management. Register your credentials to access high-performance analytics and top-tier stable invitations.
          </p>
        </div>
      </section>

      {/* CỘT PHẢI - BIỂU MẪU ĐĂNG KÝ */}
      <section className={styles.formPanel} aria-label="Jockey registration">
        <div className={styles.formWrap}>
          <h2 className={styles.title}>Jockey Registration</h2>
          <p className={styles.subtitle}>
            Complete your profile to gain access to the Jockey Portal.
          </p>

          <form onSubmit={handleRegister}>
            {/* 0. ACCOUNT CREDENTIALS */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.headerIconWrapper}>
                  <ShieldCheckIcon />
                </div>
                <h3 className={styles.cardTitle}>0. Account Credentials</h3>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.grid2}>
                  <div className={styles.inputField}>
                    <label className={styles.fieldLabel} htmlFor="email">EMAIL ADDRESS</label>
                    <div className={styles.inputShell}>
                      <input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => set('email', e.target.value)}
                        placeholder="jockey@horserace.local"
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.inputField}>
                    <label className={styles.fieldLabel} htmlFor="password">PASSWORD</label>
                    <div className={styles.inputShell}>
                      <input
                        id="password"
                        type="password"
                        value={form.password}
                        onChange={(e) => set('password', e.target.value)}
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 1. PERSONAL IDENTITY CARD */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.headerIconWrapper}>
                  <IdCardIcon />
                </div>
                <h3 className={styles.cardTitle}>1. Personal Identity</h3>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.grid2}>
                  <div className={styles.inputField}>
                    <label className={styles.fieldLabel} htmlFor="firstName">FIRST NAME</label>
                    <div className={styles.inputShell}>
                      <input
                        id="firstName"
                        value={form.firstName}
                        onChange={(e) => set('firstName', e.target.value)}
                        placeholder="e.g. William"
                      />
                    </div>
                  </div>

                  <div className={styles.inputField}>
                    <label className={styles.fieldLabel} htmlFor="lastName">LAST NAME</label>
                    <div className={styles.inputShell}>
                      <input
                        id="lastName"
                        value={form.lastName}
                        onChange={(e) => set('lastName', e.target.value)}
                        placeholder="e.g. Buick"
                      />
                    </div>
                  </div>

                  <div className={styles.inputField}>
                    <label className={styles.fieldLabel} htmlFor="age">AGE</label>
                    <div className={styles.inputShell}>
                      <input
                        id="age"
                        type="number"
                        value={form.age}
                        onChange={(e) => set('age', e.target.value)}
                        placeholder="Years"
                      />
                    </div>
                  </div>

                  <div className={styles.inputField}>
                    <label className={styles.fieldLabel} htmlFor="weight">WEIGHT (LBS)</label>
                    <div className={styles.inputShell}>
                      <input
                        id="weight"
                        type="number"
                        value={form.weight}
                        onChange={(e) => set('weight', e.target.value)}
                        placeholder="e.g. 118"
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.selectWrap}>
                  <label className={styles.fieldLabel}>NATIONALITY</label>
                  <div className={styles.selectContainer}>
                    <select
                      className={styles.select}
                      value={form.nationality}
                      onChange={(e) => set('nationality', e.target.value)}
                    >
                      <option value="">Select your nationality</option>
                      <option>United States</option>
                      <option>United Kingdom</option>
                      <option>Ireland</option>
                      <option>France</option>
                      <option>Australia</option>
                    </select>
                    <div className={styles.selectArrow}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. EXPERIENCE CARD */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.headerIconWrapper}>
                  <ClockIcon />
                </div>
                <h3 className={styles.cardTitle}>2. Experience</h3>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.grid2}>
                  <div className={styles.inputField}>
                    <label className={styles.fieldLabel} htmlFor="yearsActive">YEARS ACTIVE</label>
                    <div className={styles.inputShell}>
                      <input
                        id="yearsActive"
                        type="number"
                        value={form.yearsActive}
                        onChange={(e) => set('yearsActive', e.target.value)}
                        placeholder="Professional years"
                      />
                    </div>
                  </div>

                  <div className={styles.selectWrap} style={{ marginTop: 0 }}>
                    <label className={styles.fieldLabel}>PRIMARY RIDING STYLE</label>
                    <div className={styles.selectContainer}>
                      <select
                        className={styles.select}
                        value={form.ridingStyle}
                        onChange={(e) => set('ridingStyle', e.target.value)}
                      >
                        <option value="">Select riding style</option>
                        <option>Front Runner</option>
                        <option>Stalker / Closer</option>
                        <option>Come-from-behind</option>
                      </select>
                      <div className={styles.selectArrow}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. CREDENTIALS CARD */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.headerIconWrapper}>
                  <ShieldCheckIcon />
                </div>
                <h3 className={styles.cardTitle}>3. Credentials</h3>
              </div>

              <div className={styles.cardBody}>
                {/* License Upload */}
                <div className={styles.uploadContainer}>
                  <span className={styles.fieldLabel}>JOCKEY LICENSE COPY</span>
                  <div className={styles.uploadArea}>
                    <div className={styles.uploadIcon}>
                      <DocumentUploadIcon />
                    </div>
                    <div className={styles.uploadText}>
                      <span className={styles.highlightText}>Upload a file</span> or drag and drop
                    </div>
                    <div className={styles.uploadHint}>PDF, PNG, JPG up to 10MB</div>
                  </div>
                </div>

                {/* Fitness Certificate Upload */}
                <div className={styles.uploadContainer}>
                  <span className={styles.fieldLabel}>CURRENT FITNESS CERTIFICATE</span>
                  <div className={styles.uploadArea}>
                    <div className={styles.uploadIcon}>
                      <ShieldPlusIcon />
                    </div>
                    <div className={styles.uploadText}>
                      <span className={styles.highlightText}>Upload a file</span> or drag and drop
                    </div>
                    <div className={styles.uploadHint}>PDF, PNG, JPG up to 10MB</div>
                  </div>
                </div>
              </div>
            </div>

            {/* ACTION FOOTER */}
            <div className={styles.actionFooter}>
              <button className={styles.backBtn} type="button" onClick={() => navigate('/login')}>
                ← Back to Login
              </button>
              
              <button 
                className={styles.submitBtn} 
                type="submit"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Registration →'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}

/* SVG ICON COMPONENTS */
function CheckeredFlagIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px' }}>
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  );
}

function IdCardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2" ry="2" />
      <line x1="7" y1="8" x2="17" y2="8" />
      <line x1="7" y1="12" x2="17" y2="12" />
      <line x1="7" y1="16" x2="13" y2="16" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function ShieldCheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 11 11 13 15 9" />
    </svg>
  );
}

function DocumentUploadIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="18" x2="12" y2="12" />
      <polyline points="9 15 12 12 15 15" />
    </svg>
  );
}

function ShieldPlusIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}
