import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { QueryProvider } from '@/common/providers/QueryProvider';
import { AuthProvider } from '@/common/providers/AuthProvider';
import { ToastProvider } from '@/common/providers/ToastProvider';
import { AppBootstrap } from '@/common/components/AppBootstrap';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryProvider>
      <AuthProvider>
        <ToastProvider>
          {/* Gates the router on session rehydration — without it a hard refresh on a
              guarded URL renders before /users/me resolves and bounces you to /login. */}
          <AppBootstrap>
            <App />
          </AppBootstrap>
        </ToastProvider>
      </AuthProvider>
    </QueryProvider>
  </StrictMode>
);
