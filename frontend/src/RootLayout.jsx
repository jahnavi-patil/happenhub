import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

export function RootLayout({ children }) {
  const location = useLocation();
  const isAuthRoute = (pathname) => {
    return pathname.startsWith('/login/') || pathname.startsWith('/signup/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {!isAuthRoute(location.pathname) && <Navbar />}
      <main className="flex-grow bg-gray-50">
        {children}
      </main>
      {!isAuthRoute(location.pathname) && <Footer />}
    </div>
  );
}