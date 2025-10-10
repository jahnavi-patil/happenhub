import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/auth';

const EventCreate = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    capacity: 100,
    price: 0,
    mood: '🎵',
    imageUrl: '',
    tags: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const moods = [
    { emoji: '🎵', label: 'Music' },
    { emoji: '🎭', label: 'Theater' },
    { emoji: '🎨', label: 'Art' },
    { emoji: '🏃', label: 'Sports' },
    { emoji: '🍕', label: 'Food' },
    { emoji: '🧘', label: 'Wellness' },
    { emoji: '💼', label: 'Business' },
    { emoji: '🎓', label: 'Education' },
    { emoji: '🎮', label: 'Gaming' },
    { emoji: '📱', label: 'Technology' }
  ];

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user || user.role !== 'ORGANIZER') {
      setMessage('❌ Only organizers can create events');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        title: form.title,
        description: form.description,
        date: form.date,
        location: form.location,
        capacity: parseInt(form.capacity),
        price: parseFloat(form.price),
        mood: form.mood,
        organizerEmail: user.email,
        imageUrl: form.imageUrl || null,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(t => t) : []
      };
      
      const response = await api.events.create(payload);
      setMessage('✅ Event created successfully!');
      setTimeout(() => navigate('/dashboard/organizer'), 1500);
    } catch (err) {
      setMessage('❌ ' + (err.message || 'Failed to create event'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-red-50 py-8">
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold text-red-900 mb-6">Create New Event</h2>
          
          {message && (
            <div className={`mb-4 p-3 rounded ${
              message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Event Title *</label>
              <input 
                name="title" 
                value={form.title} 
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="e.g., Summer Music Festival"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea 
                name="description" 
                value={form.description} 
                onChange={handleChange}
                required
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Describe your event..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date & Time *</label>
                <input 
                  type="datetime-local" 
                  name="date" 
                  value={form.date} 
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                <input 
                  name="location" 
                  value={form.location} 
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="e.g., London, UK"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Capacity (Total Tickets) *</label>
                <input 
                  type="number" 
                  name="capacity" 
                  value={form.capacity} 
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ticket Price (₹) *</label>
                <input 
                  type="number" 
                  name="price" 
                  value={form.price} 
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="0 for free event"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Event Mood *</label>
              <select
                name="mood"
                value={form.mood}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {moods.map(m => (
                  <option key={m.emoji} value={m.emoji}>{m.emoji} {m.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Image URL (Optional)</label>
              <input 
                name="imageUrl" 
                value={form.imageUrl} 
                onChange={handleChange}
                type="url"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-sm text-gray-500 mt-1">Leave empty for a default image</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags (Optional)</label>
              <input 
                name="tags" 
                value={form.tags} 
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="e.g., outdoor, family-friendly, weekend"
              />
              <p className="text-sm text-gray-500 mt-1">Separate tags with commas</p>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard/organizer')}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventCreate;
