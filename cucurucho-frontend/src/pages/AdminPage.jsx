// Ruta: dev-lperez/cucurucho-web/cucurucho-frontend/src/pages/AdminPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductManagement from '../components/ProductManagement';
import IngredientManagement from '../components/IngredientManagement';

function AdminPage() {
  const [activeTab, setActiveTab] = useState('products');
  const navigate = useNavigate();

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>Panel de Administración</h1>
        <button onClick={() => navigate('/dashboard')}>Volver al Dashboard</button>
      </header>
      <nav className="admin-nav">
        <button onClick={() => setActiveTab('products')} className={activeTab === 'products' ? 'active' : ''}>
          Productos
        </button>
        <button onClick={() => setActiveTab('ingredients')} className={activeTab === 'ingredients' ? 'active' : ''}>
          Ingredientes
        </button>
        {/* Agrega aquí más botones para otras secciones */}
      </nav>
      <main className="admin-content">
        {activeTab === 'products' && <ProductManagement />}
        {activeTab === 'ingredients' && <IngredientManagement />}
      </main>
    </div>
  );
}

export default AdminPage;
