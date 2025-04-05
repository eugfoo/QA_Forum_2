import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from './AuthContext';
import { toast } from 'react-toastify';

export const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
    const { currentUser } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);
    const [notificationCount, setNotificationCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(Date.now());

    // Fetch notifications initially and when currentUser changes
    useEffect(() => {
        if (currentUser) {
            fetchNotifications();
        } else {
            setNotifications([]);
            setNotificationCount(0);
        }
    }, [currentUser]);

    // Set up polling interval for notifications
    useEffect(() => {
        if (!currentUser) return;
        
        const intervalId = setInterval(() => {
            fetchNotifications();
        }, 30000); // Poll every 30 seconds
        
        return () => clearInterval(intervalId);
    }, [currentUser]);

    const fetchNotifications = async () => {
        if (!currentUser) return;
        
        try {
            setLoading(true);
            const response = await api.get('/users/notifications');
            const notificationsData = response.data || [];
            setNotifications(notificationsData);
            
            // Count unread notifications
            const unreadCount = notificationsData.filter(n => n.read === false).length;
            setNotificationCount(unreadCount);
            setLastUpdated(Date.now());
        } catch (error) {
            // Reset notifications to empty array in case of error
            setNotifications([]);
            setNotificationCount(0);
        } finally {
            setLoading(false);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/users/notifications/read', {});
            
            // Update local state to show all notifications as read
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setNotificationCount(0);
            setLastUpdated(Date.now());
            
            return true;
        } catch (error) {
            toast.error('Failed to mark notifications as read');
            return false;
        }
    };

    // Force refresh notifications
    const refreshNotifications = () => {
        fetchNotifications();
    };

    return (
        <NotificationContext.Provider value={{
            notifications,
            notificationCount,
            loading,
            lastUpdated,
            fetchNotifications,
            markAllAsRead,
            refreshNotifications,
            setNotifications,
            setNotificationCount
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export default NotificationProvider; 