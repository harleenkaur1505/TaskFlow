import { createContext, useReducer, useEffect, useCallback } from 'react';
import { getMe, refreshToken as refreshTokenApi } from '../api/authApi';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  accessToken: null,
  isLoading: true,
  isAuthenticated: false,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'SET_TOKEN':
      return {
        ...state,
        accessToken: action.payload,
      };
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
}

function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const silentRefresh = useCallback(async () => {
    try {
      const { accessToken } = await refreshTokenApi();
      dispatch({ type: 'SET_TOKEN', payload: accessToken });

      const { user } = await getMe(accessToken);
      dispatch({ type: 'SET_USER', payload: user });
    } catch {
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  useEffect(() => {
    silentRefresh();
  }, [silentRefresh]);

  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };
