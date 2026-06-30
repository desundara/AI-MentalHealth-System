import React, { useState, useEffect } from 'react';
import { createMoodLog, getTodayLog } from '../services/mood.service';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/common/Logo';
import ThemeToggle from '../components/common/ThemeToggle';
import MoodTrendChart from '../components/charts/MoodTrendChart';
import WeeklySummaryCard from '../components/charts/WeeklySummaryCard';

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
  if (score <= 2) return { emoji: '😢', label: 'Very Bad', bg: 'from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/20', accent: 'text-red-500', ring: 'ring-red-200 dark:ring-red-800' };
  if (score <= 4) return { emoji: '😟', label: 'Not Great', bg: 'from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20', accent: 'text-orange-500', ring: 'ring-orange-200 dark:ring-orange-800' };
  if (score <= 6) return { emoji: '😐', label: 'Okay', bg: 'from-yellow-50 to-yellow-100 dark:from-yellow-950/30 dark:to-yellow-900/20', accent: 'text-yellow-600', ring: 'ring-yellow-200 dark:ring-yellow-800' };
  if (score <= 8) return { emoji: '🙂', label: 'Good', bg: 'from-verde-50 to-verde-100 dark:from-verde-950/30 dark:to-verde-900/20', accent: 'text-verde-600', ring: 'ring-verde-200 dark:ring-verde-800' };
  return { emoji: '😄', label: 'Excellent!', bg: 'from-verde-50 to-emerald-100 dark:from-verde-950/30 dark:to-emerald-900/20', accent: 'text-verde-600', ring: 'ring-verde-200 dark:ring-verde-700' };
};

const riskBadge = {
  Low: 'bg-verde-50 dark:bg-verde-950/40 text-verde-700 dark:text-verde-400 border-verde-200 dark:border-verde-800',
  Medium: 'bg-yellow-50 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
  High: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
};

const riskDot = { Low: 'bg-verde-500', Medium: 'bg-yellow-500', High: 'bg-red-500' };

