// Ruta: dev-lperez/cucurucho-web/cucurucho-frontend/src/pages/AdminPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductManagement from '../components/ProductManagement';
import IngredientManagement from '../components/IngredientManagement';
import TableManagement from '../components/TableManagement'; // <-- 1. Importar

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
        {/* 2. Botón para la nueva pestaña de Mesas */}
        <button onClick={() => setActiveTab('tables')} className={activeTab === 'tables' ? 'active' : ''}>
          Mesas
        </button>
      </nav>
      <main className="admin-content">
        {activeTab === 'products' && <ProductManagement />}
        {activeTab === 'ingredients' && <IngredientManagement />}
        {/* 3. Renderizar el nuevo componente */}
        {activeTab === 'tables' && <TableManagement />}
      </main>
    </div>
  );
}

export default AdminPage;
