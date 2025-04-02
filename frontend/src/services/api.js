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

export const registerUser = (userData) => api.post('/users/register', userData);
export const loginUser = (credentials) => api.post('/users/login', credentials);
export const fetchCurrentUser = () => api.get('/users/me', { withCredentials: true });

// Question-related calls
export const fetchQuestions = (filter = 'latest', view = 'general') =>
    api.get(`/questions?filter=${filter}&view=${view}`);
export const createQuestion = (questionData) => api.post('/questions', questionData);

// Question actions
export const editQuestion = (questionId, data) => api.put(`/questions/${questionId}`, data);
export const lockQuestion = (questionId) => api.put(`/questions/${questionId}/lock`);
export const unlockQuestion = (questionId) => api.put(`/questions/${questionId}/unlock`);
export const deleteQuestion = (questionId) => api.delete(`/questions/${questionId}`);

export default api;
