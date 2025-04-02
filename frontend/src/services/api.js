import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    // Remove withCredentials as we'll use Authorization header instead
});

// Add token to requests if available
api.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// Debounce mechanism for 401 errors
let lastAuthErrorTime = 0;
const AUTH_ERROR_COOLDOWN = 5000; // 5 seconds cooldown between auth error toasts

api.interceptors.response.use(
    res => res,
    err => {
        // Don't show error toast or redirect for session refresh requests
        const isSessionRefresh = err.config?.url?.includes('/users/me');
        const currentTime = Date.now();
        
        if (err.response?.status === 401 && !isSessionRefresh) {
            // Only show toast and redirect if we haven't done so recently
            if (currentTime - lastAuthErrorTime > AUTH_ERROR_COOLDOWN) {
                lastAuthErrorTime = currentTime;
                toast.error(err.response.data.error || 'Please log in to continue.');
                
                // Clear token on auth error
                localStorage.removeItem('token');
                localStorage.removeItem('currentUser');
                
                // Don't redirect if we're already on the login page
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(err);
    }
);

// User-related API functions
export const loginUser = (credentials) => api.post('/users/login', credentials);
export const registerUser = (userData) => api.post('/users/register', userData);
export const logout = () => {
    // JWT logout is handled client-side by removing the token
    localStorage.removeItem('token');
    return api.post('/users/logout');
};
export const updateUser = (userId, data) => api.put(`/users/${userId}`, data);
export const deleteUser = (userId) => api.delete(`/users/${userId}`);
export const fetchCurrentUser = () => api.get('/users/me');

// Question-related API functions
export const getQuestions = (filter = 'all', view = 'list') => api.get(`/questions?filter=${filter}&view=${view}`);
export const getQuestion = (questionId) => api.get(`/questions/${questionId}`);
export const createQuestion = (data) => api.post('/questions', data);
export const editQuestion = (questionId, data) => api.put(`/questions/${questionId}`, data);
export const deleteQuestion = (questionId) => api.delete(`/questions/${questionId}`);
export const voteQuestion = (questionId, voteType) => api.post(`/questions/${questionId}/vote`, { voteType });
export const lockQuestion = (questionId) => api.post(`/questions/${questionId}/lock`);
export const unlockQuestion = (questionId) => api.post(`/questions/${questionId}/unlock`);
// Question-related calls
export const fetchQuestions = (filter = 'latest', view = 'general') =>
    api.get(`/questions?filter=${filter}&view=${view}`);

// Answer-related API functions
export const getAnswers = (questionId) => api.get(`/questions/${questionId}/answers`);
export const createAnswer = (questionId, data) => api.post(`/answers/${questionId}`, data);
export const voteAnswer = (answerId, voteType) => api.post(`/answers/${answerId}/vote`, { voteType });
export const deleteAnswer = (answerId) => api.get(`/answers/${answerId}/delete`);

export default api;
