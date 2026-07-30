import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/common/Logo';
import ThemeToggle from '../components/common/ThemeToggle';

const Feature = ({ emoji, title, desc }) => (
  <div className="p-6 bg-white border shadow-sm dark:bg-ink-900 rounded-2xl border-ink-100 dark:border-ink-800 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-center w-12 h-12 mb-4 text-2xl rounded-xl bg-verde-50 dark:bg-verde-950/30">
      {emoji}
    </div>
    <h3 className="mb-2 text-base font-semibold text-ink-900 dark:text-white">{title}</h3>
    <p className="text-sm leading-relaxed text-ink-500 dark:text-ink-400">{desc}</p>
  </div>
);

const Step = ({ num, title, desc }) => (
  <div className="flex gap-4">
    <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 text-sm font-bold text-white rounded-full bg-verde-600">
      {num}
    </div>
    <div>
      <h4 className="mb-1 font-semibold text-ink-900 dark:text-white">{title}</h4>
      <p className="text-sm text-ink-500 dark:text-ink-400">{desc}</p>
    </div>
  </div>
);

const LandingPage = () => {
  return (
    <div className="min-h-screen transition-colors duration-300 bg-ink-50 dark:bg-ink-950">

      {/* Navbar */}
      <header className="sticky top-0 z-20 border-b bg-white/80 dark:bg-ink-900/80 backdrop-blur-md border-ink-100 dark:border-ink-800">
        <div className="flex items-center justify-between max-w-6xl px-4 py-3 mx-auto sm:px-6">
          <Logo size="sm" />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/login"
              className="px-4 py-2 text-sm font-medium transition-all text-ink-600 dark:text-ink-300 hover:text-verde-600 dark:hover:text-verde-400">
              Sign In
            </Link>
            <Link to="/register"
              className="px-4 py-2 text-sm font-semibold text-white transition-all rounded-xl bg-verde-600 hover:bg-verde-700">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-verde-100 dark:bg-verde-950/20 blur-3xl opacity-60 -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-verde-50 dark:bg-verde-950/10 blur-2xl opacity-40 -ml-16 -mb-16" />
        </div>
        <div className="relative max-w-4xl px-4 py-20 mx-auto text-center sm:px-6 sm:py-28">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 text-xs font-semibold border rounded-full bg-verde-50 dark:bg-verde-950/30 text-verde-700 dark:text-verde-400 border-verde-200 dark:border-verde-800">
            <span className="w-1.5 h-1.5 rounded-full bg-verde-500 animate-pulse" />
            AI-Powered Mental Health Support
          </div>
          <h1 className="mb-6 text-4xl font-bold leading-tight sm:text-5xl md:text-6xl text-ink-900 dark:text-white" style={{fontFamily:'Sora,sans-serif'}}>
            Your Mental Wellness,
            <span className="block text-verde-600 dark:text-verde-400">Guided by AI</span>
          </h1>
          <p className="max-w-2xl mx-auto mb-10 text-lg leading-relaxed text-ink-500 dark:text-ink-400">
            Track your daily mood, receive personalised AI risk assessments, and connect with counsellors — all in one secure, private platform.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link to="/register"
              className="flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white transition-all rounded-2xl bg-verde-600 hover:bg-verde-700 shadow-sm hover:shadow-md w-full sm:w-auto justify-center">
              Start Tracking Free
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
            <Link to="/login"
              className="flex items-center gap-2 px-8 py-3.5 text-base font-semibold transition-all border rounded-2xl text-ink-700 dark:text-ink-200 border-ink-200 dark:border-ink-700 hover:bg-ink-100 dark:hover:bg-ink-800 w-full sm:w-auto justify-center">
              Sign In
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto mt-16 pt-10 border-t border-ink-100 dark:border-ink-800">
            {[
              { value: '3', label: 'Risk Levels' },
              { value: 'AI', label: 'Powered Assessment' },
              { value: '100%', label: 'Private & Secure' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-bold text-verde-600 dark:text-verde-400" style={{fontFamily:'Sora,sans-serif'}}>{s.value}</p>
                <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl px-4 py-16 mx-auto sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-2xl font-bold sm:text-3xl text-ink-900 dark:text-white" style={{fontFamily:'Sora,sans-serif'}}>
            Everything you need for mental wellness
          </h2>
          <p className="text-ink-500 dark:text-ink-400">Comprehensive tools designed with your wellbeing in mind</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Feature emoji="🤖" title="AI Risk Assessment"
            desc="Log your daily mood and receive instant AI-powered risk analysis with personalised coping strategies." />
          <Feature emoji="📊" title="Mood Trend Charts"
            desc="Visualise your mood, stress, and anxiety patterns over time with beautiful interactive charts." />
          <Feature emoji="🔔" title="Counsellor Alerts"
            desc="High-risk assessments automatically notify your counsellor for timely professional support." />
          <Feature emoji="📄" title="PDF Reports"
            desc="Download a professional summary of your mood history to share with healthcare providers." />
          <Feature emoji="🔐" title="Secure & Private"
            desc="JWT authentication, bcrypt encryption, and role-based access control keep your data safe." />
          <Feature emoji="🌙" title="Dark Mode"
            desc="Comfortable viewing in any lighting with full light and dark mode support across all pages." />
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-white dark:bg-ink-900 border-y border-ink-100 dark:border-ink-800">
        <div className="max-w-3xl px-4 mx-auto sm:px-6">
          <div className="mb-10 text-center">
            <h2 className="mb-3 text-2xl font-bold sm:text-3xl text-ink-900 dark:text-white" style={{fontFamily:'Sora,sans-serif'}}>
              How it works
            </h2>
            <p className="text-ink-500 dark:text-ink-400">Get started in minutes</p>
          </div>
          <div className="space-y-6">
            <Step num="1" title="Create your free account"
              desc="Register with your name and email. No payment required — completely free to use." />
            <Step num="2" title="Log your daily mood"
              desc="Record your mood score, stress level, anxiety, sleep hours, and any symptoms you're experiencing." />
            <Step num="3" title="Get AI insights"
              desc="Our AI analyses your data and provides a risk assessment (Low, Medium, or High) with personalised coping suggestions." />
            <Step num="4" title="Track your progress"
              desc="View mood trend charts, weekly summaries, and download PDF reports to monitor your mental wellbeing over time." />
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="max-w-6xl px-4 py-16 mx-auto sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-2xl font-bold sm:text-3xl text-ink-900 dark:text-white" style={{fontFamily:'Sora,sans-serif'}}>
            Built for everyone
          </h2>
          <p className="text-ink-500 dark:text-ink-400">Three roles, one platform</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { emoji: '🌿', role: 'User', color: 'verde', desc: 'Log daily mood, receive AI assessments, view trend charts, and download PDF reports of your mental health journey.' },
            { emoji: '👩‍⚕️', role: 'Counsellor', color: 'blue', desc: 'Monitor at-risk users, receive high-risk email alerts, view mood histories, and manage case resolutions.' },
            { emoji: '⚙️', role: 'Admin', color: 'purple', desc: 'Manage counsellor accounts, activate or deactivate access, and monitor the platform\'s user base.' },
          ].map(r => (
            <div key={r.role} className="p-6 bg-white border shadow-sm dark:bg-ink-900 rounded-2xl border-ink-100 dark:border-ink-800 text-center">
              <div className="flex items-center justify-center w-14 h-14 mx-auto mb-4 text-3xl rounded-2xl bg-ink-50 dark:bg-ink-800">
                {r.emoji}
              </div>
              <h3 className="mb-2 font-bold text-ink-900 dark:text-white">{r.role}</h3>
              <p className="text-sm leading-relaxed text-ink-500 dark:text-ink-400">{r.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-verde-600 dark:bg-verde-700">
        <div className="max-w-2xl px-4 mx-auto text-center sm:px-6">
          <h2 className="mb-4 text-2xl font-bold text-white sm:text-3xl" style={{fontFamily:'Sora,sans-serif'}}>
            Start your wellness journey today
          </h2>
          <p className="mb-8 text-verde-100">
            Join MindCare and take the first step towards better mental health awareness.
          </p>
          <Link to="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold transition-all bg-white rounded-2xl text-verde-700 hover:bg-verde-50 shadow-sm">
            Create Free Account
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t bg-ink-50 dark:bg-ink-950 border-ink-100 dark:border-ink-800">
        <div className="max-w-6xl px-4 mx-auto sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <Logo size="sm" />
            <p className="text-xs text-ink-400 dark:text-ink-600">
              © 2026 MindCare — COM646 Computing Project | Glyndŵr University
            </p>
            <p className="text-xs text-ink-400 dark:text-ink-600">
              Not a clinical diagnostic tool
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
