import { useState } from "react";
import { useNavigate } from "react-router-dom";
import horseImage from "../../assets/login.jpg";
import { loginWithCredentials, loginWithGoogle, loginWithRole } from "../../services/auth";
import styles from "./LoginPage.module.css";

const roleOptions = ["Owner", "Jockey", "Spectator"];

const dashboardByRole = {
  Owner: "/owner-dashboard",
  Jockey: "/jockey-dashboard",
  Spectator: "/spectator-dashboard",
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      const session = loginWithCredentials(identifier, password, rememberMe);
      navigate(dashboardByRole[session.user.role] || "/");
    } catch (loginError) {
      setError(loginError.message);
    }
  }

  function handleGoogleLogin() {
    setError("");

    try {
      const session = loginWithGoogle();
      navigate(dashboardByRole[session.user.role] || "/");
    } catch (loginError) {
      setError(loginError.message);
    }
  }

  function handleRoleLogin(role) {
    setError("");

    try {
      const session = loginWithRole(role);
      navigate(dashboardByRole[session.user.role] || "/");
    } catch (loginError) {
      setError(loginError.message);
    }
  }

  return (
    <main className={styles.loginPage}>
      <section className={styles.loginPanel} aria-label="Equine Elite login">
        <div className={styles.formWrap}>
          <button className={styles.brandButton} type="button" onClick={() => navigate("/")}>
            <span className={styles.brandMark}></span>
            Equine Elite
          </button>

          <div className={styles.headingBlock}>
            <h1>Equine Elite</h1>
            <p>Sign in to access Elite Management dashboard.</p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.fieldLabel} htmlFor="identifier">
              Email Address / Username
            </label>
            <div className={styles.inputShell}>
              <MailIcon />
              <input
                id="identifier"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder="Enter your email or username"
                autoComplete="username"
              />
            </div>

            <label className={styles.fieldLabel} htmlFor="password">
              Password
            </label>
            <div className={styles.inputShell}>
              <LockIcon />
              <input
                id="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                type="password"
                autoComplete="current-password"
              />
            </div>

            <div className={styles.formMeta}>
              <label className={styles.rememberControl}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />
                <span>Remember Me</span>
              </label>
              <button 
                className={styles.textButton} 
                type="button"
                onClick={() => navigate("/forgot-password")}
              >
                Forgot Password?
              </button>
            </div>

            {error && <div className={styles.errorMessage}>{error}</div>}
            <button className={styles.loginButton} type="submit">
              Login
              <ArrowRightIcon />
            </button>
          </form>

          <div className={styles.divider}>
            <span></span>
            <p>Or continue with</p>
            <span></span>
          </div>

          <button className={styles.googleButton} type="button" onClick={handleGoogleLogin}>
            <GoogleIcon />
            Continue with Google
          </button>

          <div className={styles.roleDivider}>
            <span></span>
            <p>Or sign in as</p>
            <span></span>
          </div>

          
          <div className={styles.roleGrid}>
            {roleOptions.map((role) => (
              <button
                className={styles.roleButton}
                key={role}
                type="button"
                onClick={() => {
                  // Chuyển sang trang đăng ký theo từng vai trò cụ thể
                  if (role === "Owner") {
                    handleRoleLogin("Owner");

                  } else if (role === "Jockey") {
                    handleRoleLogin("Jockey");

                  } else if (role === "Spectator") {
                    handleRoleLogin("Spectator");
                  }
                }}
              >
                <RoleIcon role={role} />
                {role}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.visualPanel} aria-label="Elite Performance">
        <img src={horseImage} alt="Running horse" className={styles.horseImage} />
        <div className={styles.visualShade}></div>
        <div className={styles.performanceCard}>
          <div className={styles.performanceIcon}>
            <MedalIcon />
          </div>
          <div>
            <span>Elite Performance</span>
            <h2>Data-Driven Excellence</h2>
            <p>Manage race assets with precision analytics and championship stable controls.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 7 9-7" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      <path d="M12 14v2" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21.6 12.2c0-.7-.1-1.3-.2-1.9H12v3.6h5.4a4.6 4.6 0 0 1-2 3v2.4h3.2c1.8-1.7 3-4.2 3-7.1Z" />
      <path d="M12 22c2.7 0 5-.9 6.6-2.6l-3.2-2.4c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.5A10 10 0 0 0 12 22Z" />
      <path d="M6.4 13.9a6 6 0 0 1 0-3.8V7.6H3.1a10 10 0 0 0 0 8.8l3.3-2.5Z" />
      <path d="M12 6c1.5 0 2.8.5 3.8 1.5l2.8-2.8A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.9 5.6l3.3 2.5C7.2 7.8 9.4 6 12 6Z" />
    </svg>
  );
}

function MedalIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="13" r="5" />
      <path d="m9 8-3-5h4l2 3 2-3h4l-3 5" />
      <path d="m10.5 13 1 1 2-2" />
    </svg>
  );
}

function RoleIcon({ role }) {
  if (role === "Owner") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M16 21v-2a4 4 0 0 0-8 0v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    );
  }

  if (role === "Jockey") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="17" cy="5" r="1.5" />
        <path d="m14 8-5 5" />
        <path d="m8 21 1-8" />
        <path d="m14 10 5 5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2" />
      <circle cx="12" cy="7" r="3" />
      <path d="M8 11h8" />
    </svg>
  );
}
