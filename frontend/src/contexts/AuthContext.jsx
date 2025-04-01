import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);


export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(() => {
        const storedUser = localStorage.getItem('currentUser');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }
        setLoading(false); // ✅ Done checking
    }, []);

    return (
        <AuthContext.Provider value={{ currentUser, setCurrentUser }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
