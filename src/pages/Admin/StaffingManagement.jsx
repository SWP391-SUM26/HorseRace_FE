import React, { useState } from 'react';
import styles from './StaffingManagement.module.css';

// Reuse UI components
import PageHeader from '../../components/ui/PageHeader';
import StatCard, { Card } from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import {
  UserPlusIcon,
  CalendarIcon,
  CheckSquareIcon,
  AlertTriangleIcon,
  UsersIcon,
  SearchIcon,
  FilterIcon,
  LayoutIcon,
  TrophyIcon,
  BarChartIcon
} from '../../components/ui/Icons';

export default function StaffingManagement() {
  const [search, setSearch] = useState("");
  const [raceStatus, setRaceStatus] = useState("All Races");
  const [assignmentStatus, setAssignmentStatus] = useState("All Statuses");

  const mockData = [
    {
      id: "RACE-2026-042",
      name: "Spring Championship",
      icon: LayoutIcon,
      date: "24 Jun 2026",
      time: "14:00 GMT",
      referee: {
        name: "John Smith",
        avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d"
      },
      status: "Assigned"
    },
    {
      id: "RACE-2026-088",
      name: "Elite Derby Cup",
      icon: TrophyIcon,
      date: "28 Jun 2026",
      time: "16:30 GMT",
      referee: null,
      status: "Unassigned"
    },
    {
      id: "RACE-2026-112",
      name: "Golden Track Race",
      icon: BarChartIcon,
      date: "02 Jul 2026",
      time: "13:15 GMT",
      referee: {
        name: "Michael Brown",
        avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704e"
      },
      status: "Assigned"
    }
  ];

  const tableColumns = [
    "RACE DETAILS",
    "RACE DATE",
    "CURRENT REFEREE",
    "ASSIGNMENT STATUS",
    "ACTIONS"
  ];

  return (
    <>
      <PageHeader
        title="Staffing Management"
        subtitle="Assign, reassign, and remove referees for scheduled races."
        actions={
          <Button icon={UserPlusIcon} style={{ backgroundColor: '#022c22', color: '#fff' }}>
            New Referee
          </Button>
        }
      />

      <div className={styles.statsGrid}>
        <StatCard
          title="TOTAL SCHEDULED RACES"
          icon={CalendarIcon}
          value="124"
          growth="+8% from last month"
        />
        
        <StatCard
          title="ASSIGNED REFEREES"
          icon={CheckSquareIcon}
          customContent={
            <>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}>98</div>
              <div className={styles.progressBarContainer}>
                <div className={styles.progressBarTrack}>
                  <div className={styles.progressBarFill} style={{ width: '79%' }}></div>
                </div>
              </div>
            </>
          }
        />

        <StatCard
          title="UNASSIGNED RACES"
          icon={AlertTriangleIcon}
          customContent={
            <>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}>26</div>
              <div className={styles.actionWarning}>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#ef4444' }}>!</span> Action required immediately
              </div>
            </>
          }
        />

        <StatCard
          title="AVAILABLE REFEREES"
          icon={UserPlusIcon}
          customContent={
            <>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}>42</div>
              <div className={styles.availableNotice}>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#b45309' }}>ⓘ</span> Available for assignment
              </div>
            </>
          }
        />
      </div>

      <Card style={{ padding: '20px', marginBottom: '24px' }}>
        <div className={styles.filterControls}>
          <div className={styles.filterGroup} style={{ flexGrow: 1 }}>
            <label className={styles.filterLabel}>Search</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <SearchIcon style={{ position: 'absolute', left: '12px', color: '#94a3b8' }} />
              <input
                className={styles.filterSelect}
                style={{ width: '100%', paddingLeft: '36px' }}
                placeholder="Search by race name, referee name, or race ID"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Race Status</label>
            <select 
              className={styles.filterSelect}
              value={raceStatus}
              onChange={(e) => setRaceStatus(e.target.value)}
            >
              <option>All Races</option>
              <option>Upcoming</option>
              <option>Completed</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Assignment Status</label>
            <select 
              className={styles.filterSelect}
              value={assignmentStatus}
              onChange={(e) => setAssignmentStatus(e.target.value)}
            >
              <option>All Statuses</option>
              <option>Assigned</option>
              <option>Unassigned</option>
            </select>
          </div>

          <Button 
            style={{ 
              height: '42px', 
              padding: '0 32px',
              backgroundColor: '#8b6f3c', // gold color from mockup
              color: 'white',
              border: 'none',
              marginLeft: '8px'
            }}
            icon={FilterIcon}
          >
            Filter
          </Button>
        </div>
      </Card>

      <Card style={{ padding: 0 }}>
        <DataTable
          columns={tableColumns}
          data={mockData}
          loading={false}
          totalItems={124}
          renderRow={(row) => (
            <tr key={row.id} className={styles.tableRow}>
              <td className={styles.td}>
                <div className={styles.raceCell}>
                  <div className={styles.raceIconWrapper}>
                    <row.icon />
                  </div>
                  <div>
                    <div className={styles.raceName}>{row.name}</div>
                    <div className={styles.raceId}>ID: {row.id}</div>
                  </div>
                </div>
              </td>
              <td className={styles.td}>
                <div className={styles.dateCell}>{row.date}</div>
                <div className={styles.timeCell}>{row.time}</div>
              </td>
              <td className={styles.td}>
                {row.referee ? (
                  <div className={styles.refereeCell}>
                    <img src={row.referee.avatar} alt="Avatar" className={styles.refereeAvatar} />
                    <span className={styles.refereeName}>{row.referee.name}</span>
                  </div>
                ) : (
                  <div className={styles.noReferee}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="2" y1="2" x2="22" y2="22"></line>
                      <path d="M10.41 10.41a2 2 0 1 1-2.83-2.83"></path>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                      <path d="M18.63 13A17.89 17.89 0 0 1 18 8"></path>
                      <path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14"></path>
                      <path d="M18 8a6 6 0 0 0-9.33-5"></path>
                    </svg>
                    Not Assigned
                  </div>
                )}
              </td>
              <td className={styles.td}>
                <Badge variant={row.status === "Assigned" ? "success" : "danger"}>
                  {row.status}
                </Badge>
              </td>
              <td className={styles.td}>
                {row.status === "Assigned" ? (
                  <div className={styles.actionsCell}>
                    <Button variant="outline" size="sm">Reassign</Button>
                    <Button variant="outline" size="sm" style={{ color: '#ef4444', borderColor: '#ef4444' }}>Remove</Button>
                  </div>
                ) : (
                  <Button size="sm" style={{ backgroundColor: '#022c22', color: 'white' }}>Assign</Button>
                )}
              </td>
            </tr>
          )}
        />
      </Card>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', color: '#64748b', fontSize: '14px' }}>
        <div>Showing <strong>1</strong> to <strong>10</strong> of <strong>124</strong> races</div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Button variant="outline" disabled style={{ padding: '6px 12px' }}>&lt; Previous</Button>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <span style={{ backgroundColor: '#022c22', color: 'white', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', fontWeight: 'bold' }}>1</span>
            <span style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>2</span>
            <span style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>3</span>
            <span style={{ padding: '0 4px' }}>...</span>
            <span style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>13</span>
          </div>
          <Button variant="outline" style={{ padding: '6px 12px' }}>Next &gt;</Button>
        </div>
      </div>
    </>
  );
}
