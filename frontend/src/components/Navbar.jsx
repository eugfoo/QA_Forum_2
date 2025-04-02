// src/components/Navbar.jsx
import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Navbar = ({ notifications: initialNotifications = [] }) => {
    const { currentUser, logout, setLogoutInProgress } = useContext(AuthContext);
    const navigate = useNavigate();
    // State for notifications dropdown
    const [isNotiOpen, setIsNotiOpen] = useState(false);
    // Derive the initial notification count (e.g. count unread notifications)
    const [notificationCount, setNotificationCount] = useState(
        initialNotifications.filter(n => !n.read).length
    );
    const notificationDropdownRef = useRef(null);

    // Toggle notifications dropdown on click
    const handleNotificationClick = (e) => {
        e.stopPropagation();
        // Simulate marking notifications as read (you could call an API here)
        setNotificationCount(0);
        setIsNotiOpen(prev => !prev);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                notificationDropdownRef.current &&
                !notificationDropdownRef.current.contains(e.target)
            ) {
                setIsNotiOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            toast.success('You have been logged out.');
            // Trigger logout in context (this sets logoutInProgress)
            logout();

            // Call backend logout route
            await axios.get('/api/users/logout', { withCredentials: true });

            navigate('/login');
            // Optionally, reset logoutInProgress after navigation if needed:
            setLogoutInProgress(false);
        } catch (err) {
            console.error('Logout failed:', err);
            toast.error('Logout failed');
        }
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
                        action="/questions/search"
                        method="GET"
                    >
                        <input
                            type="search"
                            name="q"
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
                                        <div id="notificationList" className="py-2">
                                            {initialNotifications.length > 0 ? (
                                                initialNotifications.map((notification) => {
                                                    let username = "Anonymous";
                                                    if (notification.answer && notification.answer.body) {
                                                        if (notification.answer.body.indexOf("[anon] ") === 0) {
                                                            username = "Anonymous";
                                                        } else {
                                                            username =
                                                                (notification.answer.user && notification.answer.user.username) ||
                                                                "Unknown";
                                                        }
                                                    }
                                                    const highlightClass = notification.read ? "" : "bg-blue-100";
                                                    return (
                                                        <Link
                                                            key={notification._id}
                                                            to={`/questions/${notification.question._id}`}
                                                            className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${highlightClass}`}
                                                        >
                                                            <p>
                                                                <strong>{username}</strong> answered your question:{" "}
                                                                <strong>"{notification.question.title}"</strong>
                                                            </p>
                                                        </Link>
                                                    );
                                                })
                                            ) : (
                                                <p className="px-4 py-2 text-sm text-gray-500 text-center">
                                                    No notifications
                                                </p>
                                            )}
                                        </div>
                                        <div className="border-t border-gray-100">
                                            <Link
                                                to="/notifications"
                                                className="block px-4 py-2 text-sm text-center text-gray-700 hover:bg-gray-100"
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
                                        src={currentUser.profilePic}
                                        alt="Profile"
                                        className="w-6 h-6 rounded-full object-cover mr-2"
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
                                {/* For simplicity, this dropdown is always visible on hover.
                    You could convert this to a controlled component if needed. */}
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
