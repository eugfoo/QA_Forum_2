import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    timeout: 10000, // 10 second timeout
});

// Add token to requests if available
api.interceptors.request.use(
    config => {
        console.log(`Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${config.url}`);
        
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
            console.log(`Added token to request: ${config.url}`);
        } else {
            console.log(`No token available for request: ${config.url}`);
        }
        return config;
    },
    error => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Debounce mechanism for 401 errors
let lastAuthErrorTime = 0;
const AUTH_ERROR_COOLDOWN = 5000; // 5 seconds cooldown between auth error toasts

// Add retry mechanism for network errors
let retryCount = new Map();

api.interceptors.response.use(
    res => res,
    async err => {
        const config = err.config;
        
        // Network error retry logic
        if (err.code === 'ERR_NETWORK' && (!config._retryCount || config._retryCount < 2)) {
            // Initialize retry count for this request if needed
            config._retryCount = config._retryCount || 0;
            config._retryCount++;
            
            const delayMs = config._retryCount * 1000; // Exponential backoff
            
            console.log(`Network error for ${config.url}. Retry ${config._retryCount}/3 after ${delayMs}ms`);
            
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, delayMs));
            
            // Retry the request
            return api(config);
        }
        
        // Handle auth errors
        if (err.response?.status === 401) {
            // Don't show error toast or redirect for session refresh requests
            const isSessionRefresh = config?.url?.includes('/users/me');
            const currentTime = Date.now();
            
            if (!isSessionRefresh && (currentTime - lastAuthErrorTime > AUTH_ERROR_COOLDOWN)) {
                lastAuthErrorTime = currentTime;
                toast.error(err.response.data?.error || 'Please log in to continue.');
                
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
export const updateUserProfile = (formData) => api.put('/users/profile', formData, {
    headers: {
        'Content-Type': 'multipart/form-data'
    }
});
export const updateSettings = (passwordData) => api.put('/users/settings', passwordData);

// Notification-related API functions
export const getNotifications = () => api.get('/users/notifications');
export const markNotificationsAsRead = (notificationIds = []) => api.put('/users/notifications/read', { notificationIds });

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
export const fetchQuestions = (filter = 'latest', view = 'general', search = '') => {
    console.log(`Attempting to fetch questions: filter=${filter}, view=${view}, search=${search}`);
    let url = `/questions?filter=${filter}&view=${view}`;
    if (search) {
        url += `&search=${encodeURIComponent(search)}`;
    }
    
    return api.get(url)
        .then(response => {
            console.log(`Successfully fetched ${response.data.questions?.length || 0} questions`);
            return response;
        })
        .catch(error => {
            console.error(`Error fetching questions:`, error.message);
            if (error.code === 'ERR_NETWORK') {
                console.error('Network error details:', {
                    url: `${api.defaults.baseURL}/questions?filter=${filter}&view=${view}`,
                    method: 'GET'
                });
            }
            throw error;
        });
};

// Answer-related API functions
export const getAnswers = (questionId) => api.get(`/questions/${questionId}/answers`);
export const createAnswer = (questionId, data) => api.post(`/answers/${questionId}`, data);
export const editAnswer = (answerId, data) => api.post(`/answers/${answerId}/update`, data);
export const voteAnswer = (answerId, voteType) => api.post(`/answers/${answerId}/vote`, { voteType });
export const deleteAnswer = (answerId) => api.get(`/answers/${answerId}/delete`);

// Activity timeline
export const fetchUserActivity = (page = 1) => {
    return api.get(`/users/profile?page=${page}`)
        .then(response => {
            console.log(`Successfully fetched user activity for page ${page}`);
            return response;
        })
        .catch(error => {
            console.error('Error fetching user activity:', error);
            throw error;
        });
};

export default api;
