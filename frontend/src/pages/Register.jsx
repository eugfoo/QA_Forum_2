import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await registerUser({ username, email, password, password2 });
            const { user, token, message } = response.data;
            toast.success(message || 'Registration successful');
            login(user, token);
            navigate('/');
        } catch (error) {
            console.error('Registration error:', error);
            if (error.response && error.response.data) {
                const errData = error.response.data;
                const errorMessage = errData.error || (errData.errors && errData.errors[0]?.msg) || 'Registration failed';

                if (errorMessage === 'Username is already taken') {
                    toast.error('This username is already taken. Please choose another one.');
                } else if (errorMessage === 'Email already registered') {
                    toast.error('This email is already registered. Please use a different email or login.');
                } else {
                    toast.error(errorMessage);
                }
            } else {
                toast.error('Registration failed');
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="w-full max-w-md bg-white p-6 rounded shadow">
                <h2 className="text-2xl font-bold text-center mb-4">Register</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block mb-1 font-medium">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            required
                            className="w-full p-2 border border-gray-300 rounded"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block mb-1 font-medium">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
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
                            required
                            className="w-full p-2 border border-gray-300 rounded"
                            value={password2}
                            onChange={(e) => setPassword2(e.target.value)}
                        />
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700"
                        >
                            Register
                        </button>
                    </div>
                </form>
                <p className="mt-4 text-center text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-600 hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
