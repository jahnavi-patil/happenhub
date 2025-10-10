# HappenHub - Event Management Platform# HappenHub - Event Management Platform



A full-stack event discovery and booking platform built with React and Spring Boot.A


---

## 🚀 About the Project

**Discover. Connect. Experience. 🌟**  

**HappenHub** is a comprehensive event management platform that connects event organizers with attendees. Built with modern technologies including React, Spring Boot, and MongoDB, it provides seamless event discovery, booking, and management capabilities.

### Key Highlights
- 📅 **Browse Events** by mood, location, and date
- 🎟️ **Real-time Ticket Booking** with availability tracking
- 👥 **Dual Dashboards** for Users and Organizers
- 📊 **Analytics Dashboard** for organizers (revenue, attendance, tickets sold)
- 💰 **INR Currency** support with Indian number formatting
- 🔐 **JWT Authentication** for secure access

---

## 🌟 Features

### For Users
- ✅ Browse and discover events
- ✅ Filter by mood and location
- ✅ Book tickets with real-time availability
- ✅ User profile management
- ✅ View booking history
- ✅ Track upcoming events

### For Event Organizers
- ✅ Create and manage events
- ✅ Edit event details (capacity, price, description)
- ✅ Dashboard with analytics
- ✅ Revenue and attendance tracking
- ✅ Real-time ticket availability updates
- ✅ Delete/manage events

---

## ⚙️ Tech Stack

### Frontend
| Technology | Version |
|-----------|-------------|
| **React** | 18.x |
| **Vite** | 4.5.x |
| **React Router** | 6.x |
| **Tailwind CSS** | 3.x |
| **Context API** | State Management |
| **Lucide React** | Icons |

### Backend
| Technology | Version |
|-----------|-------------|
| **Spring Boot** | 3.2.3 |
| **Java** | 17 |
| **MongoDB** | 4.4+ |
| **Spring Security** | JWT Auth |
| **Maven** | 3.8+ |

---

## 📋 Prerequisites

Before running this project, ensure you have:

- **Node.js** (v16 or higher)
- **Java JDK** 17
- **MongoDB** (v4.4 or higher)
- **Maven** (v3.8 or higher)

---

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/atharvpatil18/happenhub.git
cd happenhub
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Start MongoDB (if not running)
# Windows
net start MongoDB
# macOS/Linux
sudo systemctl start mongod

# Run the backend
./mvnw spring-boot:run
# Or on Windows
mvnw.cmd spring-boot:run
```

Backend will start on `http://localhost:8080`

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Create .env file (copy from .env.example)
# Windows
copy .env.example .env
# macOS/Linux
cp .env.example .env

# Start development server
npm run dev
```

Frontend will start on `http://localhost:5174`

---

## 🔐 Environment Variables

### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

### Backend (application.properties)

```properties
spring.data.mongodb.uri=mongodb://localhost:27017/happenhub
spring.data.mongodb.database=happenhub
server.port=8080
```

---

## 📱 Usage

### Creating an Account

1. Click **Sign Up** in the navigation
2. Choose account type:
   - **User** - For booking events
   - **Organizer** - For creating and managing events
3. Fill in your details (name, email, password)
4. Login with your credentials

### For Organizers

1. **Create Events**: Navigate to Dashboard → Create New Event
2. **Manage Events**: Edit details, update capacity, change prices
3. **Track Performance**: View revenue (₹), tickets sold, and attendance rates
4. **Monitor Capacity**: Real-time progress bars show tickets sold vs available

### For Users

1. **Browse Events**: View all events on home page
2. **Filter**: Use mood filters to find relevant events
3. **Book Tickets**: Select event → Choose quantity → Confirm booking
4. **View Profile**: Check booking history and manage account

---

## 🗂️ Project Structure

```
happenhub/
├── backend/                    # Spring Boot Backend
│   ├── src/main/java/com/happenhub/
│   │   ├── config/            # Security, CORS, MongoDB config
│   │   ├── controller/        # REST API Controllers
│   │   ├── model/             # Entity models (Event, User, Booking)
│   │   ├── repository/        # MongoDB repositories
│   │   ├── security/          # JWT filters and auth
│   │   ├── service/           # Business logic
│   │   └── util/              # Helper classes
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── pom.xml
│   └── mvnw.cmd
│
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   │   ├── Navbar.jsx
│   │   │   ├── EventCard.jsx
│   │   │   ├── BookingForm.jsx
│   │   │   └── ...
│   │   ├── context/           # Auth context
│   │   ├── pages/             # Route pages
│   │   │   ├── Home.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── EventDetails.jsx
│   │   │   └── ...
│   │   ├── utils/             # API helpers
│   │   └── App.jsx
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── Dockerfile                 # Docker configuration
└── README.md
```

---

## 📊 Key Features Explained

### Real-time Ticket Availability
- Live ticket count updates after each booking
- Automatic decrement of `availableTickets`
- Sold-out status when capacity reached
- Backend ensures data consistency

### Smart Capacity Management
- Organizers can update event capacity anytime
- System preserves already sold tickets
- Progress bar shows percentage filled
- Formula: `(capacity - availableTickets) / capacity * 100`

### Dashboard Analytics (Organizers)
- **Total Revenue**: ₹ calculated from all ticket sales
- **Tickets Sold**: Sum of `(capacity - availableTickets)` across all events
- **Average Attendance**: Overall capacity filled percentage
- **Event Count**: Total events created by organizer
- Indian number formatting with `toLocaleString('en-IN')`

### Currency System
- All prices in Indian Rupees (₹)
- Consistent formatting across platform
- Number formatting: `₹1,23,456` (Indian locale)

---

## 📄 API Endpoints

### Authentication
```
POST /api/users/signup       - User registration
POST /api/users/login        - User login
POST /api/organizers/signup  - Organizer registration
POST /api/organizers/login   - Organizer login
```

### Events
```
GET    /api/events/all           - Get all events
GET    /api/events/{id}          - Get event by ID
POST   /api/events/create        - Create event (organizer only)
PUT    /api/events/update/{id}   - Update event (organizer only)
DELETE /api/events/delete/{id}   - Delete event (organizer only)
```

### Bookings
```
POST /api/bookings/create        - Create booking
GET  /api/bookings/user          - Get user's bookings
PUT  /api/bookings/cancel/{id}   - Cancel booking
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Submit a Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Atharv Patil**
- GitHub: [@atharvpatil18](https://github.com/atharvpatil18)

---

## 🙏 Acknowledgments

- React and Vite communities
- Spring Boot framework
- MongoDB for database management
- Tailwind CSS for styling

---

Made with ❤️ using React, Spring Boot & MongoDB
