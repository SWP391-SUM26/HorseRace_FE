import { createBrowserRouter, Navigate } from "react-router-dom";
import { DashboardLayout } from "@/common/layouts/DashboardLayout";
import { SpectatorLayout } from "@/common/layouts/SpectatorLayout";
import { useAuth } from "@/common/hooks/useAuth";
import { ProtectedRoute } from "./ProtectedRoute";
import { RoleRoute } from "./RoleRoute";
import HomePage from "@/features/home/pages/HomePage";
import LoginPage from "@/features/auth/pages/LoginPage";
import ForgotPasswordPage from "@/features/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/features/auth/pages/ResetPasswordPage";
import VerifyEmailPage from "@/features/auth/pages/VerifyEmailPage";
import OwnerRegistrationPage from "@/features/auth/pages/OwnerRegistrationPage";
import JockeyRegistrationPage from "@/features/auth/pages/JockeyRegistrationPage";
import SpectatorRegistrationPage from "@/features/auth/pages/SpectatorRegistrationPage";
import StableManagementPage from "@/features/stable/pages/StableManagementPage";
import StableListPage from "@/features/stable/pages/StableListPage";
import HorseFormPage from "@/features/stable/pages/HorseFormPage";
import JockeyMarketPage from "@/features/jockeys/pages/JockeyMarketPage";
import RaceCalendarPage from "@/features/races/pages/RaceCalendarPage";
import RaceReportPage from "@/features/races/pages/RaceReportPage";
import OwnerRaceReportPage from "@/features/races/pages/OwnerRaceReportPage";
import OwnerTournamentCatalogPage from "@/features/tournaments/pages/TournamentCatalogPage";
import FinancesPage from "@/features/finances/pages/FinancesPage";
import ProfilePage from "@/features/profile/pages/ProfilePage";
import JockeyDashboardPage from "@/features/jockey/pages/JockeyDashboardPage";
import JockeyInvitationsPage from "@/features/jockey/pages/JockeyInvitationsPage";
import RaceSchedulePage from "@/features/jockey/pages/RaceSchedulePage";
import PerformancePage from "@/features/jockey/pages/PerformancePage";
import JockeyProfilePage from "@/features/jockey/pages/JockeyProfilePage";
import RefereeDashboardPage from "@/features/referee/pages/RefereeDashboardPage";
import PreRaceInspectionPage from "@/features/referee/pages/PreRaceInspectionPage";
import RaceResultsPage from "@/features/referee/pages/RaceResultsPage";
import ViolationsPage from "@/features/referee/pages/ViolationsPage";
import TournamentInvitationsPage from "@/features/referee/pages/TournamentInvitationsPage";
import MyRaceAssignmentsPage from "@/features/referee/pages/MyRaceAssignmentsPage";
import DocumentReviewPage from "@/features/referee/pages/DocumentReviewPage";
import UploadDocumentsPage from "@/features/owner/pages/UploadDocumentsPage";
import AdminUserManagementPage from "@/features/admin/pages/UserManagementPage";
import AdminTournamentOrchestrationPage from "@/features/admin/pages/TournamentOrchestrationPage";
import AdminTournamentDetailPage from "@/features/admin/pages/TournamentDetailPage";
import AdminRegistrationApprovalPage from "@/features/admin/pages/RegistrationApprovalPage";
import AdminStaffingPage from "@/features/admin/pages/StaffingPage";
import AdminStaffingDetailPage from "@/features/admin/pages/StaffingDetailPage";
import AdminRaceCalendarPage from "@/features/admin/pages/AdminRaceCalendarPage";
import AdminHorseManagementPage from "@/features/admin/pages/HorseManagementPage";
import AdminJockeyManagementPage from "@/features/admin/pages/JockeyManagementPage";
import LiveRaceMonitorPage from "@/features/referee/pages/LiveRaceMonitorPage";
import SpectatorHubPage from "@/features/spectator/pages/SpectatorHubPage";
import PredictionsPage from "@/features/spectator/pages/PredictionsPage";
import RewardsPage from "@/features/spectator/pages/RewardsPage";
import SpectatorLivePage from "@/features/spectator/pages/SpectatorLivePage";
import AdminDashboardPage from "@/features/admin/pages/AdminDashboardPage";
import NotificationsPage from "@/features/notifications/pages/NotificationsPage";
import ConfirmParticipationPage from "@/features/owner/pages/ConfirmParticipationPage";
function NotificationsRoute() {
  const { user } = useAuth();
  if (!user) return null;
  const page = <NotificationsPage />;
  return user.role === "SPECTATOR" ? <SpectatorLayout>{page}</SpectatorLayout> : <DashboardLayout>{page}</DashboardLayout>;
}
const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/forgot", element: <ForgotPasswordPage /> },
  { path: "/reset", element: <ResetPasswordPage /> },
  { path: "/verify-email", element: <VerifyEmailPage /> },
  { path: "/register", element: <Navigate to="/register/spectator" replace /> },
  { path: "/register/owner", element: <OwnerRegistrationPage /> },
  { path: "/register/jockey", element: <JockeyRegistrationPage /> },
  { path: "/register/spectator", element: <SpectatorRegistrationPage /> },
  {
    path: "/app",
    element: <ProtectedRoute />,
    children: [
      // Shared across all roles — renders in the caller's own shell (see NotificationsRoute).
      { path: "notifications", element: <NotificationsRoute /> },
      {
        element: <DashboardLayout />,
        children: [
          {
            element: <RoleRoute allow={["HORSE_OWNER"]} />,
            children: [
              { path: "owner", element: <Navigate to="/app/owner/tournaments" replace /> },
              { path: "owner/tournaments", element: <OwnerTournamentCatalogPage /> },
              { path: "owner/stable", element: <StableListPage /> },
              { path: "owner/stable/new", element: <HorseFormPage mode="create" /> },
              { path: "owner/stable/:horseId", element: <StableManagementPage /> },
              { path: "owner/stable/:horseId/edit", element: <HorseFormPage mode="edit" /> },
              { path: "owner/jockeys", element: <JockeyMarketPage /> },
              { path: "owner/invitations", element: <Navigate to="/app/owner/jockeys" replace /> },
              { path: "owner/registrations", element: <Navigate to="/app/owner/tournaments" replace /> },
              { path: "owner/profile", element: <ProfilePage /> },
              { path: "owner/races", element: <RaceCalendarPage /> },
              { path: "owner/races/:raceId/confirm", element: <ConfirmParticipationPage /> },
              { path: "owner/results", element: <RaceReportPage scope="owner" /> },
              { path: "owner/race-report", element: <OwnerRaceReportPage /> },
              { path: "owner/financials", element: <FinancesPage /> },
              { path: "owner/documents", element: <UploadDocumentsPage /> }
            ]
          },
          {
            element: <RoleRoute allow={["ADMIN"]} />,
            children: [
              { path: "admin", element: <AdminDashboardPage /> },
              { path: "admin/users", element: <AdminUserManagementPage /> },
              { path: "admin/horses", element: <AdminHorseManagementPage /> },
              { path: "admin/jockeys", element: <AdminJockeyManagementPage /> },
              { path: "admin/tournaments", element: <AdminTournamentOrchestrationPage /> },
              { path: "admin/tournaments/:tournamentId", element: <AdminTournamentDetailPage /> },
              { path: "admin/registrations", element: <AdminRegistrationApprovalPage /> },
              { path: "admin/staffing", element: <AdminStaffingPage /> },
              { path: "admin/staffing/:raceId", element: <AdminStaffingDetailPage /> },
              { path: "admin/races", element: <AdminRaceCalendarPage /> },
              { path: "admin/reports", element: <RaceReportPage scope="admin" /> }
            ]
          },
          {
            element: <RoleRoute allow={["JOCKEY"]} />,
            children: [
              { path: "jockey", element: <JockeyDashboardPage /> },
              { path: "jockey/invitations", element: <JockeyInvitationsPage /> },
              { path: "jockey/races", element: <RaceSchedulePage /> },
              { path: "jockey/performance", element: <PerformancePage /> },
              { path: "jockey/profile", element: <JockeyProfilePage /> }
            ]
          },
          {
            element: <RoleRoute allow={["RACE_REFEREE"]} />,
            children: [
              { path: "referee", element: <RefereeDashboardPage /> },
              { path: "referee/inspection", element: <PreRaceInspectionPage /> },
              { path: "referee/results", element: <RaceResultsPage /> },
              { path: "referee/violations", element: <ViolationsPage /> },
              { path: "referee/report", element: <RaceReportPage scope="referee" /> },
              { path: "referee/invitations", element: <TournamentInvitationsPage /> },
              { path: "referee/race-assignments", element: <MyRaceAssignmentsPage /> },
              { path: "referee/document-review", element: <DocumentReviewPage /> },
              { path: "referee/live", element: <LiveRaceMonitorPage /> },
              { path: "referee/live/:raceId", element: <LiveRaceMonitorPage /> }
            ]
          }
        ]
      },
      {
        // SPECTATOR uses a top-navigation shell instead of the sidebar DashboardLayout.
        element: <SpectatorLayout />,
        children: [
          {
            element: <RoleRoute allow={["SPECTATOR"]} />,
            children: [
              { path: "spectator", element: <SpectatorHubPage /> },
              { path: "spectator/predictions", element: <PredictionsPage /> },
              { path: "spectator/rewards", element: <RewardsPage /> },
              { path: "spectator/races/:raceId/live", element: <SpectatorLivePage /> }
            ]
          }
        ]
      }
    ]
  },
  { path: "*", element: <Navigate to="/" replace /> }
]);
export {
  router
};
