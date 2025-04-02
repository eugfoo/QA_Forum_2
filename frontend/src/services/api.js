import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    withCredentials: true,
});

api.interceptors.response.use(
    res => res,
    err => {
        if (err.response?.status === 401) {
            toast.error(err.response.data.error || 'Please log in to continue.');
            window.location.href = '/login';
        }
        return Promise.reject(err);
    }
);

// User-related API functions
export const loginUser = (credentials) => api.post('/users/login', credentials);
export const registerUser = (userData) => api.post('/users/register', userData);
export const logout = () => api.post('/users/logout');
export const updateUser = (userId, data) => api.put(`/users/${userId}`, data);
export const deleteUser = (userId) => api.delete(`/users/${userId}`);
export const fetchCurrentUser = () => api.get('/users/me', { withCredentials: true });

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
export const deleteAnswer = (answerId) => api.delete(`/answers/${answerId}`);

export default api;
