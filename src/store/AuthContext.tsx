import React, { createContext, useContext, useState } from "react";

export const TOKEN_KEY = "terra-token";

// there are more properties not typed here, see https://urs.earthdata.nasa.gov/documentation/for_integrators/api_documentation#/api/users/%7Buserid%7D
export type User = {
  uid: string;
  first_name: string;
  last_name: string;
  // email_address: string;
};

type AuthState = {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string | null, user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY),
  );
  const [user, setUser] = useState<User | null>(null);

  const login = (token: string | null, user: User) => {
    setToken(token);
    setUser(user);
  };

  const logout = () => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
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
