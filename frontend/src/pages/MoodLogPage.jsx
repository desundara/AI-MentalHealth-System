import React, { useState, useEffect } from 'react';
import { createMoodLog, getTodayLog } from '../services/mood.service';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/common/Logo';
import ThemeToggle from '../components/common/ThemeToggle';

const SYMPTOMS = ['Fatigue','Low motivation','Sadness','Irritability','Poor concentration','Hopelessness','Appetite changes','Insomnia','Social withdrawal','Panic attacks'];

const MoodLogPage = () => {
    const { user, logout } = useAuth();
    const [todayLog, setTodayLog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        mood_score: 5,
        sleep_hours: '',
        stress_level: 5,
        anxiety_level: 5,
        symptoms: [],
        notes: ''
    });

    useEffect(() => {
        getTodayLog()
        .then(res => setTodayLog(res.data.log))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, []);

    const toggleSymptom = (s) => {
        setForm(f => ({
        ...f,
        symptoms: f.symptoms.includes(s) ? f.symptoms.filter(x => x !== s) : [...f.symptoms, s]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
        const res = await createMoodLog({ ...form, symptoms: form.symptoms.join(',') });
        setSuccess(res.data.assessment);
        setTodayLog(res.data);
        } catch (err) {
        setError(err.response?.data?.message || 'Failed to save mood log');
        } finally {
        setSubmitting(false);
        }
    };

    const moodEmoji = (score) => {
        if (score <= 2) return '😢';
        if (score <= 4) return '😟';
        if (score <= 6) return '😐';
        if (score <= 8) return '🙂';
        return '😄';
    };

    const riskColor = (level) => ({
        Low: 'text-primary bg-primary-50 dark:bg-primary-800/30 dark:text-primary-200 border-primary-100 dark:border-primary-700',
        Medium: 'text-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
        High: 'text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-300 border-red-200 dark:border-red-800'
    }[level] || '');

    const SliderField = ({ label, name, value, emoji }) => (
        <div>
        <div className="flex justify-between mb-2">
            <label className="mb-0 mc-label">{label}</label>
            <span className="text-sm font-semibold text-primary dark:text-primary-400">{value}/10 {emoji}</span>
        </div>
        <input type="range" min="1" max="10" value={value}
            onChange={e => setForm(f => ({ ...f, [name]: parseInt(e.target.value) }))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer bg-mc-border dark:bg-mc-border-dark accent-primary" />
        <div className="flex justify-between mt-1 text-xs text-mc-muted dark:text-mc-muted-dark">
            <span>1</span><span>10</span>
        </div>
        </div>
    );

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-neutral dark:bg-neutral-dark">
        <div className="text-mc-muted dark:text-mc-muted-dark">Loading...</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-neutral dark:bg-neutral-dark">
        {/* Navbar */}
        <nav className="sticky top-0 z-10 bg-white border-b dark:bg-surface-dark border-mc-border dark:border-mc-border-dark">
            <div className="flex items-center justify-between max-w-5xl px-4 py-3 mx-auto">
            <Logo size={32} textSize="text-base" />
            <div className="flex items-center gap-3">
                <span className="hidden text-sm text-mc-muted dark:text-mc-muted-dark sm:block">Hi, {user?.full_name?.split(' ')[0]} 👋</span>
                <ThemeToggle />
                <button onClick={logout}
                className="text-sm text-mc-muted dark:text-mc-muted-dark hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                Logout
                </button>
            </div>
            </div>
        </nav>

        <div className="max-w-2xl px-4 py-8 mx-auto">
            <div className="mb-6">
            <h1 className="text-2xl font-bold text-accent dark:text-primary-50">Daily Mood Check-in</h1>
            <p className="mt-1 text-sm text-mc-muted dark:text-mc-muted-dark">
                {new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
            </p>
            </div>

            {/* Already logged today */}
            {todayLog && !success && (
            <div className="p-6 mb-6 mc-card">
                <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{moodEmoji(todayLog.mood_score)}</span>
                <div>
                    <h2 className="font-semibold text-accent dark:text-primary-50">Already logged today!</h2>
                    <p className="text-sm text-mc-muted dark:text-mc-muted-dark">Mood score: {todayLog.mood_score}/10</p>
                </div>
                </div>
                {todayLog.risk_level && (
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${riskColor(todayLog.risk_level)}`}>
                    Risk Level: {todayLog.risk_level}
                </div>
                )}
                {todayLog.ai_summary && (
                <p className="mt-3 text-sm text-mc-muted dark:text-mc-muted-dark">{todayLog.ai_summary}</p>
                )}
            </div>
            )}

            {/* AI Result after submit */}
            {success && (
            <div className="p-6 mb-6 mc-card">
                <h2 className="mb-3 font-semibold text-accent dark:text-primary-50">✅ Mood logged! AI Assessment:</h2>
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border mb-3 ${riskColor(success.risk_level)}`}>
                Risk Level: {success.risk_level}
                </div>
                <p className="mb-4 text-sm text-mc-muted dark:text-mc-muted-dark">{success.summary}</p>
                <div>
                <p className="mb-2 text-sm font-medium text-accent dark:text-primary-100">Suggestions:</p>
                <ul className="space-y-2">
                    {success.suggestions?.split('|').map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-mc-muted dark:text-mc-muted-dark">
                        <span className="text-primary mt-0.5">✓</span>{s.trim()}
                    </li>
                    ))}
                </ul>
                </div>
            </div>
            )}

            {/* Log Form - hide if already logged */}
            {!todayLog && !success && (
            <form onSubmit={handleSubmit} className="p-6 space-y-6 mc-card md:p-8">
                {error && <div className="mc-error">{error}</div>}

                {/* Mood Score */}
                <div className="pb-4 text-center border-b border-mc-border dark:border-mc-border-dark">
                <p className="mb-3 text-center mc-label">How are you feeling today?</p>
                <div className="mb-3 text-6xl">{moodEmoji(form.mood_score)}</div>
                <div className="mb-4 text-3xl font-bold text-primary dark:text-primary-400">{form.mood_score}/10</div>
                <input type="range" min="1" max="10" value={form.mood_score}
                    onChange={e => setForm(f => ({ ...f, mood_score: parseInt(e.target.value) }))}
                    className="w-full h-3 rounded-full appearance-none cursor-pointer bg-mc-border dark:bg-mc-border-dark accent-primary" />
                <div className="flex justify-between mt-2 text-xs text-mc-muted dark:text-mc-muted-dark">
                    <span>😢 Very Bad</span><span>😄 Excellent</span>
                </div>
                </div>

                {/* Sleep */}
                <div>
                <label className="mc-label">Hours of sleep last night</label>
                <input type="number" min="0" max="24" step="0.5" value={form.sleep_hours}
                    onChange={e => setForm(f => ({ ...f, sleep_hours: e.target.value }))}
                    placeholder="e.g. 7.5" className="mc-input" />
                </div>

                {/* Stress & Anxiety sliders */}
                <SliderField label="Stress Level" name="stress_level" value={form.stress_level} emoji="😤" />
                <SliderField label="Anxiety Level" name="anxiety_level" value={form.anxiety_level} emoji="😰" />

                {/* Symptoms */}
                <div>
                <label className="mc-label">Symptoms (select all that apply)</label>
                <div className="flex flex-wrap gap-2 mt-2">
                    {SYMPTOMS.map(s => (
                    <button key={s} type="button" onClick={() => toggleSymptom(s)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                        form.symptoms.includes(s)
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white dark:bg-surface-dark text-mc-muted dark:text-mc-muted-dark border-mc-border dark:border-mc-border-dark hover:border-primary'
                        }`}>
                        {s}
                    </button>
                    ))}
                </div>
                </div>

                {/* Notes */}
                <div>
                <label className="mc-label">Additional notes <span className="font-normal text-mc-muted">(optional)</span></label>
                <textarea value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="How was your day? Anything on your mind?"
                    rows={3} className="resize-none mc-input" />
                </div>

                <button type="submit" className="mc-btn-primary" disabled={submitting}>
                {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                    Analyzing with AI...
                    </span>
                ) : 'Submit & Get AI Assessment 🤖'}
                </button>
            </form>
            )}
        </div>
        </div>
    );
};

export default MoodLogPage;
