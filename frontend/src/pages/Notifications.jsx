import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import { NotificationContext } from '../contexts/NotificationContext';

const Notifications = () => {
    const { 
        notifications, 
        loading, 
        markAllAsRead, 
        refreshNotifications 
    } = useContext(NotificationContext);
    
    const timelineRef = useRef(null);
    const [currentDateGroup, setCurrentDateGroup] = useState('');
    const [scrollProgress, setScrollProgress] = useState(0);
    
    useEffect(() => {
        refreshNotifications();
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            if (!timelineRef.current) return;
            
            const { scrollTop, scrollHeight, clientHeight } = timelineRef.current;
            const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
            setScrollProgress(progress);
            
            const dateSections = document.querySelectorAll('[id^="date-"]');
            if (dateSections.length === 0) return;
            
            let currentSection = dateSections[0];
            let closestDistance = Infinity;
            
            dateSections.forEach(section => {
                const rect = section.getBoundingClientRect();
                const distance = Math.abs(rect.top);
                
                if (distance < closestDistance) {
                    closestDistance = distance;
                    currentSection = section;
                }
            });
            
            const dateId = currentSection.id;
            const dateGroup = dateId.replace('date-', '');
            setCurrentDateGroup(dateGroup);
        };
        
        const timelineElement = timelineRef.current;
        if (timelineElement) {
            timelineElement.addEventListener('scroll', handleScroll);
            handleScroll();
        }
        
        return () => {
            if (timelineElement) {
                timelineElement.removeEventListener('scroll', handleScroll);
            }
        };
    }, [notifications]);

    const groupNotificationsByDate = () => {
        const grouped = {};
        
        notifications.forEach(notification => {
            const date = new Date(notification.createdAt);
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            
            let dateKey;
            
            if (date.toDateString() === today.toDateString()) {
                dateKey = 'Today';
            } else if (date.toDateString() === yesterday.toDateString()) {
                dateKey = 'Yesterday';
            } else {
                dateKey = date.toLocaleDateString(undefined, { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });
            }
            
            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            
            grouped[dateKey].push(notification);
        });
        
        Object.keys(grouped).forEach(key => {
            grouped[key].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        });
        
        return grouped;
    };

    const groupedNotifications = groupNotificationsByDate();
    const hasUnreadNotifications = notifications.some(n => !n.read);
    const blueGradient = 'from-blue-100 to-indigo-100';

    const scrollToDate = (dateGroup) => {
        const element = document.getElementById(`date-${dateGroup}`);
        if (element && timelineRef.current) {
            timelineRef.current.scrollTo({
                top: element.offsetTop - 20,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
            {loading ? (
                <div className="text-center py-16 bg-white rounded-xl shadow-lg">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-r-4 border-blue-300 border-b-4 border-blue-200 border-l-4 border-blue-300"></div>
                    <p className="mt-4 text-gray-600 font-medium">Loading your activity...</p>
                </div>
            ) : notifications.length > 0 ? (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100">
                        <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300 ease-out"
                            style={{ width: `${scrollProgress}%` }}
                        ></div>
                    </div>
                    
                    <div className="sticky top-0 bg-white z-20 py-3 px-4 mt-1 mb-4 flex items-center justify-between border-b border-gray-200 shadow-sm">
                        <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-3 shadow-md animate-pulse">
                                <i className="fas fa-bell text-white"></i>
                            </div>
                            <div>
                                <h2 className="font-bold text-xl text-gray-800">Notification Timeline</h2>
                                <div className="flex items-center mt-1">
                                    <div className="h-4 w-4 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                                        <i className="fas fa-calendar-day text-blue-600 text-xs"></i>
                                    </div>
                                    <span className="text-sm text-gray-600">
                                        <span className="sr-only">Currently viewing: </span>
                                        {currentDateGroup}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <div className="flex space-x-1 mb-1">
                                {Object.keys(groupedNotifications).map((dateGroup, index) => (
                                    <button
                                        key={dateGroup}
                                        onClick={() => scrollToDate(dateGroup)}
                                        className={`h-2 w-2 rounded-full transition-all duration-200 ${
                                            currentDateGroup === dateGroup 
                                                ? 'bg-blue-500 transform scale-150' 
                                                : 'bg-gray-300 hover:bg-gray-400'
                                        }`}
                                        title={dateGroup}
                                        aria-label={`Jump to ${dateGroup}`}
                                    />
                                ))}
                            </div>
                            {hasUnreadNotifications && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors focus:outline-none focus:underline"
                                    aria-label="Mark all notifications as read"
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>
                    </div>
                    
                    <div 
                        ref={timelineRef}
                        className="relative overflow-y-auto custom-scrollbar px-4 pb-4" 
                        style={{ height: '600px' }}
                    >
                        <div className="absolute left-9 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-200 via-indigo-300 to-purple-200 rounded-full"></div>
                        
                        <div className="space-y-8">
                            {Object.entries(groupedNotifications).map(([dateGroup, groupNotifications], groupIndex) => (
                                <div key={dateGroup} id={`date-${dateGroup}`} className="relative fade-in">
                                    <div className="flex items-center mb-6 relative z-10">
                                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-4 shadow-md transform transition hover:scale-110">
                                            <i className="fas fa-calendar-day text-white"></i>
                                        </div>
                                        <h2 className="text-lg font-bold text-gray-800 bg-white px-3 py-1 rounded-full shadow-sm">{dateGroup}</h2>
                                        <div className="border-b-2 border-dashed border-gray-200 flex-grow ml-2"></div>
                                    </div>
                                    
                                    <div className="space-y-6 ml-2 mb-10">
                                        {groupNotifications.map((notification, index) => {
                                            let username = "Anonymous";
                                            if (notification.answer) {
                                                if (notification.answer.anonymous) {
                                                    username = "Anonymous";
                                                } else {
                                                    username = (notification.answer.user && notification.answer.user.username) || "Unknown";
                                                }
                                            }
                                            
                                            const animationDelay = `${index * 0.05}s`;
                                            
                                            return (
                                                <div 
                                                    key={notification._id} 
                                                    className="relative transform transition duration-300 hover:scale-102 hover:-translate-y-1 slide-in-bottom"
                                                    style={{ animationDelay }}
                                                >
                                                    <Link 
                                                        to={`/questions/${notification.question._id}`}
                                                        className={`block pl-16 pr-5 py-5 rounded-xl transition-all duration-300 shadow hover:shadow-md 
                                                        ${!notification.read 
                                                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500' 
                                                            : 'bg-white hover:bg-gradient-to-r hover:' + blueGradient}`}
                                                    >
                                                        <div className={`absolute left-8 top-6 w-4 h-4 rounded-full border-4 ${
                                                            !notification.read 
                                                                ? 'bg-blue-500 border-white pulse-dot' 
                                                                : 'bg-white border-gray-300'}`}
                                                        ></div>
                                                        
                                                        <div className="absolute left-1 top-3 h-12 w-12 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shadow-md transform transition-transform duration-300 hover:rotate-3">
                                                            <i className="fas fa-comment-dots text-blue-700"></i>
                                                        </div>
                                                        
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center flex-wrap">
                                                                <span className="font-semibold text-indigo-900">{username}</span>
                                                                <span className="mx-1 text-gray-600">answered your question</span>
                                                                {!notification.read && (
                                                                    <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 animate-pulse">
                                                                        New
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="mt-2 text-gray-800 font-medium text-lg leading-snug">
                                                                "{notification.question.title}"
                                                            </p>
                                                            <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100">
                                                                <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                                                                    {new Date(notification.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                                </span>
                                                                <span className="text-sm text-indigo-600 font-medium group flex items-center transition-all duration-300">
                                                                    View answer 
                                                                    <i className="fas fa-arrow-right ml-1 text-xs transform transition-transform duration-300 group-hover:translate-x-1"></i>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-16 bg-white shadow-lg rounded-xl bg-gradient-to-b from-white to-blue-50">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full mx-auto flex items-center justify-center mb-6 shadow-inner hover:from-blue-200 hover:to-indigo-200 transition-all duration-300 transform hover:scale-110">
                        <i className="fas fa-bell-slash text-indigo-400 text-2xl"></i>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">No notifications yet</h3>
                    <p className="text-gray-600 mt-2 max-w-sm mx-auto">When someone answers your questions, you'll see their responses here in your notification timeline</p>
                </div>
            )}

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 10px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                .fade-in {
                    animation: fadeIn 0.5s ease-out forwards;
                }
                
                @keyframes slideInBottom {
                    from { 
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .slide-in-bottom {
                    animation: slideInBottom 0.5s ease-out forwards;
                }
                
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
                
                .pulse-dot {
                    animation: pulse 2s infinite;
                }
            `}</style>
        </div>
    );
};

export default Notifications; 