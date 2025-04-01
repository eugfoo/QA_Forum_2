// src/components/ProfilePage.jsx
import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { fetchCurrentUser } from '../services/api'; // You'll define this

const ProfilePage = ({ activities, currentPage, totalPages, errorMsg, successMsg }) => {

    const { currentUser, setCurrentUser } = useContext(AuthContext); // ✅ fixed here
    useEffect(() => {
        if (!currentUser) {
            return null; // or a loader
        }
        const getUpdatedUser = async () => {
            try {
                const res = await fetchCurrentUser();
                setCurrentUser(res.data.user);
            } catch (err) {
                console.error('Failed to refresh user:', err);
            }
        };
        getUpdatedUser();
    }, []);

    return (
        <div>

            <div className="profile-container mx-auto max-w-4xl p-6 bg-white shadow-lg rounded-lg mt-8">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center">
                        <img
                            src={currentUser.profilePic}
                            alt="Profile Picture"
                            className="rounded-full w-24 h-24 object-cover"
                        />
                        <div className="ml-6">
                            <h2 className="text-2xl font-semibold text-blue-600">{currentUser.username}</h2>
                            <p className="text-gray-500">{currentUser.email}</p>
                            <p className="mt-2 text-gray-700">{currentUser.bio}</p>
                        </div>
                    </div>
                    <Link to="/users/edit" className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full text-sm">
                        Edit Profile
                    </Link>
                </div>

                <div className="flex flex-wrap justify-start gap-6">
                    <div className="stat-card bg-gray-100 p-4 rounded-lg shadow flex-1">
                        <p className="text-sm font-semibold">Questions Answered</p>
                        <p className="text-2xl text-blue-600">
                            {currentUser.questionsAnsweredCount != null ? currentUser.questionsAnsweredCount : 0}
                        </p>
                    </div>
                    <div className="stat-card bg-gray-100 p-4 rounded-lg shadow flex-1">
                        <p className="text-sm font-semibold">Questions Posted</p>
                        <p className="text-2xl text-blue-600">
                            {currentUser.questionsPostedCount != null ? currentUser.questionsPostedCount : 0}
                        </p>
                    </div>
                    <div className="stat-card bg-gray-100 p-4 rounded-lg shadow flex-1">
                        <p className="text-sm font-semibold">Upvotes Received</p>
                        <p className="text-2xl text-blue-600">
                            {currentUser.upvotesReceived != null ? currentUser.upvotesReceived : 0}
                        </p>
                    </div>
                </div>

                <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                    {activities && activities.length > 0 ? (
                        <>
                            <ol className="relative border-l border-gray-200">
                                {activities.map((activity, index) => (
                                    <li key={activity._id || index} className="mb-10 ml-6">
                                        <span className="absolute flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full -left-4 ring-8 ring-white">
                                            {activity.type === 'question' ? (
                                                <i className="fa-solid fa-question text-blue-600"></i>
                                            ) : activity.type === 'answer' ? (
                                                <i className="fa-solid fa-comment text-blue-600"></i>
                                            ) : null}
                                        </span>
                                        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                                            <time className="mb-1 text-xs font-normal text-gray-400">
                                                {new Date(activity.createdAt).toLocaleString()}
                                            </time>
                                            {activity.type === 'question' ? (
                                                <div className="text-sm font-normal text-gray-500">
                                                    {currentUser.username} posted a new question:{' '}
                                                    <Link to={`/questions/${activity._id}`} className="font-semibold text-blue-600 hover:underline">
                                                        "{activity.title}"
                                                    </Link>
                                                </div>
                                            ) : activity.type === 'answer' ? (
                                                <div className="text-sm font-normal text-gray-500">
                                                    Answered{' '}
                                                    <Link to={`/questions/${activity.question._id}`} className="font-semibold text-blue-600 hover:underline">
                                                        "{activity.question.title}"
                                                    </Link>{' '}
                                                    with: "{activity.body}"
                                                </div>
                                            ) : null}
                                        </div>
                                    </li>
                                ))}
                            </ol>
                            <div className="mt-4 flex justify-between items-center">
                                {currentPage > 1 ? (
                                    <Link to={`/users/profile?page=${currentPage - 1}`} className="px-3 py-1 rounded bg-blue-600 text-white">
                                        Previous
                                    </Link>
                                ) : (
                                    <span className="px-3 py-1 rounded bg-gray-300 text-white">Previous</span>
                                )}
                                <span className="text-sm">
                                    Page {currentPage} of {totalPages}
                                </span>
                                {currentPage < totalPages ? (
                                    <Link to={`/users/profile?page=${currentPage + 1}`} className="px-3 py-1 rounded bg-blue-600 text-white">
                                        Next
                                    </Link>
                                ) : (
                                    <span className="px-3 py-1 rounded bg-gray-300 text-white">Next</span>
                                )}
                            </div>
                        </>
                    ) : (
                        <p>No recent activity.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
