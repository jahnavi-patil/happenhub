import React from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import { RootLayout } from "./RootLayout";
import { AuthProvider, useAuth } from "./context";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import UserProfile from "./pages/UserProfile";
import EventCreate from "./pages/EventCreate";
import EventEdit from "./pages/EventEdit";
import EventDetails from "./pages/EventDetails";
import LoginUser from "./pages/LoginUser";
import LoginOrganiser from "./pages/LoginOrganiser";
import Signup from "./pages/Signup";

// Protected Route Component
const ProtectedRoute = ({ element: Element, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login/user" replace />;
  }

  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return Element();
};

function App() {
  return (
    <AuthProvider>
      <RootLayout>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/event/:id" element={<EventDetails />} />
          
          {/* Public auth routes */}
          <Route path="/login/user" element={<LoginUser />} />
          <Route path="/login/organizer" element={<LoginOrganiser />} />
          <Route path="/login/organiser" element={<LoginOrganiser />} />
          <Route path="/signup/:type" element={<Signup />} />
          
          {/* Protected routes */}
          <Route 
            path="/dashboard/organizer" 
            element={
              <ProtectedRoute 
                element={() => <Dashboard />} 
                allowedRoles={['ORGANIZER']} 
              />
            }
          />
          <Route 
            path="/dashboard/user" 
            element={
              <ProtectedRoute 
                element={() => <UserProfile />} 
                allowedRoles={['USER']} 
              />
            }
          />
          <Route path="/event/create" element={<EventCreate />} />
          <Route path="/event/edit/:id" element={<EventEdit />} />
          
          {/* Fallback route */}
          <Route path="*" element={
            <div className="flex min-h-screen items-center justify-center">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-red-700 mb-4">404: Page Not Found</h2>
                <p className="text-gray-600 mb-4">Sorry, the page you are looking for does not exist.</p>
                <Link 
                  to="/" 
                  className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors"
                >
                  Go Home
                </Link>
              </div>
            </div>
          } />
        </Routes>
      </RootLayout>
    </AuthProvider>
  );
}

export default App;
