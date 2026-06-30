import React, { useState, useEffect } from 'react';
import { getDashboardStats, getAlerts, resolveAlert, getCounselorUsers, getUserLogs } from '../services/counselor.service';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/common/Logo';
import ThemeToggle from '../components/common/ThemeToggle';
import UserMoodChart from '../components/charts/UserMoodChart';

const riskBadge = {
    Low:    'bg-verde-50 dark:bg-verde-950/30 text-verde-700 dark:text-verde-400 border-verde-200 dark:border-verde-800',
    Medium: 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
    High:   'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
    };
    const riskDot = { Low: 'bg-verde-500', Medium: 'bg-yellow-500', High: 'bg-red-500' };

    const RiskBadge = ({ level }) => level ? (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${riskBadge[level]}`}>
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${riskDot[level]}`} />
        {level}
    </span>
    ) : <span className="text-xs text-ink-400">—</span>;

    const StatCard = ({ icon, value, label, color, sub }) => (
    <div className={`relative overflow-hidden p-4 sm:p-5 bg-white dark:bg-ink-900 rounded-2xl border border-ink-100 dark:border-ink-800 shadow-sm`}>
        <div className={`absolute top-0 right-0 w-20 h-20 rounded-full -mr-6 -mt-6 opacity-10 ${color}`} />
        <div className="mb-2 text-2xl">{icon}</div>
        <div className="text-2xl font-bold sm:text-3xl text-ink-900 dark:text-white" style={{fontFamily:'Sora,sans-serif'}}>{value}</div>
        <div className="text-xs sm:text-sm text-ink-500 dark:text-ink-400 mt-0.5">{label}</div>
        {sub && <div className="mt-1 text-xs text-ink-400 dark:text-ink-500">{sub}</div>}
    </div>
    );

    const CounselorDashboard = () => {
    const { logout } = useAuth();
    const [tab, setTab] = useState('alerts');
    const [stats, setStats] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userLogs, setUserLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [resolving, setResolving] = useState(null);

    useEffect(() => {
        Promise.all([getDashboardStats(), getAlerts(), getCounselorUsers()])
        .then(([s, a, u]) => {
            setStats(s.data.stats);
            setAlerts(a.data.alerts);
            setUsers(u.data.users);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }, []);

    const handleResolve = async (id) => {
        setResolving(id);
        try {
        await resolveAlert(id);
        setAlerts(prev => prev.filter(a => a.id !== id));
        const s = await getDashboardStats();
        setStats(s.data.stats);
        } catch (err) { console.error(err); }
        finally { setResolving(null); }
    };

    const handleViewUser = async (user) => {
        setSelectedUser(user);
        setTab('userDetail');
        try {
        const res = await getUserLogs(user.id);
        setUserLogs(res.data.logs);
        } catch (err) { console.error(err); }
    };

    const moodEmoji = (score) => {
        if (!score) return '—';
        if (score <= 2) return '😢';
        if (score <= 4) return '😟';
        if (score <= 6) return '😐';
        if (score <= 8) return '🙂';
        return '😄';
    };

    return (
        <div className="min-h-screen transition-colors duration-300 bg-ink-50 dark:bg-ink-950">

        {/* Navbar */}
        <header className="sticky top-0 z-20 border-b bg-white/80 dark:bg-ink-900/80 backdrop-blur-md border-ink-100 dark:border-ink-800">
            <div className="flex items-center justify-between max-w-6xl px-4 py-3 mx-auto sm:px-6">
            <div className="flex items-center gap-2 sm:gap-3">
                <Logo size="sm" />
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                Counselor
                </span>
                {stats?.unresolved_alerts > 0 && (
                <span className="flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                    {stats.unresolved_alerts}
                </span>
                )}
            </div>
            <div className="flex items-center gap-2">
                <ThemeToggle />
                <button onClick={logout} title="Logout"
                className="flex items-center justify-center transition-all w-9 h-9 rounded-xl text-ink-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
                </svg>
                </button>
            </div>
            </div>
        </header>

        <main className="max-w-6xl px-4 py-6 mx-auto sm:px-6 sm:py-8">

            {/* Header */}
            <div className="mb-6">
            <div className="w-8 h-1 mb-3 bg-blue-500 rounded-full" />
            <h1 className="text-2xl font-bold sm:text-3xl text-ink-900 dark:text-white" style={{fontFamily:'Sora,sans-serif'}}>
                Counselor Dashboard
            </h1>
            <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">Monitor user wellbeing and manage alerts</p>
            </div>

            {/* Stats */}
            {stats && (
            <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-4 sm:gap-4">
                <StatCard icon="👥" value={stats.total_users} label="Total Users" color="bg-blue-500" />
                <StatCard icon="📝" value={stats.logs_today} label="Logs Today" color="bg-verde-500" />
                <StatCard icon="🔔" value={stats.unresolved_alerts} label="Open Alerts" color="bg-orange-500" />
                <StatCard icon="⚠️" value={stats.high_risk_alerts} label="High Risk" color="bg-red-500" />
            </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 p-1 mb-5 bg-ink-100 dark:bg-ink-800 rounded-xl w-fit">
            {[
                { id: 'alerts', label: '🔔 Alerts', count: alerts.length },
                { id: 'users', label: '👥 Users', count: users.length },
                ...(selectedUser ? [{ id: 'userDetail', label: `📋 ${selectedUser.full_name.split(' ')[0]}`, count: userLogs.length }] : [])
            ].map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    tab === t.id
                    ? 'bg-white dark:bg-ink-900 text-ink-900 dark:text-white shadow-sm'
                    : 'text-ink-500 dark:text-ink-400 hover:text-ink-700 dark:hover:text-ink-200'
                }`}>
                {t.label}
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                    tab === t.id ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400' : 'bg-ink-200 dark:bg-ink-700 text-ink-500'
                }`}>{t.count}</span>
                </button>
            ))}
            </div>

            {/* ===== ALERTS TAB ===== */}
            {tab === 'alerts' && (
            <div>
                <h2 className="mb-4 font-semibold text-ink-900 dark:text-white">
                Unresolved Alerts
                {alerts.length > 0 && <span className="ml-2 text-sm font-normal text-ink-400">({alerts.length} pending)</span>}
                </h2>
                {loading ? (
                <div className="flex items-center justify-center py-16 text-ink-400">
                    <svg className="w-5 h-5 mr-2 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
                    Loading alerts...
                </div>
                ) : alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 bg-white border border-dashed dark:bg-ink-900 rounded-2xl border-ink-200 dark:border-ink-700">
                    <div className="mb-3 text-5xl">✅</div>
                    <p className="font-medium text-ink-500 dark:text-ink-400">No unresolved alerts</p>
                    <p className="mt-1 text-sm text-ink-400 dark:text-ink-500">All users are doing well!</p>
                </div>
                ) : (
                <div className="space-y-3">
                    {alerts.map(alert => (
                    <div key={alert.id} className={`bg-white dark:bg-ink-900 rounded-2xl border shadow-sm overflow-hidden ${
                        alert.risk_level === 'High' ? 'border-red-200 dark:border-red-900' : 'border-ink-100 dark:border-ink-800'
                    }`}>
                        {alert.risk_level === 'High' && (
                        <div className="h-1 bg-gradient-to-r from-red-500 to-orange-500" />
                        )}
                        <div className="p-4 sm:p-5">
                        <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 text-sm font-bold rounded-xl bg-ink-100 dark:bg-ink-700 text-ink-600 dark:text-ink-300">
                                {alert.full_name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="font-semibold text-ink-900 dark:text-white">{alert.full_name}</p>
                                <p className="text-xs text-ink-500 dark:text-ink-400">{alert.email}</p>
                            </div>
                            </div>
                            <RiskBadge level={alert.risk_level} />
                        </div>

                        {/* Mood data */}
                        <div className="grid grid-cols-3 gap-2 p-3 mb-3 rounded-xl bg-ink-50 dark:bg-ink-800">
                            <div className="text-center">
                            <p className="text-lg font-bold text-ink-900 dark:text-white">{moodEmoji(alert.mood_score)} {alert.mood_score}/10</p>
                            <p className="text-xs text-ink-400">Mood</p>
                            </div>
                            <div className="text-center">
                            <p className="text-lg font-bold text-ink-900 dark:text-white">{alert.stress_level || '—'}/10</p>
                            <p className="text-xs text-ink-400">Stress</p>
                            </div>
                            <div className="text-center">
                            <p className="text-lg font-bold text-ink-900 dark:text-white">{alert.anxiety_level || '—'}/10</p>
                            <p className="text-xs text-ink-400">Anxiety</p>
                            </div>
                        </div>

                        {alert.summary && (
                            <p className="mb-3 text-sm leading-relaxed text-ink-600 dark:text-ink-300">{alert.summary}</p>
                        )}

                        {alert.symptoms && (
                            <div className="flex flex-wrap gap-1.5 mb-3">
                            {alert.symptoms.split(',').map(s => (
                                <span key={s} className="px-2 py-1 text-xs rounded-lg bg-ink-100 dark:bg-ink-700 text-ink-600 dark:text-ink-300">{s.trim()}</span>
                            ))}
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t border-ink-50 dark:border-ink-800">
                            <span className="text-xs text-ink-400 dark:text-ink-500">
                            {new Date(alert.created_at).toLocaleString()}
                            </span>
                            <div className="flex items-center gap-2">
                            <button onClick={() => handleViewUser({ id: alert.user_id, full_name: alert.full_name })}
                                className="px-3 py-1.5 text-xs font-medium border rounded-lg text-ink-600 dark:text-ink-300 border-ink-200 dark:border-ink-700 hover:bg-ink-50 dark:hover:bg-ink-800 transition-all">
                                View History
                            </button>
                            <button onClick={() => handleResolve(alert.id)} disabled={resolving === alert.id}
                                className="px-3 py-1.5 text-xs font-medium text-white transition-all rounded-lg bg-verde-600 hover:bg-verde-700 disabled:opacity-60">
                                {resolving === alert.id ? 'Resolving...' : '✓ Resolve'}
                            </button>
                            </div>
                        </div>
                        </div>
                    </div>
                    ))}
                </div>
                )}
            </div>
            )}

            {/* ===== USERS TAB ===== */}
            {tab === 'users' && (
            <div>
                <h2 className="mb-4 font-semibold text-ink-900 dark:text-white">All Users</h2>
                {loading ? (
                <div className="flex items-center justify-center py-16 text-ink-400">
                    <svg className="w-5 h-5 mr-2 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
                    Loading...
                </div>
                ) : users.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 bg-white border border-dashed dark:bg-ink-900 rounded-2xl border-ink-200 dark:border-ink-700">
                    <div className="mb-3 text-5xl">👥</div>
                    <p className="font-medium text-ink-500 dark:text-ink-400">No users yet</p>
                </div>
                ) : (
                <>
                    {/* Desktop table */}
                    <div className="hidden overflow-x-auto bg-white border shadow-sm sm:block dark:bg-ink-900 rounded-2xl border-ink-100 dark:border-ink-800">
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="border-b bg-ink-50 dark:bg-ink-800/50 border-ink-100 dark:border-ink-800">
                            {['User','Last Log','Logs','Latest Mood','Risk','Action'].map(h => (
                            <th key={h} className="px-5 py-3.5 text-xs font-semibold tracking-wider text-left uppercase text-ink-500 dark:text-ink-400">{h}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-ink-50 dark:divide-ink-800">
                        {users.map(u => (
                            <tr key={u.id} className="transition-colors hover:bg-ink-50/50 dark:hover:bg-ink-800/30">
                            <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 text-sm font-semibold rounded-full bg-ink-100 dark:bg-ink-700 text-ink-600 dark:text-ink-300">
                                    {u.full_name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-medium text-ink-900 dark:text-white">{u.full_name}</p>
                                    <p className="text-xs text-ink-400">{u.email}</p>
                                </div>
                                </div>
                            </td>
                            <td className="px-5 py-4 text-sm text-ink-500 dark:text-ink-400">
                                {u.last_log_date ? new Date(u.last_log_date).toLocaleDateString() : <span className="text-ink-300">Never</span>}
                            </td>
                            <td className="px-5 py-4">
                                <span className="inline-flex items-center justify-center text-xs font-semibold rounded-full w-7 h-7 bg-verde-50 dark:bg-verde-950/30 text-verde-700 dark:text-verde-400">{u.total_logs}</span>
                            </td>
                            <td className="px-5 py-4">
                                {u.latest_mood ? <span className="font-medium text-ink-700 dark:text-ink-300">{moodEmoji(u.latest_mood)} {u.latest_mood}/10</span> : <span className="text-ink-300">—</span>}
                            </td>
                            <td className="px-5 py-4"><RiskBadge level={u.latest_risk} /></td>
                            <td className="px-5 py-4">
                                <button onClick={() => handleViewUser(u)}
                                className="px-3 py-1.5 text-xs font-medium border rounded-lg text-ink-600 dark:text-ink-300 border-ink-200 dark:border-ink-700 hover:bg-ink-50 dark:hover:bg-ink-800 transition-all">
                                View Logs
                                </button>
                            </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="space-y-3 sm:hidden">
                    {users.map(u => (
                        <div key={u.id} className="p-4 bg-white border shadow-sm dark:bg-ink-900 rounded-2xl border-ink-100 dark:border-ink-800">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center flex-shrink-0 text-sm font-semibold rounded-full w-9 h-9 bg-ink-100 dark:bg-ink-700 text-ink-600 dark:text-ink-300">
                                {u.full_name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-ink-900 dark:text-white">{u.full_name}</p>
                                <p className="text-xs text-ink-400">{u.email}</p>
                            </div>
                            </div>
                            <RiskBadge level={u.latest_risk} />
                        </div>
                        <div className="grid grid-cols-3 gap-2 pt-3 mb-3 text-center border-t border-ink-50 dark:border-ink-800">
                            <div>
                            <p className="font-bold text-verde-600 dark:text-verde-400">{u.total_logs}</p>
                            <p className="text-xs text-ink-400">Logs</p>
                            </div>
                            <div>
                            <p className="text-xs font-medium text-ink-700 dark:text-ink-300">{u.latest_mood ? `${moodEmoji(u.latest_mood)} ${u.latest_mood}/10` : '—'}</p>
                            <p className="text-xs text-ink-400">Mood</p>
                            </div>
                            <div>
                            <p className="text-xs font-medium text-ink-700 dark:text-ink-300">{u.last_log_date ? new Date(u.last_log_date).toLocaleDateString() : '—'}</p>
                            <p className="text-xs text-ink-400">Last Log</p>
                            </div>
                        </div>
                        <button onClick={() => handleViewUser(u)}
                            className="w-full py-2 text-xs font-medium transition-all border rounded-xl text-ink-600 dark:text-ink-300 border-ink-200 dark:border-ink-700 hover:bg-ink-50 dark:hover:bg-ink-800">
                            View Mood History
                        </button>
                        </div>
                    ))}
                    </div>
                </>
                )}
            </div>
            )}

            {/* ===== USER DETAIL TAB ===== */}
            {tab === 'userDetail' && selectedUser && (
            <div>
                <div className="flex items-center gap-3 mb-4">
                <button onClick={() => setTab('users')}
                    className="flex items-center gap-1.5 text-sm text-ink-500 dark:text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 5l-7 7 7 7"/>
                    </svg>
                    Back
                </button>
                <h2 className="font-semibold text-ink-900 dark:text-white">{selectedUser.full_name}'s Mood History</h2>
                </div>

                {userLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 bg-white border border-dashed dark:bg-ink-900 rounded-2xl border-ink-200 dark:border-ink-700">
                    <div className="mb-3 text-5xl">📝</div>
                    <p className="font-medium text-ink-500 dark:text-ink-400">No mood logs yet</p>
                </div>
                ) : (
                <div className="space-y-3">
                    {userLogs.map(log => (
                    <div key={log.id} className="p-4 bg-white border shadow-sm sm:p-5 dark:bg-ink-900 rounded-2xl border-ink-100 dark:border-ink-800">
                        <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">{moodEmoji(log.mood_score)}</span>
                            <div>
                            <p className="font-semibold text-ink-900 dark:text-white">{log.mood_score}/10</p>
                            <p className="text-xs text-ink-400">{new Date(log.log_date).toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' })}</p>
                            </div>
                        </div>
                        <RiskBadge level={log.risk_level} />
                        </div>

                        <div className="grid grid-cols-3 gap-2 p-3 mb-3 text-center rounded-xl bg-ink-50 dark:bg-ink-800">
                        <div>
                            <p className="text-sm font-semibold text-ink-900 dark:text-white">{log.sleep_hours || '—'}h</p>
                            <p className="text-xs text-ink-400">Sleep</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-ink-900 dark:text-white">{log.stress_level || '—'}/10</p>
                            <p className="text-xs text-ink-400">Stress</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-ink-900 dark:text-white">{log.anxiety_level || '—'}/10</p>
                            <p className="text-xs text-ink-400">Anxiety</p>
                        </div>
                        </div>

                        {log.symptoms && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                            {log.symptoms.split(',').map(s => (
                            <span key={s} className="px-2 py-1 text-xs rounded-lg bg-ink-100 dark:bg-ink-700 text-ink-600 dark:text-ink-300">{s.trim()}</span>
                            ))}
                        </div>
                        )}

                        {log.summary && (
                        <p className="text-sm leading-relaxed text-ink-500 dark:text-ink-400">{log.summary}</p>
                        )}
                    </div>
                    ))}
                </div>
                )}
            </div>
            )}

        </main>
        </div>
    );
};

export default CounselorDashboard;