import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './layout.css';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  function handleLogout() {
    localStorage.removeItem('user_token');
    navigate('/login');
  }

  function toggleMenu() {
    setIsOpen(v => !v);
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${isOpen ? 'open' : 'collapsed'}`}>
        <div className="brand">🍦 Cucurucho</div>
        <nav className="nav">
          <Link to="/dashboard" className="nav-link" onClick={() => setIsOpen(false)}>📊 Dashboard</Link>
          <Link to="/pos" className="nav-link" onClick={() => setIsOpen(false)}>🧾 Punto de Venta</Link>
          <Link to="/queue" className="nav-link" onClick={() => setIsOpen(false)}>📋 Cola</Link>
          <Link to="/admin" className="nav-link" onClick={() => setIsOpen(false)}>⚙️ Admin</Link>
          <Link to="/products" className="nav-link" onClick={() => setIsOpen(false)}>🧁 Productos</Link>
          <Link to="/inventory" className="nav-link" onClick={() => setIsOpen(false)}>📦 Inventario</Link>
          <Link to="/tables" className="nav-link" onClick={() => setIsOpen(false)}>🪑 Mesas</Link>
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-small">Cerrar sesión</button>
        </div>
      </aside>

      {/* Overlay para cerrar el menú en móvil */}
      <div className={`overlay ${isOpen ? 'visible' : ''}`} onClick={() => setIsOpen(false)} />

      <div className="content-area">
        <header className="header">
          <div className="header-left">
            <button className="menu-button" aria-label="Abrir menú" onClick={toggleMenu}>☰</button>
            <h1 className="store-name">Cucurucho Digital</h1>
          </div>
          <div className="header-right">
            <div className="user-info">Admin ▾</div>
          </div>
        </header>

        <main className="main-content">{children}</main>

        <footer className="footer">© {new Date().getFullYear()} Cucurucho</footer>
      </div>
    </div>
  );
}
