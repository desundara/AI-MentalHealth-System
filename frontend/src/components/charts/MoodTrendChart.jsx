import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { getMoodStats } from '../../services/mood.service';

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    return (
        <div className="px-3 py-2 text-xs bg-white border shadow-lg dark:bg-ink-800 rounded-xl border-ink-100 dark:border-ink-700">
        <p className="mb-1 font-semibold text-ink-900 dark:text-white">{label}</p>
        {payload.map((p, i) => (
            <p key={i} style={{ color: p.color }} className="font-medium">
            {p.name}: {p.value}
            </p>
        ))}
        </div>
    );
    };

    const MoodTrendChart = () => {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [metric, setMetric] = useState('mood_score');

    useEffect(() => {
        getMoodStats()
        .then(res => setStats(res.data.stats))
        .catch(console.error)
        .finally(() => setLoading(false));
    }, []);

    const chartData = stats.map(s => ({
        date: new Date(s.log_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        mood_score: s.mood_score,
        stress_level: s.stress_level,
        anxiety_level: s.anxiety_level,
    }));

    const metrics = [
        { key: 'mood_score', label: 'Mood', color: '#16a34a', emoji: '😊' },
        { key: 'stress_level', label: 'Stress', color: '#f97316', emoji: '😤' },
        { key: 'anxiety_level', label: 'Anxiety', color: '#a855f7', emoji: '😰' },
    ];

    const activeMetric = metrics.find(m => m.key === metric);

    if (loading) {
        return (
        <div className="flex items-center justify-center bg-white border shadow-sm dark:bg-ink-900 rounded-2xl border-ink-100 dark:border-ink-800 h-72">
            <svg className="w-6 h-6 animate-spin text-verde-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
        </div>
        );
    }

    if (chartData.length === 0) {
        return (
        <div className="flex flex-col items-center justify-center py-12 bg-white border border-dashed dark:bg-ink-900 rounded-2xl border-ink-200 dark:border-ink-700">
            <div className="mb-2 text-4xl">📊</div>
            <p className="text-sm font-medium text-ink-500 dark:text-ink-400">No mood data yet</p>
            <p className="text-xs text-ink-400 dark:text-ink-500">Log your mood to see trends here</p>
        </div>
        );
    }

    return (
        <div className="p-5 bg-white border shadow-sm dark:bg-ink-900 rounded-2xl border-ink-100 dark:border-ink-800">
        <div className="flex items-center justify-between mb-4">
            <div>
            <h3 className="font-semibold text-ink-900 dark:text-white">Mood Trend</h3>
            <p className="text-xs text-ink-400 dark:text-ink-500">Last {chartData.length} entries</p>
            </div>
            <div className="flex gap-1 p-1 bg-ink-100 dark:bg-ink-800 rounded-xl">
            {metrics.map(m => (
                <button key={m.key} onClick={() => setMetric(m.key)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    metric === m.key
                    ? 'bg-white dark:bg-ink-900 text-ink-900 dark:text-white shadow-sm'
                    : 'text-ink-400 dark:text-ink-500'
                }`}>
                {m.emoji} {m.label}
                </button>
            ))}
            </div>
        </div>

        <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
                <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={activeMetric.color} stopOpacity={0.25}/>
                <stop offset="95%" stopColor={activeMetric.color} stopOpacity={0}/>
                </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-ink-100 dark:text-ink-800" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={24} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey={metric} name={activeMetric.label}
                stroke={activeMetric.color} strokeWidth={2.5}
                fill="url(#colorMetric)"
                dot={{ fill: activeMetric.color, r: 3 }}
                activeDot={{ r: 5 }} />
            </AreaChart>
        </ResponsiveContainer>
        </div>
    );
};

export default MoodTrendChart;
