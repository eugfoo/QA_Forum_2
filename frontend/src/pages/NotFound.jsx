import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="text-center">
                <h1 className="text-7xl font-bold text-blue-600 mb-4">404</h1>
                <p className="text-2xl font-semibold text-gray-800 mb-2">Page Not Found</p>
                <p className="text-gray-600 mb-6">Oops! The page you're looking for doesn't exist.</p>
                <Link
                    to="/"
                    className="inline-block px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded transition"
                >
                    Go Back Home
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
