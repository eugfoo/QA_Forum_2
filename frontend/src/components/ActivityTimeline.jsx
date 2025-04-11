import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchUserActivity } from '../services/api';
import Loader from './Loader';
import { toast } from 'react-toastify';

const ActivityTimeline = ({ userId }) => {
    const [loading, setLoading] = useState(true);
    const [activities, setActivities] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    useEffect(() => {
        loadActivities(currentPage);
    }, [currentPage, userId]);

    const loadActivities = async (page) => {
        setLoading(true);
        try {
            const response = await fetchUserActivity(page);
            
            const sortedActivities = [...response.data.activities].sort((a, b) => 
                new Date(b.createdAt) - new Date(a.createdAt)
            );
            
            setActivities(sortedActivities);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Error loading activities:', error);
            toast.error('Failed to load your activity timeline');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > totalPages) return;
        setCurrentPage(newPage);
    };

    return (
        <div className="activity-timeline mt-8">
            <h2 className="text-xl font-semibold text-blue-600 mb-4">Your Activity Timeline</h2>
            
            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader />
                </div>
            ) : (
                <>
                    {activities.length === 0 ? (
                        <div className="text-center py-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <p className="text-gray-600">You don't have any activity yet.</p>
                        </div>
                    ) : (
                        <>
                            <ol className="relative border-l border-blue-200">
                                {activities.map((activity, index) => (
                                    <li key={activity._id || index} className="mb-10 ml-6">
                                        <span className="absolute flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full -left-4 ring-8 ring-white">
                                            {activity.type === 'question' ? (
                                                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"></path>
                                                </svg>
                                            ) : activity.type === 'answer' ? (
                                                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                    <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H6z" clipRule="evenodd"></path>
                                                </svg>
                                            ) : null}
                                        </span>
                                        <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                                            <div className="flex justify-between items-start">
                                                <time className="mb-1 text-xs font-normal text-gray-400">
                                                    {new Date(activity.createdAt).toLocaleString()}
                                                </time>
                                                <span className="px-2 py-1 text-xs font-medium text-blue-100 bg-blue-600 rounded-full">
                                                    {activity.type === 'question' ? 'Question' : 'Answer'}
                                                </span>
                                            </div>
                                            
                                            {activity.type === 'question' ? (
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900 mt-2">
                                                        <Link to={`/questions/${activity._id}`} className="hover:text-blue-600">
                                                            {activity.title}
                                                        </Link>
                                                    </h3>
                                                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">{activity.body}</p>
                                                    {activity.tags && activity.tags.length > 0 && (
                                                        <div className="flex flex-wrap gap-2 mt-3">
                                                            {activity.tags.map((tag, i) => (
                                                                <span key={i} className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded-full">
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : activity.type === 'answer' ? (
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900 mt-2">
                                                        <Link to={`/questions/${activity.question._id}`} className="hover:text-blue-600">
                                                            Re: {activity.question.title}
                                                        </Link>
                                                    </h3>
                                                    <p className="text-sm text-gray-500 mt-2 line-clamp-3">{activity.body}</p>
                                                </div>
                                            ) : null}
                                            
                                            <div className="mt-3 flex items-center text-xs text-gray-500">
                                                {activity.type === 'question' && (
                                                    <span className="flex items-center mr-3">
                                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"></path>
                                                            <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"></path>
                                                        </svg>
                                                        {(activity.answers?.length || 0)} replies
                                                    </span>
                                                )}
                                                <span className="flex items-center">
                                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"></path>
                                                    </svg>
                                                    {activity.votes?.up?.length || 0} upvotes
                                                </span>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                            
                            <div className="flex items-center justify-between mt-6">
                                <button 
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`px-4 py-2 rounded-md ${currentPage === 1 
                                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                                        : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                                >
                                    Previous
                                </button>
                                
                                <div className="flex items-center gap-2">
                                    {[...Array(Math.min(totalPages, 5)).keys()].map(page => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = page + 1;
                                        } else {
                                            let start = Math.max(1, currentPage - 2);
                                            let end = Math.min(totalPages, start + 4);
                                            start = Math.max(1, end - 4);
                                            pageNum = start + page;
                                        }
                                        
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => handlePageChange(pageNum)}
                                                className={`w-8 h-8 rounded-full ${currentPage === pageNum
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>
                                
                                <button 
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={`px-4 py-2 rounded-md ${currentPage === totalPages 
                                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                                        : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                                >
                                    Next
                                </button>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default ActivityTimeline; 