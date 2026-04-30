import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://your-railway-url.up.railway.app/api',
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