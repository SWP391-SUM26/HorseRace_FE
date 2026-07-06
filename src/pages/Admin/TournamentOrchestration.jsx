import React, { useRef, useState, useEffect } from 'react';
import styles from './TournamentOrchestration.module.css';
import { getTournaments, createTournament, updateTournament, getTournamentById, uploadTournamentImage } from '../../services/tournament';
import { getRaceList } from '../../services/race';

import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import { PlusIcon, CalendarIcon, AlertTriangleIcon, MoreHorizontalIcon, LayoutIcon } from '../../components/ui/Icons';

export default function TournamentOrchestration() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const builderRef = useRef(null);
  const codeInputRef = useRef(null);

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
    status: 'DRAFT',
    imageUrl: ''
  });
  const [coverImage, setCoverImage] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = { page, size: 50 };
      if (search) params.name = search;
      if (statusFilter) params.status = statusFilter;

      const response = await getTournaments(params);
      const payload = response?.data ?? response;
      const items = Array.isArray(payload) ? payload : (payload?.content ?? payload?.items ?? []);

      if (payload?.totalPages) setTotalPages(payload.totalPages);

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
  }, [page, statusFilter]);

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
    builderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => codeInputRef.current?.focus(), 250);
  };

  const handleSelect = async (item) => {
    try {
      const detail = await getTournamentById(item.id);
      const detailData = detail?.data ?? detail;

      setSelectedId(detailData.tournamentId || detailData.id);
      setFormData({
        tournamentCode: detailData.tournamentCode || '',
        name: detailData.name || '',
        description: detailData.description || '',
        location: detailData.location || '',
        startDate: detailData.startDate ? new Date(detailData.startDate).toISOString().slice(0, 16) : '',
        endDate: detailData.endDate ? new Date(detailData.endDate).toISOString().slice(0, 16) : '',
        registrationOpenAt: detailData.registrationOpenAt ? new Date(detailData.registrationOpenAt).toISOString().slice(0, 16) : '',
        registrationCloseAt: detailData.registrationCloseAt ? new Date(detailData.registrationCloseAt).toISOString().slice(0, 16) : '',
        status: detailData.status || 'DRAFT',
        imageUrl: detailData.imageUrl || ''
      });
      setCoverImage(null);
    } catch (err) {
      showToast("Error loading tournament details", "error");
    }
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
        if (coverImage) {
          await uploadTournamentImage(selectedId, coverImage);
        }
        showToast(`Tournament updated successfully!`, 'success');
      } else {
        const res = await createTournament(payload);
        const newId = res?.data?.id || res?.id;
        if (coverImage && newId) {
          await uploadTournamentImage(newId, coverImage);
        }
        showToast(`Tournament ${finalStatus === 'DRAFT' ? 'saved as draft' : 'published'} successfully!`, 'success');
        handleNewTournament();
      }
      setCoverImage(null);
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
          <Button icon={PlusIcon} onClick={handleNewTournament}>New Tournament</Button>
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
                  <span><strong style={{ color: '#0f172a' }}>Belmont:</strong> Heavy Rain Expected</span>
                </li>
                <li className={styles.alertItem}>
                  <div className={`${styles.alertDot} ${styles.alertDotGray}`}></div>
                  <span><strong style={{ color: '#0f172a' }}>Churchill Downs:</strong> Clear</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Master Schedule Table */}
          <div className={styles.widgetCard} style={{ padding: 0 }}>
            <div className={styles.builderHeader}>
              <h3 className={styles.builderTitle}>Master Schedule</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  value={statusFilter}
                  onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
                  style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                >
                  <option value="">All Statuses</option>
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="REGISTRATION_OPEN">Reg. Open</option>
                  <option value="ONGOING">Ongoing</option>
                </select>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && loadData()}
                  placeholder="Search..."
                  style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '13px', width: '120px' }}
                />
                <button onClick={() => { setPage(0); loadData(); }} style={{ background: '#f1f5f9', border: 'none', color: '#022c22', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px', fontSize: '13px', fontWeight: '500' }}>Search</button>
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
                    <span className={`${styles.statusBadge} ${item.status === 'PUBLISHED' ? styles.statusConfirmed :
                        item.status === 'ONGOING' ? styles.statusPending :
                          styles.statusDraft
                      }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              )}
            />
            <div style={{ padding: '12px', textAlign: 'center', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button
                disabled={page === 0}
                onClick={() => setPage(p => Math.max(0, p - 1))}
                style={{ background: '#f1f5f9', border: 'none', color: page === 0 ? '#cbd5e1' : '#022c22', fontSize: '13px', fontWeight: '600', cursor: page === 0 ? 'not-allowed' : 'pointer', padding: '4px 12px', borderRadius: '4px' }}
              >
                Prev
              </button>
              <span style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center' }}>
                Page {page + 1} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                style={{ background: '#f1f5f9', border: 'none', color: page >= totalPages - 1 ? '#cbd5e1' : '#022c22', fontSize: '13px', fontWeight: '600', cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer', padding: '4px 12px', borderRadius: '4px' }}
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Tournament Builder */}
        <div className={styles.sidebar} ref={builderRef}>
          <div className={styles.builderCard}>
            <div className={styles.builderHeader}>
              <h3 className={styles.builderTitle}>Tournament Builder</h3>
              <button style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><LayoutIcon /></button>
            </div>

            <div className={styles.builderBody}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Tournament Code <span style={{ color: 'red' }}>*</span></label>
                <input
                  ref={codeInputRef}
                  type="text"
                  className={styles.formInput}
                  placeholder="e.g. TRN-2026-01"
                  value={formData.tournamentCode}
                  onChange={e => setFormData({ ...formData, tournamentCode: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Tournament Name <span style={{ color: 'red' }}>*</span></label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Cover Image</label>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', background: '#f1f5f9', border: '1px solid #e2e8f0', flexShrink: 0 }}>
                    {coverImage ? (
                      <img src={URL.createObjectURL(coverImage)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onLoad={() => URL.revokeObjectURL(coverImage)} />
                    ) : formData.imageUrl ? (
                      <img src={formData.imageUrl.startsWith('http') ? formData.imageUrl : `http://localhost:8080${formData.imageUrl}`} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ display: 'flex', height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#94a3b8' }}>No image</div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <input 
                      type="file" 
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      onChange={(e) => setCoverImage(e.target.files?.[0])}
                      style={{ fontSize: '13px', color: '#64748b' }}
                    />
                    <p style={{ marginTop: '4px', fontSize: '12px', color: '#94a3b8' }}>
                      {selectedId ? 'Uploads immediately (PNG/JPG/WebP/GIF, ≤5MB).' : 'Uploads after the tournament is created.'}
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Location</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Status</label>
                  <select
                    className={styles.formInput}
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
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
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>End Date</label>
                  <input
                    type="datetime-local"
                    className={styles.formInput}
                    value={formData.endDate}
                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
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
                    onChange={e => setFormData({ ...formData, registrationOpenAt: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Reg. Close</label>
                  <input
                    type="datetime-local"
                    className={styles.formInput}
                    value={formData.registrationCloseAt}
                    onChange={e => setFormData({ ...formData, registrationCloseAt: e.target.value })}
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


