import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:4000/api' });

export const fetchKPIs         = (start, end)  => api.get('/kpis', { params: { start, end } }).then(r => r.data);
export const fetchStatusChart  = (start, end)  => api.get('/status-chart', { params: { start, end } }).then(r => r.data);
export const fetchPipelineChart = ()           => api.get('/pipeline-chart').then(r => r.data);
export const fetchFailureChart = (start, end)  => api.get('/failure-chart', { params: { start, end } }).then(r => r.data);
export const fetchUsers        = (start)       => api.get('/users', { params: { start } }).then(r => r.data);
export const fetchUserList     = ()            => api.get('/users/list').then(r => r.data);
export const fetchUserDetail   = (id)          => api.get(`/users/${id}`).then(r => r.data);
