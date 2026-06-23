import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import MoodLogPage from './pages/MoodLogPage';

// Placeholder pages (Week 2 onwards)
import Logo from './components/common/Logo';
import ThemeToggle from './components/common/ThemeToggle';

const PlaceholderPage = ({ title, emoji, week }) => (
  <div className="min-h-screen transition-colors duration-300 bg-ink-50 dark:bg-ink-950">
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-ink-100 dark:border-ink-800 dark:bg-ink-900">
      <Logo size="md" />
      <ThemeToggle />
    </header>
    <main className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <div className="mb-6 text-6xl">{emoji}</div>
      <h2 className="mb-3 text-3xl font-bold font-display text-ink-900 dark:text-white"
          style={{ fontFamily: 'Sora, sans-serif' }}>
        {title}
      </h2>
      <p className="max-w-sm text-ink-500 dark:text-ink-400">
        Coming in <span className="font-semibold text-verde-600 dark:text-verde-400">{week}</span>. Stay tuned!
      </p>
      <div className="w-16 h-1 mx-auto mt-8 rounded-full bg-verde-500" />
    </main>
  </div>
);

const UserDashboardPage      = () => <PlaceholderPage title="User Dashboard"       emoji="🌿" week="Week 2" />;
const CounselorDashboardPage = () => <PlaceholderPage title="Counselor Dashboard"  emoji="🧑‍⚕️" week="Week 4" />;
const UnauthorizedPage       = () => <PlaceholderPage title="Access Restricted"    emoji="🔒" week="N/A" />;

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login"         element={<LoginPage />} />
            <Route path="/register"      element={<RegisterPage />} />
            <Route path="/unauthorized"  element={<UnauthorizedPage />} />

            <Route path="/counselor/dashboard" element={
              <ProtectedRoute roles={['counselor']}>
                <CounselorDashboardPage />
              </ProtectedRoute>
            } />
            
            <Route path="/admin" element={
              <ProtectedRoute roles={['superadmin']}>
                <AdminPage />
              </ProtectedRoute>
            } />

            <Route path="/dashboard" element={
              <ProtectedRoute roles={['user']}>
                <MoodLogPage />
              </ProtectedRoute>
            } />

            <Route path="/"  element={<Navigate to="/login" replace />} />
            <Route path="*"  element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
