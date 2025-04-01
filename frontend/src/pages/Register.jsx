// src/components/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [errorMsg, setErrorMsg] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg(null);
        setSuccessMsg(null);

        // You might also perform some client-side validations here.
        try {
            const response = await registerUser({ username, email, password, password2 });
            setSuccessMsg(response.data.message);
            // Optionally, redirect to the login page after successful registration
            navigate('/login');
        } catch (error) {
            console.error('Registration error:', error);
            if (error.response && error.response.data) {
                // In case your API returns an array of errors, you might pick the first message.
                const errData = error.response.data;
                setErrorMsg(errData.error || (errData.errors && errData.errors[0]?.msg) || 'Registration failed');
            } else {
                setErrorMsg('Registration failed');
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="w-full max-w-md bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-bold text-center text-blue-600 mb-4">Register</h2>
                <div id="toast-container" className="fixed top-20 right-4 z-50 flex flex-col space-y-2">
                    {errorMsg && (
                        <div className="bg-red-200 text-red-800 p-2 rounded">
                            {errorMsg}
                        </div>
                    )}
                    {successMsg && (
                        <div className="bg-green-200 text-green-800 p-2 rounded">
                            {successMsg}
                        </div>
                    )}
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block mb-1 font-medium">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            placeholder="Enter username"
                            required
                            className="w-full p-2 border border-gray-300 rounded"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block mb-1 font-medium">
                            Email address
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Enter email"
                            required
                            className="w-full p-2 border border-gray-300 rounded"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block mb-1 font-medium">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Enter password"
                            required
                            className="w-full p-2 border border-gray-300 rounded"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="password2" className="block mb-1 font-medium">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            id="password2"
                            name="password2"
                            placeholder="Confirm password"
                            required
                            className="w-full p-2 border border-gray-300 rounded"
                            value={password2}
                            onChange={(e) => setPassword2(e.target.value)}
                        />
                    </div>
                    <div>
                        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                            Register
                        </button>
                    </div>
                </form>
                <p className="mt-3 text-center text-sm">
                    Already have an account?{' '}
                    <Link to="/users/login" className="text-blue-600 hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
