// Ruta: cucurucho-web/cucurucho-frontend/src/components/CategoryManagement.jsx
import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';

function CategoryManagement() {
    const [categories, setCategories] = useState([]);
    const [newCategoryName, setNewCategoryName] = useState('');

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = () => {
        productService.getCategories()
            .then(setCategories)
            .catch(console.error);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newCategoryName) return;
        try {
            await productService.createCategory({ name: newCategoryName });
            setNewCategoryName('');
            loadCategories(); // Recargar la lista de categorías
        } catch (error) {
            console.error('Error al crear la categoría', error);
        }
    };

    return (
        <div>
            <h2>Gestión de Categorías</h2>
            <form onSubmit={handleSubmit} className="admin-form">
                <h3>Añadir Nueva Categoría</h3>
                <input
                    type="text"
                    placeholder="Nombre de la categoría"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    required
                />
                <button type="submit">Añadir Categoría</button>
            </form>

            <h3>Categorías Existentes</h3>
            <ul className="admin-list">
                {categories.map((cat) => (
                    <li key={cat.id}>
                        <span>{cat.name}</span>
                        {/* Aquí se podrían añadir botones de editar/eliminar en el futuro */}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default CategoryManagement;
