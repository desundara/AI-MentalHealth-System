import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/common/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import UserDashboardPage from './pages/UserDashboardPage';
import MoodHistoryPage from './pages/MoodHistoryPage';
import UserProfilePage from './pages/UserProfilePage';
import CounselorDashboard from './pages/CounselorDashboard';
import NotFoundPage from './pages/NotFoundPage';

const UnauthorizedPage = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-ink-50 dark:bg-ink-950 text-center px-4">
    <div className="text-6xl mb-4">🔒</div>
    <h2 className="text-2xl font-bold text-ink-900 dark:text-white mb-2">Access Restricted</h2>
    <p className="text-ink-500 dark:text-ink-400 mb-6">You don't have permission to view this page.</p>
    <a href="/login" className="px-6 py-3 text-sm font-semibold text-white rounded-2xl bg-verde-600 hover:bg-verde-700 transition-all">Go to Login</a>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/"          element={<LandingPage />} />
            <Route path="/login"     element={<LoginPage />} />
            <Route path="/register"  element={<RegisterPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* User routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute roles={['user']}>
                <UserDashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/history" element={
              <ProtectedRoute roles={['user']}>
                <MoodHistoryPage />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute roles={['user']}>
                <UserProfilePage />
              </ProtectedRoute>
            } />

            {/* Counselor routes */}
            <Route path="/counselor/dashboard" element={
              <ProtectedRoute roles={['counselor']}>
                <CounselorDashboard />
              </ProtectedRoute>
            } />

            {/* Admin routes */}
            <Route path="/admin" element={
              <ProtectedRoute roles={['superadmin']}>
                <AdminPage />
              </ProtectedRoute>
            } />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
