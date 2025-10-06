// Ruta: dev-lperez/cucurucho-web/cucurucho-frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import PosPage from './pages/PosPage.jsx';
import AdminPage from './pages/AdminPage.jsx'; // 1. Importa la nueva página de Admin.
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Nuevos imports para rutas que existen como componentes
import ProductManagement from './components/ProductManagement.jsx';
import IngredientManagement from './components/IngredientManagement.jsx';
import TableManagement from './components/TableManagement.jsx';
import QueuePage from './pages/QueuePage.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route 
          path="/dashboard" 
          element={<ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>}
        />
        <Route 
          path="/pos" 
          element={<ProtectedRoute><Layout><PosPage /></Layout></ProtectedRoute>}
        />
        <Route
          path="/queue"
          element={<ProtectedRoute><Layout><QueuePage /></Layout></ProtectedRoute>}
        />
        <Route
          path="/products"
          element={<ProtectedRoute><Layout><ProductManagement /></Layout></ProtectedRoute>}
        />
        <Route
          path="/inventory"
          element={<ProtectedRoute><Layout><IngredientManagement /></Layout></ProtectedRoute>}
        />
        <Route
          path="/tables"
          element={<ProtectedRoute><Layout><TableManagement /></Layout></ProtectedRoute>}
        />

        {/* 2. Añade la nueva ruta protegida para el panel de administración */}
        <Route 
          path="/admin" 
          element={<ProtectedRoute><Layout><AdminPage /></Layout></ProtectedRoute>}
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
