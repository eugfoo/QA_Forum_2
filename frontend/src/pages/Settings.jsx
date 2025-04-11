import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { updateSettings } from '../services/api';
import { toast } from 'react-toastify';

const Settings = () => {
    const { currentUser } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (formData.newPassword !== formData.confirmPassword) {
                toast.error('New passwords do not match');
                setLoading(false);
                return;
            }

            if (formData.newPassword.length < 6) {
                toast.error('New password must be at least 6 characters');
                setLoading(false);
                return;
            }

            const response = await updateSettings(formData);
            toast.success(response.data.message || 'Password updated successfully');
            setFormData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            console.error('Error updating password:', error);
            if (error.response?.data?.errors) {
                error.response.data.errors.forEach(err => {
                    toast.error(err.msg);
                });
            } else {
                toast.error(error.response?.data?.error || 'Failed to update password');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg p-8">
                <h1 className="text-2xl font-bold text-blue-600 mb-6">Account Settings</h1>

                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Change Password</h2>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label htmlFor="currentPassword" className="block text-gray-700 text-sm font-bold mb-2">
                                Current Password
                            </label>
                            <input
                                type="password"
                                id="currentPassword"
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="newPassword" className="block text-gray-700 text-sm font-bold mb-2">
                                New Password
                            </label>
                            <input
                                type="password"
                                id="newPassword"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                required
                                minLength="6"
                            />
                            <p className="text-gray-500 text-xs mt-1">Must be at least 6 characters</p>
                        </div>

                        <div className="mb-6">
                            <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-bold mb-2">
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                required
                            />
                        </div>

                        <div className="flex items-center justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                                    loading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                {loading ? 'Updating...' : 'Update Password'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Settings; 