import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginWithCredentials } from "../../services/auth";
import api from "../../services/api";
import styles from "./OwnerRegistrationPage.module.css";

export default function OwnerRegistrationPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    contactNumber: "",
    primaryRegion: "",
    stableName: "",
    bio: "",
    agreeTerms: false,
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      alert("Please fill in email and password");
      return;
    }
    setLoading(true);
    try {
      const nameParts = form.fullName
        ? form.fullName.split(" ")
        : ["Owner", "User"];
      const payload = {
        email: form.email,
        password: form.password,
        confirmPassword: form.password,
        firstName: nameParts[0],
        lastName: nameParts.slice(1).join(" ") || "Owner",
        fullName: form.fullName || "Owner User",
        contactNumber: form.contactNumber,
        primaryRegion: form.primaryRegion,
        stableName: form.stableName,
        bio: form.bio,
        agreedToTerms: form.agreeTerms,
        // Optional fields could be passed here if BE supports them
        // stableName: form.stableName,
        // primaryRegion: form.primaryRegion,
        // bio: form.bio
      };

      await api.post("/api/v1/auth/register/owner", payload);

      // Auto login after successful registration
      await loginWithCredentials(form.email, form.password);
      navigate("/owner-dashboard");
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
        <div className={styles.container}>
          {/* LEFT PANEL */}
          <aside className={styles.leftPanel}>
            <div className={styles.leftContent}>
              <h2 className={styles.leftTitle}>Welcome to the Inner Circle</h2>
              <p className={styles.leftDesc}>
                Register as an Owner to access the industry's most advanced
                bloodline analytics and race management platform.
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
            <div className={styles.formHeader}>
              <h1 className={styles.formTitle}>Owner Registration</h1>
              <span className={styles.stepIndicator}>STEP 01 / 01</span>
            </div>

            <form onSubmit={handleRegister}>
              {/* STABLE IDENTITY UPLOAD */}
              <div className={styles.uploadSection}>
                <div className={styles.uploadIconBox}>
                  <CameraLogoIcon />
                  <span className={styles.uploadIconLabel}>LOGO</span>
                </div>
                <div className={styles.uploadInfo}>
                  <h3 className={styles.uploadTitle}>Stable Identity</h3>
                  <p className={styles.uploadDesc}>
                    Upload your racing silks, stable logo, or professional
                    avatar. High-resolution PNG or JPG preferred.
                  </p>
                  <label className={styles.chooseFileBtn}>
                    Choose File
                    <input
                      type="file"
                      accept="image/png, image/jpeg"
                      onChange={handleFileChange}
                      hidden
                    />
                  </label>
                  {avatarFile && (
                    <span className={styles.fileName}>{avatarFile.name}</span>
                  )}
                </div>
              </div>

              {/* FORM FIELDS */}
              <div className={styles.fieldGrid}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Full Legal Name</label>
                  <input
                    className={styles.input}
                    placeholder="e.g. Alistair Sterling"
                    value={form.fullName}
                    onChange={(e) => set("fullName", e.target.value)}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Email Address</label>
                  <input
                    className={styles.input}
                    type="email"
                    placeholder="owner@equine-elite.com"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Password</label>
                  <input
                    className={styles.input}
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => set("password", e.target.value)}
                    required
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Contact Number</label>
                  <input
                    className={styles.input}
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={form.contactNumber}
                    onChange={(e) => set("contactNumber", e.target.value)}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Primary Region</label>
                  <div className={styles.selectContainer}>
                    <select
                      className={styles.select}
                      value={form.primaryRegion}
                      onChange={(e) => set("primaryRegion", e.target.value)}
                    >
                      <option value="">Select region</option>
                      <option>Kentucky, USA</option>
                      <option>Newmarket, UK</option>
                      <option>County Tipperary, Ireland</option>
                      <option>Chantilly, France</option>
                      <option>Melbourne, Australia</option>
                      <option>Dubai, UAE</option>
                      <option>Tokyo, Japan</option>
                    </select>
                    <div className={styles.selectArrow}>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.fieldGroup} style={{ marginTop: "20px" }}>
                <label className={styles.fieldLabel}>Stable Name</label>
                <input
                  className={styles.input}
                  placeholder="Sterling Racing Stables"
                  value={form.stableName}
                  onChange={(e) => set("stableName", e.target.value)}
                />
              </div>

              <div className={styles.fieldGroup} style={{ marginTop: "20px" }}>
                <label className={styles.fieldLabel}>
                  Professional Bio / Credentials
                </label>
                <textarea
                  className={styles.textarea}
                  placeholder="Briefly describe your racing history, notable wins, and breeding philosophy..."
                  rows={4}
                  value={form.bio}
                  onChange={(e) => set("bio", e.target.value)}
                />
              </div>

              {/* TERMS CHECKBOX */}
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
                  and confirm that I hold valid ownership credentials for my
                  listed stable.
                </span>
              </label>

              {/* SUBMIT BUTTON */}
              <button
                className={styles.submitBtn}
                type="submit"
                disabled={loading || !form.agreeTerms}
              >
                {loading ? "Registering..." : "Register Account →"}
              </button>
            </form>

            {/* SIGN IN LINK */}
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
          </section>
        </div>
      </main>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerLeft}>
            <div className={styles.footerBrand}>Equine Elite</div>
            <p className={styles.footerCopy}>
              © 2024 Equine Elite Analytics. All rights reserved.
            </p>
          </div>
          <div className={styles.footerLinks}>
            <button type="button" className={styles.footerLink}>
              Terms of Service
            </button>
            <button type="button" className={styles.footerLink}>
              Privacy Policy
            </button>
            <button type="button" className={styles.footerLink}>
              Help Center
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* SVG ICON COMPONENTS */
function CheckCircleIcon() {
  return (
    <svg
      className="check-circle-icon"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#34d399"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function CameraLogoIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="3" ry="3" />
      <circle cx="12" cy="11" r="3" />
      <path d="M9 7h6" />
    </svg>
  );
}
