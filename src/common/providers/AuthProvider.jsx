import { createContext, useEffect, useState } from "react";
import { tokenStore } from "@/common/lib/storage";
import { fetchMe } from "@/common/lib/userApi";
const AuthContext = createContext(null);
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(true);
  useEffect(() => {
    if (!tokenStore.get()) {
      setBootstrapping(false);
      return;
    }
    fetchMe().then(setUser).catch(() => tokenStore.clear()).finally(() => setBootstrapping(false));
  }, []);
  const login = (u, token) => {
    tokenStore.set(token);
    setUser(u);
  };
  const logout = () => {
    tokenStore.clear();
    setUser(null);
  };
  return <AuthContext.Provider value={{ user, isAuthenticated: !!user, bootstrapping, login, setUser, logout }}>
      {children}
    </AuthContext.Provider>;
}
export {
  AuthContext,
  AuthProvider
};
