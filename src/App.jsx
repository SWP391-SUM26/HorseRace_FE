import './index.css';

import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom';

import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import JockeyRegistrationPage from './pages/auth/JockeyRegistrationPage';
import OwnerRegistrationPage from './pages/auth/OwnerRegistrationPage';
import SpectatorRegistrationPage from './pages/auth/SpectatorRegistrationPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import { DashboardLayout } from '@/common/layouts/DashboardLayout';
import OwnerLayout from './layouts/OwnerLayout';
import AdminLayout from './layouts/AdminLayout';
import DashboardHome from './pages/dashboard/DashboardHome';
import AdminDashboard from './pages/Admin/AdminDashboard';
import UserManagement from './pages/Admin/UserManagement';
import TournamentManagement from './pages/Admin/TournamentManagement';
import RaceManagement from './pages/Admin/RaceManagement';
import RaceApproval from './pages/Admin/RaceApproval';
import ResultsPredictions from './pages/Admin/ResultsPredictions';
import Overview from './pages/Owner/Overview';
import StableManagement from './pages/Owner/StableManagement';
import JockeyMarket from './pages/Owner/JockeyMarket';
import JockeyDetail from './pages/Owner/JockeyDetail';
import OwnerRegistrations from './pages/Owner/OwnerRegistrations';
import OwnerRaceSchedule from './pages/Owner/RaceSchedule';
import MyInvitationsPage from '@/features/jockey/pages/MyInvitationsPage'; // For Owner
import JockeyDashboardPage from '@/features/jockey/pages/JockeyDashboardPage';
import JockeyInvitationsPage from '@/features/jockey/pages/JockeyInvitationsPage';
import JockeyProfilePage from '@/features/jockey/pages/JockeyProfilePage';
import PerformancePage from '@/features/jockey/pages/PerformancePage';
import RaceSchedulePage from '@/features/jockey/pages/RaceSchedulePage';
// ---------------------------------------
import RegistrationManagement from '@/features/referee/pages/RegistrationManagementPage';
import PreRaceInspection from '@/features/referee/pages/PreRaceInspectionPage';
import RefereeDashboard from '@/features/referee/pages/RefereeDashboardPage';
import LiveRaceMonitor from '@/features/referee/pages/LiveRaceMonitorPage';
import NotificationsCenter from './pages/shared/NotificationsCenter';
import UserProfile from './pages/shared/UserProfile';
import ViolationManagement from '@/features/referee/pages/ViolationsPage';
import RaceResultRecording from '@/features/referee/pages/RaceResultsPage';
import OfficialReports from './pages/Referee/OfficialReports';
import Settings from './pages/Admin/Settings';
import SpectatorLayout from './layouts/SpectatorLayout';
import LiveRaces from './pages/Spectator/LiveRaces';
import Schedule from './pages/Spectator/Schedule';
import Predictions from './pages/Spectator/Predictions';
import Rewards from './pages/Spectator/Rewards';
import StaffingManagement from './pages/Admin/StaffingManagement';

const OwnerPlaceholder = ({ title }) => (
  <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
    <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '12px' }}>{title}</h2>
    <p style={{ color: '#64748b' }}>Đường dẫn Router hoạt động tốt! Nội dung đang được cập nhật.</p>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>

        {/* HOME */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/jockey-register" element={<JockeyRegistrationPage />} />
        <Route path="/owner-register" element={<OwnerRegistrationPage />} />
        <Route path="/spectator-register" element={<SpectatorRegistrationPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<UserProfile />} />
        </Route>

        {/* DASHBOARDS */}
        <Route element={<ProtectedRoute roles={['Owner']} />}>
          <Route element={<OwnerLayout />}>
            <Route path="/owner/overview" element={<Overview />} />
            <Route path="/owner/stable" element={<StableManagement />} />
            <Route path="/owner/jockey-market" element={<JockeyMarket />} />
            <Route path="/owner/jockey-market/:jockeyId" element={<JockeyDetail />} />
            <Route path="/owner/registrations" element={<OwnerRegistrations />} />
            <Route path="/owner/race-schedule" element={<OwnerRaceSchedule />} />

            {/* Backward-compatible owner routes */}
            <Route path="/owner-dashboard" element={<Overview />} />
            <Route path="/owner-dashboard/stable" element={<StableManagement />} />
            <Route path="/owner-dashboard/notifications" element={<NotificationsCenter />} />
            <Route path="/owner-dashboard/jockeys" element={<JockeyMarket />} />
            <Route path="/owner/invitations" element={<MyInvitationsPage />} />
            <Route path="/owner-dashboard/calendar" element={<OwnerRaceSchedule />} />
            <Route path="/owner-dashboard/financials" element={<OwnerPlaceholder title="💵 Financials" />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={['Jockey']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/jockey-dashboard" element={<JockeyDashboardPage />} />
            <Route path="/jockey/profile" element={<JockeyProfilePage />} />
            <Route path="/jockey/invitations" element={<JockeyInvitationsPage />} />
            <Route path="/jockey/schedule" element={<RaceSchedulePage />} />
            <Route path="/jockey/performance" element={<PerformancePage />} />
            <Route path="/jockey/notifications" element={<NotificationsCenter />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={['Spectator']} />}>
          <Route element={<SpectatorLayout />}>
            <Route path="/spectator-dashboard" element={<LiveRaces />} />
            <Route path="/spectator/live-races" element={<LiveRaces />} />
            <Route path="/spectator/schedule" element={<Schedule />} />
            <Route path="/spectator/predictions" element={<Predictions />} />
            <Route path="/spectator/rewards" element={<Rewards />} />
            <Route path="/spectator/notifications" element={<NotificationsCenter />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={['Referee']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/referee/dashboard" element={<RefereeDashboard />} />
            <Route path="/referee/registration" element={<RegistrationManagement />} />
            <Route path="/referee/inspection" element={<PreRaceInspection />} />
            <Route path="/referee/pre-race-inspection" element={<PreRaceInspection />} />
            <Route path="/referee/live-monitor" element={<LiveRaceMonitor />} />
            <Route path="/referee/notifications" element={<NotificationsCenter />} />
            <Route path="/referee/violations" element={<ViolationManagement />} />
            <Route path="/referee/race-result-recording" element={<RaceResultRecording />} />
            <Route path="/referee/reports" element={<OfficialReports />} />
            <Route path="/referee/settings" element={<Settings />} />
          </Route>
        </Route>

        {/* ADMIN */}
        <Route element={<ProtectedRoute roles={['Admin']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/tournaments" element={<TournamentManagement />} />
            <Route path="/admin/races" element={<RaceManagement />} />
            <Route path="/admin/race-approval" element={<RaceApproval />} />
            <Route path="/admin/results" element={<ResultsPredictions />} />
            <Route path="/admin/staffing" element={<StaffingManagement />} />
            <Route path="/admin/settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
