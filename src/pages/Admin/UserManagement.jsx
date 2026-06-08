import React, { useState, useMemo, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import styles from './UserManagement.module.css';
import { getStoredSession } from '../../services/auth';
import { getAllUsers, getUserById, updateMyProfile, updateUserProfile } from '../../services/user';

// Import newly extracted components
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import StatCard, { Card } from '../../components/ui/StatCard';
import PageHeader from '../../components/ui/PageHeader';
import SearchFilterBar from '../../components/ui/SearchFilterBar';
import DataTable from '../../components/ui/DataTable';
import Sidebar from '../../components/layout/Sidebar';
import Navbar from '../../components/layout/Navbar';
import { DownloadIcon, UserPlusIcon, TrendingUpIcon, OwnerIcon, JockeyIcon, RefereeIcon, EyeIcon, CameraIcon } from '../../components/ui/Icons';

// ==========================================
// SUB-PAGES VIEW MANAGEMENT
// ==========================================

const UserManagementView = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', username: '', stable: '' });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  // Fetch list of users from the server on mount
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getAllUsers();
      const processed = data.map(u => ({
        ...u,
        roleIcon:
          u.role === 'Owner'
            ? OwnerIcon
            : u.role === 'Jockey'
              ? JockeyIcon
              : u.role === 'Referee'
                ? RefereeIcon
                : EyeIcon,
        lastAuth:
          u.role === 'Owner'
            ? 'Today, 08:42 AM'
            : u.role === 'Jockey'
              ? 'Oct 24, 14:30 PM'
              : u.role === 'Referee'
                ? 'Sep 12, 09:15 AM'
                : 'Oct 25, 18:05 PM'
      }));
      setUsers(processed);
      setLoading(false);
    }
    loadData();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(u =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.stable.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  const roleDistribution = useMemo(() => {
    const counts = {};
    users.forEach(u => {
      counts[u.role] = (counts[u.role] || 0) + 1;
    });
    const total = users.length;
    const colors = {
      'Owner': '#022c22',
      'Jockey': '#64748b',
      'Referee': '#cbd5e1',
      'Spectator (VIP)': '#16a34a',
      'Spectator': '#22c55e'
    };
    return Object.entries(counts).map(([role, count]) => ({
      role,
      pct: total ? Math.round((count / total) * 100) : 0,
      color: colors[role] || '#64748b'
    }));
  }, [users]);

  const handleSelectUser = async (user) => {
    // Load fresh details from API
    const freshUser = await getUserById(user.id);
    if (!freshUser) return;

    const processed = {
      ...freshUser,
      roleIcon:
        freshUser.role === 'Owner'
          ? OwnerIcon
          : freshUser.role === 'Jockey'
            ? JockeyIcon
            : freshUser.role === 'Referee'
              ? RefereeIcon
              : EyeIcon,
      lastAuth: user.lastAuth
    };
    
    setSelectedUser(processed);
    setEditForm({
      name: processed.name,
      email: processed.email,
      username: processed.username || processed.name.toLowerCase().replace(' ', '.'),
      stable: processed.stable || ''
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    const nameParts = editForm.name.trim().split(' ');
    const newAvatar = ((nameParts[0]?.[0] || '') + (nameParts[nameParts.length - 1]?.[0] || '')).toUpperCase();

    const currentSession = getStoredSession();
    if (currentSession?.user && currentSession.user.id === selectedUser.id) {
      try {
        const updatedSelf = await updateMyProfile({
          fullName: editForm.name,
          phone: selectedUser.phone,
          avatarUrl: selectedUser.avatarUrl
        });

        const processedSelf = {
          ...updatedSelf,
          roleIcon: selectedUser.roleIcon,
          lastAuth: selectedUser.lastAuth
        };
        
        setUsers(users.map(u => u.id === selectedUser.id ? processedSelf : u));
        setSelectedUser(processedSelf);
        showToast('Hồ sơ cá nhân của bạn đã được cập nhật thành công trên server!', 'success');
        return;
      } catch (err) {
        showToast('Lỗi cập nhật hồ sơ: ' + err.message, 'error');
        return;
      }
    }

    try {
      const updatedData = await updateUserProfile(selectedUser.id, {
        name: editForm.name,
        email: editForm.email,
        stable: editForm.stable
      });

      const processedUpdated = {
        ...selectedUser,
        ...updatedData,
        avatar: newAvatar
      };

      setUsers(users.map(u => u.id === selectedUser.id ? processedUpdated : u));
      setSelectedUser(processedUpdated);
      showToast('Hồ sơ thành viên đã được cập nhật thành công!', 'success');
    } catch (err) {
      showToast('Lỗi cập nhật hồ sơ: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !selectedUser) return;
    const localAvatarUrl = URL.createObjectURL(file);
    setUsers(users.map(u => u.id === selectedUser.id ? { ...u, avatarUrl: localAvatarUrl } : u));
    setSelectedUser(prev => ({ ...prev, avatarUrl: localAvatarUrl }));
  };

  const tableColumns = ['USER DETAILS', 'SYSTEM ROLE', 'CLEARANCE STATUS', 'LAST AUTHENTICATION'];

  return (
    <>
      <PageHeader 
        title="User Management" 
        subtitle="Oversee roles, permissions, and system access for all personnel." 
        actions={
          <>
            <Button variant="ghost" icon={DownloadIcon}>Export CSV</Button>
            <Button icon={UserPlusIcon}>Provision User</Button>
          </>
        }
      />

      <div className={styles.statsGrid}>
        <StatCard 
          title="GLOBAL USER GROWTH" 
          icon={TrendingUpIcon} 
          value="12,482" 
          growth="+14.2%" 
          note="vs. previous 30 days" 
        />
        <StatCard 
          title="ACTIVE SESSIONS" 
          live={true} 
          value="847" 
          note="Current live connections" 
        />
        <StatCard 
          title="ROLE DISTRIBUTION" 
          customContent={
            roleDistribution.map(({ role, pct, color }) => (
              <div key={role} className={styles.roleRow}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ background: color, width: '8px', height: '8px', borderRadius: '50%' }} />
                  <span>{role === 'Spectator (VIP)' ? role : `${role}s`}</span>
                </div>
                <span>{pct}%</span>
              </div>
            ))
          } 
        />
      </div>

      {selectedUser && (
        <Card style={{ marginBottom: '24px', padding: '24px', borderLeft: '4px solid #022c22' }}>
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
                <label className={styles.uploadLabel}><CameraIcon className={styles.cameraIcon} /><input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} /></label>
              </div>
              <div className={styles.profileId}>{selectedUser.id}</div>
              <h3 className={styles.profileName}>{selectedUser.name}</h3>
              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center' }}>
                <Badge variant="ghost">
                  <span style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                    <selectedUser.roleIcon className={styles.roleIconSmall} /> {selectedUser.role}
                  </span>
                </Badge>
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
        <SearchFilterBar 
          searchValue={search}
          onSearchChange={(e) => setSearch(e.target.value)}
          searchPlaceholder="Search by name, site, stable..."
        />
        <DataTable 
          columns={tableColumns}
          data={filteredUsers}
          loading={loading}
          totalItems={users.length}
          renderRow={(u) => {
            const RoleIcon = u.roleIcon;
            return (
              <tr key={u.id} onClick={() => handleSelectUser(u)} className={`${styles.tableRow} ${selectedUser?.id === u.id ? styles.tableRowSelected : ''}`}>
                <td className={styles.td}>
                  <div className={styles.userCell}>
                    {u.avatarUrl ? <img src={u.avatarUrl} alt="Avatar" className={styles.smallAvatarImg} /> : <div className={styles.userAvatar}>{u.avatar}</div>}
                    <div><div className={styles.userName}>{u.name}</div><div className={styles.userEmail}>{u.email}</div></div>
                  </div>
                </td>
                <td className={styles.td}>
                  <div className={styles.roleCell}>
                    <RoleIcon className={styles.roleIconSmall} /> {u.role}
                  </div>
                </td>
                <td className={styles.td}><Badge variant={u.status === 'ACTIVE' ? 'success' : u.status === 'PENDING' ? 'warning' : 'suspended'}>{u.status}</Badge></td>
                <td className={styles.td} style={{ fontSize: 13, color: '#64748b' }}>{u.lastAuth}</td>
              </tr>
            );
          }}
        />
      </Card>

      {toast.show && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalBox} ${styles[`modal_${toast.type}`]}`}>
            <div className={styles.modalContent}>
              <span className={styles.modalIcon}>
                {toast.type === 'success' ? '✅' : '❌'}
              </span>
              <div className={styles.modalText}>
                <h3 className={styles.modalTitle}>
                  {toast.type === 'success' ? 'Thành công' : 'Thất bại'}
                </h3>
                <p className={styles.modalMessage}>{toast.message}</p>
              </div>
            </div>
            <div className={styles.modalActions}>
              <Button onClick={() => setToast({ ...toast, show: false })}>
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
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
function AdminDashboardLayout() {
  return (
    <div className={styles.layoutContainer}>
      <Sidebar />
      <div className={styles.mainContent}>
        <Navbar title="Equine Elite Admin" systemStatus="System Status: Healthy" />
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
  const session = getStoredSession();

  if (!session || session.user.role !== 'Admin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      <Route path="/*" element={<AdminDashboardLayout />} />
    </Routes>
  );
}
