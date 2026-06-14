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
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardHome from './pages/dashboard/DashboardHome';
import AdminDashboard from './pages/Admin/UserManagement';
import Overview from './pages/Owner/Overview';
import StableManagement from './pages/Owner/StableManagement';
import JockeyMarket from './pages/Owner/JockeyMarket';
import JockeyDetail from './pages/Owner/JockeyDetail';
import InvitationList from './pages/Jockey/InvitationList';

const OwnerPlaceholder = ({ title }) => (
  <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
    <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '12px' }}>{title}</h2>
    <p style={{ color: '#64748b' }}>Đường dẫn Router hoạt động tốt! Nội dung đang được cập nhật.</p>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* HOME */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/jockey-register" element={<JockeyRegistrationPage />} />
        <Route path="/owner-register" element={<OwnerRegistrationPage />} />
        <Route path="/spectator-register" element={<SpectatorRegistrationPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* DASHBOARDS */}
        <Route element={<ProtectedRoute roles={['Owner']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/owner-dashboard" element={<Overview />} />
            <Route path="/owner-dashboard/stable" element={<StableManagement />} />
            <Route path="/owner/jockey-market" element={<JockeyMarket />} />
            <Route path="/owner/jockey-market/:jockeyId" element={<JockeyDetail />} />
            <Route path="/owner-dashboard/jockeys" element={<JockeyMarket />} />
            <Route path="/owner-dashboard/calendar" element={<OwnerPlaceholder title="📅 Race Calendar" />} />
            <Route path="/owner-dashboard/financials" element={<OwnerPlaceholder title="💵 Financials" />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={['Jockey']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/jockey-dashboard" element={<DashboardHome />} />
            <Route path="/jockey/invitations" element={<InvitationList />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={['Spectator']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/spectator-dashboard" element={<DashboardHome />} />
          </Route>
        </Route>

        {/* ADMIN */}
        <Route path="/admin/*" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
