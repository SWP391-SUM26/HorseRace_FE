import React, { useState, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import styles from './UserManagement.module.css';
import DATA_FROM_JSON from '../../data/UserMock.json';

// ==========================================
// CÁC COMPONENT GIAO DIỆN NỘI BỘ (INTERNAL COMPONENTS)
// ==========================================

const Badge = ({ variant, children }) => {
  const badgeClass = `${styles.badge} ${styles[`badge_${variant.toLowerCase()}`]}`;
  return <span className={badgeClass}>{children}</span>;
};

const Button = ({ variant = 'primary', icon, children, ...props }) => {
  const btnClass = `${styles.button} ${styles[`btn_${variant}`]}`;
  return (
    <button className={btnClass} {...props}>
      {icon && <span className={styles.btnIcon}>{icon}</span>}
      {children}
    </button>
  );
};

const Card = ({ children, style }) => {
  return <div className={styles.card} style={style}>{children}</div>;
};

const Topbar = ({ title, systemStatus }) => {
  return (
    <header className={styles.topbar}>
      <div className={styles.topbarLeft}>
        <span className={styles.topbarTitle}>{title}</span>
        <span className={styles.topbarStatus}>{systemStatus}</span>
      </div>
      <div className={styles.topbarActions}>
        <button className={styles.topbarIconBtn}>🔔<span className={styles.topbarBadge} /></button>
        <button className={styles.topbarIconBtn}>👤</button>
      </div>
    </header>
  );
};

const Sidebar = () => {
  const location = useLocation();
  
  const menuItems = [
    { path: '/admin/users', icon: '👥', label: 'User Management' },
    { path: '/admin/tournaments', icon: '🏆', label: 'Tournaments' },
    { path: '/admin/races', icon: '✅', label: 'Race Approval' },
    { path: '/admin/staffing', icon: '📋', label: 'Staffing' },
    { path: '/admin/settings', icon: '⚙️', label: 'Settings' },
    { path: '/admin/logs', icon: '📄', label: 'Audit Logs' },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarLogo}>
        <span className={styles.logoIcon}>🛡️</span>
        <div className={styles.logoText}>
          <div className={styles.logoTitle}>Equine Elite</div>
          <div className={styles.logoSubtitle}>ADMIN MANAGEMENT</div>
        </div>
      </div>
      <nav className={styles.sidebarNav}>
        {menuItems.slice(0, 4).map(item => (
          <Link 
            key={item.path}
            to={item.path} 
            className={`${styles.sidebarItem} ${(location.pathname === item.path || (item.path === '/admin/users' && location.pathname === '/')) ? styles.sidebarItemActive : ''}`}
          >
            <span className={styles.sidebarItemIcon}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className={styles.sidebarBottom}>
        {menuItems.slice(4).map(item => (
          <Link 
            key={item.path}
            to={item.path} 
            className={`${styles.sidebarItem} ${location.pathname === item.path ? styles.sidebarItemActive : ''}`}
          >
            <span className={styles.sidebarItemIcon}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
        <button className={styles.systemReportBtn}>System Report</button>
      </div>
    </aside>
  );
};

// Chuẩn hóa dữ liệu ban đầu
const INITIAL_USERS = [
  ...(DATA_FROM_JSON.users || []),
  DATA_FROM_JSON.googleAccount
].map(user => ({
  ...user,
  roleIcon:
    user.role === 'Owner'
      ? '🏪'
      : user.role === 'Jockey'
      ? '🏁'
      : user.role === 'Referee'
      ? '⚖️'
      : '👁️',
  status:
    user.role === 'Owner' || user.role === 'Spectator (VIP)'
      ? 'ACTIVE'
      : user.role === 'Jockey'
      ? 'PENDING'
      : 'SUSPENDED',
  lastAuth:
    user.role === 'Owner'
      ? 'Today, 08:42 AM'
      : user.role === 'Jockey'
      ? 'Oct 24, 14:30 PM'
      : user.role === 'Referee'
      ? 'Sep 12, 09:15 AM'
      : 'Oct 25, 18:05 PM',
  avatarUrl: null
}));

// ==========================================
// SUB-PAGES VIEW MANAGEMENT
// ==========================================

const UserManagementView = () => {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null); 
  const [editForm, setEditForm] = useState({ name: '', email: '', username: '', stable: '' });

  const filteredUsers = useMemo(() => {
    return users.filter(u =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.stable.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setEditForm({ 
      name: user.name, 
      email: user.email,
      username: user.username,
      stable: user.stable
    });
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    const nameParts = editForm.name.trim().split(' ');
    const newAvatar = ((nameParts[0]?.[0] || '') + (nameParts[nameParts.length - 1]?.[0] || '')).toUpperCase();

    const updatedUsers = users.map(u => {
      if (u.id === selectedUser.id) {
        return { ...u, name: editForm.name, email: editForm.email, username: editForm.username, stable: editForm.stable, avatar: newAvatar };
      }
      return u;
    });

    setUsers(updatedUsers);
    setSelectedUser(prev => ({ ...prev, name: editForm.name, email: editForm.email, username: editForm.username, stable: editForm.stable, avatar: newAvatar }));
    alert('Hồ sơ thành viên đã được cập nhật thành công!');
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !selectedUser) return;
    const localAvatarUrl = URL.createObjectURL(file);
    setUsers(users.map(u => u.id === selectedUser.id ? { ...u, avatarUrl: localAvatarUrl } : u));
    setSelectedUser(prev => ({ ...prev, avatarUrl: localAvatarUrl }));
  };

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>User Management</h1>
          <p className={styles.pageSubtitle}>Oversee roles, permissions, and system access for all personnel.</p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="ghost" icon="📥">Export CSV</Button>
          <Button icon="👤+">Provision User</Button>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <Card>
          <div className={styles.statHeader}><span className={styles.statLabel}>GLOBAL USER GROWTH</span><span>📈</span></div>
          <div className={styles.statValue}>12,482</div>
          <div><span className={styles.statGrowth}>+14.2%</span><span className={styles.statNote}> vs. previous 30 days</span></div>
        </Card>
        <Card>
          <div className={styles.statHeader}><span className={styles.statLabel}>ACTIVE SESSIONS</span><div className={styles.liveIndicator} /></div>
          <div className={styles.statValue}>847</div>
          <div className={styles.statNote}>Current live connections</div>
        </Card>
        <Card>
          <div className={styles.statHeader} style={{ marginBottom: 12 }}><span className={styles.statLabel}>ROLE DISTRIBUTION</span><span>📊</span></div>
          {[
            ['Owners', 45, '#002315'], 
            ['Jockeys', 30, '#64748b'], 
            ['Referees', 15, '#cbd5e1']
          ].map(([label, pct, color]) => (
            <div key={label} className={styles.roleRow}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: color, width: '8px', height: '8px', borderRadius: '50%' }} />
                <span>{label}</span>
              </div>
              <span>{pct}%</span>
            </div>
          ))}
        </Card>
      </div>

      {selectedUser && (
        <Card style={{ marginBottom: '24px', padding: '24px', borderLeft: '4px solid #002315' }}>
          <div className={styles.profilePanelHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 className={styles.profilePanelTitle}>Personnel Security File</h2>
            </div>
            <button onClick={() => setSelectedUser(null)} className={styles.closeBtn}>✕</button>
          </div>
          <div className={styles.profilePanelBody}>
            <div className={styles.profileLeftBox}>
              <div className={styles.avatarWrapper}>
                {selectedUser.avatarUrl ? <img src={selectedUser.avatarUrl} alt="Avatar" className={styles.largeAvatarImg} /> : <div className={styles.largeAvatarPlaceholder}>{selectedUser.avatar}</div>}
                <label className={styles.uploadLabel}>📷<input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} /></label>
              </div>
              <div className={styles.profileId}>{selectedUser.id}</div>
              <h3 className={styles.profileName}>{selectedUser.name}</h3>
              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                <Badge variant="ghost">{selectedUser.roleIcon} {selectedUser.role}</Badge>
                <Badge variant={selectedUser.status === 'ACTIVE' ? 'success' : selectedUser.status === 'PENDING' ? 'warning' : 'suspended'}>{selectedUser.status}</Badge>
              </div>
            </div>
            <div className={styles.profileRightBox}>
              <form onSubmit={handleUpdateProfile}>
                <div className={styles.formGrid}>
                  <div><label className={styles.formLabel}>MEMBER ACCOUNT NAME</label><input type="text" className={styles.formInput} value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} required /></div>
                  <div><label className={styles.formLabel}>EMAIL ADDRESS</label><input type="email" className={styles.formInput} value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} required /></div>
                  <div><label className={styles.formLabel}>SYSTEM USERNAME</label><input type="text" className={styles.formInput} value={editForm.username} onChange={e => setEditForm({ ...editForm, username: e.target.value })} required /></div>
                  <div><label className={styles.formLabel}>ASSIGNED STABLE / CIRCUIT</label><input type="text" className={styles.formInput} value={editForm.stable} onChange={e => setEditForm({ ...editForm, stable: e.target.value })} required /></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}><Button type="submit">Update Identity Records</Button></div>
              </form>
            </div>
          </div>
        </Card>
      )}

      <Card style={{ padding: 0 }}>
        <div className={styles.tableHeader}>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>🔍</span>
            <input className={styles.searchInput} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, site, stable..." />
          </div>
          <button className={styles.filterBtn}>≡ Filter</button>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>{['USER DETAILS', 'SYSTEM ROLE', 'CLEARANCE STATUS', 'LAST AUTHENTICATION'].map(h => <th key={h} className={styles.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id} onClick={() => handleSelectUser(u)} className={`${styles.tableRow} ${selectedUser?.id === u.id ? styles.tableRowSelected : ''}`}>
                <td className={styles.td}>
                  <div className={styles.userCell}>
                    {u.avatarUrl ? <img src={u.avatarUrl} alt="Avatar" className={styles.smallAvatarImg} /> : <div className={styles.userAvatar}>{u.avatar}</div>}
                    <div><div className={styles.userName}>{u.name}</div><div className={styles.userEmail}>{u.email}</div></div>
                  </div>
                </td>
                <td className={styles.td}><div className={styles.roleCell}>{u.roleIcon} {u.role}</div></td>
                <td className={styles.td}><Badge variant={u.status === 'ACTIVE' ? 'success' : u.status === 'PENDING' ? 'warning' : 'suspended'}>{u.status}</Badge></td>
                <td className={styles.td} style={{ fontSize: 13, color: '#64748b' }}>{u.lastAuth}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className={styles.pagination}>
          <span className={styles.paginationInfo}>Showing 1 to {filteredUsers.length} of 12,482 entries</span>
          <div className={styles.paginationBtns}>
            <button className={styles.pageBtn} disabled>&lt;</button>
            <button className={`${styles.pageBtn} ${styles.active}`}>1</button>
            <button className={styles.pageBtn}>2</button>
            <button className={styles.pageBtn}>&gt;</button>
          </div>
        </div>
      </Card>
    </>
  );
};

const PlaceholderView = ({ title }) => (
  <Card style={{ padding: '40px', textAlign: 'center' }}>
    <h2 className={styles.pageTitle} style={{ marginBottom: '12px' }}>{title} Component</h2>
    <p style={{ color: '#64748b' }}>Đường dẫn Router hoạt động tốt! Nội dung đang được cập nhật.</p>
  </Card>
);

// ==========================================
// MAIN APP ROUTER INTEGRATION
// ==========================================
function DashboardLayout() {
  return (
    <div className={styles.layoutContainer}>
      <Sidebar />
      <div className={styles.mainContent}>
        <Topbar title="Equine Elite Admin" systemStatus="System Status: Healthy" />
        <div className={styles.pageBody}>
          <Routes>
            <Route path="/" element={<UserManagementView />} />
            <Route path="/users" element={<UserManagementView />} />
            <Route path="/tournaments" element={<PlaceholderView title="🏆 Tournaments" />} />
            <Route path="/races" element={<PlaceholderView title="✅ Race Approval" />} />
            <Route path="/staffing" element={<PlaceholderView title="📋 Staffing" />} />
            <Route path="/settings" element={<PlaceholderView title="⚙️ Settings" />} />
            <Route path="/logs" element={<PlaceholderView title="📄 Audit Logs" />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default function UserManagement() {
  return (

      <Routes>
        <Route path="/*" element={<DashboardLayout />} />
      </Routes>

  );
}