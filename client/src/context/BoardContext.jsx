import { createContext, useReducer } from 'react';

const BoardContext = createContext(null);

const initialState = {
  board: null,
  lists: [],
  isLoading: true,
};

function boardReducer(state, action) {
  switch (action.type) {
    case 'SET_BOARD': {
      const { lists, ...board } = action.payload;
      return {
        ...state,
        board,
        lists: lists || [],
        isLoading: false,
      };
    }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'UPDATE_BOARD':
      return { ...state, board: { ...state.board, ...action.payload } };

    case 'ADD_LIST':
      return { ...state, lists: [...state.lists, action.payload] };

    case 'UPDATE_LIST':
      return {
        ...state,
        lists: state.lists.map((list) =>
          list._id === action.payload._id
            ? { ...list, ...action.payload }
            : list,
        ),
      };

    case 'DELETE_LIST':
      return {
        ...state,
        lists: state.lists.filter((list) => list._id !== action.payload),
      };

    case 'REORDER_LISTS':
      return { ...state, lists: action.payload };

    case 'ADD_CARD': {
      const { listId, card } = action.payload;
      return {
        ...state,
        lists: state.lists.map((list) =>
          list._id === listId
            ? { ...list, cards: [...(list.cards || []), card] }
            : list,
        ),
      };
    }

    case 'UPDATE_CARD': {
      const updatedCard = action.payload;
      return {
        ...state,
        lists: state.lists.map((list) => ({
          ...list,
          cards: (list.cards || []).map((card) =>
            card._id === updatedCard._id
              ? { ...card, ...updatedCard }
              : card,
          ),
        })),
      };
    }

    case 'DELETE_CARD': {
      const { listId: delListId, cardId } = action.payload;
      return {
        ...state,
        lists: state.lists.map((list) =>
          list._id === delListId
            ? { ...list, cards: (list.cards || []).filter((c) => c._id !== cardId) }
            : list,
        ),
      };
    }

    case 'REORDER_CARDS': {
      const { listId: reorderListId, cards: reorderedCards } = action.payload;
      return {
        ...state,
        lists: state.lists.map((list) =>
          list._id === reorderListId
            ? { ...list, cards: reorderedCards }
            : list,
        ),
      };
    }

    case 'MOVE_CARD': {
      const { sourceListId, destListId, sourceCards, destCards } = action.payload;
      return {
        ...state,
        lists: state.lists.map((list) => {
          if (list._id === sourceListId) {
            return { ...list, cards: sourceCards };
          }
          if (list._id === destListId) {
            return { ...list, cards: destCards };
          }
          return list;
        }),
      };
    }

    // --- Socket-driven actions (server state wins) ---

    case 'SOCKET_REORDER_LISTS': {
      // payload: [{ _id, position }]
      const posMap = {};
      for (const item of action.payload) {
        posMap[item._id] = item.position;
      }
      const sorted = [...state.lists].sort(
        (a, b) => (posMap[a._id] ?? a.position) - (posMap[b._id] ?? b.position),
      );
      return { ...state, lists: sorted };
    }

    case 'SOCKET_MOVE_CARD': {
      const { cardId: moveCardId, sourceListId: srcId, destListId: dstId, newPosition: newPos } = action.payload;
      let movedCard = null;

      // Remove card from source list
      const listsAfterRemove = state.lists.map((list) => {
        if (list._id === srcId) {
          const filtered = (list.cards || []).filter((c) => {
            if (c._id === moveCardId) {
              movedCard = c;
              return false;
            }
            return true;
          });
          return { ...list, cards: filtered };
        }
        return list;
      });

      if (!movedCard) return state;

      // Insert card into destination list at newPosition
      const listsAfterInsert = listsAfterRemove.map((list) => {
        if (list._id === dstId) {
          const cards = [...(list.cards || [])];
          cards.splice(newPos, 0, movedCard);
          return { ...list, cards };
        }
        return list;
      });

      return { ...state, lists: listsAfterInsert };
    }

    case 'SOCKET_REORDER_CARDS': {
      // payload: { listId, cards: [{ _id, position }] }
      const { listId: reorderSocketListId, cards: posArr } = action.payload;
      const cardPosMap = {};
      for (const item of posArr) {
        cardPosMap[item._id] = item.position;
      }
      return {
        ...state,
        lists: state.lists.map((list) => {
          if (list._id !== reorderSocketListId) return list;
          const sorted = [...(list.cards || [])].sort(
            (a, b) => (cardPosMap[a._id] ?? a.position) - (cardPosMap[b._id] ?? b.position),
          );
          return { ...list, cards: sorted };
        }),
      };
    }

    case 'ADD_BOARD_MEMBER': {
      if (!state.board) return state;
      return {
        ...state,
        board: {
          ...state.board,
          members: [...(state.board.members || []), action.payload],
        },
      };
    }

    case 'REMOVE_BOARD_MEMBER': {
      if (!state.board) return state;
      return {
        ...state,
        board: {
          ...state.board,
          members: (state.board.members || []).filter(
            (m) => (m._id || m) !== action.payload,
          ),
        },
      };
    }

    case 'ADD_ACTIVITY':
      // No-op in board reducer — activity sidebar fetches its own data.
      // This case exists so the dispatch doesn't warn.
      return state;

    default:
      return state;
  }
}

function BoardProvider({ children }) {
  const [state, dispatch] = useReducer(boardReducer, initialState);

  return (
    <BoardContext.Provider value={{ ...state, dispatch }}>
      {children}
    </BoardContext.Provider>
  );
}

export { BoardContext, BoardProvider };
