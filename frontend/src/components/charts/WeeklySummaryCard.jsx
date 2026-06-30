import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const riskColors = { Low: 'bg-verde-500', Medium: 'bg-yellow-500', High: 'bg-red-500' };

const WeeklySummaryCard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.get('/mood/weekly-summary')
        .then(res => setData(res.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
        <div className="flex items-center justify-center h-40 bg-white border shadow-sm dark:bg-ink-900 rounded-2xl border-ink-100 dark:border-ink-800">
            <svg className="w-5 h-5 animate-spin text-verde-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
        </div>
        );
    }

    const s = data?.summary;
    if (!s || s.total_logs === 0) {
        return (
        <div className="p-5 text-center bg-white border border-dashed dark:bg-ink-900 rounded-2xl border-ink-200 dark:border-ink-700">
            <p className="text-sm text-ink-400 dark:text-ink-500">No logs in the last 7 days yet</p>
        </div>
        );
    }

    const totalRisk = data.riskBreakdown.reduce((sum, r) => sum + r.count, 0);

    return (
        <div className="p-5 bg-white border shadow-sm dark:bg-ink-900 rounded-2xl border-ink-100 dark:border-ink-800">
        <h3 className="mb-1 font-semibold text-ink-900 dark:text-white">Weekly Summary</h3>
        <p className="mb-4 text-xs text-ink-400 dark:text-ink-500">Last 7 days · {s.total_logs} log{s.total_logs > 1 ? 's' : ''}</p>

        <div className="grid grid-cols-2 gap-3 mb-4 sm:grid-cols-4">
            {[
            { label: 'Avg Mood', value: s.avg_mood?.toFixed(1) ?? '—', emoji: '😊' },
            { label: 'Avg Stress', value: s.avg_stress?.toFixed(1) ?? '—', emoji: '😤' },
            { label: 'Avg Anxiety', value: s.avg_anxiety?.toFixed(1) ?? '—', emoji: '😰' },
            { label: 'Avg Sleep', value: s.avg_sleep ? `${s.avg_sleep.toFixed(1)}h` : '—', emoji: '🌙' },
            ].map(stat => (
            <div key={stat.label} className="p-3 text-center rounded-xl bg-ink-50 dark:bg-ink-800">
                <div className="mb-1 text-lg">{stat.emoji}</div>
                <p className="text-lg font-bold text-ink-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-ink-400 dark:text-ink-500">{stat.label}</p>
            </div>
            ))}
        </div>

        {totalRisk > 0 && (
            <div>
            <p className="mb-2 text-xs font-medium text-ink-500 dark:text-ink-400">Risk level breakdown</p>
            <div className="flex h-2 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
                {data.riskBreakdown.map(r => (
                <div key={r.risk_level} className={riskColors[r.risk_level]}
                    style={{ width: `${(r.count / totalRisk) * 100}%` }} />
                ))}
            </div>
            <div className="flex flex-wrap gap-3 mt-2">
                {data.riskBreakdown.map(r => (
                <span key={r.risk_level} className="flex items-center gap-1.5 text-xs text-ink-500 dark:text-ink-400">
                    <span className={`w-2 h-2 rounded-full ${riskColors[r.risk_level]}`} />
                    {r.risk_level}: {r.count}
                </span>
                ))}
            </div>
            </div>
        )}
        </div>
    );
};

export default WeeklySummaryCard;
