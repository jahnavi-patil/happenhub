import React, { useState, useEffect } from 'react';
import EventCard from "../components/EventCard";
import MoodFilter from '../components/MoodFilter';
import SearchBar from '../components/SearchBar';
import { api } from '../utils/api';

function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationTerm, setLocationTerm] = useState('');
  const [selectedMood, setSelectedMood] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await api.events.getAll();
        setEvents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMood = selectedMood ? event.mood === selectedMood : true;
    const matchesLocation = locationTerm ? event.location.toLowerCase().includes(locationTerm.toLowerCase()) : true;
    return matchesSearch && matchesMood && matchesLocation;
  });

  if (loading) {
    return (
      <div className="home-container p-6 bg-[#6F1D1B] min-h-screen">
        <div className="text-white text-center mt-4">Loading events...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-container p-6 bg-[#6F1D1B] min-h-screen">
        <div className="text-red-500 text-center mt-4">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="home-container p-6 bg-red-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <SearchBar placeholder="Search by event title..." value={searchTerm} setValue={setSearchTerm} />
          </div>
          <div className="flex-1">
            <SearchBar placeholder="Search by location..." value={locationTerm} setValue={setLocationTerm} />
          </div>
        </div>
        
        <MoodFilter selectedMood={selectedMood} setSelectedMood={setSelectedMood} />

        <h2 className="text-3xl font-bold text-red-900">Upcoming Events</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.length > 0 ? (
            filteredEvents.map(event => (
              <EventCard
                key={event.id}
                id={event.id}
                title={event.title}
                date={event.date}
                mood={event.mood}
                location={event.location}
                imageUrl={event.imageUrl}
                description={event.description}
                price={event.price}
                tags={event.tags}
              />
            ))
          ) : (
            <div className="col-span-full">
              <p className="text-red-700 text-center text-lg">No events found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
