import { LOCALSTORAGE_TOKEN_KEY } from '../config/constants';
import authService from '../services/api/authService';

export const login = async ({ userNameOrEmail, password }) => {
  const res = await authService.login({ userNameOrEmail, password });
  localStorage.setItem("token", res.token);
  localStorage.setItem('user', JSON.stringify({ id: res.id, displayName: res.userName }));
  return res;
};

export const signup = async ({ userName, email, password }) => {
  const res = await authService.register({ userName, email, password });
  // Assuming signup doesn't auto-login; if it does, add token/user storage here
  return res;
};

export const logout = async () => {
  await authService.logout();
  localStorage.removeItem("token");
  localStorage.removeItem('user');
};

export const isAuthenticated = () => !!localStorage.getItem(LOCALSTORAGE_TOKEN_KEY);

export const getCurrentUser = () => JSON.parse(localStorage.getItem('user')) || null;

export const getToken = () => localStorage.getItem(LOCALSTORAGE_TOKEN_KEY);