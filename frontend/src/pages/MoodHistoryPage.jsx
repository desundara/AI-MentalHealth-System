import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyLogs } from '../services/mood.service';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/common/Logo';
import ThemeToggle from '../components/common/ThemeToggle';
import IdleWarningModal from '../components/common/IdleWarningModal';
import generateMoodReport from '../utils/MoodReportPDF';
import API from '../services/api';

const riskBadge = {
  Low: 'bg-verde-50 dark:bg-verde-950/30 text-verde-700 dark:text-verde-400 border-verde-200 dark:border-verde-800',
  Medium: 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
  High: 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
};
const riskDot = { Low: 'bg-verde-500', Medium: 'bg-yellow-500', High: 'bg-red-500' };

const moodEmoji = (score) => {
  if (score <= 2) return '😢';
  if (score <= 4) return '😟';
  if (score <= 6) return '😐';
  if (score <= 8) return '🙂';
  return '😄';
};

const RiskBadge = ({ level }) => level ? (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${riskBadge[level]}`}>
    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${riskDot[level]}`} />
    {level}
  </span>
) : null;

const MoodHistoryPage = () => {
  const { user, logout } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    getMyLogs()
      .then(res => setLogs(res.data.logs))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? logs : logs.filter(l => l.risk_level === filter);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const summaryRes = await API.get('/mood/weekly-summary');
      generateMoodReport({
        user: { full_name: user?.full_name, email: user?.email },
        logs,
        weeklySummary: summaryRes.data,
      });
    } catch (err) { console.error(err); }
    finally { setDownloading(false); }
  };

  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-950 transition-colors duration-300">
      <IdleWarningModal />

      {/* Navbar */}
      <header className="sticky top-0 z-20 border-b bg-white/80 dark:bg-ink-900/80 backdrop-blur-md border-ink-100 dark:border-ink-800">
        <div className="flex items-center justify-between max-w-3xl px-4 py-3 mx-auto sm:px-6">
          <Logo size="sm" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/dashboard"
              className="px-3 py-2 text-sm font-medium transition-all text-ink-500 dark:text-ink-400 hover:text-verde-600 dark:hover:text-verde-400 rounded-xl hover:bg-verde-50 dark:hover:bg-verde-950/20">
              ← Dashboard
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

      <main className="max-w-3xl px-4 py-8 mx-auto sm:px-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="w-8 h-1 mb-3 rounded-full bg-verde-500" />
            <h1 className="text-2xl font-bold text-ink-900 dark:text-white" style={{fontFamily:'Sora,sans-serif'}}>Mood History</h1>
            <p className="mt-1 text-sm text-ink-400 dark:text-ink-500">{logs.length} total entries</p>
          </div>
          <button onClick={handleDownload} disabled={downloading || logs.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-xl text-ink-600 dark:text-ink-300 border-ink-200 dark:border-ink-700 hover:bg-ink-50 dark:hover:bg-ink-800 transition-all disabled:opacity-50 flex-shrink-0">
            {downloading
              ? <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
              : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>}
            <span className="hidden sm:inline">{downloading ? 'Generating...' : 'Download PDF'}</span>
            <span className="sm:hidden">PDF</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 p-1 mb-5 bg-ink-100 dark:bg-ink-800 rounded-xl w-fit">
          {[
            { id: 'all', label: 'All' },
            { id: 'High', label: '🔴 High' },
            { id: 'Medium', label: '🟡 Medium' },
            { id: 'Low', label: '🟢 Low' },
          ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === f.id
                  ? 'bg-white dark:bg-ink-900 text-ink-900 dark:text-white shadow-sm'
                  : 'text-ink-500 dark:text-ink-400 hover:text-ink-700'
              }`}>
              {f.label}
              {f.id === 'all' && <span className="ml-1.5 text-xs text-ink-400">{logs.length}</span>}
              {f.id !== 'all' && <span className="ml-1.5 text-xs text-ink-400">{logs.filter(l => l.risk_level === f.id).length}</span>}
            </button>
          ))}
        </div>

        {/* Logs */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-ink-400">
            <svg className="w-5 h-5 mr-2 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
            Loading history...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white border border-dashed dark:bg-ink-900 rounded-2xl border-ink-200 dark:border-ink-700">
            <div className="mb-3 text-5xl">📋</div>
            <p className="font-medium text-ink-500 dark:text-ink-400">
              {filter === 'all' ? 'No mood logs yet' : `No ${filter} risk entries`}
            </p>
            {filter === 'all' && (
              <Link to="/dashboard" className="mt-3 text-sm text-verde-600 dark:text-verde-400 hover:underline">
                Log your first mood →
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(log => {
              const isExpanded = expandedId === log.id;
              return (
                <div key={log.id} className="overflow-hidden bg-white border shadow-sm dark:bg-ink-900 rounded-2xl border-ink-100 dark:border-ink-800">
                  {/* Card Header */}
                  <button className="w-full text-left" onClick={() => setExpandedId(isExpanded ? null : log.id)}>
                    <div className="flex items-center justify-between p-4 sm:p-5">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 text-xl rounded-xl bg-ink-50 dark:bg-ink-800 flex-shrink-0">
                          {moodEmoji(log.mood_score)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-ink-900 dark:text-white">
                            {new Date(log.log_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                          <p className="text-xs text-ink-400 dark:text-ink-500">Mood: {log.mood_score}/10</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <RiskBadge level={log.risk_level} />
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                          className={`text-ink-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                          <polyline points="6 9 12 15 18 9"/>
                        </svg>
                      </div>
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 border-t border-ink-50 dark:border-ink-800">
                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-2 mt-4 mb-4">
                        {[
                          { label: 'Mood', value: `${log.mood_score}/10`, emoji: moodEmoji(log.mood_score) },
                          { label: 'Stress', value: log.stress_level ? `${log.stress_level}/10` : '—', emoji: '😤' },
                          { label: 'Anxiety', value: log.anxiety_level ? `${log.anxiety_level}/10` : '—', emoji: '😰' },
                          { label: 'Sleep', value: log.sleep_hours ? `${log.sleep_hours}h` : '—', emoji: '🌙' },
                        ].map(s => (
                          <div key={s.label} className="p-2.5 text-center rounded-xl bg-ink-50 dark:bg-ink-800">
                            <p className="text-base">{s.emoji}</p>
                            <p className="mt-0.5 text-sm font-semibold text-ink-900 dark:text-white">{s.value}</p>
                            <p className="text-xs text-ink-400">{s.label}</p>
                          </div>
                        ))}
                      </div>

                      {/* Symptoms */}
                      {log.symptoms && (
                        <div className="mb-3">
                          <p className="mb-2 text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wide">Symptoms</p>
                          <div className="flex flex-wrap gap-1.5">
                            {log.symptoms.split(',').map(s => (
                              <span key={s} className="px-2.5 py-1 text-xs rounded-lg bg-ink-100 dark:bg-ink-700 text-ink-600 dark:text-ink-300">
                                {s.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {log.notes && (
                        <div className="mb-3">
                          <p className="mb-1 text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wide">Notes</p>
                          <p className="text-sm text-ink-600 dark:text-ink-300 leading-relaxed">{log.notes}</p>
                        </div>
                      )}

                      {/* AI Summary */}
                      {log.ai_summary && (
                        <div className="p-3.5 rounded-xl bg-ink-50 dark:bg-ink-800">
                          <p className="mb-1.5 text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wide">🤖 AI Assessment</p>
                          <p className="text-sm text-ink-600 dark:text-ink-300 leading-relaxed">{log.ai_summary}</p>
                          {log.suggestions && (
                            <ul className="mt-2 space-y-1">
                              {log.suggestions.split('|').map((s, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-ink-500 dark:text-ink-400">
                                  <span className="text-verde-500 flex-shrink-0 mt-0.5">✓</span>{s.trim()}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default MoodHistoryPage;
