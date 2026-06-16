import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const { accessToken } = useAuth.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let refreshing: Promise<string> | null = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      if (!refreshing) {
        refreshing = (async () => {
          const { refreshToken, setTokens } = useAuth.getState();
          if (!refreshToken) throw new Error('No refresh token');
          const res = await axios.post('/api/auth/refresh', { refreshToken });
          const newAccess: string = res.data.accessToken;
          const newRefresh: string = res.data.refreshToken;
          setTokens(newAccess, newRefresh);
          return newAccess;
        })().finally(() => {
          refreshing = null;
        });
      }
      const newToken = await refreshing;
      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    }
    return Promise.reject(error);
  }
);

export default api;
