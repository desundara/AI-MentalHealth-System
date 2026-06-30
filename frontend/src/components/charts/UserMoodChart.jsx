import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    return (
        <div className="px-3 py-2 text-xs bg-white border shadow-lg dark:bg-ink-800 rounded-xl border-ink-100 dark:border-ink-700">
        <p className="mb-1 font-semibold text-ink-900 dark:text-white">{label}</p>
        {payload.map((p, i) => (
            <p key={i} style={{ color: p.color }} className="font-medium">{p.name}: {p.value}</p>
        ))}
        </div>
    );
    };

    // Pass in `logs` array (from getUserLogs) — same shape as MoodLogs + AIAssessments join
    const UserMoodChart = ({ logs }) => {
    if (!logs || logs.length === 0) {
        return (
        <div className="flex flex-col items-center justify-center py-10 bg-white border border-dashed dark:bg-ink-900 rounded-2xl border-ink-200 dark:border-ink-700">
            <div className="mb-2 text-4xl">📊</div>
            <p className="text-sm text-ink-400 dark:text-ink-500">No mood history to chart yet</p>
        </div>
        );
    }

    // logs come newest-first from backend — reverse for chronological chart
    const chartData = [...logs].reverse().map(l => ({
        date: new Date(l.log_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        Mood: l.mood_score,
        Stress: l.stress_level,
        Anxiety: l.anxiety_level,
    }));

    return (
        <div className="p-5 bg-white border shadow-sm dark:bg-ink-900 rounded-2xl border-ink-100 dark:border-ink-800">
        <h3 className="mb-1 font-semibold text-ink-900 dark:text-white">Mood, Stress & Anxiety Trend</h3>
        <p className="mb-4 text-xs text-ink-400 dark:text-ink-500">{chartData.length} logged entries</p>

        <ResponsiveContainer width="100%" height={260}>
        <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-ink-100 dark:text-ink-800" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={24} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
          <Line type="monotone" dataKey="Mood" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          <Line type="monotone" dataKey="Stress" stroke="#f97316" strokeWidth={2} dot={{ r: 2.5 }} strokeDasharray="4 2" />
          <Line type="monotone" dataKey="Anxiety" stroke="#a855f7" strokeWidth={2} dot={{ r: 2.5 }} strokeDasharray="4 2" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UserMoodChart;
