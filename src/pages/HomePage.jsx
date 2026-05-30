import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./HomePage.module.css";
import silverStreakImg from "../assets/silver_streak.png";
import dashboardMonitorImg from "../assets/dashboard_monitor.png";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className={styles.appContainer}>
      {/* NAVBAR */}
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <div className={styles.brandDot}></div>
          Equine Elite
        </div>

        <div className={styles.topbarNav}>
          <button className={styles.topbarNavBtn}>Home</button>
          <button className={styles.topbarNavBtn}>Platform</button>
          <button className={styles.topbarNavBtn}>Solutions</button>
          <button className={styles.topbarNavBtn}>Pricing</button>
        </div>

        <div className={styles.topbarSpacer}></div>

        <div className={styles.topbarActions}>
          <button className={styles.loginBtn} onClick={() => navigate('/login')}>
            Login
          </button>
          <button className={styles.ctaBtn} onClick={() => navigate('/register')}>
            Register
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className={styles.hero}>
        <div className={styles.heroGlow}></div>
        
        <div className={styles.heroBadge}>
          <span className={styles.heroBadgeDot}></span>
          ★ The gold standard of Thoroughbred stable management
        </div>

        <h1 className={styles.heroTitle}>
          ELITE POWER.
          <br />
          ABSOLUTE PRECISION.
        </h1>

        <p className={styles.heroSubtitle}>
          The world's most sophisticated racing operating system. Unified data for the
          sport of kings, delivering real-time performance analytics and seamless
          syndicate oversight.
        </p>

        <div className={styles.heroButtons}>
          <button className={styles.heroPrimaryBtn} onClick={() => navigate('/login')}>
            Initialize Platform <span className={styles.arrow}>→</span>
          </button>
          <button className={styles.heroSecondaryBtn} onClick={() => navigate('/register')}>
            Request Credentials
          </button>
        </div>
      </section>

      {/* MARKET & LEADERBOARD SECTION */}
      <section className={styles.marketSection}>
        {/* LEFT CARD - LIVE RACE & LEADERS */}
        <div className={styles.marketCard}>
          <div className={styles.marketHeader}>
            <div>
              <div className={styles.marketLive}>
                <span className={styles.livePulseDot}></span>
                Live: Royal Ascot
              </div>
              <div className={styles.marketMeta}>
                Ascot, UK | Track: Good to Firm (2.4)
              </div>
            </div>

            <div className={styles.postTime}>
              <span>NEXT POST TIME</span>
              <h2>04:12:35</h2>
            </div>
          </div>

          <h3 className={styles.marketTitle}>MARKET LEADERS (R5)</h3>

          <div className={styles.marketContent}>
            <div className={styles.runners}>
              <div className={styles.runnerCard}>
                <div className={styles.runnerIndex}>1</div>
                <div className={styles.runnerInfo}>
                  <strong>Midnight Banner</strong>
                  <span>J: R. Moore | T: A. O'Brien</span>
                </div>
                <div className={styles.oddsBox}>2/1</div>
              </div>

              <div className={styles.runnerCard}>
                <div className={styles.runnerIndex}>4</div>
                <div className={styles.runnerInfo}>
                  <strong>Desert Storm</strong>
                  <span>J: W. Buick | T: C. Appleby</span>
                </div>
                <div className={styles.oddsBox}>4/1</div>
              </div>

              <div className={styles.runnerCard}>
                <div className={styles.runnerIndex}>7</div>
                <div className={styles.runnerInfo}>
                  <strong>Ocean Pearl</strong>
                  <span>J: J. McDonald | T: C. Waller</span>
                </div>
                <div className={styles.oddsBox}>11/2</div>
              </div>
            </div>

            {/* AI Insights Card */}
            <div className={styles.aiCard}>
              <h4 className={styles.aiCardTitle}>
                <span className={styles.aiBrainIcon}>🧠</span> AI Predictor Insights
              </h4>
              <p className={styles.aiCardText}>
                Track conditions favor low-draw sprinters today. Midnight Runner has
                a 68% win probability based on morning works and pedigree analysis.
              </p>
              
              <div className={styles.aiConfidenceHeader}>
                <span>CONFIDENCE SCORE</span>
                <strong className={styles.confidenceValue}>68% HIGH</strong>
              </div>
              <div className={styles.aiProgressBar}>
                <div className={styles.aiProgressBarFill} style={{ width: '68%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT CARD - GLOBAL LEADERBOARD */}
        <div className={styles.leaderboardCard}>
          <h3 className={styles.leaderboardTitle}>
            <span className={styles.trophyIcon}>🏆</span> GLOBAL LEADERBOARD
          </h3>

          <div className={styles.leaderboardList}>
            <div className={styles.rankItem}>
              <span className={styles.rankNum}>01</span>
              <div className={styles.rankDetails}>
                <strong>Flightline</strong>
                <small>Rating: 140</small>
              </div>
              <span className={`${styles.roleBadge} ${styles.badgeHorse}`}>Horse</span>
            </div>

            <div className={styles.rankItem}>
              <span className={styles.rankNum}>02</span>
              <div className={styles.rankDetails}>
                <strong>Baaeed</strong>
                <small>Rating: 135</small>
              </div>
              <span className={`${styles.roleBadge} ${styles.badgeHorse}`}>Horse</span>
            </div>

            <div className={styles.rankItem}>
              <span className={styles.rankNum}>03</span>
              <div className={styles.rankDetails}>
                <strong>James McDonald</strong>
                <small>Wins: 142</small>
              </div>
              <span className={`${styles.roleBadge} ${styles.badgeJockey}`}>Jockey</span>
            </div>
          </div>

          <button className={styles.viewRankingsBtn}>View All Rankings</button>
        </div>
      </section>

      {/* ECOSYSTEM */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>The Elite Ecosystem</h2>
          <p className={styles.sectionSubtitle}>
            Tailored operational hubs for every professional and enthusiast in the racing circuit.
          </p>
        </div>

        <div className={styles.portalGrid}>
          {/* OWNER PORTAL */}
          <div className={styles.portalCard}>
            <div className={styles.portalCardTop}>
              <div className={`${styles.portalIcon} ${styles.ownerIcon}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              </div>
              <h3 className={styles.portalCardTitle}>Syndicates & Owners</h3>
              <p className={styles.portalCardDesc}>
                Asset management and fiduciary oversight for elite thoroughbred portfolios.
              </p>
            </div>

            <div className={styles.portalCardBody}>
              <div className={styles.cardWidget}>
                <div className={styles.widgetHeader}>
                  <span className={styles.widgetLabel}>PORTFOLIO ROI</span>
                  <span className={styles.roiValue}>+14.2%</span>
                </div>
                <div className={styles.progressBarBg}>
                  <div className={styles.progressBarFill} style={{ width: '70%' }}></div>
                </div>
              </div>

              <ul className={styles.portalFeatures}>
                <li className={styles.portalFeature}>
                  <svg className={`${styles.checkIcon} ${styles.ownerCheck}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  Horse Registration
                </li>
                <li className={styles.portalFeature}>
                  <svg className={`${styles.checkIcon} ${styles.ownerCheck}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  Financial Ledgering
                </li>
                <li className={styles.portalFeature}>
                  <svg className={`${styles.checkIcon} ${styles.ownerCheck}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  Health Reports
                </li>
              </ul>
            </div>

            <div className={styles.portalCardFooter}>
              <button className={`${styles.portalLaunchBtn} ${styles.ownerBtn}`} onClick={() => navigate('/login')}>
                Launch Owner Portal
              </button>
            </div>
          </div>

          {/* JOCKEY PORTAL */}
          <div className={styles.portalCard}>
            <div className={styles.portalCardTop}>
              <div className={`${styles.portalIcon} ${styles.jockeyIcon}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="1"></circle>
                  <path d="M14 7l-5.2 4.8a1 1 0 0 0-.3.7L7 19"></path>
                  <path d="M4 16h4l2.5-3.5"></path>
                  <path d="M14 9.5L12 13l-2.5 3"></path>
                  <path d="M16 11.5L21 16"></path>
                </svg>
              </div>
              <h3 className={styles.portalCardTitle}>Professional Jockeys</h3>
              <p className={styles.portalCardDesc}>
                Schedule synchronization and biological performance mapping.
              </p>
            </div>

            <div className={styles.portalCardBody}>
              <div className={styles.cardWidget}>
                <div className={styles.widgetHeader}>
                  <span className={styles.widgetLabel}>NEXT BOOKING</span>
                  <span className={styles.statusBadge}>Confirmed</span>
                </div>
                <div className={styles.bookingDetails}>
                  <div className={styles.bookingTitle}>Race 7 @ Flemington</div>
                  <div className={styles.bookingTime}>Post time: 15:45 (Local)</div>
                </div>
              </div>

              <ul className={styles.portalFeatures}>
                <li className={styles.portalFeature}>
                  <svg className={`${styles.checkIcon} ${styles.jockeyCheck}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  Ride Schedule Management
                </li>
                <li className={styles.portalFeature}>
                  <svg className={`${styles.checkIcon} ${styles.jockeyCheck}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  Agent Communication
                </li>
                <li className={styles.portalFeature}>
                  <svg className={`${styles.checkIcon} ${styles.jockeyCheck}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  Weight Analytics
                </li>
              </ul>
            </div>

            <div className={styles.portalCardFooter}>
              <button className={`${styles.portalLaunchBtn} ${styles.jockeyBtn}`} onClick={() => navigate('/login')}>
                View Ride Deck
              </button>
            </div>
          </div>

          {/* SPECTATOR PORTAL */}
          <div className={styles.portalCard}>
            <div className={styles.portalCardTop}>
              <div className={`${styles.portalIcon} ${styles.spectatorIcon}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
              <h3 className={styles.portalCardTitle}>Spectators & Fans</h3>
              <p className={styles.portalCardDesc}>
                Immersive fan experiences with real-time data and prediction tools.
              </p>
            </div>

            <div className={styles.portalCardBody}>
              <div className={styles.cardWidget}>
                <div className={styles.widgetHeader}>
                  <span className={styles.widgetLabel}>LIVE STREAM</span>
                  <span className={styles.liveIndicator}>
                    <span className={styles.liveDot}></span>
                  </span>
                </div>
                <div className={styles.videoPlayer}>
                  <div className={styles.playButton}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                  </div>
                </div>
              </div>

              <ul className={styles.portalFeatures}>
                <li className={styles.portalFeature}>
                  <svg className={`${styles.checkIcon} ${styles.spectatorCheck}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  Real-time Results Feed
                </li>
                <li className={styles.portalFeature}>
                  <svg className={`${styles.checkIcon} ${styles.spectatorCheck}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  Community Predictions
                </li>
                <li className={styles.portalFeature}>
                  <svg className={`${styles.checkIcon} ${styles.spectatorCheck}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  Digital Collectibles
                </li>
              </ul>
            </div>

            <div className={styles.portalCardFooter}>
              <button className={`${styles.portalLaunchBtn} ${styles.spectatorBtn}`} onClick={() => navigate('/login')}>
                Enter Fan Zone
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* VIRTUAL PADDOCK */}
      <section className={styles.virtualPaddock}>
        <div className={styles.sectionLabel}>SPECIAL FEATURE</div>
        <h2 className={styles.sectionTitle}>The Virtual Paddock</h2>
        <p className={styles.sectionSubtitle}>
          An immersive preview for every stakeholder. View elite athletes in high-fidelity before the gate opens.
        </p>

        <div className={styles.paddockContainer}>
          {/* LEFT DISPLAY */}
          <div className={styles.paddockHorse}>
            <img src={silverStreakImg} alt="Silver Streak Thoroughbred" className={styles.horseImg} />
            
            <div className={styles.paddockOverlay}>
              <span className={styles.horseBadge}>HORSE OF THE DAY</span>
              <h3 className={styles.horseName}>SILVER STREAK</h3>
              
              <div className={styles.horseStats}>
                <div className={styles.statBox}>
                  <strong>4</strong>
                  <span>AGE</span>
                </div>
                <div className={styles.statBox}>
                  <strong>12</strong>
                  <span>WINS</span>
                </div>
                <div className={styles.statBox}>
                  <strong>88%</strong>
                  <span>WIN RATE</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PERFORMANCE METRICS */}
          <div className={styles.metricsPanel}>
            <h3 className={styles.metricsTitle}>
              <span className={styles.metricsSliderIcon}>🎛️</span> Performance Metrics
            </h3>

            <div className={styles.metricItem}>
              <div className={styles.metricHeader}>
                <span>Stamina</span>
                <strong>92</strong>
              </div>
              <div className={styles.metricBar}>
                <div className={styles.metricFill} style={{ width: '92%' }} />
              </div>
            </div>

            <div className={styles.metricItem}>
              <div className={styles.metricHeader}>
                <span>Speed</span>
                <strong>88</strong>
              </div>
              <div className={styles.metricBar}>
                <div className={styles.metricFill} style={{ width: '88%' }} />
              </div>
            </div>

            <div className={styles.metricItem}>
              <div className={styles.metricHeader}>
                <span>Temperament</span>
                <strong>95</strong>
              </div>
              <div className={styles.metricBar}>
                <div className={styles.metricFill} style={{ width: '95%' }} />
              </div>
            </div>

            <button className={styles.pedigreeBtn}>
              View Full Pedigree <span className={styles.btnArrow}>↗</span>
            </button>
          </div>
        </div>
      </section>

      {/* THE BACKBONE */}
      <section className={styles.backboneSection}>
        <div className={styles.backboneContainer}>
          {/* LEFT DESCRIPTION */}
          <div className={styles.backboneLeft}>
            <div className={styles.backboneLabel}>THE BACKBONE</div>
            <h2 className={styles.backboneTitle}>Precision Intelligence for Modern Stables</h2>
            <p className={styles.backboneDesc}>
              Our administrative layer handles the clinical complexities of racing management so you can focus on the finish line. From inventory tracking to staff duty logs, nothing is left to chance.
            </p>

            <div className={styles.backboneFeaturesGrid}>
              <div className={styles.backboneFeatureCard}>
                <div className={styles.featureCardIcon}>📦</div>
                <div className={styles.featureCardContent}>
                  <h4>Supply Chain</h4>
                  <p>Automated stock management</p>
                </div>
              </div>
              
              <div className={styles.backboneFeatureCard}>
                <div className={styles.featureCardIcon}>👥</div>
                <div className={styles.featureCardContent}>
                  <h4>Staff Hub</h4>
                  <p>Duty logs & duty roster</p>
                </div>
              </div>
            </div>

            <button className={styles.adminDashboardBtn}>
              Admin Dashboard <span className={styles.btnArrow}>↗</span>
            </button>
          </div>

          {/* RIGHT MONITOR DISPLAY */}
          <div className={styles.backboneRight}>
            <img src={dashboardMonitorImg} alt="Equine Elite Admin Dashboard Monitor" className={styles.monitorImg} />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerGrid}>
          <div className={styles.footerBrandCol}>
            <div className={styles.footerBrand}>Equine Elite</div>
            <p className={styles.footerTagline}>
              Standardising the thoroughbred industry through state-of-the-art management since 2024.
            </p>
          </div>

          <div className={styles.footerCol}>
            <h4 className={styles.footerColTitle}>Company</h4>
            <button className={styles.footerLink}>About Us</button>
            <button className={styles.footerLink}>Network</button>
            <button className={styles.footerLink}>Security</button>
          </div>

          <div className={styles.footerCol}>
            <h4 className={styles.footerColTitle}>Contact</h4>
            <button className={styles.footerLink}>Partnerships</button>
            <button className={styles.footerLink}>Support</button>
            <button className={styles.footerLink}>Press</button>
          </div>

          <div className={styles.footerCol}>
            <h4 className={styles.footerColTitle}>Legal</h4>
            <button className={styles.footerLink}>Terms</button>
            <button className={styles.footerLink}>Privacy</button>
            <button className={styles.footerLink}>AML Policy</button>
          </div>
        </div>
      </footer>
    </div>
  );
}