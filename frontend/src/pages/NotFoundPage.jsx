import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/common/Logo';
import ThemeToggle from '../components/common/ThemeToggle';

const NotFoundPage = () => (
  <div className="min-h-screen bg-ink-50 dark:bg-ink-950 transition-colors duration-300">
    <header className="border-b bg-white dark:bg-ink-900 border-ink-100 dark:border-ink-800">
      <div className="flex items-center justify-between max-w-6xl px-4 py-3 mx-auto sm:px-6">
        <Logo size="sm" />
        <ThemeToggle />
      </div>
    </header>
    <main className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <div className="mb-4 text-7xl">🌿</div>
      <h1 className="mb-2 text-6xl font-bold text-verde-600 dark:text-verde-400" style={{fontFamily:'Sora,sans-serif'}}>404</h1>
      <h2 className="mb-3 text-xl font-semibold text-ink-900 dark:text-white">Page Not Found</h2>
      <p className="max-w-sm mb-8 text-ink-500 dark:text-ink-400">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="px-6 py-3 text-sm font-semibold text-white transition-all rounded-2xl bg-verde-600 hover:bg-verde-700">
        Go Home
      </Link>
    </main>
  </div>
);

export default NotFoundPage;
