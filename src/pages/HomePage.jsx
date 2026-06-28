import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Boxes,
  Briefcase,
  Check,
  ExternalLink,
  Eye,
  Play,
  Trophy,
  Users,
} from "lucide-react";
import styles from "./HomePage.module.css";
import heroHorses from "../assets/hero_horses.png";
import silverStreak from "../assets/silver_streak.png";
import dashboardMonitor from "../assets/dashboard_monitor.png";

const liveRace = {
  event: "Royal Ascot",
  location: "Ascot, UK",
  going: "Good to Firm (3.4)",
  nextPostTime: "04:12:35",
  raceLabel: "R5",
};

const marketLeaders = [
  { rank: 1, horse: "Midnight Runner", jockey: "J. McConnell", odds: "2/1" },
  { rank: 2, horse: "Desert Storm", jockey: "W. Buick", odds: "7/2" },
  { rank: 3, horse: "Ocean Pearl", jockey: "L. Marquand", odds: "11/2" },
];

const leaderboard = [
  { rank: "01", name: "Fitzgerald Stables", role: "Trainer" },
  { rank: "02", name: "Aiden Speed", role: "Owner" },
  { rank: "03", name: "James McDonald", role: "Jockey" },
];

const featuredHorse = {
  name: "Silver Streak",
  grade: "Grade 1 - Flat Turf",
  wins: 4,
  races: 12,
  winRate: 88,
  metrics: {
    stamina: 90,
    speed: 84,
    temperament: 78,
  },
};

const footerColumns = [
  { heading: "Company", links: ["About Us", "Careers", "Security"] },
  { heading: "Contact", links: ["Partnerships", "Support", "Press"] },
  { heading: "Legal", links: ["Terms", "Privacy", "AML Policy"] },
];

const navItems = [
  { label: "Home", to: "/" },
  { label: "Platform", href: "#platform" },
  { label: "Solutions", href: "#solutions" },
  { label: "Register", href: "#register" },
];

function HomeNavBar() {
  return (
    <nav className={styles.navbar}>
      <Link to="/" className={styles.logoLink}>
        Equine Elite
      </Link>

      <ul className={styles.navLinks}>
        {navItems.map((item) => (
          <li key={item.label}>
            {item.to ? (
              <Link to={item.to}>{item.label}</Link>
            ) : (
              <a href={item.href}>{item.label}</a>
            )}
          </li>
        ))}
      </ul>

      <Link to="/login" className={styles.navButton}>
        Login
      </Link>
    </nav>
  );
}

