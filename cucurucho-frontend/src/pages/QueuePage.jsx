import React from 'react';
import { useNavigate } from 'react-router-dom';
import QueueDisplay from '../components/QueueDisplay';

export default function QueuePage() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Cola de Pedidos</h1>
        <button onClick={() => navigate('/dashboard')} className="logout-button">Volver</button>
      </header>

      <main className="dashboard-main">
        <p>Vista de la cola de pedidos. Aquí se mostrarán pedidos en espera y su estado.</p>
        <div style={{marginTop: '1rem'}}>
          <QueueDisplay />
        </div>
      </main>
    </div>
  );
}
