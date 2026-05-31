import React from 'react';
import './index.css';

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import JockeyRegistrationPage from './pages/auth/JockeyRegistrationPage';
import OwnerRegistrationPage from './pages/auth/OwnerRegistrationPage';
import SpectatorRegistrationPage from './pages/auth/SpectatorRegistrationPage';

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
      </Routes>
    </BrowserRouter>
  );
}