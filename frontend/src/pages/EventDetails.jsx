import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context';
import { api } from '../utils/api';

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingData, setBookingData] = useState({
    numberOfTickets: 1,
    specialRequirements: ''
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingMessage, setBookingMessage] = useState('');

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await api.events.getById(id);
        console.log('Event data:', response);
        setEvent(response);
      } catch (err) {
        console.error('Error fetching event:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEventDetails();
  }, [id]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    setBookingMessage('');

    try {
      const bookingPayload = {
        eventId: event.id,
        eventTitle: event.title,
        organizerEmail: event.organizerEmail,
        numberOfTickets: parseInt(bookingData.numberOfTickets),
        totalAmount: event.price * parseInt(bookingData.numberOfTickets),
        specialRequirements: bookingData.specialRequirements
      };

      await api.bookings.create(bookingPayload);
      setBookingMessage('✅ Booking confirmed! Check your email for details.');

      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      setBookingMessage('❌ ' + (err.message || 'Booking failed. Please try again.'));
    } finally {
      setBookingLoading(false);
    }
  };

  const calculateTotal = () => {
    return (event?.price || 0) * parseInt(bookingData.numberOfTickets || 1);
  };

  if (loading)
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-xl text-red-600">Loading event details...</div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-red-600 mb-4">Error: {error}</div>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800"
          >
            Go Home
          </button>
        </div>
      </div>
    );

  if (!event)
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Event not found</div>
      </div>
    );

  const hasTicketsAvailable = event.availableTickets > 0;
  const isOrganizer =
    user && user.role === 'ORGANIZER' && user.email === event.organizerEmail;

  return (
    <div className="min-h-screen bg-red-50 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <img
          src={
            event.imageUrl ||
            'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop'
          }
          alt={event.title}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              'https://via.placeholder.com/800x600/991b1b/ffffff?text=Event+Image';
          }}
          className="w-full h-64 object-cover"
        />

        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-red-900">{event.title}</h1>
            <span className="text-4xl">{event.mood}</span>
          </div>

          {/* Event Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="text-red-700 text-xl">📅</span>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="text-gray-900 font-medium">
                    {new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-red-700 text-xl">📍</span>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="text-gray-900 font-medium">{event.location}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-red-700 text-xl">💰</span>
                <div>
                  <p className="text-sm text-gray-500">Ticket Price</p>
                  <p className="text-gray-900 font-bold text-lg">
                    {event.price === 0
                      ? 'FREE'
                      : `₹${event.price.toFixed(2)}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-red-700 text-xl">🎟️</span>
                <div>
                  <p className="text-sm text-gray-500">Availability</p>
                  <p
                    className={`font-medium ${
                      hasTicketsAvailable
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {hasTicketsAvailable
                      ? `${event.availableTickets} / ${event.capacity} tickets available`
                      : 'SOLD OUT'}
                  </p>
                </div>
              </div>

              {event.organizerEmail && (
                <div className="flex items-center space-x-2">
                  <span className="text-red-700 text-xl">👤</span>
                  <div>
                    <p className="text-sm text-gray-500">Organized by</p>
                    <p className="text-gray-900 font-medium">
                      {event.organizerEmail}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-xl font-semibold text-red-900 mb-3">
                About the Event
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {event.description}
              </p>

              {event.tags && event.tags.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">Tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Booking Section for Users */}
          {user && user.role === 'USER' && hasTicketsAvailable && (
            <div className="mt-8 p-6 bg-red-50 rounded-lg border border-red-200">
              <h3 className="text-xl font-semibold text-red-900 mb-4">
                Book Your Tickets
              </h3>

              {bookingMessage && (
                <div
                  className={`mb-4 p-3 rounded ${
                    bookingMessage.includes('✅')
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {bookingMessage}
                </div>
              )}

              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="numberOfTickets"
                    className="block text-gray-700 font-medium mb-2"
                  >
                    Number of Tickets (Max: {event.availableTickets})
                  </label>
                  <input
                    type="number"
                    id="numberOfTickets"
                    min="1"
                    max={event.availableTickets}
                    value={bookingData.numberOfTickets}
                    onChange={(e) =>
                      setBookingData((prev) => ({
                        ...prev,
                        numberOfTickets: e.target.value
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="specialRequirements"
                    className="block text-gray-700 font-medium mb-2"
                  >
                    Special Requirements (Optional)
                  </label>
                  <textarea
                    id="specialRequirements"
                    value={bookingData.specialRequirements}
                    onChange={(e) =>
                      setBookingData((prev) => ({
                        ...prev,
                        specialRequirements: e.target.value
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    rows="3"
                    placeholder="Any special requirements..."
                  />
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Ticket Price:</span>
                    <span className="font-medium">
                      ₹{event.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-medium">
                      {bookingData.numberOfTickets}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="text-gray-900 font-bold">
                      Total Amount:
                    </span>
                    <span className="text-red-700 font-bold text-xl">
                      ₹{calculateTotal().toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="w-full py-3 px-6 bg-red-700 text-white font-medium rounded-lg hover:bg-red-800 transition-colors disabled:opacity-50"
                >
                  {bookingLoading ? 'Processing...' : 'Confirm Booking'}
                </button>
              </form>
            </div>
          )}

          {!hasTicketsAvailable && (
            <div className="mt-8 p-6 bg-gray-100 rounded-lg text-center">
              <p className="text-xl font-bold text-gray-700">
                Sorry, this event is sold out!
              </p>
            </div>
          )}

          {!user && hasTicketsAvailable && (
            <div className="mt-8 p-6 bg-red-50 rounded-lg text-center border border-red-200">
              <p className="text-gray-700 mb-4 text-lg">
                Please log in to book tickets for this event.
              </p>
              <button
                onClick={() => navigate('/login/user')}
                className="px-6 py-3 bg-red-700 text-white font-medium rounded-lg hover:bg-red-800 transition-colors"
              >
                Log In to Book
              </button>
            </div>
          )}

          {isOrganizer && (
            <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-xl font-semibold text-blue-900 mb-4">
                Organizer Actions
              </h3>
              <div className="flex gap-4">
                <button
                  onClick={() => navigate(`/event/edit/${event.id}`)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Edit Event
                </button>
                <button
                  onClick={() => navigate('/dashboard/organizer')}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EventDetails;
