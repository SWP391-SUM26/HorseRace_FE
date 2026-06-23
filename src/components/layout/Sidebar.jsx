import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../../services/auth';
import styles from './Sidebar.module.css';
import {
  BarChartIcon,
  CheckSquareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardIcon,
  FileTextIcon,
  SettingsIcon,
  ShieldIcon,
  TrophyIcon,
  UsersIcon,
  BellIcon,
} from '../ui/Icons';

const defaultMenuItems = [
  { path: '/admin/users', icon: UsersIcon, label: 'User Management' },
  { path: '/admin/approvals', icon: ClipboardIcon, label: 'Registration Approval' },
  { path: '/admin/tournaments', icon: TrophyIcon, label: 'Tournaments' },
  { path: '/admin/races', icon: CheckSquareIcon, label: 'Race Management' },
  { path: '/admin/race-approval', icon: FileTextIcon, label: 'Race Approval' },
  { path: '/admin/staffing', icon: ClipboardIcon, label: 'Staffing' },
  { path: '/admin/notifications', icon: BellIcon, label: 'Notifications' },
  { path: '/admin/settings', icon: SettingsIcon, label: 'Settings', bottom: true },
  { path: '/admin/logs', icon: FileTextIcon, label: 'Audit Logs', bottom: true },
];

export default function Sidebar({
  menuItems = defaultMenuItems,
  title = 'Equine Elite',
  subtitle = 'ADMIN MANAGEMENT',
  footerAction,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('equine_elite_sidebar_collapsed') === 'true',
  );
  const primaryItems = menuItems.filter((item) => !item.bottom);
  const bottomItems = menuItems.filter((item) => item.bottom);

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  function toggleSidebar() {
    setCollapsed((current) => {
      const nextValue = !current;
      localStorage.setItem(
        'equine_elite_sidebar_collapsed',
        String(nextValue),
      );
      return nextValue;
    });
  }

  function isItemActive(item) {
    if (item.isActive) {
      return item.isActive(location.pathname);
    }

    if (item.end) {
      return location.pathname === item.path;
    }

    return location.pathname === item.path ||
      location.pathname.startsWith(`${item.path}/`) ||
      (item.path === '/admin/users' && (location.pathname === '/admin' || location.pathname === '/admin/'));
  }

  function renderMenuItem(item) {
    const Icon = item.icon;
    const isActive = isItemActive(item);
    const className = `${styles.sidebarItem} ${isActive ? styles.sidebarItemActive : ''}`;
    const title = collapsed ? item.label : undefined;

    if (item.onClick) {
      return (
        <button
          key={item.label}
          type="button"
          className={className}
          title={title}
          onClick={item.onClick}
        >
          <Icon className={styles.sidebarItemIcon} />
          <span className={styles.itemLabel}>{item.label}</span>
        </button>
      );
    }

    return (
      <NavLink
        key={item.path}
        to={item.path}
        className={className}
        title={title}
      >
        <Icon className={styles.sidebarItemIcon} />
        <span className={styles.itemLabel}>{item.label}</span>
      </NavLink>
    );
  }

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.sidebarLogo}>
        <ShieldIcon className={styles.logoIcon} />
        <div className={styles.logoText}>
          <div className={styles.logoTitle}>{title}</div>
          <div className={styles.logoSubtitle}>{subtitle}</div>
        </div>
      </div>
      
      <nav className={styles.sidebarNav}>
        {primaryItems.map(renderMenuItem)}
      </nav>
      
      <div className={styles.sidebarBottom}>
        {bottomItems.map(renderMenuItem)}
        {footerAction === undefined ? (
          <button className={styles.systemReportBtn}>
            <BarChartIcon className={styles.reportIcon} />
            <span className={styles.itemLabel}>System Report</span>
          </button>
        ) : footerAction}
        <button
          type="button"
          className={styles.toggleButton}
          onClick={toggleSidebar}
          aria-label={collapsed ? 'Open sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Open sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </button>
        <button
          type="button"
          className={styles.logoutButton}
          onClick={handleLogout}
        >
          <span className={styles.itemLabel}>Log out</span>
        </button>
      </div>
    </aside>
  );
}