function HomeHero() {
  return (
    <header className={styles.hero}>
      <div
        className={styles.heroImage}
        style={{ backgroundImage: `url(${heroHorses})` }}
        aria-hidden="true"
      />
      <div className={styles.heroOverlay} aria-hidden="true" />

      <div className={styles.heroContent}>
        <HomeNavBar />

        <div className={styles.heroCopy}>
          <span className={styles.heroBadge}>The Vanguard of Thoroughbred Management</span>

          <h1>
            Elite Power.
            <br />
            <span>Absolute Precision.</span>
          </h1>

          <p>
            The world's most sophisticated racing operating system. Unified data
            for the sport of kings, delivering real-time performance analytics
            and seamless syndicate oversight.
          </p>

          <div className={styles.heroActions}>
            <Link to="/spectator-register" className={styles.primaryCta}>
              Initialize Platform
              <ArrowRight size={18} />
            </Link>
            <Link to="/login" className={styles.secondaryCta}>
              Request Credentials
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

function LiveRaceBand() {
  return (
    <section className={styles.liveSection} id="platform">
      <div className={styles.liveGrid}>
        <article className={`${styles.card} ${styles.marketCard}`}>
          <div className={styles.liveHeader}>
            <div className={styles.liveTitleGroup}>
              <span className={styles.pulseDot}>
                <span />
              </span>
              <div>
                <p className={styles.liveTitle}>Live: {liveRace.event}</p>
                <p className={styles.mutedText}>
                  {liveRace.location} - Track: {liveRace.going}
                </p>
              </div>
            </div>

            <div className={styles.postTime}>
              <span>Next Post Time</span>
              <strong>{liveRace.nextPostTime}</strong>
            </div>
          </div>

          <div className={styles.divider} />

          <div>
            <p className={styles.kicker}>Market Leaders ({liveRace.raceLabel})</p>
            <ul className={styles.marketList}>
              {marketLeaders.map((leader) => (
                <li key={leader.rank}>
                  <span className={styles.rankBox}>{leader.rank}</span>
                  <div>
                    <strong>{leader.horse}</strong>
                    <small>{leader.jockey}</small>
                  </div>
                  <span className={styles.odds}>{leader.odds}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.aiCallout}>
            <div>
              <span className={styles.aiBadge}>AI</span>
              <p>Midnight Runner shows the strongest closing-sectional form on Good to Firm ground.</p>
            </div>
            <strong>66% WIN</strong>
          </div>
        </article>

        <article className={`${styles.card} ${styles.leaderboardCard}`}>
          <p className={styles.leaderboardTitle}>Global Leaderboard</p>

          <ul className={styles.leaderboardList}>
            {leaderboard.map((entry) => (
              <li key={entry.rank}>
                <span>{entry.rank}</span>
                <div>
                  <strong>{entry.name}</strong>
                  <small>{entry.role}</small>
                </div>
                <Trophy size={18} />
              </li>
            ))}
          </ul>

          <a href="#platform">View All Rankings -&gt;</a>
        </article>
      </div>
    </section>
  );
}

function BulletList({ items }) {
  return (
    <ul className={styles.bulletList}>
      {items.map((item) => (
        <li key={item}>
          <Check size={17} />
          {item}
        </li>
      ))}
    </ul>
  );
}

function EcosystemCard({ icon, title, description, highlight, bullets, cta }) {
  return (
    <article className={`${styles.card} ${styles.ecosystemCard}`}>
      <div className={styles.portalIcon}>{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>

      <div className={styles.cardHighlight}>{highlight}</div>

      <div className={styles.bulletArea}>
        <BulletList items={bullets} />
      </div>

      <Link to={cta.to} className={`${styles.portalButton} ${cta.variant === "secondary" ? styles.portalButtonSecondary : ""}`}>
        {cta.label}
      </Link>
    </article>
  );
}

function EcosystemSection() {
  return (
    <section className={styles.ecosystemSection} id="solutions">
      <div className={styles.sectionHeader}>
        <h2>The Elite Ecosystem</h2>
        <p>
          Tailored operational hubs for every professional and enthusiast in the racing circuit.
        </p>
      </div>

      <div className={styles.ecosystemGrid}>
        <EcosystemCard
          icon={<Briefcase size={26} />}
          title="Syndicates & Owners"
          description="Asset management and fiduciary oversight for elite thoroughbred portfolios."
          highlight={
            <div>
              <div className={styles.highlightRow}>
                <span>Portfolio ROI</span>
                <strong>+14.2%</strong>
              </div>
              <div className={styles.progressTrack}>
                <div style={{ width: "70%" }} />
              </div>
            </div>
          }
          bullets={["Horse Registration", "Financial Ledgering", "Health Reports"]}
          cta={{ label: "Launch Owner Portal", to: "/login", variant: "primary" }}
        />

        <EcosystemCard
          icon={<Users size={26} />}
          title="Professional Jockeys"
          description="Schedule, communication, and biometric performance tracking."
          highlight={
            <div className={styles.bookingBox}>
              <span>Next Booking</span>
              <div>
                <strong>Race 7 @ Flemington</strong>
                <em>Confirmed</em>
              </div>
            </div>
          }
          bullets={["Ride Schedule Management", "Agent Communication", "Weight Analytics"]}
          cta={{ label: "View Ride Deck", to: "/login", variant: "secondary" }}
        />

        <EcosystemCard
          icon={<Eye size={26} />}
          title="Spectators & Fans"
          description="Immersive race experience with real-time data and prediction tools."
          highlight={
            <div className={styles.streamBox}>
              <span>Live Stream</span>
              <div>
                <Play size={22} fill="currentColor" />
              </div>
            </div>
          }
          bullets={["Real-time Results Feed", "Community Predictions", "Digital Collectibles"]}
          cta={{ label: "Enter Fan Zone", to: "/spectator-register", variant: "secondary" }}
        />
      </div>
    </section>
  );
}

function MetricBar({ label, value }) {
  return (
    <div className={styles.metricItem}>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <div className={styles.metricTrack}>
        <div style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function VirtualPaddock() {
  const { name, grade, wins, races, winRate, metrics } = featuredHorse;

  return (
    <section className={styles.paddockSection}>
      <div className={styles.sectionHeader}>
        <span>Special Feature</span>
        <h2>The Virtual Paddock</h2>
        <p>
          An immersive preview for every stakeholder. View elite athletes in high-fidelity before the gate opens.
        </p>
      </div>

      <article className={`${styles.card} ${styles.paddockCard}`}>
        <div className={styles.paddockImage}>
          <img src={silverStreak} alt={name} />
          <div>
            <p>{grade}</p>
            <strong>{name}</strong>
            <span>{wins} Wins - {races} Races - {winRate}% Win</span>
          </div>
        </div>

        <div className={styles.metricsPanel}>
          <div className={styles.metricsTitle}>
            <Activity size={22} />
            <h3>Performance Metrics</h3>
          </div>

          <div className={styles.metricsList}>
            <MetricBar label="Stamina" value={metrics.stamina} />
            <MetricBar label="Speed" value={metrics.speed} />
            <MetricBar label="Temperament" value={metrics.temperament} />
          </div>

          <button type="button" className={styles.metricsButton}>
            View Full Pedigree
            <ArrowRight size={17} />
          </button>
        </div>
      </article>
    </section>
  );
}

function FeatureRow({ icon, title, description }) {
  return (
    <div className={styles.featureRow}>
      <div>{icon}</div>
      <section>
        <p>{title}</p>
        <span>{description}</span>
      </section>
    </div>
  );
}

function BackboneSection() {
  return (
    <section className={styles.backboneSection}>
      <div className={styles.backboneGrid}>
        <div>
          <span className={styles.sectionKicker}>The Backbone</span>
          <h2>Precision Intelligence for Modern Stables</h2>
          <p>
            Our administrative layer handles the clinical complexities of racing management so you can focus on the finish line.
            From inventory tracking to staff duty logs, nothing is left to chance.
          </p>

          <div className={styles.featureRows}>
            <FeatureRow icon={<Boxes size={22} />} title="Supply Chain" description="Automated stock management" />
            <FeatureRow icon={<Users size={22} />} title="Staff Hub" description="Duty logs and payroll" />
          </div>

          <Link to="/login" className={styles.adminButton}>
            Admin Dashboard
            <ExternalLink size={17} />
          </Link>
        </div>

        <img src={dashboardMonitor} alt="Analytics dashboards on a monitor" className={styles.monitorImage} />
      </div>
    </section>
  );
}

function HomeFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerGrid}>
        <div className={styles.footerBrand}>
          <p>Equine Elite</p>
          <span>Democratizing the thoroughbred industry through subscription management since 2026.</span>
        </div>

        {footerColumns.map((column) => (
          <div className={styles.footerColumn} key={column.heading}>
            <p>{column.heading}</p>
            <ul>
              {column.links.map((link) => (
                <li key={link}>
                  <a href="#platform">{link}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className={styles.footerBottom}>© 2026 Equine Elite</div>
    </footer>
  );
}

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <HomeHero />
      <LiveRaceBand />
      <EcosystemSection />

      <section className={styles.registerStrip} id="register">
        <div>
          <span>Start from the right portal</span>
          <strong>Register by role or sign in with existing credentials.</strong>
        </div>
        <div>
          <button type="button" onClick={() => navigate("/owner-register")}>Owner</button>
          <button type="button" onClick={() => navigate("/jockey-register")}>Jockey</button>
          <button type="button" onClick={() => navigate("/spectator-register")}>Spectator</button>
        </div>
      </section>

      <VirtualPaddock />
      <BackboneSection />
      <HomeFooter />
    </div>
  );
}
