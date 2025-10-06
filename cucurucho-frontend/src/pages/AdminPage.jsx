// Ruta: cucurucho-web/cucurucho-frontend/src/pages/AdminPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductManagement from '../components/ProductManagement';
import IngredientManagement from '../components/IngredientManagement';
import TableManagement from '../components/TableManagement';
import CategoryManagement from '../components/CategoryManagement'; // <-- 1. Importar el nuevo componente

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
                {/* 2. Botón para la nueva pestaña de Categorías */}
                <button onClick={() => setActiveTab('categories')} className={activeTab === 'categories' ? 'active' : ''}>
                    Categorías
                </button>
                <button onClick={() => setActiveTab('ingredients')} className={activeTab === 'ingredients' ? 'active' : ''}>
                    Ingredientes
                </button>
                <button onClick={() => setActiveTab('tables')} className={activeTab === 'tables' ? 'active' : ''}>
                    Mesas
                </button>
            </nav>
            <main className="admin-content">
                {activeTab === 'products' && <ProductManagement />}
                {activeTab === 'categories' && <CategoryManagement />} {/* <-- 3. Renderizar el nuevo componente */}
                {activeTab === 'ingredients' && <IngredientManagement />}
                {activeTab === 'tables' && <TableManagement />}
            </main>
        </div>
    );
}

export default AdminPage;
