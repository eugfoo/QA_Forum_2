// src/components/PrivateRoute.jsx
import React, { useContext, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const PrivateRoute = ({ children }) => {
    const { currentUser } = useContext(AuthContext);

    const navigate = useNavigate();

    useEffect(() => {
        if (!currentUser) {
            toast.error('Please log in to access this page');
            setTimeout(() => {
                navigate('/login');
            }, 100); // Give toast time to appear
        }
    }, [currentUser, navigate]);

    if (!currentUser) return null;
    return <Outlet />;
};

export default PrivateRoute;
