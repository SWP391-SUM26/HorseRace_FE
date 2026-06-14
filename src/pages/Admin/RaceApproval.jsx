import React from 'react';
import styles from './RaceApproval.module.css';

import PageHeader from '../../components/ui/PageHeader';
import StatCard, { Card } from '../../components/ui/StatCard';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import {
  DownloadIcon,
  CheckSquareIcon,
  AlertTriangleIcon,
  UsersIcon,
  TrendingUpIcon,
  FileTextIcon
} from '../../components/ui/Icons';

export default function RaceApproval() {
  const pendingRaces = [
    {
      id: "ER-8842",
      location: "Churchill Downs",
      horseNum: "4",
      horseColor: "#6ee7b7", // light green
      horseName: "Midnight Runner",
      pool: "845,200",
      status: "AWAITING AUTH",
      statusType: "info",
      action: "Verify"
    },
    {
      id: "ER-8843",
      location: "Ascot Furlong",
      horseNum: "7",
      horseColor: "#93c5fd", // light blue
      horseName: "Silver Bullet",
      pool: "1,204,550",
      status: "DISPUTE OPEN",
      statusType: "danger",
      action: "Review"
    },
    {
      id: "ER-8844",
      location: "Meydan Dirt",
      horseNum: "1",
      horseColor: "#6ee7b7", // light green
      horseName: "Desert Wind",
      pool: "630,000",
      status: "AWAITING AUTH",
      statusType: "info",
      action: "Verify"
    }
  ];

  const anomalyLogs = [
    {
      title: "Late Volume Spike",
      desc: "Unusual concentration of tokens placed on Horse #4 (ER-8842) within 60s of gate close.",
      meta: "12 mins ago • Sys_AI_Monitor",
      icon: AlertTriangleIcon,
      type: "red"
    },
    {
      title: "Syndicate Action Suspected",
      desc: "4 connected accounts flagged for identical trifecta layouts across 3 tracks.",
      meta: "45 mins ago • Risk Dept",
      icon: UsersIcon,
      type: "grey"
    },
    {
      title: "Payout Cap Reached",
      desc: "Total platform liability exceeded the optimal 85% threshold for the daily races.",
      meta: "2 hours ago • Finance Team",
      icon: TrendingUpIcon,
      type: "green"
    }
  ];

  return (
    <>
      <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
        Oversight Module
      </div>
      
      <PageHeader
        title="Results & Predictions"
        subtitle=""
        actions={
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button variant="outline" icon={DownloadIcon}>
              Export Ledger
            </Button>
            <Button style={{ backgroundColor: '#022c22', color: '#fff' }} icon={CheckSquareIcon}>
              Publish Selected Results
            </Button>
          </div>
        }
      />

      <div className={styles.topCards}>
        <StatCard
          title="TOTAL PLATFORM STAKE (24H)"
          icon={FileTextIcon}
          value="4,285,100"
          customContent={
            <>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '16px' }}>
                <span style={{ fontSize: '36px', fontWeight: 'bold', color: '#0f172a' }}>4,285,100</span>
                <span style={{ fontSize: '14px', color: '#64748b' }}>EE Tokens</span>
              </div>
              <Badge variant="success" style={{ backgroundColor: '#ecfdf5', color: '#047857', fontWeight: 'bold' }}>
                <TrendingUpIcon style={{ width: '14px', height: '14px', marginRight: '4px' }}/> +12.4% vs Prev Day
              </Badge>
            </>
          }
        />

        <StatCard
          title="EST. PAYOUT LIABILITY"
          icon={FileTextIcon}
          customContent={
            <>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#0f172a', marginBottom: '16px' }}>82.4%</div>
              <div className={styles.progressContainer}>
                <div className={styles.progressTrack}>
                  <div className={styles.progressFill} style={{ width: '82.4%' }}></div>
                  <div className={styles.progressMarker} style={{ left: '80%' }}></div>
                  <div className={styles.progressMarker} style={{ left: '85%' }}></div>
                </div>
                <div className={styles.progressLabels}>
                  <span>Target Range: 80-85%</span>
                  <span className={styles.optimalText}>Optimal</span>
                </div>
              </div>
            </>
          }
        />

        <StatCard
          className={styles.riskCard}
          title={<span style={{ color: '#ef4444' }}>ACTIVE RISK ALERTS</span>}
          icon={() => <AlertTriangleIcon style={{ color: '#ef4444' }} />}
          customContent={
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '36px', fontWeight: 'bold', color: '#ef4444' }}>14</span>
                  <span style={{ fontSize: '14px', color: '#ef4444', fontWeight: '500' }}>Patterns Flagged</span>
                </div>
              </div>
              <div>
                <Badge style={{ backgroundColor: '#fee2e2', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer', padding: '6px 12px' }}>
                  Review Immediate Holds →
                </Badge>
              </div>
            </div>
          }
        />
      </div>

      <div className={styles.mainLayout}>
        {/* Pending Race Verification */}
        <Card style={{ padding: '24px' }}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Pending Race Verification</h2>
            <span className={styles.viewLink}>View Schedule</span>
          </div>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
            <thead>
              <tr>
                <th className={styles.th}>RACE ID</th>
                <th className={styles.th}>LOCATION</th>
                <th className={styles.th}>SYSTEM WINNER</th>
                <th className={styles.th}>POOL SIZE</th>
                <th className={styles.th}>STATUS</th>
                <th className={styles.th}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {pendingRaces.map((race, idx) => (
                <tr key={idx} className={styles.tableRow}>
                  <td className={styles.td} style={{ color: '#047857', fontWeight: '500' }}>{race.id}</td>
                  <td className={styles.td}>{race.location}</td>
                  <td className={styles.td}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span className={styles.horseBadge} style={{ backgroundColor: race.horseColor }}>
                        {race.horseNum}
                      </span>
                      <span style={{ fontWeight: '500' }}>{race.horseName}</span>
                    </div>
                  </td>
                  <td className={styles.td} style={{ fontWeight: '500' }}>{race.pool}</td>
                  <td className={styles.td}>
                    <Badge style={{ 
                      backgroundColor: race.statusType === 'info' ? '#e0f2fe' : '#fee2e2', 
                      color: race.statusType === 'info' ? '#0369a1' : '#ef4444',
                      textTransform: 'uppercase',
                      fontSize: '11px',
                      fontWeight: '700'
                    }}>
                      {race.status}
                    </Badge>
                  </td>
                  <td className={styles.td}>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      style={{ 
                        color: race.action === 'Review' ? '#ef4444' : '#047857',
                        borderColor: race.action === 'Review' ? '#ef4444' : '#047857',
                        padding: '4px 16px'
                      }}
                    >
                      {race.action}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Anomaly Detection Log */}
        <Card style={{ padding: '24px' }}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Anomaly Detection Log</h2>
          </div>
          
          <div className={styles.logList}>
            {anomalyLogs.map((log, idx) => {
              const Icon = log.icon;
              const isRed = log.type === 'red';
              const isGreen = log.type === 'green';
              
              return (
                <div key={idx} className={`${styles.logItem} ${isRed ? styles.logItemRed : isGreen ? styles.logItemGreen : ''}`}>
                  <div className={`${styles.logIcon} ${isRed ? styles.logIconRed : isGreen ? styles.logIconGreen : styles.logIconGrey}`}>
                    <Icon />
                  </div>
                  <div className={styles.logContent}>
                    <div className={styles.logTitle}>{log.title}</div>
                    <div className={styles.logDesc}>{log.desc}</div>
                    <div className={styles.logMeta}>{log.meta}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </>
  );
}
