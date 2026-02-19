import api from './axiosInstance';

export const getBoards = async () => {
  const { data } = await api.get('/boards');
  return data.data;
};

export const createBoard = async ({ title, background }) => {
  const { data } = await api.post('/boards', { title, background });
  return data.data;
};

export const getBoard = async (boardId) => {
  const { data } = await api.get(`/boards/${boardId}`);
  return data.data;
};

export const updateBoard = async (boardId, updates) => {
  const { data } = await api.put(`/boards/${boardId}`, updates);
  return data.data;
};

export const deleteBoard = async (boardId) => {
  const { data } = await api.delete(`/boards/${boardId}`);
  return data.data;
};

export const toggleStar = async (boardId) => {
  const { data } = await api.put(`/boards/${boardId}/star`);
  return data.data;
};

export const addMember = async (boardId, email) => {
  const { data } = await api.post(`/boards/${boardId}/members`, { email });
  return data.data;
};

export const removeMember = async (boardId, userId) => {
  const { data } = await api.delete(`/boards/${boardId}/members/${userId}`);
  return data.data;
};
