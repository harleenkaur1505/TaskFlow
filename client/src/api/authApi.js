import api from './axiosInstance';

export const register = async ({ name, email, password }) => {
  const { data } = await api.post('/auth/register', { name, email, password });
  return data.data;
};

export const login = async ({ email, password }) => {
  const { data } = await api.post('/auth/login', { email, password });
  return data.data;
};

export const refreshToken = async () => {
  const { data } = await api.post('/auth/refresh');
  return data.data;
};

export const logout = async () => {
  const { data } = await api.post('/auth/logout');
  return data.data;
};

export const getMe = async (token) => {
  const config = token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : {};
  const { data } = await api.get('/auth/me', config);
  return { user: data.data };
};

export const updateProfile = async (formData) => {
  const { data } = await api.put('/auth/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
};
