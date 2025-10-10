import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context';

const Navbar = () => {
  const { user, logout, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Hide navbar on login and signup pages
  if (location.pathname.includes('/login') || location.pathname.includes('/signup')) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-red-700">HappenHub</span>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-red-700">HappenHub</span>
            </Link>
          </div>
          <div className="flex items-center gap-6">
            {user ? (
              <>
                <Link 
                  to="/" 
                  className="text-gray-700 hover:text-red-700 font-medium transition-colors"
                >
                  Home
                </Link>
                <Link 
                  to={user.role === 'ORGANIZER' ? '/dashboard/organizer' : '/dashboard/user'} 
                  className="text-gray-700 hover:text-red-700 font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <span className="text-red-700 font-medium">
                  Hello, {user.name || user.email?.split('@')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login/user"
                  className="px-4 py-2 text-red-700 hover:text-red-800 transition-colors font-medium"
                >
                  Login
                </Link>
                <Link 
                  to="/signup/user"
                  className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;