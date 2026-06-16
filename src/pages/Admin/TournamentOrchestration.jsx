import React, { useState, useEffect } from 'react';
import styles from './TournamentOrchestration.module.css';
import { getTournaments, createTournament } from '../../services/tournament';

import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import PopupModal from '../../components/ui/PopupModal';
import { FilterIcon, PlusIcon, CalendarIcon, AlertTriangleIcon, MoreHorizontalIcon, XIcon, LayoutIcon } from '../../components/ui/Icons';

export default function TournamentOrchestration() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState({ isOpen: false, type: 'success', title: '', message1: '' });
  
  // Builder form state
  const [formData, setFormData] = useState({
    tournamentCode: '',
    name: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    registrationOpenAt: '',
    registrationCloseAt: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const rawData = await getTournaments();
      const tournamentList = rawData?.data || rawData;

      setTournaments(Array.isArray(tournamentList) ? tournamentList : []);
    } catch (err) {
      console.error("Failed to fetch tournaments:", err);
      setTournaments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatDateTime = (dtStr) => {
    if (!dtStr) return null;
    return new Date(dtStr).toISOString();
  };

  const preparePayload = (status) => ({
    ...formData,
    status,
    startDate: formatDateTime(formData.startDate),
    endDate: formatDateTime(formData.endDate),
    registrationOpenAt: formatDateTime(formData.registrationOpenAt),
    registrationCloseAt: formatDateTime(formData.registrationCloseAt),
  });

  const handleSaveDraft = async () => {
    try {
      if (!formData.name || !formData.tournamentCode) {
        setPopup({ isOpen: true, type: 'error', title: 'Error', message1: 'Name and Tournament Code are required!' });
        return;
      }
      await createTournament(preparePayload('DRAFT'));
      setPopup({ isOpen: true, type: 'success', title: 'Success!', message1: 'Draft saved successfully!' });
      loadData();
    } catch (err) {
      setPopup({ isOpen: true, type: 'error', title: 'Error', message1: err.response?.data?.message || err.message });
    }
  };

  const handlePublish = async () => {
    try {
      if (!formData.name || !formData.tournamentCode) {
        setPopup({ isOpen: true, type: 'error', title: 'Error', message1: 'Name and Tournament Code are required!' });
        return;
      }
      await createTournament(preparePayload('PUBLISHED'));
      setPopup({ isOpen: true, type: 'success', title: 'Success!', message1: 'Tournament published successfully!' });
      loadData();
    } catch (err) {
      setPopup({ isOpen: true, type: 'error', title: 'Error', message1: err.response?.data?.message || err.message });
    }
  };

  const handleNewTournament = () => {
    setFormData({
      tournamentCode: '',
      name: '',
      description: '',
      location: '',
      startDate: '',
      endDate: '',
      registrationOpenAt: '',
      registrationCloseAt: ''
    });
  };

  const handleFilterView = () => {
    alert("Filter view is not yet implemented.");
  };

  const tableColumns = ['TOURNAMENT CODE', 'NAME', 'LOCATION', 'START DATE', 'STATUS'];

  return (
    <>
      <PageHeader 
        title="Tournament Orchestration" 
        subtitle="Manage global racing circuits, schedule events, and configure track details." 
        actions={
          <>
            <Button variant="ghost" icon={FilterIcon} onClick={handleFilterView}>Filter View</Button>
            <Button icon={PlusIcon} onClick={handleNewTournament}>New Tournament</Button>
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
                  <td style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>{item.tournamentCode}</td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>{item.name}</td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: '#64748b' }}>{item.location}</td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: '#64748b' }}>
                    {item.startDate ? new Date(item.startDate).toLocaleString() : 'N/A'}
                  </td>
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
                <label className={styles.formLabel}>Tournament Code</label>
                <input 
                  type="text" 
                  className={styles.formInput} 
                  value={formData.tournamentCode}
                  onChange={e => setFormData({...formData, tournamentCode: e.target.value})}
                  placeholder="e.g. TRN-2023-A"
                />
              </div>

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
                <label className={styles.formLabel}>Description</label>
                <textarea 
                  className={styles.formInput} 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Location</label>
                <input 
                  type="text" 
                  className={styles.formInput} 
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Start Date</label>
                <input 
                  type="datetime-local" 
                  className={styles.formInput} 
                  value={formData.startDate}
                  onChange={e => setFormData({...formData, startDate: e.target.value})}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>End Date</label>
                <input 
                  type="datetime-local" 
                  className={styles.formInput} 
                  value={formData.endDate}
                  onChange={e => setFormData({...formData, endDate: e.target.value})}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Registration Open</label>
                <input 
                  type="datetime-local" 
                  className={styles.formInput} 
                  value={formData.registrationOpenAt}
                  onChange={e => setFormData({...formData, registrationOpenAt: e.target.value})}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Registration Close</label>
                <input 
                  type="datetime-local" 
                  className={styles.formInput} 
                  value={formData.registrationCloseAt}
                  onChange={e => setFormData({...formData, registrationCloseAt: e.target.value})}
                />
              </div>
            </div>

            <div className={styles.builderFooter}>
              <button className={styles.btnSecondary} onClick={handleSaveDraft}>Save Draft</button>
              <button className={styles.btnPrimary} onClick={handlePublish}>Publish</button>
            </div>
          </div>
        </div>
      </div>

      {popup.isOpen && (
        <PopupModal
          type={popup.type}
          title={popup.title}
          message1={popup.message1}
          buttonText="OK"
          onButtonClick={() => setPopup({ ...popup, isOpen: false })}
        />
      )}
    </>
  );
}

