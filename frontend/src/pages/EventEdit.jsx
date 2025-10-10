import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/auth';

const EventEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const event = await api.events.getById(id);
        setForm({
          title: event.title || '',
          description: event.description || '',
          date: event.date ? new Date(event.date).toISOString().slice(0,16) : '',
          location: event.location || '',
          capacity: event.capacity || 100,
          availableTickets: event.availableTickets || event.capacity || 100,
          price: event.price || 0,
          mood: event.mood || '🎵 Music',
          imageUrl: event.imageUrl || '',
          tags: event.tags ? event.tags.join(', ') : ''
        });
      } catch (err) {
        setMessage('Failed to load event');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      
      // If capacity changes, update availableTickets proportionally
      if (name === 'capacity') {
        const newCapacity = parseInt(value) || 0;
        const oldCapacity = prev.capacity || 0;
        const ticketsSold = oldCapacity - (prev.availableTickets || 0);
        // New available tickets = new capacity - tickets already sold
        updated.availableTickets = Math.max(0, newCapacity - ticketsSold);
      }
      
      return updated;
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Convert tags string to array
      const dataToSend = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
      };
      await api.events.update(id, dataToSend);
      setMessage('Event updated successfully!');
      setTimeout(() => navigate('/dashboard/organizer'), 1500);
    } catch (err) {
      setMessage('Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!form) return <div className="p-6 text-red-600">{message || 'Event not found'}</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Edit Event</h2>
        {message && <div className="mb-4 text-sm text-green-700">{message}</div>}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Title</label>
            <input name="title" value={form.title} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Date & Time</label>
              <input type="datetime-local" name="date" value={form.date} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium">Location</label>
              <input name="location" value={form.location} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Capacity</label>
              <input type="number" name="capacity" value={form.capacity} onChange={handleChange} className="w-full px-3 py-2 border rounded" min="0" />
              <p className="text-xs text-gray-500 mt-1">
                Available: {form.availableTickets} | Sold: {form.capacity - form.availableTickets}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium">Ticket Price (₹)</label>
              <input type="number" name="price" value={form.price} onChange={handleChange} className="w-full px-3 py-2 border rounded" min="0" step="0.01" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Mood</label>
              <select name="mood" value={form.mood} onChange={handleChange} className="w-full px-3 py-2 border rounded">
                <option value="🎵 Music">🎵 Music</option>
                <option value="🎭 Theater">🎭 Theater</option>
                <option value="🎨 Art">🎨 Art</option>
                <option value="🏃 Sports">🏃 Sports</option>
                <option value="🍕 Food">🍕 Food</option>
                <option value="🧘 Wellness">🧘 Wellness</option>
                <option value="💼 Business">💼 Business</option>
                <option value="🎓 Education">🎓 Education</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Image URL (optional)</label>
              <input name="imageUrl" value={form.imageUrl} onChange={handleChange} className="w-full px-3 py-2 border rounded" placeholder="https://..." />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">Tags (comma-separated)</label>
            <input name="tags" value={form.tags} onChange={handleChange} className="w-full px-3 py-2 border rounded" placeholder="music, jazz, outdoor" />
          </div>
          <div className="flex justify-end">
            <button disabled={loading} className="px-4 py-2 bg-red-600 text-white rounded">{loading ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventEdit;
