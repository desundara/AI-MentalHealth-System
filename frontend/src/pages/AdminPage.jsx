import React, { useState, useEffect } from 'react';
import { getCounselors, createCounselor, toggleCounselor, getUsers } from '../services/admin.service';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/common/Logo';
import ThemeToggle from '../components/common/ThemeToggle';

const StatCard = ({ icon, value, label, color }) => (
  <div className="relative p-5 overflow-hidden bg-white border shadow-sm dark:bg-ink-900 rounded-2xl border-ink-100 dark:border-ink-800">
    <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -mr-8 -mt-8 opacity-10 ${color}`} />
    <div className="mb-3 text-3xl">{icon}</div>
    <div className="text-3xl font-bold text-ink-900 dark:text-white font-display" style={{fontFamily:'Sora,sans-serif'}}>{value}</div>
    <div className="mt-1 text-sm text-ink-500 dark:text-ink-400">{label}</div>
  </div>
);

const Badge = ({ active }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
    active
      ? 'bg-verde-50 dark:bg-verde-950/30 text-verde-700 dark:text-verde-400 border border-verde-200 dark:border-verde-800'
      : 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900'
  }`}>
    <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-verde-500' : 'bg-red-500'}`} />
    {active ? 'Active' : 'Inactive'}
  </span>
);

