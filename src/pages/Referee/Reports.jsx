import React, { useState, useEffect } from 'react';
import styles from './Reports.module.css';
import placeholderImg from '../../assets/photofinish.png';
import { getReports, createReport, submitReport } from '../../services/referee';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

export default function Reports() {
  const [agreed, setAgreed] = useState(false);
  const [certified, setCertified] = useState(false);
  const [reports, setReports] = useState([]);
  const [newReport, setNewReport] = useState({ reportType: 'GENERAL', summary: '', severityLevel: 'LOW', decision: '' });
  const [raceId, setRaceId] = useState('00000000-0000-0000-0000-000000000000'); // We need a valid raceId in reality

  useEffect(() => {
    fetchReports();
  }, [raceId]);

  const fetchReports = async () => {
    try {
      const data = await getReports({ raceId });
      // Filter out violations since they belong to another page
      const filtered = (data?.content || data || []).filter(r => r.reportType !== 'VIOLATION');
      setReports(filtered);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateReport = async () => {
    try {
      await createReport({ ...newReport, raceId });
      alert('Report saved!');
      setNewReport({ reportType: 'GENERAL', summary: '', severityLevel: 'LOW', decision: '' });
      fetchReports();
    } catch (e) {
      alert('Failed to save report: ' + e.message);
    }
  };

  const handleSubmitReport = async (id) => {
    try {
      await submitReport(id);
      alert('Report submitted officially!');
      fetchReports();
    } catch (e) {
      alert('Failed to submit report');
    }
  };

  const finishOrder = [
    { rank: 1, pgm: 7, name: 'Midnight Strike', jockey: 'J. Rosario', weight: 126, margin: '-', odds: '3.50' },
    { rank: 2, pgm: 3, name: 'Golden Emblem', jockey: 'I. Ortiz Jr.', weight: 126, margin: 'Nose', odds: '1.20*' },
    { rank: 3, pgm: 9, name: 'Storm Chaser', jockey: 'F. Prat', weight: 122, margin: '2 1/4', odds: '8.00' },
    { rank: 4, pgm: 1, name: 'Velocity', jockey: 'T. Gaffalione', weight: 126, margin: '1/2', odds: '12.50' }
  ];

  const handleCertify = () => {
    if (agreed) {
      setCertified(true);
      alert('Official Results Certified Successfully!');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.breadcrumbs}>
          Reports &gt; <strong>Race Certification</strong>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.iconBtn}>🔔</button>
          <button className={styles.iconBtn}>👤</button>
          <button className={styles.confirmBtn}>Confirm Results</button>
        </div>
      </div>

      <div className={styles.titleArea}>
        <div>
          <div className={styles.titleTop}>
            <span className={styles.badgeBlue}>RACE 08</span>
            <span className={styles.badgeYellow}>⚙ PENDING CERTIFICATION</span>
          </div>
          <h1 className={styles.title}>Official Results Certification</h1>
          <p className={styles.subtitle}>Churchill Downs • 1 1/4 Miles • Dirt • Fast • Grade 1</p>
        </div>
        <div className={styles.times}>
          Post Time: 6:50 PM EST<br/>
          Off Time: 6:52 PM EST
        </div>
      </div>

      <div className={styles.gridTop}>
        {/* Left: Photofinish */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}><span>📷</span> Photofinish Telemetry</h2>
            <button className={styles.expandBtn}>Expand View</button>
          </div>
          <div className={styles.photoArea}>
            <img 
              src={placeholderImg} 
              alt="Photofinish" 
              className={styles.photoImg} 
            />
            <div className={styles.finishLine}>
              <div className={styles.finishLineDot}></div>
            </div>
            <div className={styles.photoLabels}>
              <div className={styles.photoLabel}>Line A: Nose 1</div>
              <div className={styles.photoLabel}>Margin: Nse</div>
            </div>
          </div>
          <div className={styles.photoFooter}>
            <span>Camera: Finish Line Prime (10,000 FPS)</span>
            <div className={styles.photoControls}>
              <button className={styles.photoBtn}>🔍</button>
              <button className={styles.photoBtn}>➖</button>
              <button className={styles.photoBtn}>🌓</button>
            </div>
          </div>
        </div>

        {/* Right: Alerts & Telemetry */}
        <div className={styles.topRightCol}>
          {/* Active Inquiry */}
          <div className={styles.inquiryBox}>
            <div className={styles.inquiryTop}>
              <h2 className={styles.inquiryTitle}><span>⚠️</span> Active Inquiry</h2>
              <span className={styles.reviewReqBadge}>REVIEW REQUIRED</span>
            </div>
            <div className={styles.inquiryDesc}>
              Stewards inquiry regarding the start. Reviewing footage of the #4 horse breaking outward and impeding the #5 horse at the gate.
            </div>
            <div className={styles.inquiryActions}>
              <button className={styles.btnView}>📹 View Footage</button>
              <button className={styles.btnResolve}>Resolve Inquiry</button>
            </div>
          </div>

          {/* Race Telemetry */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Race Telemetry</h2>
            </div>
            <div className={styles.telemetryList}>
              <div className={styles.telemetryRow}>
                <span className={styles.telemetryLabel}>Winning Time</span>
                <span className={styles.telemetryValBold}>2:01.36</span>
              </div>
              <div className={styles.telemetryRow}>
                <span className={styles.telemetryLabel}>Fractions</span>
                <span className={styles.telemetryVal}>23.4, 47.1, 1:11.2, 1:38.0</span>
              </div>
              <div className={styles.telemetryRow}>
                <span className={styles.telemetryLabel}>Wind</span>
                <span className={styles.telemetryVal}>NW 12mph (Tailwind finish)</span>
              </div>
              <div className={styles.telemetryRow}>
                <span className={styles.telemetryLabel}>Track Bias</span>
                <span className={styles.telemetryVal}>Even</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Provisional Order of Finish */}
      <div className={styles.card}>
        <div className={styles.tableHeader}>
          <h2 className={styles.cardTitle}>Provisional Order of Finish</h2>
          <span className={styles.integrityPassed}>✓ Integrity Check Passed</span>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>RANK</th>
              <th>PGM</th>
              <th>HORSE NAME</th>
              <th>JOCKEY</th>
              <th>WEIGHT</th>
              <th>MARGIN</th>
              <th>ODDS</th>
            </tr>
          </thead>
          <tbody>
            {finishOrder.map(row => (
              <tr key={row.rank}>
                <td style={{fontWeight: 700}}>{row.rank}</td>
                <td>{row.pgm}</td>
                <td className={styles.horseNameTd}>{row.name}</td>
                <td>{row.jockey}</td>
                <td>{row.weight}</td>
                <td>{row.margin}</td>
                <td>{row.odds}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom Row */}
      <div className={styles.gridBottom}>
        {/* Official Stewards Report */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Official Stewards Reports</h2>
          </div>
          <div className={styles.reportArea}>
            <p className={styles.reportDesc}>These documents will be appended to the permanent race record.</p>
            
            {/* List existing reports */}
            {reports.length > 0 ? (
              reports.map(r => (
                <div key={r.id || r.reportId} style={{border: '1px solid #e2e8f0', borderRadius: '4px', padding: '12px', marginBottom: '12px'}}>
                  <div style={{fontWeight: 'bold'}}>{r.reportType} - {r.severityLevel}</div>
                  <div style={{margin: '8px 0'}}>{r.summary}</div>
                  {r.status !== 'SUBMITTED' && (
                    <Button onClick={() => handleSubmitReport(r.id || r.reportId)} variant="primary" style={{marginTop: '8px'}}>Submit Final</Button>
                  )}
                  {r.status === 'SUBMITTED' && <Badge variant="ghost" style={{background: '#dcfce3', color: '#16a34a'}}>Submitted ✓</Badge>}
                </div>
              ))
            ) : (
              <p>No reports found for this race.</p>
            )}

            {/* Create new report form */}
            <div style={{marginTop: '24px', borderTop: '1px dashed #cbd5e1', paddingTop: '16px'}}>
              <h3 style={{fontSize: '14px', marginBottom: '12px'}}>Create New Report</h3>
              <select 
                value={newReport.reportType} 
                onChange={e => setNewReport({...newReport, reportType: e.target.value})}
                style={{padding: '8px', marginBottom: '12px', width: '100%', borderRadius: '4px', border: '1px solid #cbd5e1'}}
              >
                <option value="GENERAL">General</option>
                <option value="INCIDENT">Incident</option>
                <option value="OBJECTION">Objection</option>
              </select>
              <textarea 
                className={styles.textarea}
                placeholder="Write report summary..."
                value={newReport.summary}
                onChange={e => setNewReport({...newReport, summary: e.target.value})}
              />
            </div>
          </div>
          <div className={styles.reportFooter}>
            <button className={styles.btnDraft} onClick={handleCreateReport}>Save Report</button>
          </div>
        </div>

        {/* Final Certification */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}><span>✍️</span> Final Certification</h2>
          </div>
          <div className={styles.reportArea}>
            <p className={styles.certDesc}>
              By affixing your digital signature below, you certify under penalty of perjury that the results, margins, and reports contained herein represent the true and official outcome of this event.
            </p>
            
            <div className={styles.pinGroup}>
              <span className={styles.pinLabel}>Chief Steward Signature (PIN)</span>
              <div className={styles.pinInputBox}>
                • • • •
              </div>
            </div>

            <div className={styles.checkboxGroup}>
              <input 
                type="checkbox" 
                className={styles.checkbox} 
                id="ackCheck"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <label htmlFor="ackCheck" className={styles.checkboxLabel}>
                I acknowledge that all pending inquiries have been resolved and the photofinish has been verified.
              </label>
            </div>

            <button 
              className={styles.btnCertify} 
              disabled={!agreed || certified}
              onClick={handleCertify}
            >
              ✓ {certified ? 'Results Certified' : 'Certify Official Results'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
