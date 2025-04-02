// PrivateRoute.jsx
import React, { useContext, useEffect, useRef } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const PrivateRoute = () => {
    const { currentUser, logoutInProgress } = useContext(AuthContext);
    const location = useLocation();
    const hasShownToast = useRef(false);

    useEffect(() => {
        if (
            !currentUser &&
            !logoutInProgress &&
            location.pathname !== '/login' &&
            !hasShownToast.current
        ) {
            toast.error('Please log in to continue.');
            hasShownToast.current = true;
        }
    }, [currentUser, logoutInProgress, location.pathname]);

    if (!currentUser) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
};

export default PrivateRoute;
