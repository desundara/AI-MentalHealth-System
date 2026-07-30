import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createMoodLog, getTodayLog, getMyLogs } from '../services/mood.service';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/common/Logo';
import ThemeToggle from '../components/common/ThemeToggle';
import IdleWarningModal from '../components/common/IdleWarningModal';
import MoodTrendChart from '../components/charts/MoodTrendChart';
import WeeklySummaryCard from '../components/charts/WeeklySummaryCard';
import generateMoodReport from '../utils/MoodReportPDF';
import API from '../services/api';

const SYMPTOMS = [
  { label: 'Fatigue', emoji: '😴' },
  { label: 'Low motivation', emoji: '😑' },
  { label: 'Sadness', emoji: '😢' },
  { label: 'Irritability', emoji: '😤' },
  { label: 'Poor concentration', emoji: '🧠' },
  { label: 'Hopelessness', emoji: '😞' },
  { label: 'Appetite changes', emoji: '🍽️' },
  { label: 'Insomnia', emoji: '🌙' },
  { label: 'Social withdrawal', emoji: '🚪' },
  { label: 'Panic attacks', emoji: '💨' },
];

const moodConfig = (score) => {
  if (score <= 2) return { emoji: '😢', label: 'Very Bad', color: 'text-red-500', bg: 'from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/20', ring: 'ring-red-200 dark:ring-red-800' };
  if (score <= 4) return { emoji: '😟', label: 'Not Great', color: 'text-orange-500', bg: 'from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20', ring: 'ring-orange-200 dark:ring-orange-800' };
  if (score <= 6) return { emoji: '😐', label: 'Okay', color: 'text-yellow-600', bg: 'from-yellow-50 to-yellow-100 dark:from-yellow-950/30 dark:to-yellow-900/20', ring: 'ring-yellow-200 dark:ring-yellow-800' };
  if (score <= 8) return { emoji: '🙂', label: 'Good', color: 'text-verde-600', bg: 'from-verde-50 to-verde-100 dark:from-verde-950/30 dark:to-verde-900/20', ring: 'ring-verde-200 dark:ring-verde-800' };
  return { emoji: '😄', label: 'Excellent!', color: 'text-verde-600', bg: 'from-verde-50 to-emerald-100 dark:from-verde-950/30 dark:to-emerald-900/20', ring: 'ring-verde-200 dark:ring-verde-700' };
};

const riskBadge = {
  Low: 'bg-verde-50 dark:bg-verde-950/40 text-verde-700 dark:text-verde-400 border-verde-200 dark:border-verde-800',
  Medium: 'bg-yellow-50 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
  High: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
};
const riskDot = { Low: 'bg-verde-500', Medium: 'bg-yellow-500', High: 'bg-red-500' };

