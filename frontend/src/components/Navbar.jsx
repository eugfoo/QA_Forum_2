import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="bg-white shadow sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link to="/" className="text-xl font-bold text-blue-600 hover:text-blue-800">
                            QA Forum
                        </Link>
                    </div>

                    {/* Links */}
                    <div className="hidden md:flex space-x-6 items-center">
                        <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium">Home</Link>
                        <Link to="/ask" className="text-gray-600 hover:text-blue-600 font-medium">Ask</Link>
                        <Link to="/profile" className="text-gray-600 hover:text-blue-600 font-medium">Profile</Link>
                        <Link to="/login" className="bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700">
                            Login
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
