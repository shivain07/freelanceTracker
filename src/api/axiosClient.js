import axios from 'axios';
import { notifyUser } from '../utils/notifications';

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
});


// Automatically add Authorization token to every outgoing request
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// }, (error) => {
//   return Promise.reject(error);
// });


const getErrorMessage = (error) => {
  const { status, data } = error.response || {};
  const serverMessage =
    typeof data?.message === 'string'
      ? data.message
      : typeof data?.error === 'string'
        ? data.error
        : null;

  if (status === 400) {
    return serverMessage || 'Check the information you entered and try again.';
  }
  if (status === 401) {
    return error.config?.skipAuthRedirect
      ? 'Google could not verify this sign-in. Please try signing in again.'
      : 'Your session has expired. Please sign in again.';
  }
  if (status === 403) {
    return serverMessage || 'You do not have permission to perform this action.';
  }
  if (status === 404) {
    return serverMessage || 'The requested page or resource could not be found.';
  }
  if (status === 502) {
    return 'Google sign-in is temporarily unavailable. Please try again shortly.';
  }
  if (status >= 500) {
    return 'Something went wrong on our side. Please try again.';
  }
  if (!error.response) {
    return 'Unable to reach the server. Check your connection and try again.';
  }

  return serverMessage || 'The request could not be completed. Please try again.';
};

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      if (!error.config?.skipAuthRedirect) {
        window.dispatchEvent(new CustomEvent('app:auth-expired'));
      } else {
        notifyUser(getErrorMessage(error));
      }
    } else {
      notifyUser(getErrorMessage(error));
    }

    return Promise.reject(error);
  }
);

export default api;
