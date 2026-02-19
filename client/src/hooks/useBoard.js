import { useContext, useCallback } from 'react';
import { BoardContext } from '../context/BoardContext';
import { getBoard, updateBoard as updateBoardApi } from '../api/boardsApi';
import {
  createList as createListApi,
  updateList as updateListApi,
  deleteList as deleteListApi,
  reorderLists as reorderListsApi,
} from '../api/listsApi';
import {
  createCard as createCardApi,
  getCard as getCardApi,
  updateCard as updateCardApi,
  deleteCard as deleteCardApi,
  reorderCards as reorderCardsApi,
  moveCard as moveCardApi,
  addCardMember as addCardMemberApi,
  removeCardMember as removeCardMemberApi,
  addChecklist as addChecklistApi,
  updateChecklistItem as updateChecklistItemApi,
  deleteChecklist as deleteChecklistApi,
  addComment as addCommentApi,
  addAttachment as addAttachmentApi,
  deleteAttachment as deleteAttachmentApi,
} from '../api/cardsApi';

function useBoard() {
  const context = useContext(BoardContext);

  if (!context) {
    throw new Error('useBoard must be used within a BoardProvider');
  }

  const { board, lists, isLoading, dispatch } = context;

  const fetchBoard = useCallback(async (boardId) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const data = await getBoard(boardId);
      dispatch({ type: 'SET_BOARD', payload: data });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  }, [dispatch]);

  const updateBoardTitle = useCallback(async (boardId, title) => {
    dispatch({ type: 'UPDATE_BOARD', payload: { title } });
    await updateBoardApi(boardId, { title });
  }, [dispatch]);

  const addList = useCallback(async (boardId, title) => {
    const newList = await createListApi(boardId, title);
    dispatch({ type: 'ADD_LIST', payload: { ...newList, cards: [] } });
    return newList;
  }, [dispatch]);

  const updateList = useCallback(async (boardId, listId, title) => {
    dispatch({ type: 'UPDATE_LIST', payload: { _id: listId, title } });
    await updateListApi(boardId, listId, title);
  }, [dispatch]);

  const removeList = useCallback(async (boardId, listId) => {
    dispatch({ type: 'DELETE_LIST', payload: listId });
    await deleteListApi(boardId, listId);
  }, [dispatch]);

  const reorderListsAction = useCallback(async (boardId, reorderedLists) => {
    dispatch({ type: 'REORDER_LISTS', payload: reorderedLists });
    const listPositions = reorderedLists.map((list, index) => ({
      listId: list._id,
      position: index,
    }));
    await reorderListsApi(boardId, listPositions);
  }, [dispatch]);

  const addCard = useCallback(async (boardId, listId, title) => {
    const newCard = await createCardApi(boardId, { title, listId });
    dispatch({ type: 'ADD_CARD', payload: { listId, card: newCard } });
    return newCard;
  }, [dispatch]);

  const updateCard = useCallback(async (boardId, cardId, updates) => {
    dispatch({ type: 'UPDATE_CARD', payload: { _id: cardId, ...updates } });
    const updated = await updateCardApi(boardId, cardId, updates);
    dispatch({ type: 'UPDATE_CARD', payload: updated });
    return updated;
  }, [dispatch]);

  const fetchCard = useCallback(async (boardId, cardId) => {
    const card = await getCardApi(boardId, cardId);
    dispatch({ type: 'UPDATE_CARD', payload: card });
    return card;
  }, [dispatch]);

  const removeCard = useCallback(async (boardId, listId, cardId) => {
    dispatch({ type: 'DELETE_CARD', payload: { listId, cardId } });
    await deleteCardApi(boardId, cardId);
  }, [dispatch]);

  const reorderCardsAction = useCallback(async (boardId, listId, reorderedCards) => {
    dispatch({ type: 'REORDER_CARDS', payload: { listId, cards: reorderedCards } });
    const cardPositions = reorderedCards.map((card, index) => ({
      cardId: card._id,
      position: index,
    }));
    await reorderCardsApi(boardId, { listId, cards: cardPositions });
  }, [dispatch]);

  const moveCardAction = useCallback(async (
    boardId, sourceListId, destListId, sourceCards, destCards, cardId, newPosition,
  ) => {
    dispatch({
      type: 'MOVE_CARD',
      payload: { sourceListId, destListId, sourceCards, destCards },
    });
    await moveCardApi(boardId, {
      cardId,
      sourceListId,
      destinationListId: destListId,
      newPosition,
    });
  }, [dispatch]);

  const addMemberToCard = useCallback(async (boardId, cardId, userId) => {
    const updated = await addCardMemberApi(boardId, cardId, userId);
    dispatch({ type: 'UPDATE_CARD', payload: updated });
    return updated;
  }, [dispatch]);

  const removeMemberFromCard = useCallback(async (boardId, cardId, userId) => {
    const updated = await removeCardMemberApi(boardId, cardId, userId);
    dispatch({ type: 'UPDATE_CARD', payload: updated });
    return updated;
  }, [dispatch]);

  const addChecklistToCard = useCallback(async (boardId, cardId, title) => {
    const updated = await addChecklistApi(boardId, cardId, title);
    dispatch({ type: 'UPDATE_CARD', payload: updated });
    return updated;
  }, [dispatch]);

  const updateChecklistItemOnCard = useCallback(async (
    boardId, cardId, checklistId, itemData,
  ) => {
    const updated = await updateChecklistItemApi(boardId, cardId, checklistId, itemData);
    dispatch({ type: 'UPDATE_CARD', payload: updated });
    return updated;
  }, [dispatch]);

  const deleteChecklistFromCard = useCallback(async (boardId, cardId, checklistId) => {
    const updated = await deleteChecklistApi(boardId, cardId, checklistId);
    dispatch({ type: 'UPDATE_CARD', payload: updated });
    return updated;
  }, [dispatch]);

  const addCommentToCard = useCallback(async (boardId, cardId, text) => {
    const activity = await addCommentApi(boardId, cardId, text);
    return activity;
  }, []);

  const addAttachmentToCard = useCallback(async (boardId, cardId, file) => {
    const updated = await addAttachmentApi(boardId, cardId, file);
    dispatch({ type: 'UPDATE_CARD', payload: updated });
    return updated;
  }, [dispatch]);

  const deleteAttachmentFromCard = useCallback(async (
    boardId, cardId, attachmentId,
  ) => {
    const updated = await deleteAttachmentApi(boardId, cardId, attachmentId);
    dispatch({ type: 'UPDATE_CARD', payload: updated });
    return updated;
  }, [dispatch]);

  return {
    board,
    lists,
    isLoading,
    dispatch,
    fetchBoard,
    updateBoardTitle,
    addList,
    updateList,
    removeList,
    reorderLists: reorderListsAction,
    addCard,
    updateCard,
    fetchCard,
    removeCard,
    reorderCards: reorderCardsAction,
    moveCard: moveCardAction,
    addMemberToCard,
    removeMemberFromCard,
    addChecklistToCard,
    updateChecklistItemOnCard,
    deleteChecklistFromCard,
    addCommentToCard,
    addAttachmentToCard,
    deleteAttachmentFromCard,
  };
}

export default useBoard;
