// AuthContext.jsx
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

    // Wrapper for setCurrentUser that also updates localStorage
    const setCurrentUser = (userData) => {
        if (userData) {
            localStorage.setItem('currentUser', JSON.stringify(userData));
        }
        setCurrentUserState(userData);
    };

    // Function to handle login
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

    // Function to refresh the user session
    const refreshUserSession = async () => {
        // Don't attempt to refresh if no token is present
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
            // Silently handle session refresh errors
            if (error.response?.status === 401) {
                // Don't log or show errors for expected auth failures
                localStorage.removeItem('currentUser');
                localStorage.removeItem('token');
                setCurrentUser(null);
            }
            return false;
        }
    };

    // Add a periodic session refresh
    useEffect(() => {
        if (!currentUser) return;
        
        // Refresh every 30 minutes while the user is active
        const refreshInterval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                refreshUserSession();
            }
        }, 30 * 60 * 1000); // 30 minutes
        
        return () => clearInterval(refreshInterval);
    }, [currentUser]);

    // Add a visibility change listener to refresh the session when user returns to the app
    useEffect(() => {
        const handleVisibilityChange = async () => {
            if (document.visibilityState === 'visible' && currentUser) {
                await refreshUserSession();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [currentUser]);

    // Initial auth check
    useEffect(() => {
        const checkAuth = async () => {
            const storedUser = localStorage.getItem('currentUser');
            const token = localStorage.getItem('token');
            
            if (storedUser && token) {
                setCurrentUser(JSON.parse(storedUser));
                await refreshUserSession(); // Try to refresh when app loads
            } else {
                // Clear any incomplete auth state
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
