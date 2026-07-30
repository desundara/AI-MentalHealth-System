import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../components/common/Logo';
import ThemeToggle from '../components/common/ThemeToggle';
import IdleWarningModal from '../components/common/IdleWarningModal';
import API from '../services/api';

const UserProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('profile');

  const [nameForm, setNameForm] = useState({ fullName: '' });
  const [nameMsg, setNameMsg] = useState({ type: '', text: '' });
  const [nameSaving, setNameSaving] = useState(false);

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwMsg, setPwMsg] = useState({ type: '', text: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });

  useEffect(() => {
    API.get('/user/profile')
      .then(res => {
        setProfile(res.data.user);
        setNameForm({ fullName: res.data.user.full_name });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleNameSave = async (e) => {
    e.preventDefault();
    setNameSaving(true); setNameMsg({ type: '', text: '' });
    try {
      await API.patch('/user/profile', { fullName: nameForm.fullName });
      setNameMsg({ type: 'success', text: 'Name updated successfully!' });
      setProfile(p => ({ ...p, full_name: nameForm.fullName }));
    } catch (err) {
      setNameMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update' });
    } finally { setNameSaving(false); }
  };

  const handlePwSave = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword)
      return setPwMsg({ type: 'error', text: 'New passwords do not match' });
    if (pwForm.newPassword.length < 6)
      return setPwMsg({ type: 'error', text: 'New password must be at least 6 characters' });
    setPwSaving(true); setPwMsg({ type: '', text: '' });
    try {
      await API.patch('/user/change-password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwMsg({ type: 'success', text: 'Password changed successfully!' });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwMsg({ type: 'error', text: err.response?.data?.message || 'Failed to change password' });
    } finally { setPwSaving(false); }
  };

  const EyeBtn = ({ field }) => (
    <button type="button" onClick={() => setShowPw(p => ({ ...p, [field]: !p[field] }))}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600 dark:hover:text-ink-300 transition-colors">
      {showPw[field]
        ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
        : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
    </button>
  );

  const inputCls = 'w-full px-4 py-2.5 text-sm border rounded-xl border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-800 text-ink-900 dark:text-white placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-verde-500';

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-ink-50 dark:bg-ink-950">
      <svg className="w-7 h-7 animate-spin text-verde-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
    </div>
  );

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
        <div className="mb-6">
          <div className="w-8 h-1 mb-3 rounded-full bg-verde-500" />
          <h1 className="text-2xl font-bold text-ink-900 dark:text-white" style={{fontFamily:'Sora,sans-serif'}}>My Profile</h1>
          <p className="mt-1 text-sm text-ink-400 dark:text-ink-500">Manage your account settings</p>
        </div>

        {/* Avatar Card */}
        <div className="flex items-center gap-4 p-5 mb-5 bg-white border shadow-sm dark:bg-ink-900 rounded-2xl border-ink-100 dark:border-ink-800">
          <div className="flex items-center justify-center w-16 h-16 text-2xl font-bold rounded-2xl bg-verde-100 dark:bg-verde-900/30 text-verde-700 dark:text-verde-400 flex-shrink-0">
            {profile?.full_name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-ink-900 dark:text-white">{profile?.full_name}</p>
            <p className="text-sm text-ink-500 dark:text-ink-400">{profile?.email}</p>
            <span className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-verde-50 dark:bg-verde-950/30 text-verde-700 dark:text-verde-400 border border-verde-200 dark:border-verde-800">
              <span className="w-1.5 h-1.5 rounded-full bg-verde-500" />
              {profile?.role}
            </span>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs text-ink-400 dark:text-ink-500">Member since</p>
            <p className="text-sm font-medium text-ink-700 dark:text-ink-300">
              {new Date(profile?.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 mb-5 bg-ink-100 dark:bg-ink-800 rounded-xl w-fit">
          {[{ id: 'profile', label: '👤 Edit Profile' }, { id: 'password', label: '🔐 Change Password' }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.id
                  ? 'bg-white dark:bg-ink-900 text-ink-900 dark:text-white shadow-sm'
                  : 'text-ink-500 dark:text-ink-400 hover:text-ink-700'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Edit Profile */}
        {tab === 'profile' && (
          <div className="p-6 bg-white border shadow-sm dark:bg-ink-900 rounded-2xl border-ink-100 dark:border-ink-800">
            <h2 className="mb-1 font-semibold text-ink-900 dark:text-white">Personal Information</h2>
            <p className="mb-5 text-sm text-ink-400 dark:text-ink-500">Update your display name</p>

            {nameMsg.text && (
              <div className={`flex items-center gap-2 p-3.5 mb-4 rounded-xl text-sm border ${
                nameMsg.type === 'success'
                  ? 'bg-verde-50 dark:bg-verde-950/20 border-verde-200 dark:border-verde-800 text-verde-700 dark:text-verde-400'
                  : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400'
              }`}>
                {nameMsg.type === 'success' ? '✓' : '⚠'} {nameMsg.text}
              </div>
            )}

            <form onSubmit={handleNameSave} className="space-y-4">
              <div>
                <label className="block mb-1.5 text-sm font-medium text-ink-700 dark:text-ink-300">Full Name</label>
                <input type="text" value={nameForm.fullName}
                  onChange={e => setNameForm({ fullName: e.target.value })}
                  placeholder="Your full name"
                  className={inputCls} required />
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium text-ink-700 dark:text-ink-300">Email Address</label>
                <input type="email" value={profile?.email} disabled
                  className={`${inputCls} opacity-60 cursor-not-allowed`} />
                <p className="mt-1 text-xs text-ink-400 dark:text-ink-500">Email cannot be changed</p>
              </div>
              <button type="submit" disabled={nameSaving}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white transition-all rounded-xl bg-verde-600 hover:bg-verde-700 disabled:opacity-60">
                {nameSaving
                  ? <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg> Saving...</>
                  : 'Save Changes'}
              </button>
            </form>
          </div>
        )}

        {/* Change Password */}
        {tab === 'password' && (
          <div className="p-6 bg-white border shadow-sm dark:bg-ink-900 rounded-2xl border-ink-100 dark:border-ink-800">
            <h2 className="mb-1 font-semibold text-ink-900 dark:text-white">Change Password</h2>
            <p className="mb-5 text-sm text-ink-400 dark:text-ink-500">Use a strong password with at least 6 characters</p>

            {pwMsg.text && (
              <div className={`flex items-center gap-2 p-3.5 mb-4 rounded-xl text-sm border ${
                pwMsg.type === 'success'
                  ? 'bg-verde-50 dark:bg-verde-950/20 border-verde-200 dark:border-verde-800 text-verde-700 dark:text-verde-400'
                  : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400'
              }`}>
                {pwMsg.type === 'success' ? '✓' : '⚠'} {pwMsg.text}
              </div>
            )}

            <form onSubmit={handlePwSave} className="space-y-4">
              {[
                { field: 'current', label: 'Current Password', key: 'currentPassword', placeholder: 'Enter current password' },
                { field: 'new', label: 'New Password', key: 'newPassword', placeholder: 'Minimum 6 characters' },
                { field: 'confirm', label: 'Confirm New Password', key: 'confirmPassword', placeholder: 'Repeat new password' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block mb-1.5 text-sm font-medium text-ink-700 dark:text-ink-300">{f.label}</label>
                  <div className="relative">
                    <input type={showPw[f.field] ? 'text' : 'password'}
                      value={pwForm[f.key]}
                      onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className={`${inputCls} pr-11`} required />
                    <EyeBtn field={f.field} />
                  </div>
                </div>
              ))}
              <button type="submit" disabled={pwSaving}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white transition-all rounded-xl bg-verde-600 hover:bg-verde-700 disabled:opacity-60">
                {pwSaving
                  ? <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg> Saving...</>
                  : 'Change Password'}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserProfilePage;