const AdminPage = () => {
  const { logout } = useAuth();
  const [tab, setTab] = useState('counselors');
  const [counselors, setCounselors] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    Promise.all([getCounselors(), getUsers()])
      .then(([c, u]) => { setCounselors(c.data.counselors); setUsers(u.data.users); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true); setFormError(''); setFormSuccess('');
    try {
      await createCounselor(form);
      setFormSuccess('Counselor created successfully!');
      setForm({ fullName: '', email: '', password: '' });
      const res = await getCounselors();
      setCounselors(res.data.counselors);
      setTimeout(() => { setShowForm(false); setFormSuccess(''); }, 2000);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create counselor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await toggleCounselor(id);
      const res = await getCounselors();
      setCounselors(res.data.counselors);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen transition-colors duration-300 bg-ink-50 dark:bg-ink-950">

      {/* Navbar */}
      <header className="sticky top-0 z-20 border-b bg-white/80 dark:bg-ink-900/80 backdrop-blur-md border-ink-100 dark:border-ink-800">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="md" />
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-verde-50 dark:bg-verde-950/40 text-verde-700 dark:text-verde-400 border border-verde-200 dark:border-verde-800">
              <span className="w-1.5 h-1.5 rounded-full bg-verde-500 animate-pulse" />
              Super Admin
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all text-ink-500 dark:text-ink-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl px-6 py-8 mx-auto">

        {/* Page header */}
        <div className="mb-8">
          <div className="w-10 h-1 mb-4 rounded-full bg-verde-500" />
          <h1 className="text-3xl font-bold text-ink-900 dark:text-white font-display" style={{fontFamily:'Sora,sans-serif'}}>
            Admin Dashboard
          </h1>
          <p className="mt-1 text-ink-500 dark:text-ink-400">Manage counselors and monitor user activity</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8 sm:grid-cols-3">
          <StatCard icon="👩‍⚕️" value={counselors.length} label="Total Counselors" color="bg-verde-500" />
          <StatCard icon="✅" value={counselors.filter(c => c.is_active).length} label="Active Counselors" color="bg-blue-500" />
          <StatCard icon="👥" value={users.length} label="Registered Users" color="bg-purple-500" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 mb-6 bg-ink-100 dark:bg-ink-800 rounded-xl w-fit">
          {[
            { id: 'counselors', label: 'Counselors', count: counselors.length },
            { id: 'users', label: 'Users', count: users.length },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.id
                  ? 'bg-white dark:bg-ink-900 text-ink-900 dark:text-white shadow-sm'
                  : 'text-ink-500 dark:text-ink-400 hover:text-ink-700 dark:hover:text-ink-200'
              }`}>
              {t.label}
              <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                tab === t.id ? 'bg-verde-100 dark:bg-verde-900/40 text-verde-700 dark:text-verde-400' : 'bg-ink-200 dark:bg-ink-700 text-ink-500 dark:text-ink-400'
              }`}>{t.count}</span>
            </button>
          ))}
        </div>

        {/* Counselors Tab */}
        {tab === 'counselors' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-ink-900 dark:text-white">Counselor Accounts</h2>
              <button onClick={() => { setShowForm(!showForm); setFormError(''); setFormSuccess(''); }}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                  showForm
                    ? 'bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300'
                    : 'bg-verde-600 hover:bg-verde-700 text-white shadow-sm'
                }`}>
                {showForm ? (
                  <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Cancel</>
                ) : (
                  <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Counselor</>
                )}
              </button>
            </div>

            {/* Create Form */}
            {showForm && (
              <div className="p-6 mb-5 bg-white border shadow-sm dark:bg-ink-900 border-ink-100 dark:border-ink-800 rounded-2xl">
                <h3 className="mb-1 font-semibold text-ink-900 dark:text-white">Create New Counselor Account</h3>
                <p className="mb-5 text-sm text-ink-500 dark:text-ink-400">The counselor will be able to monitor user mood logs and alerts.</p>

                {formError && (
                  <div className="flex items-center gap-2 p-3.5 mb-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl text-sm text-red-600 dark:text-red-400">
                    <span>⚠</span> {formError}
                  </div>
                )}
                {formSuccess && (
                  <div className="flex items-center gap-2 p-3.5 mb-4 bg-verde-50 dark:bg-verde-950/20 border border-verde-200 dark:border-verde-800 rounded-xl text-sm text-verde-700 dark:text-verde-400">
                    <span>✓</span> {formSuccess}
                  </div>
                )}

                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-ink-700 dark:text-ink-300 mb-1.5">Full Name</label>
                      <input type="text" value={form.fullName}
                        onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                        placeholder="e.g. Dr. Sarah Silva"
                        className="w-full px-4 py-2.5 rounded-xl border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-800 text-ink-900 dark:text-white placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-verde-500 text-sm transition-all"
                        required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ink-700 dark:text-ink-300 mb-1.5">Email Address</label>
                      <input type="email" value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="counselor@mindcare.com"
                        className="w-full px-4 py-2.5 rounded-xl border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-800 text-ink-900 dark:text-white placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-verde-500 text-sm transition-all"
                        required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink-700 dark:text-ink-300 mb-1.5">Password</label>
                    <div className="relative">
                      <input type={showPass ? 'text' : 'password'} value={form.password}
                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                        placeholder="Minimum 6 characters"
                        className="w-full px-4 py-2.5 pr-12 rounded-xl border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-800 text-ink-900 dark:text-white placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-verde-500 text-sm transition-all"
                        required />
                      <button type="button" onClick={() => setShowPass(!showPass)}
                        className="absolute transition-colors -translate-y-1/2 right-3 top-1/2 text-ink-400 hover:text-ink-600 dark:hover:text-ink-300">
                        {showPass
                          ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                          : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        }
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <button type="submit" disabled={submitting}
                      className="px-6 py-2.5 bg-verde-600 hover:bg-verde-700 text-white text-sm font-medium rounded-xl transition-all disabled:opacity-60 flex items-center gap-2">
                      {submitting ? (
                        <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg> Creating...</>
                      ) : 'Create Counselor'}
                    </button>
                    <button type="button" onClick={() => setShowForm(false)}
                      className="px-4 py-2.5 text-sm text-ink-500 dark:text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Counselors Table */}
            {loading ? (
              <div className="flex items-center justify-center py-16 text-ink-400 dark:text-ink-500">
                <svg className="w-5 h-5 mr-2 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
                Loading counselors...
              </div>
            ) : counselors.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 bg-white border border-dashed dark:bg-ink-900 rounded-2xl border-ink-200 dark:border-ink-700">
                <div className="mb-3 text-5xl">👩‍⚕️</div>
                <p className="font-medium text-ink-500 dark:text-ink-400">No counselors yet</p>
                <p className="mt-1 text-sm text-ink-400 dark:text-ink-500">Click "Add Counselor" to create one</p>
              </div>
            ) : (
              <div className="overflow-x-auto bg-white border shadow-sm dark:bg-ink-900 rounded-2xl border-ink-100 dark:border-ink-800">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-ink-50 dark:bg-ink-800/50 border-ink-100 dark:border-ink-800">
                      {['Name', 'Email', 'Status', 'Joined', 'Action'].map(h => (
                        <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-50 dark:divide-ink-800">
                    {counselors.map(c => (
                      <tr key={c.id} className="transition-colors hover:bg-ink-50/50 dark:hover:bg-ink-800/30">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 text-sm font-semibold rounded-full bg-verde-100 dark:bg-verde-900/30 text-verde-700 dark:text-verde-400">
                              {c.full_name?.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-ink-900 dark:text-white">{c.full_name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-ink-500 dark:text-ink-400">{c.email}</td>
                        <td className="px-5 py-4"><Badge active={c.is_active} /></td>
                        <td className="px-5 py-4 text-ink-500 dark:text-ink-400">{new Date(c.created_at).toLocaleDateString()}</td>
                        <td className="px-5 py-4">
                          <button onClick={() => handleToggle(c.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              c.is_active
                                ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 border border-red-200 dark:border-red-900'
                                : 'text-verde-700 dark:text-verde-400 hover:bg-verde-50 dark:hover:bg-verde-950/20 border border-verde-200 dark:border-verde-800'
                            }`}>
                            {c.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {tab === 'users' && (
          <div>
            <h2 className="mb-4 font-semibold text-ink-900 dark:text-white">Registered Users</h2>
            {loading ? (
              <div className="flex items-center justify-center py-16 text-ink-400 dark:text-ink-500">
                <svg className="w-5 h-5 mr-2 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
                Loading users...
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 bg-white border border-dashed dark:bg-ink-900 rounded-2xl border-ink-200 dark:border-ink-700">
                <div className="mb-3 text-5xl">👥</div>
                <p className="font-medium text-ink-500 dark:text-ink-400">No users registered yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto bg-white border shadow-sm dark:bg-ink-900 rounded-2xl border-ink-100 dark:border-ink-800">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-ink-50 dark:bg-ink-800/50 border-ink-100 dark:border-ink-800">
                      {['User', 'Email', 'Total Logs', 'Last Log', 'Joined'].map(h => (
                        <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider">{h}</th>
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
                            <span className="font-medium text-ink-900 dark:text-white">{u.full_name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-ink-500 dark:text-ink-400">{u.email}</td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center justify-center w-8 h-8 text-sm font-semibold rounded-full bg-verde-50 dark:bg-verde-950/30 text-verde-700 dark:text-verde-400">
                            {u.total_logs}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-ink-500 dark:text-ink-400">
                          {u.last_log_date ? new Date(u.last_log_date).toLocaleDateString() : (
                            <span className="text-ink-300 dark:text-ink-600">Never</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-ink-500 dark:text-ink-400">{new Date(u.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPage;