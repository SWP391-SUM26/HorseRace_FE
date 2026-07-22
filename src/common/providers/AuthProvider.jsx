import { createContext, useEffect, useState } from "react";
import { tokenStore } from "@/common/lib/storage";
import { queryClient } from "@/common/lib/queryClient";
import { registerSessionExpiredHandler } from "@/common/lib/sessionBus";
import { toastError } from "@/common/lib/toastBus";
import { fetchMe } from "@/common/lib/userApi";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    if (!tokenStore.get()) {
      setBootstrapping(false);
      return;
    }
    fetchMe()
      .then(setUser)
      // Only a real 401 means the credential is bad. This used to discard the token on ANY
      // failure — a network blip or a backend restart mid-development was enough to sign the
      // user out for good, which is the likeliest cause of "I keep getting logged out".
      // On a transient error we keep the token: this render lands on /login, but a reload once
      // the backend is back restores the session instead of forcing a fresh sign-in.
      .catch((err) => {
        if (err?.response?.status === 401) tokenStore.clear();
      })
      .finally(() => setBootstrapping(false));
  }, []);

  // The axios interceptor runs outside React; without this the token would be gone while `user`
  // stayed populated, leaving a UI that looks signed-in until the next reload.
  useEffect(() => {
    registerSessionExpiredHandler(() => {
      setUser(null);
      queryClient.clear();
      toastError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    });
    return () => registerSessionExpiredHandler(null);
  }, []);

  const login = (u, token) => {
    tokenStore.set(token);
    setUser(u);
  };
  const logout = () => {
    tokenStore.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, bootstrapping, login, setUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
