import { useState, useMemo } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import SearchFilterBar from '../../components/ui/SearchFilterBar';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import { Card } from '../../components/ui/StatCard';
import { DownloadIcon, FileTextIcon, FilterIcon } from '../../components/ui/Icons';
import styles from './AuditLogs.module.css';

const MOCK_LOGS = [
  {
    id: 'LOG-8832',
    timestamp: '2026-06-17 14:32:45',
    actor: 'admin@hannn.local',
    action: 'CREATE',
    entity: 'User (Role: Referee)',
    ip: '192.168.1.104',
    device: 'Chrome / Windows',
  },
  {
    id: 'LOG-8831',
    timestamp: '2026-06-17 13:15:20',
    actor: 'admin@horserace.local',
    action: 'UPDATE',
    entity: 'Race (ID: #4221)',
    ip: '10.0.0.5',
    device: 'Safari / macOS',
  },
  {
    id: 'LOG-8830',
    timestamp: '2026-06-17 11:05:00',
    actor: 'owner@horserace.local',
    action: 'LOGIN',
    entity: 'Session',
    ip: '203.112.44.5',
    device: 'App / iOS',
  },
  {
    id: 'LOG-8829',
    timestamp: '2026-06-16 16:45:12',
    actor: 'admin@hannn.local',
    action: 'DELETE',
    entity: 'Tournament (ID: #992)',
    ip: '192.168.1.104',
    device: 'Chrome / Windows',
  },
  {
    id: 'LOG-8828',
    timestamp: '2026-06-16 09:30:00',
    actor: 'system',
    action: 'MAINTENANCE',
    entity: 'Database Backup',
    ip: 'localhost',
    device: 'Server Cron',
  },
];

export default function AuditLogs() {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const filteredLogs = useMemo(() => {
    return MOCK_LOGS.filter(log => 
      log.actor.toLowerCase().includes(search.toLowerCase()) ||
      log.entity.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const getActionBadge = (action) => {
    switch(action) {
      case 'CREATE': return <Badge variant="success">CREATE</Badge>;
      case 'UPDATE': return <Badge variant="warning">UPDATE</Badge>;
      case 'DELETE': return <Badge style={{backgroundColor: '#fef2f2', color: '#991b1b'}}>DELETE</Badge>;
      case 'LOGIN': return <Badge style={{backgroundColor: '#e0f2fe', color: '#0369a1'}}>LOGIN</Badge>;
      default: return <Badge variant="ghost">{action}</Badge>;
    }
  };

  const tableColumns = [
    "TIMESTAMP",
    "ACTOR",
    "ACTION",
    "ENTITY",
    "IP / DEVICE"
  ];

  return (
    <>
      <PageHeader
        title="System Audit Logs"
        subtitle="Track all system modifications, access events, and administrative actions."
        actions={
          <>
            <Button variant="outline" icon={FilterIcon}>Advanced Filters</Button>
            <Button variant="primary" icon={DownloadIcon}>Export Report</Button>
          </>
        }
      />

      <Card style={{ padding: 0 }}>
        <SearchFilterBar
          searchValue={search}
          onSearchChange={(e) => setSearch(e.target.value)}
          searchPlaceholder="Search by actor email, entity, or action type..."
        />
        
        <DataTable
          columns={tableColumns}
          data={filteredLogs}
          loading={loading}
          totalItems={filteredLogs.length}
          renderRow={(log) => (
            <tr key={log.id} className={styles.tableRow}>
              <td className={styles.td}>
                <div className={styles.logTime}>{log.timestamp}</div>
                <div className={styles.logId}>{log.id}</div>
              </td>
              <td className={styles.td}>
                <div className={styles.actorName}>{log.actor}</div>
              </td>
              <td className={styles.td}>
                {getActionBadge(log.action)}
              </td>
              <td className={styles.td}>
                <div className={styles.entityName}>{log.entity}</div>
              </td>
              <td className={styles.td}>
                <div className={styles.ipAddress}>{log.ip}</div>
                <div className={styles.deviceInfo}>{log.device}</div>
              </td>
            </tr>
          )}
        />
      </Card>
    </>
  );
}
