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
