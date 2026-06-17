import React, { useState, useEffect } from 'react';
import styles from './TournamentOrchestration.module.css';
import { getTournaments, createTournament } from '../../services/tournament';

import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import { FilterIcon, PlusIcon, CalendarIcon, AlertTriangleIcon, MoreHorizontalIcon, XIcon, LayoutIcon } from '../../components/ui/Icons';

export default function TournamentOrchestration() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Builder form state
  const [formData, setFormData] = useState({
    name: 'Dubai World Cup Draft',
    tier: 'Group 1 (Elite)',
    eligibility: {
      thoroughbreds: true,
      age3Plus: true,
      previousWin: false,
    },
    track: 'Meydan Racecourse'
  });

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const rawData = await getTournaments();
        // Giả sử backend trả về dạng { data: [...] } hoặc trả thẳng mảng
        const tournamentList = rawData?.data || rawData;

        if (Array.isArray(tournamentList) && tournamentList.length > 0) {
          setTournaments(tournamentList);
        } else {
          setTournaments(mockTournaments);
        }
      } catch (err) {
        console.error("Failed to fetch tournaments, using mock data", err);
        setTournaments(mockTournaments);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSaveDraft = async () => {
    try {
      // await createTournament({ ...formData, status: 'DRAFT' });
      alert("Draft saved successfully!");
    } catch (err) {
      alert("Error saving draft");
    }
  };

  const handlePublish = async () => {
    try {
      // await createTournament({ ...formData, status: 'PENDING ENTRIES' });
      alert("Tournament published successfully!");
    } catch (err) {
      alert("Error publishing tournament");
    }
  };

  const tableColumns = ['RACE ID', 'TOURNAMENT', 'LOCATION', 'DATE & TIME', 'STATUS'];

  return (
    <>
      <PageHeader 
        title="Tournament Orchestration" 
        subtitle="Manage global racing circuits, schedule events, and configure track details." 
        actions={
          <>
            <Button variant="ghost" icon={FilterIcon}>Filter View</Button>
            <Button icon={PlusIcon}>New Tournament</Button>
          </>
        }
      />

      <div className={styles.container}>
        {/* Left Column: Main Dashboard & Schedule */}
        <div className={styles.mainContent}>
          
          {/* Active Feature Card */}
          <div className={styles.featureCard}>
            <div className={styles.featureCardBg}></div>
            <div className={styles.featureCardOverlay}></div>
            <div className={styles.featureCardContent}>
              <div className={styles.featureHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className={styles.featureBadge}>ACTIVE</span>
                  <span style={{ fontSize: '14px', color: '#cbd5e1' }}>Global Circuit A</span>
                </div>
                <button style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                  <MoreHorizontalIcon />
                </button>
              </div>
              
              <div style={{ marginTop: '16px' }}>
                <h2 className={styles.featureTitle}>The Royal Ascot Invitational</h2>
              </div>
              
              <div className={styles.featureStats}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Total Purse</span>
                  <span className={styles.statValue}>$2,500,000</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Registered Entries</span>
                  <span className={styles.statValue}>144 <span style={{ fontSize: '14px', color: '#cbd5e1', fontWeight: 'normal' }}>/ 150</span></span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Next Race</span>
                  <span className={styles.statValue}>Oct 14 <span className={styles.statHighlight} style={{ fontSize: '14px', fontWeight: 'bold' }}>14:00</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* Widgets Grid */}
          <div className={styles.widgetsGrid}>
            <div className={styles.widgetCard}>
              <div className={styles.widgetHeader}>
                <span className={styles.widgetTitle}>Upcoming Qualifiers</span>
                <CalendarIcon className={styles.widgetIcon} />
              </div>
              <div className={styles.widgetBigValue}>12</div>
              <div className={styles.widgetSubValue}>Scheduled in next 7 days</div>
            </div>
            
            <div className={styles.widgetCard}>
              <div className={styles.widgetHeader}>
                <span className={styles.widgetTitle}>Track Alerts</span>
                <AlertTriangleIcon className={`${styles.widgetIcon} ${styles.alertIcon}`} />
              </div>
              <ul className={styles.alertList}>
                <li className={styles.alertItem}>
                  <div className={`${styles.alertDot} ${styles.alertDotRed}`}></div>
                  <span><strong style={{color: '#0f172a'}}>Belmont:</strong> Heavy Rain Expected</span>
                </li>
                <li className={styles.alertItem}>
                  <div className={`${styles.alertDot} ${styles.alertDotGray}`}></div>
                  <span><strong style={{color: '#0f172a'}}>Churchill Downs:</strong> Clear</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Master Schedule Table */}
          <div className={styles.widgetCard} style={{ padding: 0 }}>
            <div className={styles.builderHeader}>
              <h3 className={styles.builderTitle}>Master Schedule</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                 <button style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><LayoutIcon /></button>
                 <button style={{ background: '#f1f5f9', border: 'none', color: '#022c22', cursor: 'pointer', padding: '4px', borderRadius: '4px' }}><LayoutIcon /></button>
              </div>
            </div>
            <DataTable 
              columns={tableColumns}
              data={tournaments}
              loading={loading}
              totalItems={tournaments.length}
              renderRow={(item) => (
                <tr key={item.id} className={styles.tableRow} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>{item.raceId}</td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>{item.tournamentName}</td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: '#64748b' }}>{item.location}</td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: '#64748b' }}>{item.dateTime}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span className={`${styles.statusBadge} ${
                      item.status === 'CONFIRMED' ? styles.statusConfirmed :
                      item.status === 'PENDING ENTRIES' ? styles.statusPending :
                      styles.statusDraft
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              )}
            />
            <div style={{ padding: '12px', textAlign: 'center', borderTop: '1px solid #e2e8f0' }}>
              <button style={{ background: 'none', border: 'none', color: '#022c22', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                View Full Schedule
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Tournament Builder */}
        <div className={styles.sidebar}>
          <div className={styles.builderCard}>
            <div className={styles.builderHeader}>
              <h3 className={styles.builderTitle}>Tournament Builder</h3>
              <button style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><LayoutIcon /></button>
            </div>
            
            <div className={styles.builderBody}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Tournament Name</label>
                <input 
                  type="text" 
                  className={styles.formInput} 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Circuit Tier</label>
                <select 
                  className={styles.formSelect}
                  value={formData.tier}
                  onChange={e => setFormData({...formData, tier: e.target.value})}
                >
                  <option>Group 1 (Elite)</option>
                  <option>Group 2</option>
                  <option>Group 3</option>
                </select>
              </div>

              <div className={styles.criteriaBox}>
                <div className={styles.criteriaTitle}>Eligibility Criteria</div>
                <div className={styles.checkboxList}>
                  <label className={styles.checkboxItem}>
                    <input 
                      type="checkbox" 
                      className={styles.checkboxInput} 
                      checked={formData.eligibility.thoroughbreds}
                      onChange={e => setFormData({
                        ...formData, 
                        eligibility: {...formData.eligibility, thoroughbreds: e.target.checked}
                      })}
                    />
                    Thoroughbreds Only
                  </label>
                  <label className={styles.checkboxItem}>
                    <input 
                      type="checkbox" 
                      className={styles.checkboxInput} 
                      checked={formData.eligibility.age3Plus}
                      onChange={e => setFormData({
                        ...formData, 
                        eligibility: {...formData.eligibility, age3Plus: e.target.checked}
                      })}
                    />
                    Age 3+ Years
                  </label>
                  <label className={styles.checkboxItem}>
                    <input 
                      type="checkbox" 
                      className={styles.checkboxInput} 
                      checked={formData.eligibility.previousWin}
                      onChange={e => setFormData({
                        ...formData, 
                        eligibility: {...formData.eligibility, previousWin: e.target.checked}
                      })}
                    />
                    Requires Previous Group Win
                  </label>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Track Selection</label>
                {formData.track ? (
                  <div className={styles.trackBox}>
                    <div className={styles.trackInfo}>
                      <LayoutIcon style={{ color: '#64748b', width: 16, height: 16 }} />
                      {formData.track}
                    </div>
                    <button className={styles.removeTrack} onClick={() => setFormData({...formData, track: ''})}>
                      <XIcon />
                    </button>
                  </div>
                ) : null}
                <button className={styles.addTrackBtn}>
                  <PlusIcon style={{ width: 14, height: 14 }} /> Add Track
                </button>
              </div>
            </div>

            <div className={styles.builderFooter}>
              <button className={styles.btnSecondary} onClick={handleSaveDraft}>Save Draft</button>
              <button className={styles.btnPrimary} onClick={handlePublish}>Publish</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Mock Data
const mockTournaments = [
  { id: 1, raceId: 'RC-2049', tournamentName: 'Royal Ascot Inv. - R1', location: 'Ascot, UK (Turf)', dateTime: 'Oct 14, 2023 - 14:00', status: 'CONFIRMED' },
  { id: 2, raceId: 'RC-2050', tournamentName: 'Royal Ascot Inv. - R2', location: 'Ascot, UK (Turf)', dateTime: 'Oct 15, 2023 - 15:30', status: 'PENDING ENTRIES' },
  { id: 3, raceId: 'RC-2051', tournamentName: 'Dubai Draft - Qualifiers', location: 'Meydan, UAE (Dirt)', dateTime: 'Nov 02, 2023 - 18:00', status: 'DRAFT' },
];
