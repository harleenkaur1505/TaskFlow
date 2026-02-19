import { useContext, useEffect } from 'react';
import { SocketContext } from '../context/SocketContext';
import { BoardContext } from '../context/BoardContext';

/**
 * Hook that joins a board room and subscribes to real-time events.
 * Dispatches incoming events to BoardContext so the UI updates live.
 * Call this inside a component that has both SocketContext and BoardContext.
 */
function useSocket(boardId) {
  const socket = useContext(SocketContext);
  const boardCtx = useContext(BoardContext);
  // Extract dispatch — it's stable (from useReducer) and won't cause re-subscriptions
  const dispatch = boardCtx?.dispatch;

  useEffect(() => {
    if (!socket || !boardId || !dispatch) return;

    // Join the board room
    socket.emit('board:join', { boardId });

    // --- Board events ---
    const onBoardUpdated = ({ board }) => {
      dispatch({ type: 'UPDATE_BOARD', payload: board });
    };

    // --- List events ---
    const onListCreated = ({ list }) => {
      dispatch({ type: 'ADD_LIST', payload: list });
    };

    const onListUpdated = ({ list }) => {
      dispatch({ type: 'UPDATE_LIST', payload: list });
    };

    const onListDeleted = ({ listId }) => {
      dispatch({ type: 'DELETE_LIST', payload: listId });
    };

    const onListReordered = ({ lists: reorderedPositions }) => {
      dispatch({
        type: 'SOCKET_REORDER_LISTS',
        payload: reorderedPositions,
      });
    };

    // --- Card events ---
    const onCardCreated = ({ card, listId }) => {
      dispatch({ type: 'ADD_CARD', payload: { listId, card } });
    };

    const onCardUpdated = ({ card }) => {
      dispatch({ type: 'UPDATE_CARD', payload: card });
    };

    const onCardDeleted = ({ cardId, listId }) => {
      dispatch({ type: 'DELETE_CARD', payload: { listId, cardId } });
    };

    const onCardMoved = ({ cardId, sourceListId, destListId, newPosition }) => {
      dispatch({
        type: 'SOCKET_MOVE_CARD',
        payload: { cardId, sourceListId, destListId, newPosition },
      });
    };

    const onCardReordered = ({ listId, cards: reorderedPositions }) => {
      dispatch({
        type: 'SOCKET_REORDER_CARDS',
        payload: { listId, cards: reorderedPositions },
      });
    };

    // --- Member events ---
    const onMemberAdded = ({ user }) => {
      dispatch({ type: 'ADD_BOARD_MEMBER', payload: user });
    };

    const onMemberRemoved = ({ userId }) => {
      dispatch({ type: 'REMOVE_BOARD_MEMBER', payload: userId });
    };

    // --- Activity events (for live activity feed) ---
    const onActivityCreated = ({ activity }) => {
      dispatch({ type: 'ADD_ACTIVITY', payload: activity });
    };

    // Subscribe to all events
    socket.on('board:updated', onBoardUpdated);
    socket.on('list:created', onListCreated);
    socket.on('list:updated', onListUpdated);
    socket.on('list:deleted', onListDeleted);
    socket.on('list:reordered', onListReordered);
    socket.on('card:created', onCardCreated);
    socket.on('card:updated', onCardUpdated);
    socket.on('card:deleted', onCardDeleted);
    socket.on('card:moved', onCardMoved);
    socket.on('card:reordered', onCardReordered);
    socket.on('member:added', onMemberAdded);
    socket.on('member:removed', onMemberRemoved);
    socket.on('activity:created', onActivityCreated);

    // Cleanup: leave room and unsubscribe
    return () => {
      socket.emit('board:leave', { boardId });
      socket.off('board:updated', onBoardUpdated);
      socket.off('list:created', onListCreated);
      socket.off('list:updated', onListUpdated);
      socket.off('list:deleted', onListDeleted);
      socket.off('list:reordered', onListReordered);
      socket.off('card:created', onCardCreated);
      socket.off('card:updated', onCardUpdated);
      socket.off('card:deleted', onCardDeleted);
      socket.off('card:moved', onCardMoved);
      socket.off('card:reordered', onCardReordered);
      socket.off('member:added', onMemberAdded);
      socket.off('member:removed', onMemberRemoved);
      socket.off('activity:created', onActivityCreated);
    };
  }, [socket, boardId, dispatch]);
}

export default useSocket;
