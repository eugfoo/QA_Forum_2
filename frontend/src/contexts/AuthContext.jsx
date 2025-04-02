// AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(() => {
        const storedUser = localStorage.getItem('currentUser');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [justLoggedOut, setJustLoggedOut] = useState(false);
    const [logoutRedirect, setLogoutRedirect] = useState(false);
    const [logoutInProgress, setLogoutInProgress] = useState(false);

    const logout = () => {
        localStorage.removeItem('currentUser');
        setCurrentUser(null);
        setJustLoggedOut(true);
        setLogoutInProgress(true);
    };

    const [loading, setLoading] = useState(true);

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
                justLoggedOut,
                logoutRedirect,
                setJustLoggedOut,
                setLogoutRedirect,
                logoutInProgress,
                setLogoutInProgress,
            }}
        >
            {!loading && children}
        </AuthContext.Provider>
    );
};
