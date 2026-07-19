import './index.css';

import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom';

import HomePage from './pages/HomePage';
import LoginPage from '@/features/auth/pages/LoginPage';
import JockeyRegistrationPage from '@/features/auth/pages/JockeyRegistrationPage';
import OwnerRegistrationPage from '@/features/auth/pages/OwnerRegistrationPage';
import SpectatorRegistrationPage from '@/features/auth/pages/SpectatorRegistrationPage';
import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/features/auth/pages/ResetPasswordPage';
import VerifyEmailPage from '@/features/auth/pages/VerifyEmailPage';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import { DashboardLayout } from '@/common/layouts/DashboardLayout';
import OwnerLayout from './layouts/OwnerLayout';
import AdminLayout from './layouts/AdminLayout';
import DashboardHome from './pages/dashboard/DashboardHome';
import AdminDashboardV2 from '@/features/admin/pages/AdminDashboardPage';
import AdminUserManagement from '@/features/admin/pages/UserManagementPage';
import AdminHorseManagement from '@/features/admin/pages/HorseManagementPage';
import AdminJockeyManagement from '@/features/admin/pages/JockeyManagementPage';
import AdminTournamentOrchestration from '@/features/admin/pages/TournamentOrchestrationPage';
import AdminTournamentDetail from '@/features/admin/pages/TournamentDetailPage';
import AdminRaceManagement from '@/features/admin/pages/RaceManagementPage';
import AdminRaceCalendar from '@/features/admin/pages/AdminRaceCalendarPage';
import AdminRegistrationApproval from '@/features/admin/pages/RegistrationApprovalPage';
import AdminStaffingV2 from '@/features/admin/pages/StaffingPage';
import AdminStaffingDetail from '@/features/admin/pages/StaffingDetailPage';
import AdminWithdrawals from '@/features/admin/pages/WithdrawalsPage';
import AdminRaceReports from '@/features/races/pages/RaceReportPage';
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
import MyRaceAssignmentsPage from '@/features/referee/pages/MyRaceAssignmentsPage';
import TournamentInvitationsPage from '@/features/referee/pages/TournamentInvitationsPage';
import RaceReportPage from '@/features/races/pages/RaceReportPage';
import Settings from './pages/Admin/Settings';
import { SpectatorLayout } from '@/common/layouts/SpectatorLayout';
import SpectatorHubPage from '@/features/spectator/pages/SpectatorHubPage';
import PredictionsPage from '@/features/spectator/pages/PredictionsPage';
import RewardsPage from '@/features/spectator/pages/RewardsPage';
import SpectatorLivePage from '@/features/spectator/pages/SpectatorLivePage';


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
              <Route path="/register/jockey" element={<JockeyRegistrationPage />} />
        <Route path="/jockey-register" element={<JockeyRegistrationPage />} />
        <Route path="/register/owner" element={<OwnerRegistrationPage />} />
        <Route path="/owner-register" element={<OwnerRegistrationPage />} />
        <Route path="/register/spectator" element={<SpectatorRegistrationPage />} />
        <Route path="/spectator-register" element={<SpectatorRegistrationPage />} />
        <Route path="/forgot" element={<ForgotPasswordPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset" element={<ResetPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/app/notifications" element={<NotificationsPage />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/wallet/return" element={<WalletReturnPage />} />
          </Route>
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
            <Route path="/spectator-dashboard" element={<SpectatorHubPage />} />
            <Route path="/spectator/live-races" element={<SpectatorLivePage />} />
            <Route path="/spectator/predictions" element={<PredictionsPage />} />
            <Route path="/spectator/rewards" element={<RewardsPage />} />
            <Route path="/spectator/notifications" element={<NotificationsCenter />} />
            <Route path="/app/wallet" element={<WalletPage />} />
            <Route path="/app/wallet/return" element={<WalletReturnPage />} />  
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={['Referee']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/referee/dashboard" element={<RefereeDashboard />} />
            <Route path="/referee/inspection" element={<PreRaceInspection />} />
            <Route path="/referee/pre-race-inspection" element={<PreRaceInspection />} />
            <Route path="/referee/race-result-recording" element={<RaceResultRecording />} />
            <Route path="/referee/violations" element={<ViolationManagement />} />
            <Route path="/referee/reports" element={<RaceReportPage scope="referee" />} />
            <Route path="/referee/invitations" element={<TournamentInvitationsPage />} />
            <Route path="/referee/race-assignments" element={<MyRaceAssignmentsPage />} />
            <Route path="/referee/live-monitor" element={<LiveRaceMonitor />} />
            <Route path="/referee/live-monitor/:raceId" element={<LiveRaceMonitor />} />
            <Route path="/referee/notifications" element={<NotificationsCenter />} />
            <Route path="/referee/registration" element={<RegistrationManagement />} />
            <Route path="/referee/settings" element={<Settings />} />
          </Route>
        </Route>

        {/* ADMIN */}
        <Route element={<ProtectedRoute roles={['Admin']} />}>
          <Route element={<AdminLayout />}>
            {/* V2 admin routes used by the migrated Admin sidebar/dashboard */}
            <Route path="/app/admin" element={<AdminDashboardV2 />} />
            <Route path="/app/admin/dashboard" element={<AdminDashboardV2 />} />
            <Route path="/app/admin/users" element={<AdminUserManagement />} />
            <Route path="/app/admin/horses" element={<AdminHorseManagement />} />
            <Route path="/app/admin/jockeys" element={<AdminJockeyManagement />} />
            <Route path="/app/admin/tournaments" element={<AdminTournamentOrchestration />} />
            <Route path="/app/admin/tournaments/:tournamentId" element={<AdminTournamentDetail />} />
            <Route path="/app/admin/races" element={<AdminRaceCalendar />} />
            <Route path="/app/admin/race-management" element={<AdminRaceManagement />} />
            <Route path="/app/admin/race-calendar" element={<AdminRaceCalendar />} />
            <Route path="/app/admin/race-approval" element={<AdminRegistrationApproval />} />
            <Route path="/app/admin/registration-approval" element={<AdminRegistrationApproval />} />
            <Route path="/app/admin/registrations" element={<AdminRegistrationApproval />} />
            <Route path="/app/admin/reports" element={<AdminRaceReports scope="admin" />} />
            <Route path="/app/admin/results" element={<AdminRaceReports scope="admin" />} />
            <Route path="/app/admin/staffing" element={<AdminStaffingV2 />} />
            <Route path="/app/admin/staffing/:raceId" element={<AdminStaffingDetail />} />
            <Route path="/app/admin/withdrawals" element={<AdminWithdrawals />} />
            <Route path="/app/admin/settings" element={<Settings />} />

            {/* Backward-compatible admin routes */}
            <Route path="/admin" element={<AdminDashboardV2 />} />
            <Route path="/admin/dashboard" element={<AdminDashboardV2 />} />
            <Route path="/admin/users" element={<AdminUserManagement />} />
            <Route path="/admin/horses" element={<AdminHorseManagement />} />
            <Route path="/admin/jockeys" element={<AdminJockeyManagement />} />
            <Route path="/admin/tournaments" element={<AdminTournamentOrchestration />} />
            <Route path="/admin/tournaments/:tournamentId" element={<AdminTournamentDetail />} />
            <Route path="/admin/races" element={<AdminRaceCalendar />} />
            <Route path="/admin/race-management" element={<AdminRaceManagement />} />
            <Route path="/admin/race-calendar" element={<AdminRaceCalendar />} />
            <Route path="/admin/race-approval" element={<AdminRegistrationApproval />} />
            <Route path="/admin/registration-approval" element={<AdminRegistrationApproval />} />
            <Route path="/admin/registrations" element={<AdminRegistrationApproval />} />
            <Route path="/admin/reports" element={<AdminRaceReports scope="admin" />} />
            <Route path="/admin/results" element={<AdminRaceReports scope="admin" />} />
            <Route path="/admin/staffing" element={<AdminStaffingV2 />} />
            <Route path="/admin/staffing/:raceId" element={<AdminStaffingDetail />} />
            <Route path="/admin/withdrawals" element={<AdminWithdrawals />} />
            <Route path="/admin/settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
