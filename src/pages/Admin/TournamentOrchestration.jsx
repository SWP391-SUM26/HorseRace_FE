import React, { useState, useEffect } from 'react';
import styles from './TournamentOrchestration.module.css';
import { getTournaments, createTournament, updateTournament } from '../../services/tournament';
import { getRaceList } from '../../services/race';

import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import { FilterIcon, PlusIcon, CalendarIcon, AlertTriangleIcon, MoreHorizontalIcon, XIcon, LayoutIcon } from '../../components/ui/Icons';

export default function TournamentOrchestration() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };
  
  // Builder form state
  const [formData, setFormData] = useState({
    tournamentCode: '',
    name: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    registrationOpenAt: '',
    registrationCloseAt: '',
    status: 'DRAFT'
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await getTournaments({ page: 0, size: 50 });
      const payload = response?.data ?? response;
      const items = Array.isArray(payload) ? payload : (payload?.content ?? payload?.items ?? []);

      if (items.length > 0) {
        const mapped = items.map(t => ({
          id: t.tournamentId || t.id,
          code: t.tournamentCode || t.id?.substring(0, 8),
          tournamentName: t.name,
          description: t.description || '',
          location: t.location || '',
          startDate: t.startDate,
          endDate: t.endDate,
          registrationOpenAt: t.registrationOpenAt,
          registrationCloseAt: t.registrationCloseAt,
          dateTime: t.startDate ? new Date(t.startDate).toLocaleDateString() : 'TBD',
          status: t.status || 'DRAFT'
        }));
        setTournaments(mapped);
      } else {
        setTournaments([]);
      }
    } catch (err) {
      console.error("Failed to fetch tournaments", err);
      setTournaments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleNewTournament = () => {
    setSelectedId(null);
    setFormData({
      tournamentCode: '',
      name: '',
      description: '',
      location: '',
      startDate: '',
      endDate: '',
      registrationOpenAt: '',
      registrationCloseAt: '',
      status: 'DRAFT'
    });
  };

  const handleSelect = (item) => {
    setSelectedId(item.id);
    setFormData({
      tournamentCode: item.code || '',
      name: item.tournamentName || '',
      description: item.description || '',
      location: item.location || '',
      startDate: item.startDate ? new Date(item.startDate).toISOString().slice(0, 16) : '',
      endDate: item.endDate ? new Date(item.endDate).toISOString().slice(0, 16) : '',
      registrationOpenAt: item.registrationOpenAt ? new Date(item.registrationOpenAt).toISOString().slice(0, 16) : '',
      registrationCloseAt: item.registrationCloseAt ? new Date(item.registrationCloseAt).toISOString().slice(0, 16) : '',
      status: item.status || 'DRAFT'
    });
  };

  const handleSave = async (overrideStatus) => {
    try {
      const finalStatus = overrideStatus || formData.status;
      const payload = {
        ...formData,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
        registrationOpenAt: formData.registrationOpenAt ? new Date(formData.registrationOpenAt).toISOString() : null,
        registrationCloseAt: formData.registrationCloseAt ? new Date(formData.registrationCloseAt).toISOString() : null,
        status: finalStatus
      };
      if (selectedId) {
        await updateTournament(selectedId, payload);
        showToast(`Tournament updated successfully!`, 'success');
      } else {
        await createTournament(payload);
        showToast(`Tournament ${finalStatus === 'DRAFT' ? 'saved as draft' : 'published'} successfully!`, 'success');
        handleNewTournament();
      }
      loadData();
    } catch (err) {
      showToast("Error saving tournament: " + (err.response?.data?.message || err.message), 'error');
    }
  };

  const tableColumns = ['CODE', 'TOURNAMENT', 'LOCATION', 'START DATE', 'STATUS'];

  return (
    <>
      <PageHeader 
        title="Tournament Orchestration" 
        subtitle="Manage global racing circuits, schedule events, and configure track details." 
        actions={
          <>
            <Button variant="ghost" icon={FilterIcon}>Filter View</Button>
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
                <tr 
                  key={item.id} 
                  className={styles.tableRow} 
                  style={{ borderBottom: '1px solid #e2e8f0', cursor: 'pointer', background: selectedId === item.id ? '#f1f5f9' : 'transparent' }}
                  onClick={() => handleSelect(item)}
                >
                  <td style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>{item.code}</td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>{item.tournamentName}</td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: '#64748b' }}>{item.location || 'Not Specified'}</td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: '#64748b' }}>{item.dateTime}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span className={`${styles.statusBadge} ${
                      item.status === 'PUBLISHED' ? styles.statusConfirmed :
                      item.status === 'ONGOING' ? styles.statusPending :
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
                <label className={styles.formLabel}>Tournament Code <span style={{color: 'red'}}>*</span></label>
                <input 
                  type="text" 
                  className={styles.formInput} 
                  placeholder="e.g. TRN-2026-01"
                  value={formData.tournamentCode}
                  onChange={e => setFormData({...formData, tournamentCode: e.target.value})}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Tournament Name <span style={{color: 'red'}}>*</span></label>
                <input 
                  type="text" 
                  className={styles.formInput} 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
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
                  <label className={styles.formLabel}>Status</label>
                  <select 
                    className={styles.formInput} 
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="REGISTRATION_OPEN">Reg. Open</option>
                    <option value="REGISTRATION_CLOSED">Reg. Closed</option>
                    <option value="ONGOING">Ongoing</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
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
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Reg. Open</label>
                  <input 
                    type="datetime-local" 
                    className={styles.formInput} 
                    value={formData.registrationOpenAt}
                    onChange={e => setFormData({...formData, registrationOpenAt: e.target.value})}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Reg. Close</label>
                  <input 
                    type="datetime-local" 
                    className={styles.formInput} 
                    value={formData.registrationCloseAt}
                    onChange={e => setFormData({...formData, registrationCloseAt: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className={styles.builderFooter}>
              {selectedId ? (
                <>
                  <button className={styles.btnSecondary} onClick={() => handleNewTournament()}>
                    Cancel Edit
                  </button>
                  <button className={styles.btnPrimary} onClick={() => handleSave()}>
                    Update Tournament
                  </button>
                </>
              ) : (
                <>
                  <button className={styles.btnSecondary} onClick={() => handleSave('DRAFT')}>
                    Save Draft
                  </button>
                  <button className={styles.btnPrimary} onClick={() => handleSave('PUBLISHED')}>
                    Publish
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {toast.show && (
        <div className={styles.toastOverlay}>
          <div className={styles.toastModal}>
            <div className={`${styles.toastIcon} ${styles[`toastIcon_${toast.type}`]}`}>
              {toast.type === "success" ? "✓" : "✕"}
            </div>
            <h3 className={styles.toastTitle}>
              {toast.type === "success" ? "Thành công" : "Thất bại"}
            </h3>
            <p className={styles.toastMessage}>{toast.message}</p>
            <button
              className={`${styles.toastButton} ${styles[`toastButton_${toast.type}`]}`}
              onClick={() => setToast({ ...toast, show: false })}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </>
  );
}


