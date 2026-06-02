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
            <Route path="/owner-dashboard" element={<DashboardHome />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={['Jockey']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/jockey-dashboard" element={<DashboardHome />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={['Spectator']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/spectator-dashboard" element={<DashboardHome />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
