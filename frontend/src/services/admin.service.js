import API from './api';

export const getCounselors    = ()         => API.get('/admin/counselors');
export const createCounselor  = (data)     => API.post('/admin/counselors', data);
export const toggleCounselor  = (id)       => API.patch(`/admin/counselors/${id}/toggle`);
export const getUsers         = ()         => API.get('/admin/users');
