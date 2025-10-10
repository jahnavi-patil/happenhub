import React from 'react';
import { Link } from 'react-router-dom';

const EventCard = ({ title, date, mood, location, imageUrl, description, price, id, tags }) => {
  return (
    <div className="event-card bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <img 
        src={imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop'} 
        alt={title}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = 'https://via.placeholder.com/800x600/991b1b/ffffff?text=Event+Image';
        }}
        className="w-full h-48 object-cover hover:opacity-90 transition-opacity"
      />
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{mood}</span>
          <h3 className="text-xl font-bold text-red-800">{title}</h3>
        </div>
        {description && <p className="text-gray-700 mb-2">{description}</p>}
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span className="flex items-center gap-1">📍 {location}</span>
          <span className="flex items-center gap-1">📅 {new Date(date).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between items-center mt-4">
            {price && <span className="text-red-700 font-bold text-lg">₹{price.toLocaleString('en-IN')}</span>}
          <Link 
            to={`/event/${id}`}
            className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors duration-300"
          >
            View Details
          </Link>
        </div>
        {tags && tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-gray-100 text-sm rounded-full text-gray-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCard;