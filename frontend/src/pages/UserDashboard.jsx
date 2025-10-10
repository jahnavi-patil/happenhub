import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context';
import { api } from '../utils/api';
import '../styles/Dashboard.css';

function UserDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalEventsAttended: 0,
    upcomingEvents: 0,
    totalSpent: 0,
    favoriteEventType: '',
    nextEvent: null,
    recentEvents: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // Fetch user's bookings
        const bookings = await api.bookings.getUserBookings();
        const currentDate = new Date();

        // Process bookings data
        const pastEvents = bookings.filter(booking => new Date(booking.event.date) < currentDate);
        const upcomingEvents = bookings.filter(booking => new Date(booking.event.date) >= currentDate);
        
        // Calculate total spent
        const totalSpent = bookings.reduce((acc, booking) => acc + booking.totalAmount, 0);

        // Calculate favorite event type
        const eventTypes = pastEvents.map(booking => booking.event.mood);
        const favoriteType = eventTypes.length > 0 
          ? eventTypes.reduce((acc, type) => {
              acc[type] = (acc[type] || 0) + 1;
              return acc;
            }, {})
          : {};
        const favoriteEventType = Object.entries(favoriteType).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

        // Get next upcoming event
        const nextEvent = upcomingEvents[0];

        // Get 5 most recent events
        const recentEvents = [...bookings]
          .sort((a, b) => new Date(b.event.date) - new Date(a.event.date))
          .slice(0, 5);

        setStats({
          totalEventsAttended: pastEvents.length,
          upcomingEvents: upcomingEvents.length,
          totalSpent,
          favoriteEventType,
          nextEvent,
          recentEvents
        });
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-600">Loading your dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <div className="text-xl text-red-600">{error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Banner */}
        <div className="welcome-banner">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
          <p className="text-sm text-red-100">User ID: {user?.id}</p>
          <p className="text-red-100 mt-2">View your event history and upcoming adventures</p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3 className="stat-label">Events Attended</h3>
            <p className="stat-value">{stats.totalEventsAttended}</p>
          </div>
          <div className="stat-card">
            <h3 className="stat-label">Upcoming Events</h3>
            <p className="stat-value">{stats.upcomingEvents}</p>
          </div>
          <div className="stat-card">
            <h3 className="stat-label">Total Spent</h3>
            <p className="stat-value">₹{stats.totalSpent.toLocaleString()}</p>
          </div>
          <div className="stat-card">
            <h3 className="stat-label">Favorite Event Type</h3>
            <p className="stat-value">{stats.favoriteEventType}</p>
          </div>
        </div>

        {/* Next Event Section */}
        {stats.nextEvent && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Next Event</h2>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{stats.nextEvent.event.title}</h3>
                <p className="text-gray-600">
                  {new Date(stats.nextEvent.event.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-gray-600">📍 {stats.nextEvent.event.location}</p>
              </div>
              <Link
                to={`/event/${stats.nextEvent.event.id}`}
                className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors"
              >
                View Details
              </Link>
            </div>
          </div>
        )}

        {/* Recent Events Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Events</h2>
          {stats.recentEvents.length === 0 ? (
            <p className="text-gray-600">No events attended yet.</p>
          ) : (
            <div className="space-y-4">
              {stats.recentEvents.map(booking => (
                <div 
                  key={booking.id}
                  className="flex items-center justify-between border-b border-gray-200 pb-4 last:border-0"
                >
                  <div>
                    <h3 className="font-semibold text-gray-900">{booking.event.title}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(booking.event.date).toLocaleDateString()} • {booking.event.location}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-2xl">{booking.event.mood}</span>
                      <span className="text-sm text-gray-600">₹{booking.totalAmount}</span>
                    </div>
                  </div>
                  <Link
                    to={`/event/${booking.event.id}`}
                    className="text-red-700 hover:text-red-800 font-medium"
                  >
                    View Event →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* View All Events Button */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors shadow-sm hover:shadow-md"
          >
            Browse More Events
          </Link>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;