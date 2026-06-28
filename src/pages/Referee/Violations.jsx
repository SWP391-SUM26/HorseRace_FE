import { useState, useEffect } from 'react';
import styles from './Violations.module.css';
import { getJockeyList } from '../../services/jockey';
import { getReports, submitReport } from '../../services/referee';
import Button from '../../components/ui/Button';

export default function Violations() {
  const [jockeys, setJockeys] = useState([]);
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchViolations = async () => {
    try {
      const data = await getReports({ reportType: 'VIOLATION' });
      setViolations(data?.content || data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchJockeys = async () => {
    try {
      const data = await getJockeyList();
      if (data && data.length > 0) {
        setJockeys(data);
      } else {
        setJockeys([
          { id: 1, firstName: "Javier", lastName: "Castellano", age: 46, status: "ACTIVE", ridingStyle: "Hall of Fame", avatarUrl: "https://i.pravatar.cc/150?u=1" },
          { id: 2, firstName: "Irad", lastName: "Ortiz Jr.", age: 31, status: "ACTIVE", ridingStyle: "Pro Grade 1", avatarUrl: "https://i.pravatar.cc/150?u=2" },
          { id: 3, firstName: "Flavien", lastName: "Prat", age: 31, status: "SUSPENDED", ridingStyle: "Pending Review", avatarUrl: "https://i.pravatar.cc/150?u=3" },
          { id: 4, firstName: "Luis", lastName: "Saez", age: 31, status: "ACTIVE", ridingStyle: "Pro Grade 2", avatarUrl: "https://i.pravatar.cc/150?u=4" }
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch jockeys:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJockeys();
    fetchViolations();
  }, []);


  const handleResolveViolation = async (id) => {
    try {
      await submitReport(id);
      alert('Violation resolved and submitted officially!');
      fetchViolations();
    } catch (e) {
      alert('Failed to submit violation');
    }
  };


  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Jockey Roster</h1>
        <div className={styles.headerRight}>
          <input type="text" placeholder="🔍 Search by name or license..." className={styles.searchBox} />
          <button className={styles.confirmBtn}>Confirm Results</button>
          <button className={styles.iconBtn}>🔔</button>
          <button className={styles.iconBtn}>👤</button>
        </div>
      </div>

      <div className={styles.topCards}>
        <div className={styles.card}>
          <div className={styles.cardLabel}>TOTAL ACTIVE JOCKEYS</div>
          <div className={styles.cardValue}>142 <span className={styles.trendPos}>+4%</span></div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardLabel}>UNDER SUSPENSION</div>
          <div className={`${styles.cardValue} ${styles.cardUrgent}`}>8 ⚠️</div>
        </div>
        <div className={`${styles.card} ${styles.leaderCard}`}>
          <div className={styles.cardLabel} style={{color: '#a7f3d0'}}>SEASON LEADER</div>
          <div className={styles.leaderName}>Javier Castellano</div>
          <div className={styles.leaderDesc}>License: #EE-8821 • 42 First Place Finishes</div>
        </div>
      </div>

      <div className={styles.mainLayout}>
        <div className={styles.tableContainer}>
          <div className={styles.tableControls}>
            <div className={styles.filters}>
              <button className={styles.filterBtn}>≡ Filter</button>
              <button className={styles.filterBtn}>≡ Sort by Wins</button>
            </div>
            <div className={styles.paginationText}>
              Showing 1-10 of 142 jockeys
              <div style={{display: 'flex', gap: '4px'}}>
                <button className={styles.filterBtn}>&lt;</button>
                <button className={styles.filterBtn}>&gt;</button>
              </div>
            </div>
          </div>
          
          <table className={styles.table}>
            <thead>
              <tr>
                <th>JOCKEY</th>
                <th>LICENSE NUMBER</th>
                <th>SEASON WINS</th>
                <th>WIN RATE</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{textAlign: 'center'}}>Loading jockeys...</td></tr>
              ) : (
                jockeys.map((j, idx) => (
                  <tr key={j.id || idx}>
                    <td>
                      <div className={styles.jockeyInfo}>
                        <img src={j.avatarUrl || `https://i.pravatar.cc/150?u=${j.id}`} alt="avatar" className={styles.avatar} />
                        <div>
                          <div className={styles.jockeyName}>{j.firstName} {j.lastName}</div>
                          <div className={styles.jockeySub}>{j.ridingStyle || 'Pro'}</div>
                        </div>
                      </div>
                    </td>
                    <td>{j.id ? `EE-${1000 + idx * 423}` : 'EE-0000'}</td>
                    <td>{42 - (idx * 6)}</td>
                    <td style={{color: '#16a34a', fontWeight: '600'}}>{(18.4 - idx * 2.1).toFixed(1)}%</td>
                    <td>
                      <span className={j.status === 'ACTIVE' ? styles.statusActive : styles.statusSuspended}>
                        {j.status}
                      </span>
                    </td>
                    <td>
                      {j.status === 'ACTIVE' ? (
                        <button className={styles.btnSuspend}>Suspend</button>
                      ) : (
                        <button className={styles.btnActivate}>Activate</button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.rightSidebar}>
          <div className={styles.incidentsCard}>
            <div className={styles.incidentsHeader}>
              <h3 className={styles.incidentsTitle}>Recent Violations</h3>
              <a href="#" className={styles.viewLogLink}>View Log</a>
            </div>
            <div className={styles.incidentList}>
              {violations.length > 0 ? violations.map(v => (
                <div key={v.id || v.reportId} className={styles.incidentItem}>
                  <div className={styles.incidentIcon}>⚠️</div>
                  <div className={styles.incidentContent}>
                    <div className={styles.incidentTop}>
                      <span className={styles.incidentName}>{v.reportType}</span>
                    </div>
                    <div className={styles.incidentDesc}>
                      {v.summary}
                    </div>
                    <div className={styles.incidentTags}>
                      <span className={styles.tagLevel}>{v.severityLevel}</span>
                      {v.status !== 'SUBMITTED' ? (
                        <Button variant="outline" onClick={() => handleResolveViolation(v.id || v.reportId)} style={{marginLeft: '8px', padding: '2px 8px', fontSize: '10px'}}>Submit Final</Button>
                      ) : (
                        <span className={styles.tagReview} style={{background: '#dcfce3', color: '#16a34a'}}>SUBMITTED</span>
                      )}
                    </div>
                  </div>
                </div>
              )) : (
                <p style={{padding: '12px', fontSize: '12px', color: '#64748b'}}>No recent violations found.</p>
              )}
            </div>
          </div>

          <div className={styles.integrityCard}>
            <h3 className={styles.integrityTitle}>Integrity Report</h3>
            <p className={styles.integrityDesc}>Current season compliance rate among active jockeys.</p>
            <div className={styles.chartCircle}>95%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
