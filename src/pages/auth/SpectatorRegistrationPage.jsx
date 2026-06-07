import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginWithCredentials } from "../../services/auth";
import api from "../../services/api";
import styles from "./SpectatorRegistrationPage.module.css";

export default function SpectatorRegistrationPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.email.trim() || !form.password) {
      alert("Please fill in your full name, email, and password");
      return;
    }
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    if (!form.agreeTerms) {
      alert("You must agree to the Terms of Service and Privacy Policy");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
        agreedToTerms: form.agreeTerms,
      };

      await api.post("/api/v1/auth/register/spectator", payload);
      await loginWithCredentials(form.email, form.password);
      navigate("/spectator-dashboard");
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message || err.message || "Registration failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* NAVBAR */}
      <header className={styles.navbar}>
        <button
          className={styles.navBrand}
          type="button"
          onClick={() => navigate("/")}
        >
          Equine Elite
        </button>
        <div className={styles.navActions}>
          <button className={styles.navLink} type="button">
            Support
          </button>
          <button
            className={styles.navLoginBtn}
            type="button"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className={styles.main}>
        {/* LEFT VISUAL PANEL */}
        <aside className={styles.leftPanel}>
          <div className={styles.leftOverlay}></div>
          <img
            src="https://images.unsplash.com/photo-1553284965-83fd3e82fa5a"
            alt="Horse racing"
            className={styles.leftImage}
          />
          <div className={styles.leftContent}>
            <h2 className={styles.leftTitle}>
              Join the Elite. Predict the Winners.
            </h2>
            <p className={styles.leftDesc}>
              Experience the thrill of the race with unparalleled data,
              insights, and exclusive spectator access.
            </p>
          </div>
        </aside>

        {/* RIGHT FORM PANEL */}
        <section className={styles.rightPanel}>
          <div className={styles.formWrap}>
            <h1 className={styles.formTitle}>Create Spectator Account</h1>
            <p className={styles.formSubtitle}>
              Enter your details to access the Elite Turf paddock.
            </p>

            <form onSubmit={handleRegister}>
                  {/* Full Name */}
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Full Name</label>
                    <div className={styles.inputShell}>
                      <UserIcon />
                      <input
                        className={styles.input}
                        placeholder="e.g. John Doe"
                        value={form.fullName}
                        onChange={(e) => set("fullName", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Email Address</label>
                    <div className={styles.inputShell}>
                      <MailIcon />
                      <input
                        className={styles.input}
                        type="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={(e) => set("email", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Phone Number</label>
                    <div className={styles.inputShell}>
                      <PhoneIcon />
                      <input
                        className={styles.input}
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={form.phone}
                        onChange={(e) => set("phone", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Password</label>
                    <div className={styles.inputShell}>
                      <LockIcon />
                      <input
                        className={styles.input}
                        type="password"
                        placeholder="••••••••"
                        value={form.password}
                        onChange={(e) => set("password", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>
                      Confirm Password
                    </label>
                    <div className={styles.inputShell}>
                      <ShieldCheckIcon />
                      <input
                        className={styles.input}
                        type="password"
                        placeholder="••••••••"
                        value={form.confirmPassword}
                        onChange={(e) => set("confirmPassword", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Terms Checkbox */}
                  <label className={styles.termsLabel}>
                    <input
                      type="checkbox"
                      checked={form.agreeTerms}
                      onChange={(e) => set("agreeTerms", e.target.checked)}
                      className={styles.termsCheckbox}
                    />
                    <span className={styles.termsText}>
                      I agree to the{" "}
                      <button type="button" className={styles.termsLink}>
                        Terms of Service
                      </button>{" "}
                      and{" "}
                      <button type="button" className={styles.termsLink}>
                        Privacy Policy
                      </button>
                      .
                    </span>
                  </label>

                  {/* Submit Button */}
                  <button
                    className={styles.submitBtn}
                    type="submit"
                    disabled={loading || !form.agreeTerms}
                  >
                    {loading
                      ? "Creating Account..."
                      : "Create Spectator Account"}
                  </button>
            </form>

            {/* Sign In Link */}
            <div className={styles.signinPrompt}>
              Already have an account?{" "}
              <button
                type="button"
                className={styles.signinLink}
                onClick={() => navigate("/login")}
              >
                Sign In
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>Equine Elite</div>
          <div className={styles.footerLinks}>
            <button type="button" className={styles.footerLink}>
              Terms of Service
            </button>
            <button type="button" className={styles.footerLink}>
              Privacy Policy
            </button>
            <button type="button" className={styles.footerLink}>
              Betting Integrity
            </button>
            <button type="button" className={styles.footerLink}>
              Platform Status
            </button>
          </div>
          <div className={styles.footerCopy}>
            © 2024 Equine Elite Racing. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ========== SVG ICON COMPONENTS ========== */
function UserIcon() {
  return (
    <svg
      className="field-icon"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      className="field-icon"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 7 9-7" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      className="field-icon"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      className="field-icon"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function ShieldCheckIcon() {
  return (
    <svg
      className="field-icon"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 11 11 13 15 9" />
    </svg>
  );
}
