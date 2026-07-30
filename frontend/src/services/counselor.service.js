import API from './api';

export const getDashboardStats = ()       => API.get('/counselor/dashboard');
export const getAlerts         = ()       => API.get('/counselor/alerts');
export const resolveAlert = (id, note) =>
    API.patch(`/counselor/alerts/${id}/resolve`, {
        note,
    });
export const getCounselorUsers = ()       => API.get('/counselor/users');
export const getUserLogs       = (id)     => API.get(`/counselor/users/${id}/logs`);