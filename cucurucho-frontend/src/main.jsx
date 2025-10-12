// Ruta: cucurucho-frontend/src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Páginas Principales
import LoginPage from './pages/LoginPage.jsx';
import PosPage from './pages/PosPage.jsx';
import QueuePage from './pages/QueuePage.jsx';

// Páginas de Administración
import DashboardPage from './pages/DashboardPage.jsx';
import ProductManagement from './components/ProductManagement.jsx';
import IngredientManagement from './components/IngredientManagement.jsx';
import TableManagement from './components/TableManagement.jsx';
import ReportsPage from './pages/ReportsPage.jsx'; // ¡Importa la nueva página!

import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                {/* Ruta de Login (Pública) */}
                <Route path="/login" element={<LoginPage />} />

                {/* --- Rutas Protegidas --- */}
                <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>

                    {/* Rutas de Punto de Venta (POS) */}
                    <Route path="/pos" element={<PosPage />} />
                    <Route path="/queue" element={<QueuePage />} />

                    {/* Rutas de Administración (anidadas) */}
                    <Route path="/admin/dashboard" element={<DashboardPage />} />
                    <Route path="/admin/products" element={<ProductManagement />} />
                    <Route path="/admin/ingredients" element={<IngredientManagement />} />
                    <Route path="/admin/tables" element={<TableManagement />} />
                    {/* ¡Añade la nueva ruta de reportes! */}
                    <Route path="/admin/reports" element={<ReportsPage />} />

                    <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

                </Route>

                {/* Redirección Raíz */}
                <Route
                    path="/"
                    element={
                        localStorage.getItem('user_token')
                            ? <Navigate to="/pos" />
                            : <Navigate to="/login" />
                    }
                />
            </Routes>
        </BrowserRouter>
    </React.StrictMode>,
);