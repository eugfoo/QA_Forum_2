// AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(() => {
        const storedUser = localStorage.getItem('currentUser');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [loading, setLoading] = useState(true);

    const logout = async () => {
        try {
            setIsLoggingOut(true);
            localStorage.removeItem('currentUser');
            setCurrentUser(null);
            return true;
        } catch (error) {
            console.error('Error during logout:', error);
            return false;
        } finally {
            setIsLoggingOut(false);
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                currentUser,
                setCurrentUser,
                logout,
                isLoggingOut,
            }}
        >
            {!loading && children}
        </AuthContext.Provider>
    );
};
