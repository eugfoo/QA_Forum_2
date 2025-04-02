import React, { useState, useRef, useEffect } from 'react';

const EditProfileForm = ({ user, onSubmit }) => {
    const [username, setUsername] = useState(user.username || '');
    const [bio, setBio] = useState(user.bio || '');
    const [profilePreview, setProfilePreview] = useState(user.profilePic || '/default-avatar.png');
    const profilePhotoRef = useRef();

    useEffect(() => {
        console.log('EditProfileForm received user:', user);
        console.log('User profile pic:', user.profilePic);
        // Update preview if user data changes
        setProfilePreview(user.profilePic || '/default-avatar.png');
    }, [user]);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                console.log('Setting preview to data URL');
                setProfilePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('username', username);
        formData.append('bio', bio);
        if (profilePhotoRef.current.files[0]) {
            formData.append('profilePhoto', profilePhotoRef.current.files[0]);
        }
        onSubmit(formData); // parent handles submission
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white shadow-lg rounded-lg p-8 max-w-lg mx-auto">
                <h2 className="text-3xl font-bold text-center mb-6">Edit Profile</h2>

                <div className="relative text-center mb-6">
                    <img
                        src={profilePreview}
                        alt="Profile"
                        className="w-24 h-24 rounded-full mx-auto shadow-lg object-cover"
                    />
                    <button
                        type="button"
                        onClick={() => profilePhotoRef.current.click()}
                        className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow hover:bg-gray-100"
                    >
                        <i className="fa fa-edit text-blue-500"></i>
                    </button>
                    <p className="mt-2 text-gray-600">Change Profile Photo</p>
                </div>

                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <div className="mb-4">
                        <label htmlFor="username" className="block text-gray-700 font-semibold mb-2">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="bio" className="block text-gray-700 font-semibold mb-2">
                            Bio
                        </label>
                        <textarea
                            id="bio"
                            rows="4"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>

                    <input
                        type="file"
                        id="profilePhoto"
                        ref={profilePhotoRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handlePhotoChange}
                    />

                    <button
                        type="submit"
                        className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                    >
                        Save Changes
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditProfileForm;