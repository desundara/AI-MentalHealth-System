import API from './api';

export const createMoodLog  = (data) => API.post('/mood', data);
export const getMyLogs      = ()     => API.get('/mood');
export const getTodayLog    = ()     => API.get('/mood/today');
export const getMoodStats   = ()     => API.get('/mood/stats');
