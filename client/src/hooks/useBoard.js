import { useContext, useCallback } from 'react';
import { BoardContext } from '../context/BoardContext';
import { getBoard, updateBoard as updateBoardApi } from '../api/boardsApi';
import {
  createList as createListApi,
  updateList as updateListApi,
  deleteList as deleteListApi,
  reorderLists as reorderListsApi,
} from '../api/listsApi';

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
    // Add empty cards array for frontend rendering
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
    // Optimistic: update local state immediately
    dispatch({ type: 'REORDER_LISTS', payload: reorderedLists });

    // Send new positions to server
    const listPositions = reorderedLists.map((list, index) => ({
      listId: list._id,
      position: index,
    }));
    await reorderListsApi(boardId, listPositions);
  }, [dispatch]);

  return {
    board,
    lists,
    isLoading,
    fetchBoard,
    updateBoardTitle,
    addList,
    updateList,
    removeList,
    reorderLists: reorderListsAction,
  };
}

export default useBoard;
