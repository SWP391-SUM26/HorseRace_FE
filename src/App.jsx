import React from 'react';
import './index.css';

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import HomePage from './pages/HomePage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* HOME */}
        <Route path="/" element={<HomePage />} />

        

      </Routes>
    </BrowserRouter>
  );
}