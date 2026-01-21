import React, { createContext, useContext, useEffect, useState } from "react";

const TOKEN_KEY = "terra-token";

type AuthState = {
  token: string | null;
  user: any | null;
  isAuthenticated: boolean;
  login: (token: string, user: any) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

// TODO: add user type
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY),
  );
  const [user, setUser] = useState<any | null>(null);

  const login = (token: string, user: any) => {
    setToken(token);
    setUser(user);
  };

  const logout = () => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    console.log("logout");
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  const contextValue: AuthState = {
    token,
    user,
    isAuthenticated: Boolean(token),
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
