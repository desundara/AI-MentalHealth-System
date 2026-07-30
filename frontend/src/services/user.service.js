import API from './api';

export const getProfile       = ()     => API.get('/user/profile');
export const updateProfile    = (data) => API.patch('/user/profile', data);
export const changePassword   = (data) => API.patch('/user/change-password', data);
