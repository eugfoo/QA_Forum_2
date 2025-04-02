import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { loginUser } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { setCurrentUser, isLoggingOut } = useContext(AuthContext);
    const hasShownToast = useRef(false);

    useEffect(() => {
        // Reset hasShownToast when location changes
        hasShownToast.current = false;

        // Use a timeout to check isLoggingOut state after a short delay
        const timer = setTimeout(() => {
            if (!isLoggingOut && location.state?.from && !hasShownToast.current) {
                toast.error('Please log in to continue.');
                hasShownToast.current = true;
            }
        }, 100); // Small delay to ensure state is updated

        return () => clearTimeout(timer);
    }, [location, isLoggingOut]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg(null);
        try {
            const response = await loginUser({ email, password });
            const { user, message } = response.data;
            toast.success(message || 'Login successful');

            localStorage.setItem('currentUser', JSON.stringify(user));
            setCurrentUser(user);
            navigate('/');
        } catch (error) {
            console.error('Login error:', error);
            const msg = error.response?.data?.error || 'Login failed';
            toast.error(msg);
            setErrorMsg(msg);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="w-full max-w-md bg-white p-6 rounded shadow">
                <h2 className="text-2xl font-bold text-center mb-4">Login</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                            placeholder="Password"
                            required
                            className="w-full p-2 border border-gray-300 rounded"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700"
                        >
                            Login
                        </button>
                    </div>
                </form>
                <p className="mt-4 text-center text-sm">
                    Don't have an account?{' '}
                    <Link to="/users/register" className="text-blue-600 hover:underline">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
