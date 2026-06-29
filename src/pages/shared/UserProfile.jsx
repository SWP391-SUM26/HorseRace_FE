import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyProfile } from "../../services/user";
import styles from "./UserProfile.module.css";

function formatDate(value) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "Unable to load your profile."
  );
}

export default function UserProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    getMyProfile()
      .then((data) => {
        if (active) setProfile(data);
      })
      .catch((requestError) => {
        if (active) setError(getErrorMessage(requestError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <div className={styles.statePage}>Loading your profile...</div>;
  }

  if (error || !profile) {
    return (
      <div className={styles.statePage}>
        <p>{error || "Profile not found."}</p>
        <button type="button" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  const details = [
    ["User Code", profile.userCode || "Not available"],
    ["Email", profile.email || "Not available"],
    ["Phone", profile.phone || "Not provided"],
    ["Role", profile.roleName || profile.role],
    ["Account Status", profile.status],
    ["KYC Status", profile.kycStatus],
    ["Joined", formatDate(profile.createdAt)],
  ];

  return (
    <main className={styles.profilePage}>
      <div className={styles.pageToolbar}>
        <button type="button" onClick={() => navigate(-1)}>
          Back
        </button>
        <span>My Account</span>
      </div>

      <section className={styles.profileCard}>
        <header className={styles.profileHeader}>
          <div className={styles.avatar}>
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={`${profile.name} avatar`} />
            ) : (
              profile.avatar
            )}
          </div>
          <div>
            <span className={styles.roleBadge}>{profile.role}</span>
            <h1>{profile.name}</h1>
            <p>{profile.email}</p>
          </div>
        </header>

        <div className={styles.detailsGrid}>
          {details.map(([label, value]) => (
            <div key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
