import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import NotificationProvider from "./components/common/NotificationProvider";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import NotFoundPage from "./pages/NotFoundPage";
import LoadingSpinner from "./components/common/LoadingSpinner";

const ProtectedRoute = ({ children }) => {
  const { authenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner message="Verifying session..." />
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:projectId"
        element={
          <ProtectedRoute>
            <ProjectDetailPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <NotificationProvider>
          <AppRoutes />
        </NotificationProvider>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
