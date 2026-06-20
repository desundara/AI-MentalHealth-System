import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { loginUser } from '../services/auth.service';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/common/Logo';
import ThemeToggle from '../components/common/ThemeToggle';

const EyeIcon = ({ open }) => open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
    </svg>
    ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
    );

    const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const successMsg = location.state?.message;

    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
        const res = await loginUser(form);
        login(res.data.token, res.data.user);
        if (res.data.user.role === 'counselor') {
            navigate('/counselor/dashboard');
        } else {
            navigate('/dashboard');
        }
        } catch (err) {
        setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
        setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-ink-50 dark:bg-ink-950 flex flex-col transition-colors duration-300">
        {/* Top nav */}
        <header className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
            <Logo size="md" />
            <ThemeToggle />
        </header>

        {/* Main content */}
        <main className="flex-1 flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md">
            {/* Decorative accent */}
            <div className="h-1 w-12 rounded-full bg-verde-500 mb-8" />

            <div className="auth-card">
                {/* Header */}
                <div className="mb-8">
                <h1 className="font-display font-bold text-2xl text-ink-900 dark:text-white mb-1"
                    style={{ fontFamily: 'Sora, sans-serif' }}>
                    Welcome back
                </h1>
                <p className="text-ink-500 dark:text-ink-400 text-sm">
                    Sign in to continue your wellness journey
                </p>
                </div>

                {/* Success message */}
                {successMsg && (
                <div className="flex items-center gap-3 p-4 mb-6 rounded-xl bg-verde-50 dark:bg-verde-950/30 border border-verde-200 dark:border-verde-800 text-verde-700 dark:text-verde-400 text-sm">
                    <span>✓</span>
                    <span>{successMsg}</span>
                </div>
                )}

                {/* Error */}
                {error && (
                <div className="error-box mb-6">
                    <span className="flex-shrink-0 mt-0.5">⚠</span>
                    <span>{error}</span>
                </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                    <label htmlFor="email" className="form-label">Email address</label>
                    <input
                    type="email"
                    id="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    className="input-field"
                    />
                </div>

                {/* Password */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                    <label htmlFor="password" className="form-label mb-0">Password</label>
                    <a href="#!" className="text-xs text-verde-600 dark:text-verde-400 hover:underline">
                        Forgot password?
                    </a>
                    </div>
                    <div className="relative">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        required
                        className="input-field pr-12"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600 dark:hover:text-ink-300 transition-colors"
                    >
                        <EyeIcon open={showPassword} />
                    </button>
                    </div>
                </div>

                <div className="pt-2">
                    <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? (
                        <>
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Signing in…
                        </>
                    ) : 'Sign in'}
                    </button>
                </div>
                </form>

                <p className="mt-6 text-center text-sm text-ink-500 dark:text-ink-400">
                No account yet?{' '}
                <Link to="/register" className="text-verde-600 dark:text-verde-400 font-semibold hover:underline">
                    Create one free
                </Link>
                </p>
            </div>

            {/* Tagline */}
            <p className="text-center text-xs text-ink-400 dark:text-ink-600 mt-6">
                Your mental wellness journey, guided & private.
            </p>
            </div>
        </main>

        {/* Side decoration for large screens */}
        <div className="fixed right-0 top-0 h-full w-1/3 pointer-events-none hidden lg:block overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-l from-verde-50 to-transparent dark:from-verde-950/20 dark:to-transparent" />
            <svg viewBox="0 0 400 800" className="absolute right-0 top-0 h-full opacity-10 dark:opacity-5" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="350" cy="200" r="180" stroke="#22c55e" strokeWidth="1.5"/>
            <circle cx="200" cy="500" r="240" stroke="#22c55e" strokeWidth="1"/>
            <circle cx="380" cy="680" r="120" stroke="#22c55e" strokeWidth="1"/>
            </svg>
        </div>
        </div>
    );
};

export default Login;
