import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EditProfileForm from '../components/EditProfileForm';
import { AuthContext } from '../contexts/AuthContext';
import { updateUserProfile } from '../services/api';
import { toast } from 'react-toastify';
import { useLoader } from '../contexts/LoaderContext';

const EditProfile = () => {
    const { currentUser, setCurrentUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const { setLoading } = useLoader();
    const [error, setError] = useState('');

    if (!currentUser) {
        return <div className="text-center py-10">Loading...</div>;
    }

    const handleSubmit = async (formData) => {
        setLoading(true);
        setError('');

        try {
            const response = await updateUserProfile(formData);
            if (response.data && response.data.user) {
                const userData = {
                    ...response.data.user,
                    profilePic: response.data.user.profilePic + `?t=${new Date().getTime()}`
                };

                setCurrentUser(userData);

                toast.success('Profile updated successfully!');
                navigate('/profile');
            } else {
                throw new Error('Invalid response format');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Failed to update profile';
            setError(errorMessage);

            if (errorMessage === 'Username is already taken') {
                toast.error('This username is already taken. Please choose another one.');
            } else {
                toast.error(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}
            <EditProfileForm user={currentUser} onSubmit={handleSubmit} />
        </div>
    );
};

export default EditProfile; 