import { useState, useEffect } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import { Card } from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import { CheckCircleIcon, AlertCircleIcon, FileTextIcon, HeartIcon } from '../../components/ui/Icons';
import styles from './PreRaceInspection.module.css';
import { recordHealthCheck } from '../../services/referee';
import { getRaceList, getRaceEntries } from '../../services/race';
import { getHorseDetail } from '../../services/horse';

export default function PreRaceInspection() {
  const [races, setRaces] = useState([]);
  const [selectedRace, setSelectedRace] = useState(null);
  const [entries, setEntries] = useState([]);
  const [horses, setHorses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedId, setSelectedId] = useState(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchRaces = async () => {
      try {
        setLoading(true);
        const res = await getRaceList({ status: 'SCHEDULED', size: 10 });
        const fetchedRaces = res?.items || [];
        setRaces(fetchedRaces);
        if (fetchedRaces.length > 0) {
          setSelectedRace(fetchedRaces[0]);
        }
      } catch (err) {
        setError('Failed to load upcoming races.');
      } finally {
        setLoading(false);
      }
    };
    fetchRaces();
  }, []);

  useEffect(() => {
    if (!selectedRace) return;
    const fetchEntries = async () => {
      try {
        setLoading(true);
        setError('');
        const raceId = selectedRace.id || selectedRace.raceId;
        const data = await getRaceEntries(raceId);
        const entriesList = Array.isArray(data) ? data : (data?.content || []);
        
        // Add a local "cleared" state to entries for the UI toggle
        const entriesWithUIState = entriesList.map(e => ({ ...e, cleared: false }));
        setEntries(entriesWithUIState);

        const horseMap = {};
        for (const entry of entriesWithUIState) {
          try {
            const horseId = entry.horseId || entry.registration?.horse?.id || entry.registrationId;
            if (horseId) {
              const horseDetail = await getHorseDetail(horseId);
              horseMap[entry.id || entry.entryId] = horseDetail;
            }
          } catch (e) {
            console.error("Failed to load horse detail for entry", entry);
          }
        }
        setHorses(horseMap);
        if (entriesWithUIState.length > 0) {
          setSelectedId(entriesWithUIState[0].id || entriesWithUIState[0].entryId);
        } else {
          setSelectedId(null);
        }
        setNotes('');
      } catch (err) {
        if (err.message?.includes('prize_earned')) {
          setError('Database Error: Column "prize_earned" is missing in "race_entry". Please run ALTER TABLE in pgAdmin.');
        } else {
          setError('Failed to load race entries.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchEntries();
  }, [selectedRace]);

  const selectedEntry = entries.find(e => (e.id || e.entryId) === selectedId);
  const selectedHorseDetails = selectedEntry ? horses[selectedEntry.id || selectedEntry.entryId] : null;

  const handleToggleClear = (id) => {
    setEntries(current => 
      current.map(e => (e.id || e.entryId) === id ? { ...e, cleared: !e.cleared } : e)
    );
  };

  const handleHealthCheck = async (status) => {
    try {
      if (!selectedEntry) return;
      const horseId = selectedEntry.horseId || selectedEntry.registration?.horse?.id || selectedEntry.registrationId;
      if (!horseId) {
        alert('Cannot find Horse ID for this entry');
        return;
      }
      
      await recordHealthCheck(horseId, {
        healthStatus: status,
        note: notes
      });
      alert(`Successfully marked horse as ${status}`);
      
      // Update local UI
      setNotes('');
    } catch (error) {
      alert(error.message || 'Failed to update health status');
    }
  };

  const renderHealthIcon = (status) => {
    if (status === 'HEALTHY' || status === 'valid') return <CheckCircleIcon className={styles.iconSuccess} size={20} fill="currentColor" stroke="white" />;
    return <AlertCircleIcon className={styles.iconDanger} size={20} fill="currentColor" stroke="white" />;
  };

  const renderWeightIcon = (status) => {
    if (status === 'verified') return <CheckCircleIcon className={styles.iconSuccess} size={20} fill="currentColor" stroke="white" />;
    return <div className={styles.iconPending}>•••</div>;
  };

  return (
    <>
      <PageHeader
        title="Pre-Race Inspection"
        subtitle={selectedRace ? `${selectedRace.name || selectedRace.raceCode} • ${selectedRace.scheduledStartAt?.slice(0, 16).replace('T', ' ')}` : "Loading..."}
        actions={
          <>
            <Button variant="outline">Print Roster</Button>
            <Button variant="primary">Submit All Clearances</Button>
          </>
        }
      />

      {error && (
        <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #f87171', borderRadius: '8px' }}>
          {error}
        </div>
      )}

      {/* Race Selector */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '24px', paddingBottom: '8px' }}>
        {races.map((race) => {
          const raceId = race.id || race.raceId;
          const selectedId = selectedRace?.id || selectedRace?.raceId;
          const isSelected = selectedId === raceId;
          return (
          <button 
            key={raceId}
            onClick={() => setSelectedRace(race)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '14px',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              border: isSelected ? 'none' : '1px solid #e2e8f0',
              backgroundColor: isSelected ? '#0b3b24' : '#fff',
              color: isSelected ? '#fff' : '#334155'
            }}
          >
            {race.name || race.raceCode}
          </button>
        )})}
      </div>

      <div className={styles.inspectionLayout}>
        {/* Left: Inspection Roster */}
        <Card className={styles.rosterCard} style={{ padding: 0 }}>
          <div className={styles.rosterHeader}>
            <h2 className={styles.rosterTitle}>Inspection Roster</h2>
            <Badge variant="ghost" style={{background: '#e2e8f0', color: '#475569'}}>{entries.length} ENTRIES</Badge>
          </div>
          
          {loading ? (
             <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>Loading entries...</div>
          ) : entries.length === 0 ? (
             <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>No entries found for this race.</div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.rosterTable}>
                <thead>
                  <tr>
                    <th>Gate</th>
                    <th>Horse / Jockey</th>
                    <th style={{textAlign: 'center'}}>Health Cert</th>
                    <th style={{textAlign: 'center'}}>Weight</th>
                    <th style={{textAlign: 'center'}}>Cleared</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, idx) => {
                    const entryId = entry.id || entry.entryId;
                    const horseInfo = horses[entryId] || {};
                    const horseName = horseInfo.name || entry.horseName || `Horse #${idx+1}`;
                    const jockeyName = entry.jockeyName || 'TBA';
                    const gate = entry.laneNo || entry.entryNo || idx+1;
                    
                    return (
                      <tr 
                        key={entryId} 
                        className={selectedId === entryId ? styles.selectedRow : ''}
                        onClick={() => setSelectedId(entryId)}
                      >
                        <td>
                          <div className={styles.gateCircle}>{gate}</div>
                        </td>
                        <td>
                          <div className={styles.horseName}>{horseName}</div>
                          <div className={styles.jockeyName}>J: {jockeyName}</div>
                        </td>
                        <td align="center">
                          {renderHealthIcon(horseInfo.healthStatus || 'valid')}
                        </td>
                        <td align="center">
                          {renderWeightIcon('verified')}
                        </td>
                        <td align="center">
                          <input 
                            type="checkbox" 
                            className={styles.clearCheckbox} 
                            checked={entry.cleared}
                            onChange={() => handleToggleClear(entryId)}
                            onClick={e => e.stopPropagation()}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Right: Details Panel */}
        {selectedEntry && selectedHorseDetails && (
          <Card className={styles.detailsCard} style={{ padding: 0 }}>
            <div className={styles.detailsHeader}>
              <div>
                <h2 className={styles.detailsHorseName}>{selectedHorseDetails.name || selectedEntry.horseName}</h2>
                <Badge variant="ghost" style={{background: '#e0f2fe', color: '#0369a1', marginTop: '4px'}}>
                  GATE {selectedEntry.laneNo || selectedEntry.entryNo || '-'}
                </Badge>
              </div>
              <button className={styles.btnMenu}>⋮</button>
            </div>

            <div className={styles.detailsBody}>
              <h3 className={styles.sectionTitle}>DIGITAL PASSPORT</h3>
              <div className={styles.passportGrid}>
                <div>
                  <div className={styles.infoLabel}>Microchip ID</div>
                  <div className={styles.infoVal}>{selectedHorseDetails.microchipNo || 'Pending'}</div>
                </div>
                <div>
                  <div className={styles.infoLabel}>Age/Sex</div>
                  <div className={styles.infoVal}>{selectedHorseDetails.gender || 'Unknown'}</div>
                </div>
                <div>
                  <div className={styles.infoLabel}>Trainer</div>
                  <div className={styles.infoVal}>{selectedHorseDetails.trainerName || 'Unknown'}</div>
                </div>
                <div>
                  <div className={styles.infoLabel}>Owner</div>
                  <div className={styles.infoVal}>{selectedHorseDetails.ownerName || 'Unknown'}</div>
                </div>
              </div>

              <h3 className={styles.sectionTitle} style={{marginTop: '24px'}}>VET CLEARANCE</h3>
              <div className={styles.vetList}>
                <div className={styles.vetItem}>
                  <FileTextIcon className={styles.vetIcon} size={20} />
                  <div>
                    <div className={styles.vetTitle}>Coggins Test - Negative</div>
                    <div className={styles.vetSub}>Verified: Recently</div>
                  </div>
                </div>
                <div className={styles.vetItem}>
                  <div className={styles.vetIconBox}>W</div>
                  <div>
                    <div className={styles.vetTitle}>Weight: {selectedHorseDetails.weight || 'Pending'} lbs</div>
                    <div className={styles.vetSub}>Verified: API Default</div>
                  </div>
                </div>
                <div className={styles.vetItem}>
                  <HeartIcon className={styles.vetIcon} size={20} fill="#0f4a36" />
                  <div>
                    <div className={styles.vetTitle}>Health Status - {selectedHorseDetails.healthStatus || 'HEALTHY'}</div>
                    <div className={styles.vetSub}>Verified: Recently</div>
                  </div>
                </div>
              </div>

              <h3 className={styles.sectionTitle} style={{marginTop: '24px'}}>STEWARD NOTES</h3>
              <textarea 
                className={styles.notesArea}
                placeholder="Add inspection notes here..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>

            <div className={styles.detailsFooter}>
              <Button variant="outline" onClick={() => handleHealthCheck('HEALTHY')}>Mark Healthy</Button>
              <Button variant="outline" onClick={() => handleHealthCheck('INJURED')} style={{borderColor: '#dc2626', color: '#dc2626'}}>Mark Injured</Button>
              <Button variant="outline" onClick={() => handleHealthCheck('UNFIT')} style={{borderColor: '#ea580c', color: '#ea580c'}}>Mark Unfit</Button>
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
