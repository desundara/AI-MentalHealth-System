import React, { useState, useEffect } from 'react';
import { getCounselors, createCounselor, toggleCounselor, getUsers } from '../services/admin.service';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/common/Logo';
import ThemeToggle from '../components/common/ThemeToggle';

const AdminPage = () => {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('counselors');
  const [counselors, setCounselors] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  const TabBtn = ({ id, label, count }) => (
    <button onClick={() => setTab(id)}
      className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
        tab === id
          ? 'bg-primary text-white shadow-sm'
          : 'text-mc-muted dark:text-mc-muted-dark hover:bg-primary-50 dark:hover:bg-primary-800/20'
      }`}>
      {label} <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${tab === id ? 'bg-white/20' : 'bg-mc-border dark:bg-mc-border-dark'}`}>{count}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-neutral dark:bg-neutral-dark">
      <nav className="bg-white dark:bg-surface-dark border-b border-mc-border dark:border-mc-border-dark sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size={32} textSize="text-base" />
            <span className="text-xs font-medium bg-primary-50 dark:bg-primary-800/30 text-primary dark:text-primary-300 px-2 py-0.5 rounded-full border border-primary-100 dark:border-primary-700">Super Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button onClick={logout} className="text-sm text-mc-muted dark:text-mc-muted-dark hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-accent dark:text-primary-50">Admin Dashboard</h1>
          <p className="text-sm text-mc-muted dark:text-mc-muted-dark mt-1">Manage counselors and users</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Counselors', value: counselors.length, icon: '👩‍⚕️' },
            { label: 'Active Counselors', value: counselors.filter(c => c.is_active).length, icon: '✅' },
            { label: 'Total Users', value: users.length, icon: '👥' },
          ].map(s => (
            <div key={s.label} className="mc-card p-4">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-2xl font-bold text-accent dark:text-primary-50">{s.value}</div>
              <div className="text-xs text-mc-muted dark:text-mc-muted-dark mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          <TabBtn id="counselors" label="Counselors" count={counselors.length} />
          <TabBtn id="users" label="Users" count={users.length} />
        </div>

        {/* Counselors Tab */}
        {tab === 'counselors' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-accent dark:text-primary-50">Counselor Accounts</h2>
              <button onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-600 text-white text-sm font-medium rounded-xl transition-all">
                {showForm ? '✕ Cancel' : '+ Add Counselor'}
              </button>
            </div>

            {/* Create Form */}
            {showForm && (
              <div className="mc-card p-6 mb-5">
                <h3 className="font-medium text-accent dark:text-primary-50 mb-4">Create New Counselor</h3>
                {formError && <div className="mc-error mb-4">{formError}</div>}
                {formSuccess && <div className="mc-success mb-4">{formSuccess}</div>}
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="mc-label">Full Name</label>
                      <input type="text" value={form.fullName} onChange={e => setForm(f=>({...f, fullName: e.target.value}))}
                        placeholder="Counselor full name" className="mc-input" required />
                    </div>
                    <div>
                      <label className="mc-label">Email</label>
                      <input type="email" value={form.email} onChange={e => setForm(f=>({...f, email: e.target.value}))}
                        placeholder="counselor@mindcare.com" className="mc-input" required />
                    </div>
                  </div>
                  <div>
                    <label className="mc-label">Password</label>
                    <input type="password" value={form.password} onChange={e => setForm(f=>({...f, password: e.target.value}))}
                      placeholder="Minimum 6 characters" className="mc-input" required />
                  </div>
                  <button type="submit" disabled={submitting}
                    className="px-6 py-2.5 bg-primary hover:bg-primary-600 text-white text-sm font-medium rounded-xl transition-all disabled:opacity-60">
                    {submitting ? 'Creating...' : 'Create Counselor'}
                  </button>
                </form>
              </div>
            )}

            {/* Counselors List */}
            {loading ? (
              <div className="text-center py-10 text-mc-muted dark:text-mc-muted-dark">Loading...</div>
            ) : counselors.length === 0 ? (
              <div className="mc-card p-10 text-center text-mc-muted dark:text-mc-muted-dark">No counselors yet. Add one above.</div>
            ) : (
              <div className="mc-card overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-neutral dark:bg-neutral-dark border-b border-mc-border dark:border-mc-border-dark">
                    <tr>
                      {['Name','Email','Status','Joined','Action'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-mc-muted dark:text-mc-muted-dark uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-mc-border dark:divide-mc-border-dark">
                    {counselors.map(c => (
                      <tr key={c.id} className="hover:bg-neutral dark:hover:bg-neutral-dark transition-colors">
                        <td className="px-4 py-3 font-medium text-accent dark:text-primary-50">{c.full_name}</td>
                        <td className="px-4 py-3 text-mc-muted dark:text-mc-muted-dark">{c.email}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            c.is_active
                              ? 'bg-primary-50 dark:bg-primary-800/30 text-primary dark:text-primary-300'
                              : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                          }`}>{c.is_active ? 'Active' : 'Inactive'}</span>
                        </td>
                        <td className="px-4 py-3 text-mc-muted dark:text-mc-muted-dark">
                          {new Date(c.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => handleToggle(c.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              c.is_active
                                ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                                : 'text-primary hover:bg-primary-50 dark:hover:bg-primary-800/20'
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
            <h2 className="font-semibold text-accent dark:text-primary-50 mb-4">Registered Users</h2>
            {loading ? (
              <div className="text-center py-10 text-mc-muted dark:text-mc-muted-dark">Loading...</div>
            ) : users.length === 0 ? (
              <div className="mc-card p-10 text-center text-mc-muted dark:text-mc-muted-dark">No users yet.</div>
            ) : (
              <div className="mc-card overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-neutral dark:bg-neutral-dark border-b border-mc-border dark:border-mc-border-dark">
                    <tr>
                      {['Name','Email','Total Logs','Last Log','Joined'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-mc-muted dark:text-mc-muted-dark uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-mc-border dark:divide-mc-border-dark">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-neutral dark:hover:bg-neutral-dark transition-colors">
                        <td className="px-4 py-3 font-medium text-accent dark:text-primary-50">{u.full_name}</td>
                        <td className="px-4 py-3 text-mc-muted dark:text-mc-muted-dark">{u.email}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2.5 py-1 bg-primary-50 dark:bg-primary-800/30 text-primary dark:text-primary-300 rounded-full text-xs font-medium">{u.total_logs}</span>
                        </td>
                        <td className="px-4 py-3 text-mc-muted dark:text-mc-muted-dark">
                          {u.last_log_date ? new Date(u.last_log_date).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="px-4 py-3 text-mc-muted dark:text-mc-muted-dark">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
