import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getJockeyDetail } from "../../services/jockey";
import styles from "./JockeyDetail.module.css";

function getInitials(name = "") {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "Unable to load the jockey profile."
  );
}

export default function JockeyDetail() {
  const { jockeyId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const selectedHorseId = location.state?.selectedHorseId || "";
  const [jockey, setJockey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDetail() {
      setLoading(true);
      setError("");
      try {
        const data = await getJockeyDetail(jockeyId);
        if (!active) return;
        if (!data) {
          setError("Jockey not found.");
          return;
        }
        setJockey(data);
      } catch (requestError) {
        if (active) setError(getErrorMessage(requestError));
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDetail();
    return () => {
      active = false;
    };
  }, [jockeyId]);

  function returnToMarket(invite = false) {
    navigate("/owner/jockey-market", {
      state: {
        selectedHorseId,
        inviteJockeyId: invite && selectedHorseId ? jockeyId : undefined,
      },
    });
  }

  if (loading) {
    return <div className={styles.stateCard}>Loading jockey profile...</div>;
  }

  if (error || !jockey) {
    return (
      <div className={`${styles.stateCard} ${styles.errorState}`}>
        <p>{error || "Jockey not found."}</p>
        <button type="button" onClick={() => returnToMarket(false)}>
          Back to Jockey Market
        </button>
      </div>
    );
  }

  const details = [
    ["Email", jockey.email],
    ["Phone", jockey.phone],
    ["Status", jockey.status],
    ["Riding Style", jockey.ridingStyle],
    ["Experience", `${jockey.experience} years`],
    ["Total Races", jockey.totalRaces?.toLocaleString("en-US")],
    ["Career Wins", jockey.careerWins?.toLocaleString("en-US")],
    ["Win Rate", `${jockey.winRate}%`],
    ["Rating", `${jockey.rating} / 5`],
    ["Base Fee", formatCurrency(jockey.baseFee)],
    ["Prize Percentage", `${jockey.prizePercentage}%`],
    ["Availability", jockey.availability],
  ];

  return (
    <div className={styles.detailPage}>
      <div className={styles.toolbar}>
        <button type="button" className={styles.backButton} onClick={() => returnToMarket(false)}>
          Back to Jockey Market
        </button>
        <button
          type="button"
          className={styles.inviteButton}
          onClick={() => returnToMarket(true)}
        >
          {selectedHorseId ? "Invite to Ride" : "Select Horse to Invite"}
        </button>
      </div>

      <section className={styles.profileCard}>
        <div className={styles.profileHero}>
          <div className={styles.avatar}>
            {jockey.avatar ? (
              <img src={jockey.avatar} alt="" />
            ) : (
              getInitials(jockey.name)
            )}
          </div>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>Professional Jockey Profile</span>
            <h2>{jockey.name}</h2>
            <p>{jockey.bio}</p>
            <div className={styles.heroBadges}>
              <span className={styles.statusBadge}>{jockey.status}</span>
              <span>{jockey.ridingStyle}</span>
              <span>{jockey.stableStatus}</span>
            </div>
          </div>
          <div className={styles.performanceScore}>
            <span>Win Rate</span>
            <strong>{jockey.winRate}%</strong>
            <small>{jockey.compatibility}% horse compatibility</small>
          </div>
        </div>

        <div className={styles.detailGrid}>
          {details.map(([label, value]) => (
            <div className={styles.detailItem} key={label}>
              <span>{label}</span>
              <strong>{value || "Not provided"}</strong>
            </div>
          ))}
        </div>

        <div className={styles.bottomGrid}>
          <div className={styles.infoPanel}>
            <h3>Professional Bio</h3>
            <p>{jockey.bio || "No professional biography has been provided."}</p>
          </div>
          <div className={styles.infoPanel}>
            <h3>Trophy Cabinet</h3>
            <div className={styles.trophyList}>
              {jockey.trophies?.length ? (
                jockey.trophies.map((trophy) => (
                  <span key={trophy}>{trophy}</span>
                ))
              ) : (
                <p>No trophies listed.</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
