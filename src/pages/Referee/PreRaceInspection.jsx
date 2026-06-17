import { useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import { Card } from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import { CheckCircleIcon, AlertCircleIcon, FileTextIcon, HeartIcon } from '../../components/ui/Icons';
import styles from './PreRaceInspection.module.css';

// Mock Data
const MOCK_ROSTER = [
  {
    id: 1,
    gate: 1,
    horseName: 'Midnight Thunder',
    jockeyName: 'L. Saez',
    healthCert: 'valid', // valid, invalid, missing
    weightStatus: 'verified', // verified, pending
    cleared: true,
    microchip: '981020012345678',
    ageSex: '4yo Colt',
    trainer: 'T. Pletcher',
    owner: 'Starlight Racing',
    coggins: { status: 'Negative', verifiedAt: 'Oct 12, 2023', verifiedBy: 'Dr. Smith' },
    weight: { value: '1,150 lbs', verifiedAt: 'Today 10:15 AM' },
    exam: { status: 'Passed', verifiedAt: 'Today 11:30 AM' }
  },
  {
    id: 2,
    gate: 2,
    horseName: 'Crimson Glory',
    jockeyName: 'I. Ortiz Jr.',
    healthCert: 'invalid',
    weightStatus: 'pending',
    cleared: false,
    microchip: '981020098765432',
    ageSex: '3yo Filly',
    trainer: 'C. Brown',
    owner: 'Arlington Stables',
    coggins: { status: 'Missing', verifiedAt: '-', verifiedBy: '-' },
    weight: { value: 'Pending', verifiedAt: '-' },
    exam: { status: 'Pending', verifiedAt: '-' }
  },
  {
    id: 3,
    gate: 3,
    horseName: 'Silver Shadow',
    jockeyName: 'J. Rosario',
    healthCert: 'valid',
    weightStatus: 'verified',
    cleared: false,
    microchip: '981020055554444',
    ageSex: '5yo Gelding',
    trainer: 'B. Baffert',
    owner: 'Vanguard Racing',
    coggins: { status: 'Negative', verifiedAt: 'Nov 01, 2023', verifiedBy: 'Dr. Jones' },
    weight: { value: '1,200 lbs', verifiedAt: 'Today 09:45 AM' },
    exam: { status: 'Passed', verifiedAt: 'Today 10:30 AM' }
  }
];

export default function PreRaceInspection() {
  const [roster, setRoster] = useState(MOCK_ROSTER);
  const [selectedId, setSelectedId] = useState(1);
  const [notes, setNotes] = useState('');

  const selectedHorse = roster.find(h => h.id === selectedId);

  const handleToggleClear = (id) => {
    setRoster(current => 
      current.map(h => h.id === id ? { ...h, cleared: !h.cleared } : h)
    );
  };

  const renderHealthIcon = (status) => {
    if (status === 'valid') return <CheckCircleIcon className={styles.iconSuccess} size={20} fill="currentColor" stroke="white" />;
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
        subtitle="Belmont Park - Race 4 • 14:30 EST"
        actions={
          <>
            <Button variant="outline">Print Roster</Button>
            <Button variant="primary">Submit All Clearances</Button>
          </>
        }
      />

      <div className={styles.inspectionLayout}>
        {/* Left: Inspection Roster */}
        <Card className={styles.rosterCard} style={{ padding: 0 }}>
          <div className={styles.rosterHeader}>
            <h2 className={styles.rosterTitle}>Inspection Roster</h2>
            <Badge variant="ghost" style={{background: '#e2e8f0', color: '#475569'}}>{roster.length} ENTRIES</Badge>
          </div>
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
                {roster.map(horse => (
                  <tr 
                    key={horse.id} 
                    className={selectedId === horse.id ? styles.selectedRow : ''}
                    onClick={() => setSelectedId(horse.id)}
                  >
                    <td>
                      <div className={styles.gateCircle}>{horse.gate}</div>
                    </td>
                    <td>
                      <div className={styles.horseName}>{horse.horseName}</div>
                      <div className={styles.jockeyName}>J: {horse.jockeyName}</div>
                    </td>
                    <td align="center">
                      {renderHealthIcon(horse.healthCert)}
                    </td>
                    <td align="center">
                      {renderWeightIcon(horse.weightStatus)}
                    </td>
                    <td align="center">
                      <input 
                        type="checkbox" 
                        className={styles.clearCheckbox} 
                        checked={horse.cleared}
                        onChange={() => handleToggleClear(horse.id)}
                        onClick={e => e.stopPropagation()}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Right: Details Panel */}
        {selectedHorse && (
          <Card className={styles.detailsCard} style={{ padding: 0 }}>
            <div className={styles.detailsHeader}>
              <div>
                <h2 className={styles.detailsHorseName}>{selectedHorse.horseName}</h2>
                <Badge variant="ghost" style={{background: '#e0f2fe', color: '#0369a1', marginTop: '4px'}}>
                  GATE {selectedHorse.gate}
                </Badge>
              </div>
              <button className={styles.btnMenu}>⋮</button>
            </div>

            <div className={styles.detailsBody}>
              <h3 className={styles.sectionTitle}>DIGITAL PASSPORT</h3>
              <div className={styles.passportGrid}>
                <div>
                  <div className={styles.infoLabel}>Microchip ID</div>
                  <div className={styles.infoVal}>{selectedHorse.microchip}</div>
                </div>
                <div>
                  <div className={styles.infoLabel}>Age/Sex</div>
                  <div className={styles.infoVal}>{selectedHorse.ageSex}</div>
                </div>
                <div>
                  <div className={styles.infoLabel}>Trainer</div>
                  <div className={styles.infoVal}>{selectedHorse.trainer}</div>
                </div>
                <div>
                  <div className={styles.infoLabel}>Owner</div>
                  <div className={styles.infoVal}>{selectedHorse.owner}</div>
                </div>
              </div>

              <h3 className={styles.sectionTitle} style={{marginTop: '24px'}}>VET CLEARANCE</h3>
              <div className={styles.vetList}>
                <div className={styles.vetItem}>
                  <FileTextIcon className={styles.vetIcon} size={20} />
                  <div>
                    <div className={styles.vetTitle}>Coggins Test - {selectedHorse.coggins.status}</div>
                    <div className={styles.vetSub}>Verified: {selectedHorse.coggins.verifiedAt} - {selectedHorse.coggins.verifiedBy}</div>
                  </div>
                </div>
                <div className={styles.vetItem}>
                  <div className={styles.vetIconBox}>W</div>
                  <div>
                    <div className={styles.vetTitle}>Weight Verified: {selectedHorse.weight.value}</div>
                    <div className={styles.vetSub}>Verified: {selectedHorse.weight.verifiedAt}</div>
                  </div>
                </div>
                <div className={styles.vetItem}>
                  <HeartIcon className={styles.vetIcon} size={20} fill="#0f4a36" />
                  <div>
                    <div className={styles.vetTitle}>Pre-Race Exam - {selectedHorse.exam.status}</div>
                    <div className={styles.vetSub}>Verified: {selectedHorse.exam.verifiedAt}</div>
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
              <button className={styles.btnFlagReview}>Flag for Review</button>
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
