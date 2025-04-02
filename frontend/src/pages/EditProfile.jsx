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
            console.log('Profile update response:', response.data);
            
            // Update the current user with the new profile data
            if (response.data && response.data.user) {
                // Add cache-busting parameter to profilePic URL
                const userData = {
                    ...response.data.user,
                    profilePic: response.data.user.profilePic + `?t=${new Date().getTime()}`
                };
                
                setCurrentUser(userData);
                console.log('Updated current user in context:', userData);
                
                toast.success('Profile updated successfully!');
                navigate('/profile');
            } else {
                throw new Error('Invalid response format');
            }
        } catch (err) {
            console.error('Error updating profile:', err);
            console.error('Error response:', err.response?.data);
            setError(err.response?.data?.error || 'Failed to update profile');
            toast.error(err.response?.data?.error || 'Failed to update profile');
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