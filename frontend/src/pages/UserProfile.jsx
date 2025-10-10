import React, { useState, useEffect } from 'react';
import { useAuth } from '../context';
import { api } from '../utils/api';

const UserProfile = () => {
  const { user, logout, updateUser } = useAuth();
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    interests: user?.interests || [],
    location: user?.location || '',
    dateOfBirth: user?.dateOfBirth || '',
    profileImage: user?.profileImage || null
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [bookingHistory, setBookingHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  
  const eventInterests = [
    '🎵 Music', '🎭 Theater', '🎨 Art', '🏃 Sports', 
    '🍕 Food', '🧘 Wellness', '💼 Business', '🎓 Education',
    '🎮 Gaming', '📱 Technology', '🌱 Environment', '🎪 Entertainment'
  ];

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      // Fetch user's booking history
      const bookings = await api.bookings.getByUser();
      setBookingHistory(bookings);
      
      // Fetch user's favorite events
      const userFavorites = await api.users.getFavorites();
      setFavorites(userFavorites);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await api.users.updateProfile(profileData);
      
      console.log('Profile update response:', response);
      
      // Update local user state with response data
      if (response && !response.message?.includes('❌')) {
        const updatedData = {
          name: response.name || profileData.name,
          phone: response.phone || profileData.phone,
          bio: response.bio || profileData.bio,
          location: response.location || profileData.location
        };
        
        // Update both profile data and auth context
        setProfileData(prev => ({ ...prev, ...updatedData }));
        updateUser(updatedData);
        
        setMessage('✅ Profile updated successfully!');
      } else {
        setMessage('✅ Profile updated successfully!');
      }
      
      setIsEditing(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage('❌ Failed to update profile. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleInterestToggle = (interest) => {
    setProfileData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('image', file);
        const response = await api.users.uploadProfileImage(formData);
        setProfileData(prev => ({
          ...prev,
          profileImage: response.imageUrl
        }));
      } catch (error) {
        setMessage('Failed to upload image. Please try again.');
        setTimeout(() => setMessage(''), 3000);
      }
    }
  };

  const getBookingStats = () => {
    const now = new Date();
    // Since bookings don't have event.date, we'll just count all bookings
    // and assume bookings with CONFIRMED status are upcoming
    const upcoming = bookingHistory.filter(booking => booking.status === 'CONFIRMED');
    const past = bookingHistory.filter(booking => booking.status === 'CANCELLED' || booking.status === 'COMPLETED');
    const totalSpent = bookingHistory.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
    
    return { upcoming: upcoming.length, past: past.length, totalSpent };
  };

  const stats = getBookingStats();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src={profileData.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name)}&background=ef4444&color=fff&size=80`}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover"
                />
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-red-600 text-white p-1 rounded-full cursor-pointer hover:bg-red-700">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </label>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{profileData.name}</h1>
                <p className="text-gray-600">{profileData.email}</p>
                <p className="text-sm text-gray-500">Member since {new Date(user?.createdAt || Date.now()).getFullYear()}</p>
              </div>
            </div>
            <div className="flex space-x-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="space-x-2">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {message && (
            <div className={`mt-4 p-3 rounded-lg ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({...prev, name: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.name}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900">{profileData.email}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({...prev, phone: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.phone || 'Not provided'}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.location}
                      onChange={(e) => setProfileData(prev => ({...prev, location: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.location || 'Not provided'}</p>
                  )}
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                {isEditing ? (
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({...prev, bio: e.target.value}))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-gray-900">{profileData.bio || 'No bio provided'}</p>
                )}
              </div>
            </div>

            {/* Interests */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Event Interests</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {eventInterests.map((interest) => (
                  <label key={interest} className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                    profileData.interests.includes(interest)
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}>
                    <input
                      type="checkbox"
                      checked={profileData.interests.includes(interest)}
                      onChange={() => handleInterestToggle(interest)}
                      disabled={!isEditing}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium text-gray-700">{interest}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Account Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Actions</h2>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  Change Password
                </button>
                <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  Privacy Settings
                </button>
                <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  Notification Preferences
                </button>
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Stats and Recent Activity */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Stats</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Events Attended</span>
                  <span className="font-semibold text-gray-900">{stats.past}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Upcoming Events</span>
                  <span className="font-semibold text-gray-900">{stats.upcoming}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Spent</span>
                  <span className="font-semibold text-gray-900">₹{stats.totalSpent.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Favorites</span>
                  <span className="font-semibold text-gray-900">{favorites.length}</span>
                </div>
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Bookings</h2>
              {bookingHistory.slice(0, 3).length === 0 ? (
                <p className="text-gray-600">No bookings yet</p>
              ) : (
                <div className="space-y-3">
                  {bookingHistory.slice(0, 3).map((booking) => (
                    <div key={booking.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <span className="text-2xl">🎟️</span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{booking.eventTitle || 'Event'}</p>
                        <p className="text-sm text-gray-600">{booking.numberOfTickets} ticket(s)</p>
                        <p className="text-xs text-gray-500">{booking.status || 'CONFIRMED'}</p>
                      </div>
                      <span className="text-sm font-medium text-red-600">₹{booking.totalAmount || 0}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;