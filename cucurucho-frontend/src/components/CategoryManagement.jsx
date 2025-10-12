// Ruta: cucurucho-web/cucurucho-frontend/src/components/CategoryManagement.jsx
import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import CategoryEditModal from './CategoryEditModal';

function CategoryManagement() {
    const [categories, setCategories] = useState([]);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingCategory, setEditingCategory] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

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
            loadCategories();
        } catch (error) {
            console.error('Error al crear la categoría', error);
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setShowEditModal(true);
    };

    const handleSave = async (id, categoryData) => {
        try {
            await productService.updateCategory(id, categoryData);
            loadCategories();
        } catch (error) {
            console.error('Error al actualizar la categoría:', error);
            throw error;
        }
    };

    const handleDelete = async (category) => {
        if (window.confirm(`¿Estás seguro de que deseas eliminar la categoría "${category.name}"? Esta acción no se puede deshacer.`)) {
            try {
                await productService.deleteCategory(category.id);
                loadCategories();
            } catch (error) {
                alert(`Error al eliminar la categoría: ${error.response?.data?.message || error.message}`);
            }
        }
    };

    const handleCloseModal = () => {
        setShowEditModal(false);
        setEditingCategory(null);
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
                    <li key={cat.id} className="product-item">
                        <div className="product-info">
                            <span className="product-name">{cat.name}</span>
                            <span className="product-category" style={{ color: '#fbbf24' }}>
                                {cat.products?.length || 0} productos
                            </span>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                className="btn-edit-product"
                                onClick={() => handleEdit(cat)}
                            >
                                ✏️ Editar
                            </button>
                            <button
                                className="btn-edit-product"
                                style={{ background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)' }}
                                onClick={() => handleDelete(cat)}
                            >
                                🗑️ Eliminar
                            </button>
                        </div>
                    </li>
                ))}
            </ul>

            {showEditModal && editingCategory && (
                <CategoryEditModal
                    category={editingCategory}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                />
            )}
        </div>
    );
}

export default CategoryManagement;
