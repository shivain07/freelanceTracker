import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import api from "../api/axiosClient";
import API_ROUTES from "../api/apiRoutes";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    checkUserSession();
  }, []);

  const checkUserSession = async () => {
    try {
      setLoading(true);
      const res = await api.get(API_ROUTES.auth.verify, {
        suppressAuthError: true,
      });
      verifyUser(res || null);
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error(
          "Unable to verify the current session:",
          error.response?.data || error.message,
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyUser = useCallback((userData) => {
    if (userData?.user?.id) {
      setUser(userData?.user);
      setAuthenticated(true);
    } else {
      setAuthenticated(false);
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, authenticated, setLoading, verifyUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
