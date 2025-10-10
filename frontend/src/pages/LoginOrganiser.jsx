import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context";
import { api } from "../utils/api";

function LoginOrganiser() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const response = await api.auth.login('organizers', formData);
  login(response.user, response.token);
  navigate('/dashboard/organizer');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#6F1D1B] flex items-center justify-center px-4 py-12">
      <div className="bg-[#FFB5A7] rounded-lg shadow-xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-[#432818] text-center mb-8">
          Organizer Login
        </h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-[#432818] font-medium mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-md bg-white/90 border border-[#432818]/20 focus:outline-none focus:ring-2 focus:ring-[#9B2226]"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-[#432818] font-medium mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-md bg-white/90 border border-[#432818]/20 focus:outline-none focus:ring-2 focus:ring-[#9B2226]"
              placeholder="Enter your password"
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-6 rounded-md bg-[#9B2226] text-white font-medium hover:bg-[#6F1D1B] transition-colors
                ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[#432818]">
            Don't have an organizer account?{' '}
            <Link to="/signup/organizer" className="text-[#9B2226] hover:text-[#6F1D1B] font-medium">
              Create Account
            </Link>
          </p>
          
          <button 
            onClick={() => navigate('/login/user')}
            className="mt-4 text-[#432818] hover:text-[#9B2226] transition-colors"
          >
            Login as Event Attendee →
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginOrganiser;
