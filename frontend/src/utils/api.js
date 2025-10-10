const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Add timeout to fetch requests
const timeoutFetch = (url, options = {}) => {
  const TIMEOUT_SECONDS = 10;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_SECONDS * 1000);

  return fetch(url, {
    ...options,
    signal: controller.signal
  }).finally(() => clearTimeout(timeout));
};

const handleResponse = async (response) => {
  if (!response.ok) {
    try {
      const error = await response.json();
      throw new Error(error.message || `Server error: ${response.status}`);
    } catch (e) {
      if (e instanceof SyntaxError) {
        // If response is not JSON
        if (response.status === 0) {
          throw new Error('Cannot connect to server. Please check if the backend server is running.');
        }
        throw new Error(`Server error (${response.status}): ${response.statusText}`);
      }
      throw e;
    }
  }
  return response.json();
};

const checkServer = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error('Server connection error:', error);
    return false;
  }
};

export const api = {
  // Event APIs
  events: {
    getAll: (filters = {}) => 
      fetch(`${API_BASE_URL}/events/all?${new URLSearchParams(filters)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }).then(handleResponse),

    getById: (id) => 
      fetch(`${API_BASE_URL}/events/${id}`)
        .then(handleResponse),

    // Get events for a specific organizer
    getByOrganizer: (organizerId) =>
      fetch(`${API_BASE_URL}/events/organizer/${organizerId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }).then(handleResponse),

    create: (data) => 
      fetch(`${API_BASE_URL}/events/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      }).then(handleResponse),

    update: (id, data) => 
      fetch(`${API_BASE_URL}/events/update/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      }).then(handleResponse),

    delete: (id) => 
      fetch(`${API_BASE_URL}/events/delete/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }).then(handleResponse)
  },

  // Auth APIs
  auth: {
    login: (type, data) => 
      timeoutFetch(`${API_BASE_URL}/${type === 'users' ? 'users' : 'organizers'}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      }).then(async (response) => {
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Login failed');
        }
        const result = await response.json();
        return {
          token: result.token,
          user: result.user
        };
      })
      .catch(err => {
        if (err.name === 'AbortError') {
          throw new Error('Request timed out. Please try again.');
        }
        throw err;
      }),

    // Best-effort: fetch a single user by id (if backend supports it)
    getUser: (id) =>
      fetch(`${API_BASE_URL}/users/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      }).then(handleResponse).catch(() => null)

    ,
    signup: (type, data) => 
      timeoutFetch(`${API_BASE_URL}/${type === 'users' ? 'users' : 'organizers'}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      }).then(async (response) => {
        if (!response.ok) {
          const text = await response.text();
          throw new Error(text.includes('❌') ? text.replace('❌ ', '') : 'Signup failed');
        }
        const text = await response.text();
        return text.includes('✅') ? { message: text.replace('✅ ', '') } : { message: 'Signup successful' };
      })
      .catch(err => {
        if (err.name === 'AbortError') {
          throw new Error('Request timed out. Please try again.');
        }
        throw err;
      })
  },

  // Booking APIs
  bookings: {
    create: (data) => 
      fetch(`${API_BASE_URL}/bookings/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      }).then(handleResponse),

    getByUser: () => 
      fetch(`${API_BASE_URL}/bookings/user`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }).then(handleResponse),

    getByEvent: (eventId) => 
      fetch(`${API_BASE_URL}/bookings/event/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }).then(handleResponse),

    cancel: (bookingId) => 
      fetch(`${API_BASE_URL}/bookings/cancel/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }).then(handleResponse)
  }
  ,
  // Users endpoints (profile, favorites)
  users: {
    getFavorites: () =>
      fetch(`${API_BASE_URL}/users/favorites`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      }).then(handleResponse).catch(() => []),

    updateProfile: (data) =>
      fetch(`${API_BASE_URL}/users/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      }).then(handleResponse),

    uploadProfileImage: (formData) =>
      fetch(`${API_BASE_URL}/users/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      }).then(handleResponse).catch(() => ({ imageUrl: null }))
  }
};