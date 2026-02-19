import api from './axiosInstance';

export const createCard = async (boardId, { title, listId }) => {
  const { data } = await api.post(`/boards/${boardId}/cards`, { title, listId });
  return data.data;
};

export const getCard = async (boardId, cardId) => {
  const { data } = await api.get(`/boards/${boardId}/cards/${cardId}`);
  return data.data;
};

export const updateCard = async (boardId, cardId, updates) => {
  const { data } = await api.put(`/boards/${boardId}/cards/${cardId}`, updates);
  return data.data;
};

export const deleteCard = async (boardId, cardId) => {
  const { data } = await api.delete(`/boards/${boardId}/cards/${cardId}`);
  return data.data;
};

export const moveCard = async (boardId, moveData) => {
  const { data } = await api.put(`/boards/${boardId}/cards/move`, moveData);
  return data.data;
};

export const reorderCards = async (boardId, { listId, cards }) => {
  const { data } = await api.put(`/boards/${boardId}/cards/reorder`, { listId, cards });
  return data.data;
};

export const addCardMember = async (boardId, cardId, userId) => {
  const { data } = await api.post(`/boards/${boardId}/cards/${cardId}/members`, { userId });
  return data.data;
};

export const removeCardMember = async (boardId, cardId, userId) => {
  const { data } = await api.delete(`/boards/${boardId}/cards/${cardId}/members/${userId}`);
  return data.data;
};

export const addChecklist = async (boardId, cardId, title) => {
  const { data } = await api.post(`/boards/${boardId}/cards/${cardId}/checklists`, { title });
  return data.data;
};

export const updateChecklistItem = async (boardId, cardId, checklistId, itemData) => {
  const { data } = await api.put(
    `/boards/${boardId}/cards/${cardId}/checklists/${checklistId}/items`,
    itemData,
  );
  return data.data;
};

export const deleteChecklist = async (boardId, cardId, checklistId) => {
  const { data } = await api.delete(
    `/boards/${boardId}/cards/${cardId}/checklists/${checklistId}`,
  );
  return data.data;
};

export const addComment = async (boardId, cardId, text) => {
  const { data } = await api.post(`/boards/${boardId}/cards/${cardId}/comments`, { text });
  return data.data;
};

export const addAttachment = async (boardId, cardId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post(
    `/boards/${boardId}/cards/${cardId}/attachments`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return data.data;
};

export const deleteAttachment = async (boardId, cardId, attachmentId) => {
  const { data } = await api.delete(
    `/boards/${boardId}/cards/${cardId}/attachments/${attachmentId}`,
  );
  return data.data;
};

export const getCardActivity = async (boardId, cardId) => {
  const { data } = await api.get(`/boards/${boardId}/cards/${cardId}/activity`);
  return data.data;
};
