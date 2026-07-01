import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const IDLE_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const WARNING_BEFORE = 2 * 60 * 1000; // warn 2 min before

const useIdleTimer = ({ onWarning, onLogout }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const idleTimer = useRef(null);
    const warningTimer = useRef(null);

    const resetTimers = useCallback(() => {
        clearTimeout(idleTimer.current);
        clearTimeout(warningTimer.current);

        warningTimer.current = setTimeout(() => {
        onWarning && onWarning();
        }, IDLE_TIMEOUT - WARNING_BEFORE);

        idleTimer.current = setTimeout(() => {
        logout();
        navigate('/login');
        onLogout && onLogout();
        }, IDLE_TIMEOUT);
    }, [logout, navigate, onWarning, onLogout]);

    useEffect(() => {
        const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
        events.forEach(e => window.addEventListener(e, resetTimers));
        resetTimers();

        return () => {
        events.forEach(e => window.removeEventListener(e, resetTimers));
        clearTimeout(idleTimer.current);
        clearTimeout(warningTimer.current);
        };
    }, [resetTimers]);
};

export default useIdleTimer;