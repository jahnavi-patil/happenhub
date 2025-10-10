import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context";
import { api } from "../utils/api";
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalTicketsSold: 0,
    averageAttendance: 0,
    totalEvents: 0
  });
  const navigate = useNavigate();

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await api.events.delete(id);
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error('Failed to delete event', err);
      alert('Failed to delete event');
    }
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
  // backend expects organizer email, pass user.email
  const response = await api.events.getByOrganizer(user.email);
        
        const currentDate = new Date();
        const categorizedEvents = response.map(event => ({
          ...event,
          status: event.date && new Date(event.date) > currentDate ? "upcoming" : "past"
        }));

        setEvents(categorizedEvents);
        
        // Calculate statistics based on tickets sold (capacity - available)
        const totalTicketsSold = categorizedEvents.reduce((acc, event) => {
          const sold = (event.capacity || 0) - (event.availableTickets || 0);
          return acc + sold;
        }, 0);
        
        const totalCapacity = categorizedEvents.reduce((acc, event) => acc + (event.capacity || 0), 0);
        
        const totalRevenue = categorizedEvents.reduce((acc, event) => {
          const sold = (event.capacity || 0) - (event.availableTickets || 0);
          return acc + (sold * (event.price || 0));
        }, 0);

        setStats({
          totalRevenue,
          totalTicketsSold,
          averageAttendance: totalCapacity ? Math.round((totalTicketsSold / totalCapacity) * 100) : 0,
          totalEvents: categorizedEvents.length
        });
      } catch (err) {
        setError("Failed to load events. Please try again later.");
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [user.id]);

  const upcomingEvents = events.filter(event => event.status === "upcoming");
  const pastEvents = events.filter(event => event.status === "past");

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
        <div className="welcome-banner p-6 bg-red-600 text-white rounded-lg mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome, {user.name}!</h1>
          <p className="text-sm opacity-90">Event Organizer Dashboard</p>
          <p className="opacity-90 mt-2">Manage your events and track performance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Revenue</h3>
            <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Tickets Sold</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.totalTicketsSold}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Average Attendance</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.averageAttendance}%</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Events</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.totalEvents}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <div className="flex space-x-4 px-4">
              <button
                className={`px-4 py-3 font-medium text-sm transition-colors relative ${
                  activeTab === "upcoming"
                    ? "text-red-600 border-b-2 border-red-600"
                    : "text-gray-500 hover:text-red-600"
                }`}
                onClick={() => setActiveTab("upcoming")}
              >
                Upcoming Events
                {upcomingEvents.length > 0 && (
                  <span className="ml-2 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">
                    {upcomingEvents.length}
                  </span>
                )}
              </button>
              <button
                className={`px-4 py-3 font-medium text-sm transition-colors relative ${
                  activeTab === "past"
                    ? "text-red-600 border-b-2 border-red-600"
                    : "text-gray-500 hover:text-red-600"
                }`}
                onClick={() => setActiveTab("past")}
              >
                Past Events
                {pastEvents.length > 0 && (
                  <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                    {pastEvents.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(activeTab === "upcoming" ? upcomingEvents : pastEvents).length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500 text-lg mb-4">
                    {activeTab === "upcoming" 
                      ? "No upcoming events. Create a new event to get started!"
                      : "No past events found."}
                  </p>
                  {activeTab === "upcoming" && (
                    <Link 
                      to="/event/create"
                      className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <span className="mr-2">Create Event</span>
                      <span>+</span>
                    </Link>
                  )}
                </div>
              ) : (
                (activeTab === "upcoming" ? upcomingEvents : pastEvents).map(event => (
                  <div key={event.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl">{event.mood}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          event.status === "upcoming" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {event.status === "upcoming" ? "Upcoming" : "Past"}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p className="flex items-center">
                          <span className="mr-2"></span>
                          {event.location}
                        </p>
                        <p className="flex items-center">
                          <span className="mr-2"></span>
                          {event.date ? new Date(event.date).toLocaleDateString() : 'Date not set'}
                        </p>
                        <p className="flex items-center">
                          <span className="mr-2"></span>
                          {(event.capacity || 0) - (event.availableTickets || 0)} / {event.capacity || 0} tickets sold
                        </p>
                        <p className="flex items-center">
                          <span className="mr-2">💰</span>
                          ₹{event.price || 0} per ticket
                        </p>
                      </div>
                      
                      <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${event.capacity ? (((event.capacity - (event.availableTickets || 0)) / event.capacity) * 100) : 0}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {event.capacity ? Math.round((((event.capacity - (event.availableTickets || 0)) / event.capacity) * 100)) : 0}% capacity filled
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 px-4 py-3 border-t border-gray-100 flex items-center justify-between gap-4">
                      <Link
                        to={`/event/${event.id}`}
                        className="text-red-600 hover:text-red-700 font-medium text-sm"
                      >
                        View Details
                      </Link>
                      <div className="ml-auto flex items-center gap-2">
                        <button onClick={() => navigate(`/event/edit/${event.id}`)} className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded">Edit</button>
                        <button onClick={() => handleDelete(event.id)} className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded">Delete</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/event/create"
            className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm hover:shadow-md"
          >
            <span className="mr-2">Create New Event</span>
            <span>+</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;