import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredSession, logout } from '../../services/auth';
import { BellIcon } from '../ui/Icons';
import styles from './Navbar.module.css';

export default function Navbar({ title, systemStatus }) {
  const navigate = useNavigate();
  const session = getStoredSession();
  const adminName = session?.user?.name || "System Admin";
  const adminAvatar = session?.user?.avatar || "AD";

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNotificationsClick = () => {
    const role = session?.user?.role;
    if (role === 'Admin') navigate('/admin/notifications');
    else if (role === 'Owner') navigate('/owner-dashboard/notifications');
    else if (role === 'Jockey') navigate('/jockey/notifications');
    else if (role === 'Referee') navigate('/referee/notifications');
    else if (role === 'Spectator') navigate('/spectator/notifications');
    else navigate('/login');
  };

  return (
    <header className={styles.topbar}>
      <div className={styles.topbarLeft}>
        <span className={styles.topbarTitle}>{title}</span>
        {systemStatus && (
          <span className={styles.topbarStatus}>{systemStatus}</span>
        )}
      </div>
      <div className={styles.topbarActions}>
        <button className={styles.topbarIconBtn} title="Notifications" onClick={handleNotificationsClick}>
          <BellIcon className={styles.bellIcon} />
          <span className={styles.topbarBadge} />
        </button>
        <div className={styles.userInfo}>
          <span className={styles.userName}>{adminName}</span>
          <button 
            onClick={handleLogout} 
            className={styles.userAvatar} 
            title="Sign out"
          >
            {adminAvatar}
          </button>
        </div>
      </div>
    </header>
  );
}