const UserDashboardPage = () => {
  const { user, logout } = useAuth();
  const [todayLog, setTodayLog] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ mood_score: 5, sleep_hours: '', stress_level: 5, anxiety_level: 5, symptoms: [], notes: '' });

  useEffect(() => {
    Promise.all([getTodayLog(), getMyLogs()])
      .then(([todayRes, logsRes]) => {
        setTodayLog(todayRes.data.log);
        setRecentLogs(logsRes.data.logs.slice(0, 5));
      })
      .catch(console.error)
      .finally(() => setPageLoading(false));
  }, []);

  const toggleSymptom = (s) => setForm(f => ({
    ...f, symptoms: f.symptoms.includes(s) ? f.symptoms.filter(x => x !== s) : [...f.symptoms, s]
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setError('');
    try {
      const res = await createMoodLog({ ...form, symptoms: form.symptoms.join(',') });
      setSuccess(res.data.assessment);
      setTodayLog(res.data);
      setShowForm(false);
      const logsRes = await getMyLogs();
      setRecentLogs(logsRes.data.logs.slice(0, 5));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save mood log');
    } finally { setSubmitting(false); }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const [logsRes, summaryRes] = await Promise.all([getMyLogs(), API.get('/mood/weekly-summary')]);
      generateMoodReport({ user: { full_name: user?.full_name, email: user?.email }, logs: logsRes.data.logs, weeklySummary: summaryRes.data });
    } catch (err) { console.error(err); }
    finally { setDownloading(false); }
  };

  const mood = moodConfig(form.mood_score);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  if (pageLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-ink-50 dark:bg-ink-950">
      <svg className="w-7 h-7 animate-spin text-verde-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
    </div>
  );

  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-950 transition-colors duration-300">
      <IdleWarningModal />

      {/* Navbar */}
      <header className="sticky top-0 z-20 border-b bg-white/80 dark:bg-ink-900/80 backdrop-blur-md border-ink-100 dark:border-ink-800">
        <div className="flex items-center justify-between max-w-6xl px-4 py-3 mx-auto sm:px-6">
          <Logo size="sm" />
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300">
              👋 {user?.full_name?.split(' ')[0]}
            </span>
            <ThemeToggle />
            <Link to="/profile" title="Profile"
              className="flex items-center justify-center w-9 h-9 rounded-xl text-ink-400 hover:text-verde-600 hover:bg-verde-50 dark:hover:bg-verde-950/20 transition-all">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </Link>
            <button onClick={logout} title="Logout"
              className="flex items-center justify-center w-9 h-9 rounded-xl text-ink-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl px-4 py-6 mx-auto sm:px-6">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="w-8 h-1 mb-2 rounded-full bg-verde-500" />
            <h1 className="text-xl font-bold sm:text-2xl text-ink-900 dark:text-white" style={{fontFamily:'Sora,sans-serif'}}>
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.full_name?.split(' ')[0]} 👋
            </h1>
            <p className="mt-0.5 text-sm text-ink-400 dark:text-ink-500">{today}</p>
          </div>
          <button onClick={handleDownload} disabled={downloading}
            className="hidden sm:flex items-center gap-2 px-3 py-2 text-xs font-medium border rounded-xl text-ink-600 dark:text-ink-300 border-ink-200 dark:border-ink-700 hover:bg-ink-50 dark:hover:bg-ink-800 transition-all disabled:opacity-50">
            {downloading
              ? <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
              : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>}
            {downloading ? 'Generating...' : 'Download Report'}
          </button>
        </div>

        {/* Main Grid */}
        <div className="grid gap-5 lg:grid-cols-3">

          {/* Left Column — Today's Log */}
          <div className="space-y-4 lg:col-span-1">

            {/* Today Card */}
            {todayLog && !success ? (
              <div className="overflow-hidden bg-white border shadow-sm dark:bg-ink-900 rounded-2xl border-ink-100 dark:border-ink-800">
                <div className={`bg-gradient-to-r ${moodConfig(todayLog.mood_score).bg} px-5 py-4`}>
                  <p className="mb-1 text-xs font-medium text-ink-500 dark:text-ink-400">Today's mood</p>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{moodConfig(todayLog.mood_score).emoji}</span>
                    <div>
                      <p className="text-2xl font-bold text-ink-900 dark:text-white">{todayLog.mood_score}<span className="text-sm font-normal text-ink-400">/10</span></p>
                      <p className={`text-sm font-medium ${moodConfig(todayLog.mood_score).color}`}>{moodConfig(todayLog.mood_score).label}</p>
                    </div>
                  </div>
                </div>
                {todayLog.risk_level && (
                  <div className="px-5 py-3 border-t border-ink-50 dark:border-ink-800">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${riskBadge[todayLog.risk_level]}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${riskDot[todayLog.risk_level]}`} />
                      {todayLog.risk_level} Risk
                    </span>
                    {todayLog.ai_summary && <p className="mt-2 text-xs leading-relaxed text-ink-500 dark:text-ink-400 line-clamp-3">{todayLog.ai_summary}</p>}
                  </div>
                )}
              </div>
            ) : success ? (
              <div className="overflow-hidden bg-white border shadow-sm dark:bg-ink-900 rounded-2xl border-ink-100 dark:border-ink-800">
                <div className="px-5 py-4 border-b bg-verde-50 dark:bg-verde-950/20 border-verde-100 dark:border-verde-900">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🤖</span>
                    <p className="text-sm font-semibold text-ink-900 dark:text-white">AI Assessment</p>
                  </div>
                </div>
                <div className="px-5 py-4 space-y-3">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${riskBadge[success.risk_level]}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${riskDot[success.risk_level]}`} />
                    {success.risk_level} Risk
                  </span>
                  <p className="text-xs leading-relaxed text-ink-600 dark:text-ink-300">{success.summary}</p>
                  <div className="p-3 rounded-xl bg-ink-50 dark:bg-ink-800">
                    <p className="mb-2 text-xs font-semibold text-ink-400 uppercase">Suggestions</p>
                    <ul className="space-y-1">
                      {success.suggestions?.split('|').map((s, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs text-ink-600 dark:text-ink-300">
                          <span className="text-verde-500 flex-shrink-0">✓</span>{s.trim()}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-5 bg-white border shadow-sm dark:bg-ink-900 rounded-2xl border-ink-100 dark:border-ink-800">
                <div className="mb-4 text-center">
                  <p className="text-3xl mb-2">🌿</p>
                  <p className="text-sm font-semibold text-ink-900 dark:text-white">Log Today's Mood</p>
                  <p className="text-xs text-ink-400 dark:text-ink-500 mt-1">You haven't logged yet today</p>
                </div>
                <button onClick={() => setShowForm(!showForm)}
                  className="w-full py-2.5 text-sm font-semibold text-white transition-all rounded-xl bg-verde-600 hover:bg-verde-700">
                  {showForm ? 'Cancel' : '+ Log Mood Now'}
                </button>
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Total Logs', value: recentLogs.length > 0 ? `${recentLogs.length}+` : '0', emoji: '📝' },
                { label: 'This Week', value: recentLogs.filter(l => new Date(l.log_date) >= new Date(Date.now() - 7*24*60*60*1000)).length, emoji: '📅' },
              ].map(s => (
                <div key={s.label} className="p-4 bg-white border shadow-sm dark:bg-ink-900 rounded-2xl border-ink-100 dark:border-ink-800 text-center">
                  <p className="text-xl mb-1">{s.emoji}</p>
                  <p className="text-xl font-bold text-ink-900 dark:text-white">{s.value}</p>
                  <p className="text-xs text-ink-400 dark:text-ink-500">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Quick Links */}
            <div className="p-4 bg-white border shadow-sm dark:bg-ink-900 rounded-2xl border-ink-100 dark:border-ink-800">
              <p className="mb-3 text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wide">Quick Links</p>
              <div className="space-y-2">
                <Link to="/history" className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-ink-50 dark:hover:bg-ink-800 transition-all group">
                  <span className="text-lg">📋</span>
                  <span className="text-sm font-medium text-ink-700 dark:text-ink-300 group-hover:text-verde-600 dark:group-hover:text-verde-400">Mood History</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-auto text-ink-300 dark:text-ink-600">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </Link>
                <Link to="/profile" className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-ink-50 dark:hover:bg-ink-800 transition-all group">
                  <span className="text-lg">👤</span>
                  <span className="text-sm font-medium text-ink-700 dark:text-ink-300 group-hover:text-verde-600 dark:group-hover:text-verde-400">My Profile</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-auto text-ink-300 dark:text-ink-600">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column — Charts & Form */}
          <div className="space-y-4 lg:col-span-2">

            {/* Mood Log Form */}
            {showForm && !todayLog && !success && (
              <form onSubmit={handleSubmit} className="bg-white border shadow-sm dark:bg-ink-900 rounded-2xl border-ink-100 dark:border-ink-800 overflow-hidden">
                {/* Mood Score */}
                <div className={`bg-gradient-to-br ${mood.bg} px-5 pt-5 pb-4`}>
                  {error && <div className="flex items-center gap-2 p-3 mb-3 text-sm text-red-600 border border-red-100 rounded-xl bg-red-50 dark:bg-red-950/20 dark:border-red-900 dark:text-red-400"><span>⚠</span>{error}</div>}
                  <p className="mb-3 text-sm font-semibold text-ink-700 dark:text-ink-200">How are you feeling today?</p>
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-16 h-16 rounded-2xl bg-white/60 dark:bg-ink-900/40 ring-2 ${mood.ring} flex items-center justify-center text-4xl flex-shrink-0`}>
                      {mood.emoji}
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-ink-900 dark:text-white">{form.mood_score}<span className="text-base font-normal text-ink-400">/10</span></p>
                      <p className={`text-sm font-medium ${mood.color}`}>{mood.label}</p>
                    </div>
                  </div>
                  <input type="range" min="1" max="10" value={form.mood_score}
                    onChange={e => setForm(f => ({ ...f, mood_score: parseInt(e.target.value) }))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer accent-verde-600 bg-white/60 dark:bg-ink-700" />
                  <div className="flex justify-between mt-1 text-xs text-ink-400">
                    <span>Very Bad</span><span>Excellent</span>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {/* Sleep */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-ink-700 dark:text-ink-300">🌙 Sleep hours</label>
                    <input type="number" min="0" max="24" step="0.5" value={form.sleep_hours}
                      onChange={e => setForm(f => ({ ...f, sleep_hours: e.target.value }))}
                      placeholder="e.g. 7.5"
                      className="w-full px-4 py-2.5 text-sm border rounded-xl border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-800 text-ink-900 dark:text-white placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-verde-500" />
                  </div>

                  {/* Sliders */}
                  {[
                    { label: '😤 Stress Level', name: 'stress_level', value: form.stress_level, color: 'accent-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/20', text: 'text-orange-600 dark:text-orange-400' },
                    { label: '😰 Anxiety Level', name: 'anxiety_level', value: form.anxiety_level, color: 'accent-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/20', text: 'text-purple-600 dark:text-purple-400' },
                  ].map(f => (
                    <div key={f.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-sm font-medium text-ink-700 dark:text-ink-300">{f.label}</label>
                        <span className={`px-2 py-0.5 text-xs font-bold rounded-lg ${f.bg} ${f.text}`}>{f.value}/10</span>
                      </div>
                      <input type="range" min="1" max="10" value={f.value}
                        onChange={e => setForm(prev => ({ ...prev, [f.name]: parseInt(e.target.value) }))}
                        className={`w-full h-2 rounded-full appearance-none cursor-pointer ${f.color} bg-ink-100 dark:bg-ink-700`} />
                    </div>
                  ))}

                  {/* Symptoms */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-ink-700 dark:text-ink-300">🔍 Symptoms <span className="font-normal text-ink-400 text-xs">(select all that apply)</span></label>
                    <div className="flex flex-wrap gap-1.5">
                      {SYMPTOMS.map(s => (
                        <button key={s.label} type="button" onClick={() => toggleSymptom(s.label)}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                            form.symptoms.includes(s.label)
                              ? 'bg-verde-600 text-white border-verde-600'
                              : 'bg-ink-50 dark:bg-ink-800 text-ink-600 dark:text-ink-300 border-ink-200 dark:border-ink-700 hover:border-verde-300'
                          }`}>
                          <span>{s.emoji}</span>{s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-ink-700 dark:text-ink-300">📝 Notes <span className="font-normal text-ink-400 text-xs">(optional)</span></label>
                    <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                      placeholder="How was your day?" rows={2}
                      className="w-full px-4 py-2.5 text-sm border resize-none rounded-xl border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-800 text-ink-900 dark:text-white placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-verde-500" />
                  </div>

                  <button type="submit" disabled={submitting}
                    className="flex items-center justify-center w-full gap-2 py-3 text-sm font-semibold text-white transition-all rounded-xl bg-verde-600 hover:bg-verde-700 disabled:opacity-60">
                    {submitting
                      ? <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>Analyzing...</>
                      : <><span>🤖</span>Submit & Get AI Assessment</>}
                  </button>
                </div>
              </form>
            )}

            {/* Charts */}
            <WeeklySummaryCard />
            <MoodTrendChart />

            {/* Recent Logs */}
            {recentLogs.length > 0 && (
              <div className="bg-white border shadow-sm dark:bg-ink-900 rounded-2xl border-ink-100 dark:border-ink-800 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-ink-50 dark:border-ink-800">
                  <h3 className="font-semibold text-ink-900 dark:text-white">Recent Logs</h3>
                  <Link to="/history" className="text-xs text-verde-600 dark:text-verde-400 hover:underline font-medium">View all →</Link>
                </div>
                <div className="divide-y divide-ink-50 dark:divide-ink-800">
                  {recentLogs.map(log => (
                    <div key={log.id} className="flex items-center justify-between px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{moodConfig(log.mood_score).emoji}</span>
                        <div>
                          <p className="text-sm font-medium text-ink-900 dark:text-white">
                            {new Date(log.log_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                          <p className="text-xs text-ink-400">Mood: {log.mood_score}/10</p>
                        </div>
                      </div>
                      {log.risk_level && (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${riskBadge[log.risk_level]}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${riskDot[log.risk_level]}`} />
                          {log.risk_level}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboardPage;
