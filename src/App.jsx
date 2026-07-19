import './index.css';

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
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
import AdminPredictionManagement from '@/features/admin/pages/PredictionManagementPage';
import AdminRaceReports from '@/features/races/pages/RaceReportPage';
import OwnerTournamentCatalogPage from '@/features/tournaments/pages/TournamentCatalogPage';
import StableListPage from '@/features/stable/pages/StableListPage';
import StableManagementPage from '@/features/stable/pages/StableManagementPage';
import HorseFormPage from '@/features/stable/pages/HorseFormPage';
import JockeyMarketPage from '@/features/jockeys/pages/JockeyMarketPage';
import RaceCalendarPage from '@/features/races/pages/RaceCalendarPage';
import ConfirmParticipationPage from '@/features/owner/pages/ConfirmParticipationPage';
import OwnerRaceReportPage from '@/features/races/pages/OwnerRaceReportPage';
import UploadDocumentsPage from '@/features/owner/pages/UploadDocumentsPage';
import FinancesPage from '@/features/finances/pages/FinancesPage';
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
import ProfilePage from '@/features/profile/pages/ProfilePage';
import ViolationManagement from '@/features/referee/pages/ViolationsPage';
import RaceResultRecording from '@/features/referee/pages/RaceResultsPage';
import MyRaceAssignmentsPage from '@/features/referee/pages/MyRaceAssignmentsPage';
import RefereeRegistrationApproval from '@/features/referee/pages/RegistrationApprovalPage';
import TournamentInvitationsPage from '@/features/referee/pages/TournamentInvitationsPage';
import RaceReportPage from '@/features/races/pages/RaceReportPage';
import Settings from './pages/Admin/Settings';
import { SpectatorLayout } from '@/common/layouts/SpectatorLayout';
import SpectatorHubPage from '@/features/spectator/pages/SpectatorHubPage';
import PredictionsPage from '@/features/spectator/pages/PredictionsPage';
import RewardsPage from '@/features/spectator/pages/RewardsPage';
import SpectatorLivePage from '@/features/spectator/pages/SpectatorLivePage';
import WalletPage from '@/features/wallet/pages/WalletPage';
import WalletReturnPage from '@/features/wallet/pages/WalletReturnPage';
import NotificationsPage from '@/features/notifications/pages/NotificationsPage';


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
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/app/notifications" element={<NotificationsPage />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/wallet/return" element={<WalletReturnPage />} />
          </Route>
        </Route>

        {/* DASHBOARDS */}
        <Route element={<ProtectedRoute roles={['Owner']} />}>
          <Route element={<OwnerLayout />}>
            {/* Owner home is the tournament catalogue (there is no separate overview page). */}
            <Route path="/owner" element={<Navigate to="/owner/tournaments" replace />} />
            <Route path="/owner/overview" element={<Navigate to="/owner/tournaments" replace />} />
            <Route path="/owner/tournaments" element={<OwnerTournamentCatalogPage />} />
            <Route path="/owner/stable" element={<StableListPage />} />
            <Route path="/owner/stable/new" element={<HorseFormPage mode="create" />} />
            <Route path="/owner/stable/:horseId" element={<StableManagementPage />} />
            <Route path="/owner/stable/:horseId/edit" element={<HorseFormPage mode="edit" />} />
            <Route path="/owner/jockey-market" element={<JockeyMarketPage />} />
            <Route path="/owner/invitations" element={<MyInvitationsPage />} />
            <Route path="/owner/race-schedule" element={<RaceCalendarPage />} />
            <Route
              path="/owner/race-schedule/:raceId/confirm"
              element={<ConfirmParticipationPage />}
            />
            <Route path="/owner/results" element={<AdminRaceReports scope="owner" />} />
            <Route path="/owner/race-report" element={<OwnerRaceReportPage />} />
            <Route path="/owner/documents" element={<UploadDocumentsPage />} />
            <Route path="/owner/financials" element={<FinancesPage />} />
            <Route
              path="/owner/registrations"
              element={<Navigate to="/owner/tournaments" replace />}
            />

            {/* Backward-compatible owner routes */}
            <Route path="/owner-dashboard" element={<Navigate to="/owner/tournaments" replace />} />
            <Route path="/owner-dashboard/stable" element={<Navigate to="/owner/stable" replace />} />
            <Route
              path="/owner-dashboard/notifications"
              element={<Navigate to="/app/notifications" replace />}
            />
            <Route
              path="/owner-dashboard/jockeys"
              element={<Navigate to="/owner/jockey-market" replace />}
            />
            <Route
              path="/owner-dashboard/calendar"
              element={<Navigate to="/owner/race-schedule" replace />}
            />
            <Route
              path="/owner-dashboard/financials"
              element={<Navigate to="/owner/financials" replace />}
            />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={['Jockey']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/jockey-dashboard" element={<JockeyDashboardPage />} />
            <Route path="/jockey/profile" element={<JockeyProfilePage />} />
            <Route path="/jockey/invitations" element={<JockeyInvitationsPage />} />
            <Route path="/jockey/schedule" element={<RaceSchedulePage />} />
            <Route path="/jockey/performance" element={<PerformancePage />} />
            <Route path="/jockey/notifications" element={<Navigate to="/app/notifications" replace />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={['Spectator']} />}>
          <Route element={<SpectatorLayout />}>
            <Route path="/spectator-dashboard" element={<SpectatorHubPage />} />
            <Route path="/spectator/live-races" element={<SpectatorLivePage />} />
            <Route path="/spectator/predictions" element={<PredictionsPage />} />
            <Route path="/spectator/rewards" element={<RewardsPage />} />
            <Route path="/spectator/notifications" element={<Navigate to="/app/notifications" replace />} />
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
            <Route path="/referee/notifications" element={<Navigate to="/app/notifications" replace />} />
            <Route path="/referee/registration" element={<RegistrationManagement />} />
            <Route path="/referee/applications" element={<RefereeRegistrationApproval />} />
            <Route path="/referee/settings" element={<Settings />} />
          </Route>
        </Route>

        {/* ADMIN */}
        <Route element={<ProtectedRoute roles={['Admin']} />}>
          <Route element={<AdminLayout />}>
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
            <Route path="/admin/predictions" element={<AdminPredictionManagement />} />
            <Route path="/admin/settings" element={<Settings />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
