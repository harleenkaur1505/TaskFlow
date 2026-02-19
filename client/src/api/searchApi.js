import api from './axiosInstance';

export const searchCards = async (query) => {
  const { data } = await api.get(`/search?q=${encodeURIComponent(query)}`);
  return data.data;
};
