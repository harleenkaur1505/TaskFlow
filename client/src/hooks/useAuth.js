import { useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  login as loginApi,
  register as registerApi,
  logout as logoutApi,
} from '../api/authApi';
import { setAccessToken } from '../api/axiosInstance';

function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const { user, accessToken, isLoading, isAuthenticated, dispatch } = context;

  const login = useCallback(async ({ email, password }) => {
    const data = await loginApi({ email, password });
    setAccessToken(data.accessToken);
    dispatch({ type: 'LOGIN_SUCCESS', payload: data });
    return data;
  }, [dispatch]);

  const register = useCallback(async ({ name, email, password }) => {
    const data = await registerApi({ name, email, password });
    setAccessToken(data.accessToken);
    dispatch({ type: 'LOGIN_SUCCESS', payload: data });
    return data;
  }, [dispatch]);

  const logout = useCallback(async () => {
    await logoutApi();
    setAccessToken(null);
    dispatch({ type: 'LOGOUT' });
  }, [dispatch]);

  return { user, accessToken, isLoading, isAuthenticated, login, register, logout };
}

export default useAuth;
