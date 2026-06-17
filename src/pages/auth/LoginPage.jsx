import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import horseImage from "../../assets/login.jpg";
import { loginWithCredentials, loginWithGoogle } from "../../services/auth";
import styles from "./LoginPage.module.css";

const roleOptions = ["Owner", "Jockey", "Spectator"];

const dashboardByRole = {
  Admin: "/admin/users",
  SystemAdmin: "/admin/users",
  TournamentAdmin: "/admin/tournaments",
  Owner: "/owner-dashboard",
  Jockey: "/jockey/invitations",
  Referee: "/referee/registrations",
  Spectator: "/spectator-dashboard",
};

const registrationRouteByRole = {
  Owner: "/owner-register",
  Jockey: "/jockey-register",
  Spectator: "/spectator-register",
};

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const isGoogleConfigured =
  Boolean(googleClientId) &&
  !googleClientId.startsWith("your-google-web-client-id");

function loadGoogleIdentityScript() {
  const existingScript = document.querySelector(
    'script[src="https://accounts.google.com/gsi/client"]',
  );

  if (existingScript) {
    return new Promise((resolve, reject) => {
      if (window.google?.accounts?.id) {
        resolve();
        return;
      }

      existingScript.addEventListener("load", resolve, { once: true });
      existingScript.addEventListener("error", reject, { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export default function LoginPage() {
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function initializeGoogleSignIn() {
      if (!isGoogleConfigured || !googleButtonRef.current) {
        return;
      }

      try {
        await loadGoogleIdentityScript();

        if (!mounted || !googleButtonRef.current) {
          return;
        }

        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response) => {
            setError("");
            setGoogleLoading(true);

            try {
              const session = await loginWithGoogle(response.credential);
              navigate(dashboardByRole[session.user.role] || "/");
            } catch (loginError) {
              setError(loginError.message);
            } finally {
              setGoogleLoading(false);
            }
          },
        });
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: "outline",
          size: "large",
          shape: "rectangular",
          text: "continue_with",
          width: googleButtonRef.current.offsetWidth || 360,
        });
      } catch {
        if (mounted) {
          setError("Could not load Google Sign-In.");
        }
      }
    }

    initializeGoogleSignIn();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const session = await loginWithCredentials(
        identifier,
        password,
        rememberMe,
      );
      navigate(dashboardByRole[session.user.role] || "/");
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setLoading(false);
    }
  }

  function handleMissingGoogleConfig() {
    setError(
      "Google Client ID is missing. Please update VITE_GOOGLE_CLIENT_ID in .env and restart the frontend.",
    );
  }

  function registrationByRole(role) {
    const registrationRoute = registrationRouteByRole[role];

    if (registrationRoute) {
      navigate(registrationRoute);
    }
  }

  return (
    <main className={styles.loginPage}>
      <section className={styles.loginPanel} aria-label="Equine Elite login">
        <div className={styles.formWrap}>
          <button
            className={styles.brandButton}
            type="button"
            onClick={() => navigate("/")}
          >
            <span className={styles.brandMark}></span>
            Equine Elite
          </button>

          <div className={styles.headingBlock}>
            <h1>Equine Elite</h1>
            <p>Sign in to access Elite Management dashboard.</p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.fieldLabel} htmlFor="identifier">
              Email Address
            </label>
            <div className={styles.inputShell}>
              <MailIcon />
              <input
                id="identifier"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder="owner@horserace.local"
                autoComplete="username"
                type="text"
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
            <button
              className={styles.loginButton}
              type="submit"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
              {!loading && <ArrowRightIcon />}
            </button>
          </form>

          <div className={styles.divider}>
            <span></span>
            <p>Or continue with</p>
            <span></span>
          </div>

          {isGoogleConfigured ? (
            <div className={styles.googleButtonHost} ref={googleButtonRef}>
              {googleLoading && (
                <span className={styles.googleLoadingText}>
                  Signing in with Google...
                </span>
              )}
            </div>
          ) : (
            <button
              className={styles.googleButton}
              type="button"
              onClick={handleMissingGoogleConfig}
            >
              <GoogleIcon />
              Sign in with Google
            </button>
          )}

          <div className={styles.roleDivider}>
            <span></span>
            <p>Or sign up as</p>
            <span></span>
          </div>

          <div className={styles.roleGrid}>
            {roleOptions.map((role) => (
              <button
                className={styles.roleButton}
                key={role}
                type="button"
                onClick={() => registrationByRole(role)}
              >
                <RoleIcon role={role} />
                {role}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.visualPanel} aria-label="Elite Performance">
        <img
          src={horseImage}
          alt="Running horse"
          className={styles.horseImage}
        />
        <div className={styles.visualShade}></div>
        <div className={styles.performanceCard}>
          <div className={styles.performanceIcon}>
            <MedalIcon />
          </div>
          <div>
            <span>Elite Performance</span>
            <h2>Data-Driven Excellence</h2>
            <p>
              Manage race assets with precision analytics and championship
              stable controls.
            </p>
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