const MoodLogPage = () => {
  const { user, logout } = useAuth();
  const [todayLog, setTodayLog] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ mood_score: 5, sleep_hours: '', stress_level: 5, anxiety_level: 5, symptoms: [], notes: '' });

  useEffect(() => {
    getTodayLog().then(res => setTodayLog(res.data.log)).catch(() => {}).finally(() => setPageLoading(false));
  }, []);

  const toggleSymptom = (s) => setForm(f => ({ ...f, symptoms: f.symptoms.includes(s) ? f.symptoms.filter(x => x !== s) : [...f.symptoms, s] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setError('');
    try {
      const res = await createMoodLog({ ...form, symptoms: form.symptoms.join(',') });
      setSuccess(res.data.assessment);
      setTodayLog(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save mood log');
    } finally { setSubmitting(false); }
  };

  const mood = moodConfig(form.mood_score);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  if (pageLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-ink-50 dark:bg-ink-950">
      <div className="flex flex-col items-center gap-3">
        <svg className="w-8 h-8 animate-spin text-verde-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
        <p className="text-sm text-ink-400">Loading your dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen transition-colors duration-300 bg-ink-50 dark:bg-ink-950">

      {/* Navbar */}
      <header className="sticky top-0 z-20 border-b bg-white/80 dark:bg-ink-900/80 backdrop-blur-md border-ink-100 dark:border-ink-800">
        <div className="flex items-center justify-between max-w-2xl px-4 py-3 mx-auto sm:px-6">
          <Logo size="sm" />
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300">
              👋 {user?.full_name?.split(' ')[0]}
            </span>
            <ThemeToggle />
            <button onClick={logout} title="Logout"
              className="flex items-center justify-center transition-all w-9 h-9 rounded-xl text-ink-400 dark:text-ink-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl px-4 py-8 mx-auto sm:px-6">

        {/* Page header */}
        <div className="mb-6">
          <div className="w-8 h-1 mb-3 rounded-full bg-verde-500" />
          <h1 className="text-2xl font-bold sm:text-3xl text-ink-900 dark:text-white" style={{fontFamily:'Sora,sans-serif'}}>
            Daily Mood Check-in
          </h1>
          <p className="mt-1 text-sm text-ink-400 dark:text-ink-500">{today}</p>
        </div>

        {/* Already logged today */}
        {todayLog && !success && (
          <div className="overflow-hidden bg-white border shadow-sm dark:bg-ink-900 rounded-2xl border-ink-100 dark:border-ink-800">
            <div className={`bg-gradient-to-r ${moodConfig(todayLog.mood_score).bg} px-6 py-5`}>
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl bg-white/60 dark:bg-ink-900/40 ring-2 ${moodConfig(todayLog.mood_score).ring} flex items-center justify-center text-3xl`}>
                  {moodConfig(todayLog.mood_score).emoji}
                </div>
                <div>
                  <p className="text-xs font-medium text-ink-500 dark:text-ink-400 mb-0.5">Today's mood</p>
                  <p className="text-2xl font-bold text-ink-900 dark:text-white">{todayLog.mood_score}<span className="text-base font-normal text-ink-400">/10</span></p>
                  <p className={`text-sm font-medium ${moodConfig(todayLog.mood_score).accent}`}>{moodConfig(todayLog.mood_score).label}</p>
                </div>
              </div>
            </div>
            {todayLog.risk_level && (
              <div className="px-6 py-4 border-t border-ink-50 dark:border-ink-800">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${riskBadge[todayLog.risk_level]}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${riskDot[todayLog.risk_level]}`} />
                    {todayLog.risk_level} Risk
                  </span>
                  <p className="text-xs text-ink-400 dark:text-ink-500">Come back tomorrow 🌱</p>
                </div>
                {todayLog.ai_summary && <p className="mt-3 text-sm leading-relaxed text-ink-500 dark:text-ink-400">{todayLog.ai_summary}</p>}
              </div>
            )}
          </div>
        )}

        {/* AI Result after submit */}
        {success && (
          <div className="overflow-hidden bg-white border shadow-sm dark:bg-ink-900 rounded-2xl border-ink-100 dark:border-ink-800">
            <div className="px-6 py-5 border-b bg-verde-50 dark:bg-verde-950/20 border-verde-100 dark:border-verde-900">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 text-xl rounded-xl bg-verde-100 dark:bg-verde-900/40">🤖</div>
                <div>
                  <p className="font-semibold text-ink-900 dark:text-white">AI Assessment Complete</p>
                  <p className="text-xs text-ink-400 dark:text-ink-500">Based on your mood log</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-5 space-y-4">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${riskBadge[success.risk_level]}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${riskDot[success.risk_level]}`} />
                {success.risk_level} Risk Level
              </span>
              <p className="text-sm leading-relaxed text-ink-600 dark:text-ink-300">{success.summary}</p>
              <div className="p-4 rounded-xl bg-ink-50 dark:bg-ink-800">
                <p className="mb-3 text-xs font-semibold tracking-widest uppercase text-ink-400 dark:text-ink-500">Suggestions for you</p>
                <ul className="space-y-2.5">
                  {success.suggestions?.split('|').map((s, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-ink-700 dark:text-ink-300">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-verde-100 dark:bg-verde-900/40 text-verde-600 dark:text-verde-400 flex items-center justify-center text-xs font-bold mt-0.5">{i+1}</span>
                      {s.trim()}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Log Form */}
        {!todayLog && !success && (
          <form onSubmit={handleSubmit} className="space-y-3">

            {error && (
              <div className="flex items-center gap-2 p-4 text-sm text-red-600 border border-red-100 rounded-xl bg-red-50 dark:bg-red-950/20 dark:border-red-900 dark:text-red-400">
                <span>⚠</span> {error}
              </div>
            )}

            {/* Mood Score */}
            <div className={`overflow-hidden rounded-2xl border border-ink-100 dark:border-ink-800 shadow-sm`}>
              <div className={`bg-gradient-to-br ${mood.bg} px-6 pt-6 pb-4`}>
                <p className="mb-4 text-sm font-semibold text-ink-700 dark:text-ink-200">How are you feeling today?</p>
                <div className="flex flex-col items-center mb-5">
                  <div className={`w-20 h-20 rounded-2xl bg-white/60 dark:bg-ink-900/40 ring-2 ${mood.ring} flex items-center justify-center text-5xl mb-3 shadow-sm`}>
                    {mood.emoji}
                  </div>
                  <p className={`text-sm font-semibold ${mood.accent} mb-1`}>{mood.label}</p>
                  <p className="text-4xl font-bold text-ink-900 dark:text-white">
                    {form.mood_score}<span className="text-xl font-normal text-ink-400">/10</span>
                  </p>
                </div>
                <input type="range" min="1" max="10" value={form.mood_score}
                  onChange={e => setForm(f => ({ ...f, mood_score: parseInt(e.target.value) }))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer accent-verde-600 bg-white/60 dark:bg-ink-700" />
                <div className="flex justify-between mt-2 text-xs text-ink-400 dark:text-ink-500">
                  <span>Very Bad</span><span>Excellent</span>
                </div>
              </div>
            </div>

            {/* Sleep */}
            <div className="p-5 bg-white border shadow-sm dark:bg-ink-900 rounded-2xl border-ink-100 dark:border-ink-800">
              <label className="flex items-center gap-2 mb-3 text-sm font-semibold text-ink-700 dark:text-ink-300">
                <span className="flex items-center justify-center text-base rounded-lg w-7 h-7 bg-ink-100 dark:bg-ink-700">🌙</span>
                Hours of sleep last night
              </label>
              <input type="number" min="0" max="24" step="0.5" value={form.sleep_hours}
                onChange={e => setForm(f => ({ ...f, sleep_hours: e.target.value }))}
                placeholder="e.g. 7.5 hours"
                className="w-full px-4 py-2.5 text-sm border rounded-xl border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-800 text-ink-900 dark:text-white placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-verde-500" />
            </div>

            {/* Stress & Anxiety */}
            <div className="p-5 bg-white border shadow-sm dark:bg-ink-900 rounded-2xl border-ink-100 dark:border-ink-800">
              <div className="space-y-6">
                {[
                  { label: 'Stress Level', emoji: '😤', name: 'stress_level', value: form.stress_level, color: 'accent-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/20', text: 'text-orange-600 dark:text-orange-400' },
                  { label: 'Anxiety Level', emoji: '😰', name: 'anxiety_level', value: form.anxiety_level, color: 'accent-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/20', text: 'text-purple-600 dark:text-purple-400' },
                ].map(f => (
                  <div key={f.name}>
                    <div className="flex items-center justify-between mb-3">
                      <label className="flex items-center gap-2 text-sm font-semibold text-ink-700 dark:text-ink-300">
                        <span className="flex items-center justify-center text-base rounded-lg w-7 h-7 bg-ink-100 dark:bg-ink-700">{f.emoji}</span>
                        {f.label}
                      </label>
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${f.bg} ${f.text}`}>{f.value}/10</span>
                    </div>
                    <input type="range" min="1" max="10" value={f.value}
                      onChange={e => setForm(prev => ({ ...prev, [f.name]: parseInt(e.target.value) }))}
                      className={`w-full h-2 rounded-full appearance-none cursor-pointer ${f.color} bg-ink-100 dark:bg-ink-700`} />
                    <div className="flex justify-between mt-1.5 text-xs text-ink-400 dark:text-ink-500">
                      <span>Low</span><span>High</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Symptoms */}
            <div className="p-5 bg-white border shadow-sm dark:bg-ink-900 rounded-2xl border-ink-100 dark:border-ink-800">
              <label className="flex items-center gap-2 mb-3 text-sm font-semibold text-ink-700 dark:text-ink-300">
                <span className="flex items-center justify-center text-base rounded-lg w-7 h-7 bg-ink-100 dark:bg-ink-700">🔍</span>
                Symptoms <span className="ml-1 text-xs font-normal text-ink-400">(select all that apply)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {SYMPTOMS.map(s => {
                  const active = form.symptoms.includes(s.label);
                  return (
                    <button key={s.label} type="button" onClick={() => toggleSymptom(s.label)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                        active
                          ? 'bg-verde-600 text-white border-verde-600 shadow-sm scale-95'
                          : 'bg-ink-50 dark:bg-ink-800 text-ink-600 dark:text-ink-300 border-ink-200 dark:border-ink-700 hover:border-verde-300 dark:hover:border-verde-700 hover:bg-verde-50 dark:hover:bg-verde-950/20'
                      }`}>
                      <span className="text-base">{s.emoji}</span>
                      <span>{s.label}</span>
                    </button>
                  );
                })}
              </div>
              {form.symptoms.length > 0 && (
                <p className="mt-3 text-xs text-ink-400 dark:text-ink-500">{form.symptoms.length} symptom{form.symptoms.length > 1 ? 's' : ''} selected</p>
              )}
            </div>

            {/* Notes */}
            <div className="p-5 bg-white border shadow-sm dark:bg-ink-900 rounded-2xl border-ink-100 dark:border-ink-800">
              <label className="flex items-center gap-2 mb-3 text-sm font-semibold text-ink-700 dark:text-ink-300">
                <span className="flex items-center justify-center text-base rounded-lg w-7 h-7 bg-ink-100 dark:bg-ink-700">📝</span>
                Additional notes <span className="ml-1 text-xs font-normal text-ink-400">(optional)</span>
              </label>
              <textarea value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="How was your day? Anything on your mind?"
                rows={3}
                className="w-full px-4 py-3 text-sm leading-relaxed border resize-none rounded-xl border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-800 text-ink-900 dark:text-white placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-verde-500" />
            </div>

            {/* Submit */}
            <button type="submit" disabled={submitting}
              className="flex items-center justify-center w-full gap-2.5 py-4 text-sm font-semibold text-white transition-all rounded-2xl bg-verde-600 hover:bg-verde-700 active:scale-98 disabled:opacity-60 shadow-sm">
              {submitting ? (
                <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>Analyzing with AI...</>
              ) : (
                <><span className="text-lg">🤖</span>Submit & Get AI Assessment</>
              )}
            </button>

            <p className="pb-4 text-xs text-center text-ink-400 dark:text-ink-600">Your data is private and secure 🔒</p>
          </form>
        )}
        <div className="mt-6 space-y-4">
          <WeeklySummaryCard />
          <MoodTrendChart />
        </div>
      </main>
    </div>
  );
};

export default MoodLogPage;