// Ruta: dev-lperez/cucurucho-web/cucurucho-frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import PosPage from './pages/PosPage.jsx';
import AdminPage from './pages/AdminPage.jsx'; // 1. Importa la nueva página de Admin.
import './index.css';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('user_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route 
          path="/dashboard" 
          element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} 
        />
        <Route 
          path="/pos" 
          element={<ProtectedRoute><PosPage /></ProtectedRoute>} 
        />
        {/* 2. Añade la nueva ruta protegida para el panel de administración */}
        <Route 
          path="/admin" 
          element={<ProtectedRoute><AdminPage /></ProtectedRoute>} 
        />

        <Route 
          path="/" 
          element={
            localStorage.getItem('user_token') ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
          } 
        />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);

