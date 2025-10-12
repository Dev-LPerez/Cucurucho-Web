import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('user_token');
  console.log('ProtectedRoute - Token presente:', !!token); // Debug

  if (!token) {
    console.warn('No hay token, redirigiendo a login'); // Debug
    return <Navigate to="/login" replace />;
  }
  return children;
}
