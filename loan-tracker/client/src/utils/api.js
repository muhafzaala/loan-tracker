import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const userToken = localStorage.getItem('loanTrackerToken');
  if (userToken) {
    config.headers.Authorization = `Bearer ${userToken}`;
  }
  return config;
});

export default apiClient;