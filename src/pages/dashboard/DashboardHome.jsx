import { useOutletContext } from "react-router-dom";
import styles from "./DashboardHome.module.css";

const roleContent = {
  Owner: {
    title: "Owner Command Center",
    description: "Track stable health, portfolio performance, and upcoming race obligations.",
    stats: [
      ["Active Horses", "18"],
      ["Portfolio ROI", "+14.2%"],
      ["Open Reports", "6"],
    ],
    tasks: ["Review race entries", "Approve monthly ledger", "Check veterinary notes"],
  },
  Jockey: {
    title: "Jockey Performance Hub",
    description: "Manage ride bookings, readiness metrics, and professional credentials.",
    stats: [
      ["Confirmed Rides", "7"],
      ["Win Rate", "31%"],
      ["Weight Target", "118 lbs"],
    ],
    tasks: ["Confirm Flemington booking", "Upload fitness certificate", "Review speed analytics"],
  },
  Spectator: {
    title: "Spectator Race Center",
    description: "Follow live races, predictions, and fan-focused market insights.",
    stats: [
      ["Live Races", "4"],
      ["Prediction Score", "82%"],
      ["Watchlist", "11"],
    ],
    tasks: ["Join live stream", "Submit race prediction", "Track favorite runners"],
  },
};

export default function DashboardHome() {
  const { session, permissions } = useOutletContext();
  const content = roleContent[session.user.role] || roleContent.Spectator;

  return (
    <section className={styles.dashboardHome}>
      <div className={styles.heroPanel}>
        <div>
          <span className={styles.welcomeText}>Welcome back, {session.user.name}</span>
          <h2>{content.title}</h2>
          <p>{content.description}</p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        {content.stats.map(([label, value]) => (
          <article className={styles.statCard} key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>

      <div className={styles.contentGrid}>
        <section className={styles.panel}>
          <h3>Priority Work</h3>
          <ul className={styles.taskList}>
            {content.tasks.map((task) => (
              <li key={task}>{task}</li>
            ))}
          </ul>
        </section>

        <section className={styles.panel}>
          <h3>User Permissions</h3>
          <div className={styles.permissionList}>
            {permissions.map((permission) => (
              <span key={permission}>{permission}</span>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
