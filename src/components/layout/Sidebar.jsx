import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import styles from './Sidebar.module.css';
import { ShieldIcon, UsersIcon, TrophyIcon, CheckSquareIcon, ClipboardIcon, SettingsIcon, FileTextIcon, BarChartIcon } from '../ui/Icons';

export default function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { path: '/admin/users', icon: UsersIcon, label: 'User Management' },
    { path: '/admin/tournaments', icon: TrophyIcon, label: 'Tournaments' },
    { path: '/admin/races', icon: CheckSquareIcon, label: 'Race Approval' },
    { path: '/admin/staffing', icon: ClipboardIcon, label: 'Staffing' },
    { path: '/admin/settings', icon: SettingsIcon, label: 'Settings' },
    { path: '/admin/logs', icon: FileTextIcon, label: 'Audit Logs' },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarLogo}>
        <ShieldIcon className={styles.logoIcon} />
        <div className={styles.logoText}>
          <div className={styles.logoTitle}>Equine Elite</div>
          <div className={styles.logoSubtitle}>ADMIN MANAGEMENT</div>
        </div>
      </div>
      
      <nav className={styles.sidebarNav}>
        {menuItems.slice(0, 4).map(item => {
          const isActive = location.pathname === item.path || 
                           (item.path === '/admin/users' && (location.pathname === '/admin' || location.pathname === '/admin/'));
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`${styles.sidebarItem} ${isActive ? styles.sidebarItemActive : ''}`}
            >
              <item.icon className={styles.sidebarItemIcon} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
      
      <div className={styles.sidebarBottom}>
        {menuItems.slice(4).map(item => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`${styles.sidebarItem} ${isActive ? styles.sidebarItemActive : ''}`}
            >
              <item.icon className={styles.sidebarItemIcon} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
        <button className={styles.systemReportBtn}>
          <BarChartIcon className={styles.reportIcon} />
          System Report
        </button>
      </div>
    </aside>
  );
}
