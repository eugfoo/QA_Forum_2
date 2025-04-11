import React, { createContext, useState, useEffect } from 'react';
import { fetchCurrentUser } from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUserState] = useState(() => {
        const storedUser = localStorage.getItem('currentUser');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [loading, setLoading] = useState(true);

    const setCurrentUser = (userData) => {
        if (userData) {
            localStorage.setItem('currentUser', JSON.stringify(userData));
        }
        setCurrentUserState(userData);
    };

    const login = (userData, token) => {
        localStorage.setItem('token', token);
        setCurrentUser(userData);
    };

    const logout = async () => {
        try {
            setIsLoggingOut(true);
            localStorage.removeItem('currentUser');
            localStorage.removeItem('token');
            setCurrentUser(null);
            return true;
        } catch (error) {
            return false;
        } finally {
            setIsLoggingOut(false);
        }
    };

    const refreshUserSession = async () => {
        if (!localStorage.getItem('token')) return false;
        
        try {
            const response = await fetchCurrentUser();
            if (response.data && response.data.user) {
                setCurrentUser(response.data.user);
                localStorage.setItem('currentUser', JSON.stringify(response.data.user));
                return true;
            }
            return false;
        } catch (error) {
            if (error.response?.status === 401) {
                localStorage.removeItem('currentUser');
                localStorage.removeItem('token');
                setCurrentUser(null);
            }
            return false;
        }
    };

    useEffect(() => {
        if (!currentUser) return;
        
        const refreshInterval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                refreshUserSession();
            }
        }, 30 * 60 * 1000);
        
        return () => clearInterval(refreshInterval);
    }, [currentUser]);

    useEffect(() => {
        const handleVisibilityChange = async () => {
            if (document.visibilityState === 'visible' && currentUser) {
                await refreshUserSession();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [currentUser]);

    useEffect(() => {
        const checkAuth = async () => {
            const storedUser = localStorage.getItem('currentUser');
            const token = localStorage.getItem('token');
            
            if (storedUser && token) {
                setCurrentUser(JSON.parse(storedUser));
                await refreshUserSession(); 
            } else {
                localStorage.removeItem('currentUser');
                localStorage.removeItem('token');
                setCurrentUser(null);
            }
            
            setLoading(false);
        };
        
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ 
            currentUser, 
            setCurrentUser, 
            login,
            logout, 
            isLoggingOut, 
            refreshUserSession
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
