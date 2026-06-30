import API from './api';

export const getDashboardStats = ()       => API.get('/counselor/dashboard');
export const getAlerts         = ()       => API.get('/counselor/alerts');
export const resolveAlert      = (id)     => API.patch(`/counselor/alerts/${id}/resolve`);
export const getCounselorUsers = ()       => API.get('/counselor/users');
export const getUserLogs       = (id)     => API.get(`/counselor/users/${id}/logs`);