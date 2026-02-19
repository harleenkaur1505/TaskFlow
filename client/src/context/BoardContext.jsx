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
