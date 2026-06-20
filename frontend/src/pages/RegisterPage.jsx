import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/auth.service';
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

    const CheckIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
    </svg>
    );

    const PasswordStrength = ({ password }) => {
    const checks = [
        { label: '6+ characters', valid: password.length >= 6 },
        { label: 'Uppercase letter', valid: /[A-Z]/.test(password) },
        { label: 'Number', valid: /\d/.test(password) },
    ];
    if (!password) return null;
    return (
        <div className="flex gap-3 mt-2 flex-wrap">
        {checks.map(({ label, valid }) => (
            <span key={label} className={`flex items-center gap-1 text-xs ${valid ? 'text-verde-600 dark:text-verde-400' : 'text-ink-400 dark:text-ink-600'}`}>
            <span className={`w-3 h-3 rounded-full flex items-center justify-center ${valid ? 'bg-verde-500' : 'bg-ink-200 dark:bg-ink-700'}`}>
                {valid && <CheckIcon />}
            </span>
            {label}
            </span>
        ))}
        </div>
    );
    };

    const Register = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
        if (form.password.length < 6) return setError('Password must be at least 6 characters.');
        setLoading(true);
        try {
        await registerUser({ fullName: form.fullName, email: form.email, password: form.password, role: 'user' });
        navigate('/login', { state: { message: 'Account created! Please sign in.' } });
        } catch (err) {
        setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
        setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-ink-50 dark:bg-ink-950 flex flex-col transition-colors duration-300">
        <header className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
            <Logo size="md" />
            <ThemeToggle />
        </header>

        <main className="flex-1 flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md">
            <div className="h-1 w-12 rounded-full bg-verde-500 mb-8" />

            <div className="auth-card">
                <div className="mb-8">
                <h1 className="font-display font-bold text-2xl text-ink-900 dark:text-white mb-1"
                    style={{ fontFamily: 'Sora, sans-serif' }}>
                    Create your account
                </h1>
                <p className="text-ink-500 dark:text-ink-400 text-sm">
                    Start tracking your mental wellbeing today — it's free
                </p>
                </div>

                {error && (
                <div className="error-box mb-6">
                    <span className="flex-shrink-0 mt-0.5">⚠</span>
                    <span>{error}</span>
                </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label htmlFor="fullName" className="form-label">Full name</label>
                    <input
                    type="text" id="fullName" name="fullName"
                    value={form.fullName} onChange={handleChange}
                    placeholder="Your full name" required
                    className="input-field"
                    />
                </div>

                <div>
                    <label htmlFor="email" className="form-label">Email address</label>
                    <input
                    type="email" id="email" name="email"
                    value={form.email} onChange={handleChange}
                    placeholder="you@example.com" required
                    className="input-field"
                    />
                </div>

                <div>
                    <label htmlFor="password" className="form-label">Password</label>
                    <div className="relative">
                    <input
                        type={showPass ? 'text' : 'password'}
                        id="password" name="password"
                        value={form.password} onChange={handleChange}
                        placeholder="Minimum 6 characters" required
                        className="input-field pr-12"
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600 dark:hover:text-ink-300 transition-colors">
                        <EyeIcon open={showPass} />
                    </button>
                    </div>
                    <PasswordStrength password={form.password} />
                </div>

                <div>
                    <label htmlFor="confirmPassword" className="form-label">Confirm password</label>
                    <input
                    type="password" id="confirmPassword" name="confirmPassword"
                    value={form.confirmPassword} onChange={handleChange}
                    placeholder="Repeat your password" required
                    className="input-field"
                    />
                </div>

                <div className="pt-2">
                    <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? (
                        <>
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Creating account…
                        </>
                    ) : 'Create account'}
                    </button>
                </div>
                </form>

                <p className="mt-6 text-center text-sm text-ink-500 dark:text-ink-400">
                Already have an account?{' '}
                <Link to="/login" className="text-verde-600 dark:text-verde-400 font-semibold hover:underline">
                    Sign in
                </Link>
                </p>
            </div>

            <p className="text-center text-xs text-ink-400 dark:text-ink-600 mt-6">
                By creating an account, you agree to our Terms & Privacy Policy.
            </p>
            </div>
        </main>

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

export default Register;
