// Ruta: dev-lperez/cucurucho-web/cucurucho-frontend/src/pages/DashboardPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

function DashboardPage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>¡Bienvenido a Cucurucho Digital!</h1>
        <button onClick={handleLogout} className="logout-button">Cerrar Sesión</button>
      </header>
      <main className="dashboard-main">
        <p>Selecciona una opción para comenzar:</p>
        <div className="dashboard-actions">
          <button className="action-button" onClick={() => navigate('/pos')}>
            Ir al Punto de Venta (POS)
          </button>
          {/* --- BOTÓN HABILITADO --- */}
          <button className="action-button" onClick={() => navigate('/admin')}>
            Panel de Administración
          </button>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;

