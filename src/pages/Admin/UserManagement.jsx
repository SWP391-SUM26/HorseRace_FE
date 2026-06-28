import { useState, useMemo, useEffect } from "react";
import styles from "./UserManagement.module.css";
import { getStoredSession } from "../../services/auth";
import {
  getAllUsers,
  getUserById,
  updateMyProfile,
  updateUserProfile,
  uploadAvatar,
  deleteUser,
  getUserPermissions,
} from "../../services/user";
import { MoreVertical, Edit2, Trash2, Ban } from 'lucide-react';

// Import newly extracted components
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import StatCard, { Card } from '../../components/ui/StatCard';
import PageHeader from '../../components/ui/PageHeader';
import SearchFilterBar from '../../components/ui/SearchFilterBar';
import DataTable from '../../components/ui/DataTable';
import { DownloadIcon, UserPlusIcon, TrendingUpIcon, OwnerIcon, JockeyIcon, RefereeIcon, EyeIcon, CameraIcon } from '../../components/ui/Icons';

// ==========================================
// SUB-PAGES VIEW MANAGEMENT
// ==========================================

const UserManagementView = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    username: "",
    stable: "",
  });
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const [actionMenuOpenId, setActionMenuOpenId] = useState(null);
  const [deleteModalUser, setDeleteModalUser] = useState(null);
  const [suspendModalUser, setSuspendModalUser] = useState(null);

  useEffect(() => {
    if (!actionMenuOpenId) return;
    const closeMenu = (e) => {
      if (!e.target.closest('[data-user-actions]')) {
        setActionMenuOpenId(null);
      }
    };
    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, [actionMenuOpenId]);

  const handleDeleteUser = async () => {
    if (!deleteModalUser) return;
    try {
      await deleteUser(deleteModalUser.id);
      setUsers(users.filter(u => u.id !== deleteModalUser.id));
      showToast("User has been deleted successfully", "success");
      if (selectedUser?.id === deleteModalUser.id) {
        setSelectedUser(null);
      }
    } catch (err) {
      showToast("Failed to delete user", "error");
    } finally {
      setDeleteModalUser(null);
    }
  };

  const handleSuspendUser = async () => {
    if (!suspendModalUser) return;
    try {
      // Mocked suspend action
      const updatedStatus = suspendModalUser.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
      setUsers(users.map(u => u.id === suspendModalUser.id ? { ...u, status: updatedStatus } : u));
      if (selectedUser?.id === suspendModalUser.id) {
        setSelectedUser({ ...selectedUser, status: updatedStatus });
      }
      showToast(`User has been ${updatedStatus === "SUSPENDED" ? "suspended" : "activated"}`, "success");
    } catch (err) {
      showToast("Failed to change user status", "error");
    } finally {
      setSuspendModalUser(null);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  // Fetch list of users from the server on mount
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getAllUsers();
      const processed = data.map((u) => ({
        ...u,
        roleIcon:
          u.role === "Owner"
            ? OwnerIcon
            : u.role === "Jockey"
              ? JockeyIcon
              : u.role === "Referee"
                ? RefereeIcon
                : EyeIcon,
        lastAuth:
          u.role === "Owner"
            ? "Today, 08:42 AM"
            : u.role === "Jockey"
              ? "Oct 24, 14:30 PM"
              : u.role === "Referee"
                ? "Sep 12, 09:15 AM"
                : "Oct 25, 18:05 PM",
      }));
      setUsers(processed);
      setLoading(false);
    }
    loadData();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.stable.toLowerCase().includes(search.toLowerCase()),
    );
  }, [users, search]);

  const roleDistribution = useMemo(() => {
    const counts = {};
    users.forEach((u) => {
      counts[u.role] = (counts[u.role] || 0) + 1;
    });
    const total = users.length;
    const colors = {
      Owner: "#022c22",
      Jockey: "#64748b",
      Referee: "#cbd5e1",
      "Spectator (VIP)": "#16a34a",
      Spectator: "#22c55e",
    };
    return Object.entries(counts).map(([role, count]) => ({
      role,
      pct: total ? Math.round((count / total) * 100) : 0,
      color: colors[role] || "#64748b",
    }));
  }, [users]);

  const handleSelectUser = async (user) => {
    // Load fresh details from API
    const [freshUser, permissions] = await Promise.all([
      getUserById(user.id),
      getUserPermissions(user.id).catch(() => [])
    ]);
    if (!freshUser) return;

    const processed = {
      ...freshUser,
      permissions: permissions,
      roleIcon:
        freshUser.role === "Owner"
          ? OwnerIcon
          : freshUser.role === "Jockey"
            ? JockeyIcon
            : freshUser.role === "Referee"
              ? RefereeIcon
              : EyeIcon,
      lastAuth: user.lastAuth,
    };

    setSelectedUser(processed);
    setEditForm({
      name: processed.name,
      email: processed.email,
      username:
        processed.username || processed.name.toLowerCase().replace(" ", "."),
      stable: processed.stable || "",
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    const nameParts = editForm.name.trim().split(" ");
    const newAvatar = (
      (nameParts[0]?.[0] || "") + (nameParts[nameParts.length - 1]?.[0] || "")
    ).toUpperCase();

    const currentSession = getStoredSession();
    if (currentSession?.user && currentSession.user.id === selectedUser.id) {
      try {
        const updatedSelf = await updateMyProfile({
          fullName: editForm.name,
          phone: selectedUser.phone,
          avatarUrl: selectedUser.avatarUrl,
        });

        const processedSelf = {
          ...updatedSelf,
          roleIcon: selectedUser.roleIcon,
          lastAuth: selectedUser.lastAuth,
        };

        setUsers(
          users.map((u) => (u.id === selectedUser.id ? processedSelf : u)),
        );
        setSelectedUser(processedSelf);
        showToast(
          "Hồ sơ cá nhân của bạn đã được cập nhật thành công trên server!",
          "success",
        );
        return;
      } catch (err) {
        showToast("Lỗi cập nhật hồ sơ: " + err.message, "error");
        return;
      }
    }

    try {
      const updatedData = await updateUserProfile(selectedUser.id, {
        name: editForm.name,
        email: editForm.email,
        stable: editForm.stable,
      });

      const processedUpdated = {
        ...selectedUser,
        ...updatedData,
        avatar: newAvatar,
      };

      setUsers(
        users.map((u) => (u.id === selectedUser.id ? processedUpdated : u)),
      );
      setSelectedUser(processedUpdated);
      showToast("Hồ sơ thành viên đã được cập nhật thành công!", "success");
    } catch (err) {
      showToast(
        "Lỗi cập nhật hồ sơ: " + (err.response?.data?.message || err.message),
        "error",
      );
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedUser) return;
    
    // Check if the user is uploading their own avatar
    const currentSession = getStoredSession();
    if (currentSession?.user && currentSession.user.id === selectedUser.id) {
      try {
        const updatedSelf = await uploadAvatar(file);
        const processedSelf = {
          ...updatedSelf,
          roleIcon: selectedUser.roleIcon,
          lastAuth: selectedUser.lastAuth,
        };
        setUsers(users.map((u) => (u.id === selectedUser.id ? processedSelf : u)));
        setSelectedUser(processedSelf);
        showToast("Avatar đã được tải lên thành công!", "success");
      } catch (err) {
        showToast("Lỗi upload avatar: " + (err.response?.data?.message || err.message), "error");
      }
    } else {
      showToast("Chỉ có thể thay đổi avatar của chính bạn!", "warning");
    }
  };

  const tableColumns = [
    "USER DETAILS",
    "SYSTEM ROLE",
    "CLEARANCE STATUS",
    "LAST AUTHENTICATION",
    "ACTIONS"
  ];

  return (
    <>
      <PageHeader
        title="User Management"
        subtitle="Oversee roles, permissions, and system access for all personnel."
        actions={
          <>
            <Button variant="ghost" icon={DownloadIcon}>
              Export CSV
            </Button>
            <Button icon={UserPlusIcon} onClick={() => showToast("Tính năng thêm người dùng mới đang được phát triển!", "success")}>Provision User</Button>
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
          customContent={roleDistribution.map(({ role, pct, color }) => (
            <div key={role} className={styles.roleRow}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span
                  style={{
                    background: color,
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                  }}
                />
                <span>{role === "Spectator (VIP)" ? role : `${role}s`}</span>
              </div>
              <span>{pct}%</span>
            </div>
          ))}
        />
      </div>

      {selectedUser && (
        <Card
          style={{
            marginBottom: "24px",
            padding: "24px",
            borderLeft: "4px solid #022c22",
          }}
        >
          <div className={styles.profilePanelHeader}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h2 className={styles.profilePanelTitle}>
                Personnel Security File
              </h2>
            </div>
            <button
              onClick={() => setSelectedUser(null)}
              className={styles.closeBtn}
            >
              ✕
            </button>
          </div>
          <div className={styles.profilePanelBody}>
            <div className={styles.profileLeftBox}>
              <div className={styles.avatarWrapper}>
                {selectedUser.avatarUrl ? (
                  <img
                    src={selectedUser.avatarUrl}
                    alt="Avatar"
                    className={styles.largeAvatarImg}
                  />
                ) : (
                  <div className={styles.largeAvatarPlaceholder}>
                    {selectedUser.avatar}
                  </div>
                )}
                <label className={styles.uploadLabel}>
                  <CameraIcon className={styles.cameraIcon} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
              <div className={styles.profileId}>{selectedUser.id}</div>
              <h3 className={styles.profileName}>{selectedUser.name}</h3>
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Badge variant="ghost">
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <selectedUser.roleIcon className={styles.roleIconSmall} />{" "}
                    {selectedUser.role}
                  </span>
                </Badge>
                <Badge
                  variant={
                    selectedUser.status === "ACTIVE"
                      ? "success"
                      : selectedUser.status === "PENDING"
                        ? "warning"
                        : "suspended"
                  }
                >
                  {selectedUser.status}
                </Badge>
              </div>
              <div style={{ marginTop: '24px', textAlign: 'left', width: '100%' }}>
                <h4 style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>SYSTEM CLEARANCE / PERMISSIONS</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {selectedUser.permissions?.length > 0 ? (
                    selectedUser.permissions.map((perm, idx) => (
                      <span key={idx} style={{ background: '#f1f5f9', color: '#334155', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>
                        {perm}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>No specific permissions assigned</span>
                  )}
                </div>
              </div>
            </div>
            <div className={styles.profileRightBox}>
              <form onSubmit={handleUpdateProfile}>
                <div className={styles.formGrid}>
                  <div>
                    <label className={styles.formLabel}>
                      MEMBER ACCOUNT NAME
                    </label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className={styles.formLabel}>EMAIL ADDRESS</label>
                    <input
                      type="email"
                      className={styles.formInput}
                      value={editForm.email}
                      onChange={(e) =>
                        setEditForm({ ...editForm, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className={styles.formLabel}>SYSTEM USERNAME</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={editForm.username}
                      onChange={(e) =>
                        setEditForm({ ...editForm, username: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className={styles.formLabel}>
                      ASSIGNED STABLE / CIRCUIT
                    </label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={editForm.stable}
                      onChange={(e) =>
                        setEditForm({ ...editForm, stable: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: "16px",
                  }}
                >
                  <Button type="submit">Update Identity Records</Button>
                </div>
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
          showFilter={false}
        />
        <DataTable
          columns={tableColumns}
          data={filteredUsers}
          loading={loading}
          totalItems={users.length}
          renderRow={(u) => {
            const RoleIcon = u.roleIcon;
            return (
              <tr
                key={u.id}
                onClick={() => handleSelectUser(u)}
                className={`${styles.tableRow} ${selectedUser?.id === u.id ? styles.tableRowSelected : ""}`}
              >
                <td className={styles.td}>
                  <div className={styles.userCell}>
                    {u.avatarUrl ? (
                      <img
                        src={u.avatarUrl}
                        alt="Avatar"
                        className={styles.smallAvatarImg}
                      />
                    ) : (
                      <div className={styles.userAvatar}>{u.avatar}</div>
                    )}
                    <div>
                      <div className={styles.userName}>{u.name}</div>
                      <div className={styles.userEmail}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className={styles.td}>
                  <div className={styles.roleCell}>
                    <RoleIcon className={styles.roleIconSmall} /> {u.role}
                  </div>
                </td>
                <td className={styles.td}>
                  <Badge
                    variant={
                      u.status === "ACTIVE"
                        ? "success"
                        : u.status === "PENDING"
                          ? "warning"
                          : "suspended"
                    }
                  >
                    {u.status}
                  </Badge>
                </td>
                <td
                  className={styles.td}
                  style={{ fontSize: 13, color: "#64748b" }}
                >
                  {u.lastAuth}
                </td>
                <td className={styles.td} style={{ width: '80px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} data-user-actions>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleSelectUser(u); }}
                      style={{ padding: '4px', color: '#64748b', cursor: 'pointer', background: 'transparent', border: 'none' }}
                      title="Edit Identity"
                    >
                      <Edit2 size={16} />
                    </button>
                    <div style={{ position: 'relative' }}>
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setActionMenuOpenId(actionMenuOpenId === u.id ? null : u.id);
                        }}
                        style={{ padding: '4px', color: '#64748b', cursor: 'pointer', background: 'transparent', border: 'none' }}
                        title="More Actions"
                      >
                        <MoreVertical size={16} />
                      </button>
                      {actionMenuOpenId === u.id && (
                        <div style={{
                          position: 'absolute', right: '0', top: '100%', zIndex: 50,
                          background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '4px', minWidth: '150px'
                        }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); setActionMenuOpenId(null); setSuspendModalUser(u); }}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 12px', fontSize: '13px', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', color: '#334155' }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#f1f5f9'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <Ban size={14} /> {u.status === "ACTIVE" ? "Suspend User" : "Activate User"}
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setActionMenuOpenId(null); setDeleteModalUser(u); }}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 12px', fontSize: '13px', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#fef2f2'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <Trash2 size={14} /> Delete Record
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            );
          }}
        />
      </Card>

      {toast.show && (
        <div className={styles.modalOverlay}>
          <div
            className={`${styles.modalBox} ${styles[`modal_${toast.type}`]}`}
          >
            <div className={styles.modalContent}>
              <span className={styles.modalIcon}>
                {toast.type === "success" ? "✅" : "❌"}
              </span>
              <div className={styles.modalText}>
                <h3 className={styles.modalTitle}>
                  {toast.type === "success" ? "Thành công" : "Thất bại"}
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

      {deleteModalUser && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <div className={styles.modalContent}>
              <span className={styles.modalIcon} style={{ background: '#fee2e2', color: '#ef4444' }}>
                <Trash2 size={24} />
              </span>
              <div className={styles.modalText}>
                <h3 className={styles.modalTitle}>Delete User Record</h3>
                <p className={styles.modalMessage}>Are you sure you want to permanently delete {deleteModalUser.name}? This action cannot be undone.</p>
              </div>
            </div>
            <div className={styles.modalActions}>
              <Button variant="ghost" onClick={() => setDeleteModalUser(null)}>Cancel</Button>
              <Button style={{ background: '#ef4444', color: 'white', borderColor: '#ef4444' }} onClick={handleDeleteUser}>Delete User</Button>
            </div>
          </div>
        </div>
      )}

      {suspendModalUser && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <div className={styles.modalContent}>
              <span className={styles.modalIcon} style={{ background: '#fef3c7', color: '#d97706' }}>
                <Ban size={24} />
              </span>
              <div className={styles.modalText}>
                <h3 className={styles.modalTitle}>{suspendModalUser.status === "ACTIVE" ? "Suspend" : "Activate"} User</h3>
                <p className={styles.modalMessage}>Are you sure you want to {suspendModalUser.status === "ACTIVE" ? "suspend" : "activate"} access for {suspendModalUser.name}?</p>
              </div>
            </div>
            <div className={styles.modalActions}>
              <Button variant="ghost" onClick={() => setSuspendModalUser(null)}>Cancel</Button>
              <Button style={{ background: '#d97706', color: 'white', borderColor: '#d97706' }} onClick={handleSuspendUser}>Confirm</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const PlaceholderView = ({ title }) => (
  <Card style={{ padding: "40px", textAlign: "center" }}>
    <h2 className={styles.pageTitle} style={{ marginBottom: "12px" }}>
      {title} Component
    </h2>
    <p style={{ color: "#64748b" }}>
      Đường dẫn Router hoạt động tốt! Nội dung đang được cập nhật.
    </p>
  </Card>
);

export default function UserManagement() {
  const session = getStoredSession();

  if (!session || session.user.role !== "Admin") {
    return null;
  }

  return <UserManagementView />;
}
