// Ruta: cucurucho-frontend/src/components/Layout.jsx

import React from 'react';
// 1. Importamos Outlet junto a los otros hooks de react-router-dom
import { NavLink, useLocation, useNavigate, Outlet } from 'react-router-dom';
import './layout.css';

// El sub-componente Header no cambia
const Header = ({ onToggleView, currentView }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('user_token');
        navigate('/login');
    };

    return (
        <header className="app-header">
            <div className="header-left">
                <h1 className="app-title">🍦 Cucurucho Digital</h1>
            </div>
            <div className="header-center">
                <div className="view-toggle">
                    <button
                        className={`toggle-btn ${currentView === 'pos' ? 'active' : ''}`}
                        onClick={() => onToggleView('pos')}
                    >
                        Punto de Venta
                    </button>
                    <button
                        className={`toggle-btn ${currentView === 'admin' ? 'active' : ''}`}
                        onClick={() => onToggleView('admin')}
                    >
                        Administración
                    </button>
                </div>
            </div>
            <div className="header-right">
                <div className="user-menu">
                    <span className="user-name">Administrador</span>
                    <span className="user-role">Admin</span>
                    <div className="user-avatar">▼</div>
                    <div className="user-dropdown">
                        <a href="#">Mi Perfil</a>
                        <a href="#">Configuración</a>
                        <div className="dropdown-divider"></div>
                        <a href="#" onClick={handleLogout}>Cerrar Sesión</a>
                    </div>
                </div>
            </div>
        </header>
    );
};

// El sub-componente AdminSidebar no cambia
const AdminSidebar = () => (
    <nav className="admin-sidebar">
        <NavLink to="/admin/dashboard" className="admin-nav-link">Dashboard</NavLink>
        <NavLink to="/admin/products" className="admin-nav-link">Productos</NavLink>
        <NavLink to="/admin/categories" className="admin-nav-link">Categorías</NavLink>
        <NavLink to="/admin/ingredients" className="admin-nav-link">Ingredientes</NavLink>
        <NavLink to="/admin/tables" className="admin-nav-link">Mesas</NavLink>
        <NavLink to="/admin/reports" className="admin-nav-link">Reportes</NavLink>
    </nav>
);


// 2. Quitamos la prop "children" que ya no se necesita
export default function Layout() {
    const location = useLocation();
    const navigate = useNavigate();

    const currentView = location.pathname.startsWith('/admin') ? 'admin' : 'pos';

    const handleToggleView = (view) => {
        if (view === 'pos') {
            navigate('/pos');
        } else {
            navigate('/admin/dashboard');
        }
    };

    return (
        <div className="app-shell">
            <Header onToggleView={handleToggleView} currentView={currentView} />
            <div className="app-body">
                {currentView === 'admin' && <AdminSidebar />}
                <main className="main-content">
                    {/* 3. Reemplazamos "{children}" con el componente <Outlet /> */}
                    <Outlet />
                </main>
            </div>
        </div>
    );
}