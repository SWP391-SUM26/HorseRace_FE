import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { QueryProvider } from '@/common/providers/QueryProvider';
import { AuthProvider } from '@/common/providers/AuthProvider';
import { ToastProvider } from '@/common/providers/ToastProvider';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryProvider>
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    </QueryProvider>
  </StrictMode>
);
