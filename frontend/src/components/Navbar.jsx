// src/components/Navbar.jsx
import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import api from '../services/api';

const Navbar = () => {
    const { currentUser, logout, setLogoutInProgress } = useContext(AuthContext);
    const navigate = useNavigate();
    // State for notifications dropdown
    const [isNotiOpen, setIsNotiOpen] = useState(false);
    // State for notifications
    const [notifications, setNotifications] = useState([]);
    const [notificationCount, setNotificationCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const notificationDropdownRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Toggle notifications dropdown on click
    const handleNotificationClick = (e) => {
        e.stopPropagation();
        setIsNotiOpen(!isNotiOpen);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = async (e) => {
            if (
                notificationDropdownRef.current &&
                !notificationDropdownRef.current.contains(e.target) &&
                isNotiOpen
            ) {
                setIsNotiOpen(false);
                
                // Mark notifications as read when closing the dropdown
                if (notificationCount > 0) {
                    try {
                        // Mark all notifications as read in the API
                        const response = await api.put('/users/notifications/read', {});
                        
                        // Update the notification count after API call succeeds
                        setNotificationCount(0);
                        
                        // Update the notification objects in state to show as read
                        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                    } catch (error) {
                        // If API call fails, restore the notification count
                        fetchNotifications();
                        
                        // Show error toast
                        toast.error('Failed to mark notifications as read. Please try again later.');
                    }
                }
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isNotiOpen, notificationCount]);

    // Fetch notifications when component mounts or when currentUser changes
    useEffect(() => {
        if (currentUser) {
            fetchNotifications();
        }
    }, [currentUser]);

    // Periodically refresh notifications every 30 seconds
    useEffect(() => {
        if (!currentUser) return;
        
        // Initial fetch
        fetchNotifications();
        
        // Set up interval to fetch notifications
        const intervalId = setInterval(() => {
            fetchNotifications();
        }, 30000); // 30 seconds
        
        // Clean up interval on unmount
        return () => clearInterval(intervalId);
    }, [currentUser]);

    // Fetch notifications from the API
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
        } catch (error) {
            // Reset notifications to empty array in case of error
            setNotifications([]);
            setNotificationCount(0);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            const logoutSuccess = await logout();
            if (logoutSuccess) {
                // Attempt the backend logout but catch errors so they don't trigger an error toast
                await axios.get('/api/users/logout', { withCredentials: true }).catch(() => {
                    // Silently fail - we're logging out anyway
                });

                navigate('/login');
                toast.success('You have been logged out.');
            } else {
                toast.error('Failed to log out. Please try again.');
            }
        } catch (err) {
            toast.error('Logout failed. Please try again.');
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    };

    return (
        <nav className="bg-gray-900 text-white sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between">
                {/* Left Section: Logo and Search */}
                <div className="flex items-center space-x-4">
                    <Link to="/" className="text-xl font-bold">
                        Q&A Forum
                    </Link>
                    <form
                        className="flex items-center space-x-2"
                        role="search"
                        onSubmit={handleSearch}
                    >
                        <input
                            type="search"
                            name="q"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search questions..."
                            className="p-2 bg-gray-800 text-white placeholder-white border border-gray-700 rounded"
                        />
                        <button
                            type="submit"
                            className="searchBtn px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Search
                        </button>
                    </form>
                </div>

                {/* Right Section: Conditional Rendering */}
                <div className="flex items-center space-x-4">
                    {currentUser ? (
                        <>
                            {/* Notification Dropdown */}
                            <div className="relative inline-block">
                                <button
                                    id="notificationButton"
                                    className="notiDropdown relative px-3 py-2 rounded-full hover:bg-gray-800 transition duration-300"
                                    onClick={handleNotificationClick}
                                >
                                    <i className="fa-solid fa-bell text-xl"></i>
                                    {notificationCount > 0 && (
                                        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                                            {notificationCount}
                                        </span>
                                    )}
                                </button>

                                {isNotiOpen && (
                                    <div
                                        id="notificationDropdown"
                                        ref={notificationDropdownRef}
                                        className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg"
                                    >
                                        <div id="notificationList" className="max-h-64 overflow-y-auto py-2 custom-scrollbar">
                                            {loading ? (
                                                <p className="px-4 py-2 text-sm text-gray-500 text-center">
                                                    Loading notifications...
                                                </p>
                                            ) : notifications.length > 0 ? (
                                                notifications.slice(0, 4).map((notification) => {
                                                    let username = "Anonymous";
                                                    if (notification.answer) {
                                                        if (notification.answer.anonymous) {
                                                            username = "Anonymous";
                                                        } else {
                                                            username =
                                                                (notification.answer.user && notification.answer.user.username) ||
                                                                "Unknown";
                                                        }
                                                    }
                                                    const highlightClass = notification.read ? "" : "bg-blue-50 border-l-4 border-blue-500";
                                                    return (
                                                        <Link
                                                            key={notification._id}
                                                            to={`/questions/${notification.question._id}`}
                                                            className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${highlightClass}`}
                                                            onClick={() => {
                                                                // Close the dropdown when notification is clicked
                                                                setIsNotiOpen(false);
                                                            }}
                                                        >
                                                            <div className="flex items-start">
                                                                <div className="flex-grow">
                                                                    <p>
                                                                        <strong>{username}</strong> answered your question:{" "}
                                                                        <strong>"{notification.question.title}"</strong>
                                                                    </p>
                                                                    <p className="text-xs text-gray-500 mt-1">
                                                                        {new Date(notification.createdAt).toLocaleString()}
                                                                    </p>
                                                                </div>
                                                                {!notification.read && (
                                                                    <span className="bg-blue-500 rounded-full h-2 w-2 mt-2 ml-1" aria-label="Unread notification"></span>
                                                                )}
                                                            </div>
                                                        </Link>
                                                    );
                                                })
                                            ) : (
                                                <p className="px-4 py-2 text-sm text-gray-500 text-center">
                                                    No notifications
                                                </p>
                                            )}
                                        </div>
                                        {notifications.length > 4 && (
                                            <div className="border-t border-gray-100 py-1 bg-gray-50">
                                                <p className="text-xs text-gray-500 text-center px-4">
                                                    Showing 4 of {notifications.length} notifications
                                                </p>
                                            </div>
                                        )}
                                        <div className="border-t border-gray-100">
                                            <Link
                                                to="/notifications"
                                                className="block px-4 py-2 text-sm text-center text-gray-700 hover:bg-gray-100"
                                                onClick={() => {
                                                    // Close the dropdown when "See all notifications" is clicked
                                                    setIsNotiOpen(false);
                                                }}
                                            >
                                                See all notifications
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Profile Dropdown */}
                            <div className="relative inline-block group">
                                <button
                                    id="dropdownHoverButton"
                                    className="accActions text-white bg-transparent hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 inline-flex items-center"
                                    type="button"
                                >
                                    <img
                                        src={currentUser.profilePic ? `${currentUser.profilePic}` : '/default-avatar.png'}
                                        alt="Profile"
                                        className="w-6 h-6 rounded-full object-cover mr-2 bg-gray-200"
                                        onError={(e) => {
                                            e.target.src = '/default-avatar.png';
                                            e.target.onerror = null; // Prevent infinite error loop
                                        }}
                                    />
                                    <span className="truncate max-w-[80px]">{currentUser.username}</span>
                                    <svg
                                        className="w-2.5 h-2.5 ms-3"
                                        aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 10 6"
                                    >
                                        <path
                                            stroke="currentColor"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="m1 1 4 4 4-4"
                                        />
                                    </svg>
                                </button>
                                <div
                                    id="dropdownHover"
                                    className="absolute z-10 hidden group-hover:block bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44"
                                >
                                    <ul className="py-2 text-sm text-gray-700" aria-labelledby="dropdownHoverButton">
                                        <li>
                                            <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100">
                                                Profile
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to="/settings" className="block px-4 py-2 hover:bg-gray-100">
                                                Settings
                                            </Link>
                                        </li>
                                        <li>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left block px-4 py-2 hover:bg-gray-100"
                                            >
                                                Sign out
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </>
                    ) : (
                        <ul className="flex items-center">
                            <li>
                                <Link
                                    to="/login"
                                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
                                >
                                    Login
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/register"
                                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
                                >
                                    Register
                                </Link>
                            </li>
                        </ul>
                    )}
                </div>
            </div>
            <iframe id="notificationFrame" style={{ display: 'none' }}></iframe>
        </nav>
    );
};

export default Navbar;
