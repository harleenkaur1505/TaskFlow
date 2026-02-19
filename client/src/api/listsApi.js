import api from './axiosInstance';

export const createList = async (boardId, title) => {
  const { data } = await api.post(`/boards/${boardId}/lists`, { title });
  return data.data;
};

export const updateList = async (boardId, listId, title) => {
  const { data } = await api.put(`/boards/${boardId}/lists/${listId}`, { title });
  return data.data;
};

export const deleteList = async (boardId, listId) => {
  const { data } = await api.delete(`/boards/${boardId}/lists/${listId}`);
  return data.data;
};

export const reorderLists = async (boardId, lists) => {
  const { data } = await api.put(`/boards/${boardId}/lists/reorder`, { lists });
  return data.data;
};
