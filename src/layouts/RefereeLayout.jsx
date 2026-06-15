import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import {
  BarChartIcon,
  CheckSquareIcon,
  ClipboardIcon,
  EyeIcon,
  FileTextIcon,
  ShieldIcon,
} from '../components/ui/Icons';
import styles from './RefereeLayout.module.css';

const menuItems = [
  { path: '/referee/dashboard', icon: BarChartIcon, label: 'Dashboard' },
  {
    path: '/referee/registrations',
    icon: CheckSquareIcon,
    label: 'Registration Management',
  },
  { path: '/referee/inspection', icon: ClipboardIcon, label: 'Pre-Race Inspection' },
  { path: '/referee/live-monitor', icon: EyeIcon, label: 'Live Monitor' },
  { path: '/referee/violations', icon: ShieldIcon, label: 'Violations' },
  { path: '/referee/reports', icon: FileTextIcon, label: 'Reports' },
];

export default function RefereeLayout() {
  return (
    <div className={styles.layout}>
      <Sidebar
        menuItems={menuItems}
        subtitle="REFEREE PORTAL"
        footerAction={null}
      />
      <div className={styles.content}>
        <Navbar title="Equine Elite Referee" systemStatus="Review System: Online" />
        <main className={styles.page}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
