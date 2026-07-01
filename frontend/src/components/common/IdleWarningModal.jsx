import React, { useState, useEffect } from 'react';
import useIdleTimer from '../../hooks/useIdleTimer';

const IdleWarningModal = () => {
    const [showWarning, setShowWarning] = useState(false);
    const [countdown, setCountdown] = useState(120);
    const countdownRef = React.useRef(null);

    const startCountdown = () => {
        setShowWarning(true);
        setCountdown(120);
        countdownRef.current = setInterval(() => {
        setCountdown(prev => {
            if (prev <= 1) {
            clearInterval(countdownRef.current);
            return 0;
            }
            return prev - 1;
        });
        }, 1000);
    };

    const handleStayLoggedIn = () => {
        setShowWarning(false);
        setCountdown(120);
        clearInterval(countdownRef.current);
    };

    useEffect(() => {
        return () => clearInterval(countdownRef.current);
    }, []);

    useIdleTimer({
        onWarning: startCountdown,
        onLogout: () => { setShowWarning(false); clearInterval(countdownRef.current); },
    });

    if (!showWarning) return null;

    const mins = Math.floor(countdown / 60);
    const secs = countdown % 60;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm">
        <div className="w-full max-w-sm overflow-hidden bg-white border shadow-xl dark:bg-ink-900 rounded-2xl border-ink-100 dark:border-ink-800">
            <div className="h-1 bg-gradient-to-r from-yellow-400 to-orange-500" />
            <div className="p-6 text-center">
            <div className="flex items-center justify-center mx-auto mb-4 text-3xl w-14 h-14 rounded-2xl bg-yellow-50 dark:bg-yellow-950/30">
                ⏱️
            </div>
            <h3 className="mb-2 text-lg font-bold text-ink-900 dark:text-white">
                Still there?
            </h3>
            <p className="mb-4 text-sm text-ink-500 dark:text-ink-400">
                You'll be logged out due to inactivity in
            </p>
            <div className="mb-6 text-3xl font-bold text-orange-500">
                {mins}:{secs.toString().padStart(2, '0')}
            </div>
            <button onClick={handleStayLoggedIn}
                className="w-full py-3 text-sm font-semibold text-white transition-all rounded-xl bg-verde-600 hover:bg-verde-700">
                Stay Logged In
            </button>
            </div>
        </div>
        </div>
    );
    };

export default IdleWarningModal;