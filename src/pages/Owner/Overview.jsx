import React, { useState } from 'react';
import styles from './Overview.module.css';
import ownerMock from '../../data/ownerMock.json';

export default function Overview() {
  const [timeMode, setTimeMode] = useState('realtime');
  const { estatePerformance } = ownerMock;

  // Custom CSS grid/flex bar chart drawing
  const maxVal = Math.max(...estatePerformance.chartData.map(d => d.value));

  return (
    <div className={styles.overviewContainer}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <span className={styles.eyebrow}>ESTATE PERFORMANCE</span>
          <h1 className={styles.pageTitle}>Owner Dashboard</h1>
        </div>
        <div className={styles.toggleGroup}>
          <button 
            className={`${styles.toggleBtn} ${timeMode === 'realtime' ? styles.toggleBtnActive : ''}`}
            onClick={() => setTimeMode('realtime')}
          >
            Real-time
          </button>
          <button 
            className={`${styles.toggleBtn} ${timeMode === 'historical' ? styles.toggleBtnActive : ''}`}
            onClick={() => setTimeMode('historical')}
          >
            Historical
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiIcon}>💵</span>
            <span className={styles.kpiTrendPositive}>{estatePerformance.stableValueChange}</span>
          </div>
          <span className={styles.kpiLabel}>TOTAL STABLE VALUE</span>
          <h2 className={styles.kpiValue}>{estatePerformance.totalStableValue}</h2>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiIcon}>🏚️</span>
          </div>
          <span className={styles.kpiLabel}>ACTIVE HORSES</span>
          <h2 className={styles.kpiValue}>
            {estatePerformance.activeHorses} <span className={styles.kpiTotalSub}>/ {estatePerformance.totalStalls} Stalls</span>
          </h2>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiIcon}>🏆</span>
            <span className={styles.kpiTrendPositive}>{estatePerformance.winsChange}</span>
          </div>
          <span className={styles.kpiLabel}>CAREER WINS</span>
          <h2 className={styles.kpiValue}>{estatePerformance.careerWins}</h2>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiIcon}>💼</span>
          </div>
          <span className={styles.kpiLabel}>TOTAL PRIZE MONEY</span>
          <h2 className={styles.kpiValue}>{estatePerformance.totalPrizeMoney}</h2>
        </div>
      </div>

      {/* Middle Section: Chart and Horse Spotlight */}
      <div className={styles.middleSection}>
        {/* Stable Health Bar Chart */}
        <div className={`${styles.card} ${styles.chartCard}`}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitleWrap}>
              <span className={styles.cardHeaderIcon}>📈</span>
              <h3 className={styles.cardTitle}>Stable Health & Performance</h3>
            </div>
            <select className={styles.chartSelect} defaultValue="6months">
              <option value="6months">Last 6 Months</option>
              <option value="year">Last Year</option>
            </select>
          </div>

          <div className={styles.chartContainer}>
            <div className={styles.chartYAxis}>
              <span>100%</span>
              <span>75%</span>
              <span>50%</span>
              <span>25%</span>
              <span>0%</span>
            </div>
            <div className={styles.chartBarsArea}>
              {estatePerformance.chartData.map((data, idx) => {
                const heightPercentage = (data.value / maxVal) * 90; // scale to fit nicely
                return (
                  <div key={data.month} className={styles.chartBarCol}>
                    <div className={styles.chartBarWrapper}>
                      <div 
                        className={styles.chartBar} 
                        style={{ height: `${heightPercentage}%` }}
                        title={`${data.month}: ${data.value}% Health`}
                      >
                        <span className={styles.barTooltip}>{data.value}%</span>
                      </div>
                    </div>
                    <span className={styles.chartMonthLabel}>{data.month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Spotlight Showcase Horse Card */}
        <div className={`${styles.card} ${styles.spotlightCard}`}>
          <div 
            className={styles.spotlightBg}
            style={{ backgroundImage: `linear-gradient(rgba(2, 44, 34, 0.85), rgba(2, 44, 34, 0.95)), url(${estatePerformance.showcaseHorse.image})` }}
          >
            <div className={styles.spotlightHeader}>
              <div>
                <h3 className={styles.spotlightName}>{estatePerformance.showcaseHorse.name}</h3>
                <span className={styles.spotlightTitle}>{estatePerformance.showcaseHorse.title}</span>
              </div>
              <span className={styles.spotlightBadge}>{estatePerformance.showcaseHorse.tier}</span>
            </div>

            <div className={styles.spotlightDetails}>
              <div className={styles.spotlightStat}>
                <span className={styles.spotlightStatLabel}>CONDITION</span>
                <span className={styles.spotlightStatValue}>{estatePerformance.showcaseHorse.condition}</span>
              </div>
              <div className={styles.spotlightStat}>
                <span className={styles.spotlightStatLabel}>LAST WIN</span>
                <span className={styles.spotlightStatValue}>{estatePerformance.showcaseHorse.lastWin}</span>
              </div>
            </div>

            <button className={styles.spotlightBtn}>
              Manage Performance Portfolio
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: Races and Financial Summary */}
      <div className={styles.bottomSection}>
        {/* Upcoming Races List */}
        <div className={`${styles.card} ${styles.racesCard}`}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Upcoming Races</h3>
            <a href="#calendar" className={styles.cardHeaderLink}>View Full Calendar</a>
          </div>

          <div className={styles.racesList}>
            {estatePerformance.upcomingRaces.map((race, idx) => (
              <div key={idx} className={styles.raceRow}>
                <div className={styles.raceDateBox}>
                  <span className={styles.raceMonth}>{race.date.split(' ')[0]}</span>
                  <span className={styles.raceDay}>{race.date.split(' ')[1]}</span>
                </div>
                <div className={styles.raceInfo}>
                  <strong className={styles.raceName}>{race.raceName}</strong>
                  <span className={styles.raceDetail}>{race.location} • {race.distance}</span>
                </div>
                <div className={styles.raceHorseJockey}>
                  <span className={styles.raceHorse}>{race.horse}</span>
                  <span className={styles.raceJockeyBadge}>{race.jockey}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Summary Table */}
        <div className={`${styles.card} ${styles.financeCard}`}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Financial Summary</h3>
            <button className={styles.moreOptionsBtn}>•••</button>
          </div>

          <table className={styles.financeTable}>
            <thead>
              <tr>
                <th>TRANSACTION</th>
                <th>ENTITY</th>
                <th>AMOUNT</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {estatePerformance.financialSummary.map((item, idx) => {
                const isPositive = item.amount.startsWith('+');
                return (
                  <tr key={idx}>
                    <td>
                      <div className={styles.financeTxName}>{item.transaction}</div>
                      <div className={styles.financeTxDetails}>{item.details}</div>
                    </td>
                    <td>{item.entity}</td>
                    <td className={isPositive ? styles.amountPositive : styles.amountNegative}>
                      {item.amount}
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[`status_${item.status.toLowerCase()}`]}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
