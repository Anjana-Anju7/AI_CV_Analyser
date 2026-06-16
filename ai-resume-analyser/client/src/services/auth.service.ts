import api from './api';

export const authService = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }).then((r) => r.data),

  register: (email: string, password: string, name?: string) =>
    api.post('/auth/register', { email, password, name }).then((r) => r.data),

  logout: () => api.post('/auth/logout').then((r) => r.data),

  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }).then((r) => r.data),
};
