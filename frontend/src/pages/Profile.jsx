import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { fetchCurrentUser } from '../services/api'; 
import ActivityTimeline from '../components/ActivityTimeline';

const ProfilePage = () => {
    const { currentUser, setCurrentUser } = useContext(AuthContext);
    
    useEffect(() => {
        if (!currentUser) {
            return null; 
        }
        const getUpdatedUser = async () => {
            try {
                const res = await fetchCurrentUser();
                setCurrentUser(res.data.user);
            } catch (err) {
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
                            src={`${currentUser.profilePic}?${new Date().getTime()}`}
                            alt="Profile Picture"
                            className="rounded-full w-24 h-24 object-cover"
                            onError={(e) => {
                                e.target.src = '/default-avatar.png';
                                e.target.onerror = null;
                            }}
                        />
                        <div className="ml-6">
                            <h2 className="text-2xl font-semibold text-blue-600">{currentUser.username}</h2>
                            <p className="text-gray-500">{currentUser.email}</p>
                            <p className="mt-2 text-gray-700">{currentUser.bio}</p>
                        </div>
                    </div>
                    <Link to="/profile/edit" className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full text-sm">
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

                <ActivityTimeline userId={currentUser._id} />
            </div>
        </div>
    );
};

export default ProfilePage;
