// Ruta: cucurucho-frontend/src/components/CategoryManagement.jsx

import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import CategoryEditModal from './CategoryEditModal';
import '../pages/Admin.css';

function CategoryManagement() {
    const [categories, setCategories] = useState([]);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingCategory, setEditingCategory] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const loadCategories = async () => {
        try {
            setLoading(true);
            const data = await productService.getCategories();
            setCategories(data);
        } catch (error) {
            console.error('Error al cargar categorías', error);
            alert('No se pudieron cargar las categorías.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newCategoryName) return;
        try {
            await productService.createCategory({ name: newCategoryName });
            setNewCategoryName('');
            loadCategories();
            alert('Categoría creada exitosamente.');
        } catch (error) {
            console.error('Error al crear la categoría', error);
            alert(`Error: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleDelete = async (category) => {
        if (window.confirm(`¿Estás seguro de que deseas eliminar la categoría "${category.name}"?`)) {
            try {
                await productService.deleteCategory(category.id);
                loadCategories();
                alert('Categoría eliminada.');
            } catch (error) {
                alert(`Error al eliminar: ${error.response?.data?.message || error.message}`);
            }
        }
    };

    const handleOpenEditModal = (category) => {
        setEditingCategory(category);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditingCategory(null);
    };

    const handleSaveChanges = async (id, categoryData) => {
        try {
            await productService.updateCategory(id, categoryData);
            loadCategories();
        } catch(error) {
            console.error('Error al actualizar la categoría:', error);
            throw error;
        }
    };

    return (
        <div className="admin-page-container">
            <div className="admin-page-header">
                <h2>Gestión de Categorías</h2>
                <p>Organiza los productos de tu menú</p>
            </div>

            <div className="admin-card">
                <div className="admin-card-header">
                    <h3>Añadir Nueva Categoría</h3>
                </div>
                <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                    <div className="form-group" style={{ flexGrow: 1 }}>
                        <label htmlFor="categoryName">Nombre de la Categoría</label>
                        <input
                            type="text"
                            id="categoryName"
                            placeholder="Ej: Helados"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" style={{ height: '44px' }}>+ Añadir Categoría</button>
                </form>
            </div>

            <div className="admin-card">
                <div className="admin-card-header">
                    <h3>Categorías Existentes</h3>
                </div>
                {loading ? <p>Cargando...</p> : (
                    <table className="admin-table">
                        <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Nº de Productos</th>
                            <th style={{ textAlign: 'right' }}>Acciones</th>
                        </tr>
                        </thead>
                        <tbody>
                        {categories.map((cat) => (
                            <tr key={cat.id}>
                                <td>{cat.name}</td>
                                <td>{cat.products?.length || 0}</td>
                                <td className="actions-cell">
                                    <button className="action-btn" onClick={() => handleOpenEditModal(cat)}>✏️</button>
                                    <button className="action-btn delete" onClick={() => handleDelete(cat)}>🗑️</button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>

            {isEditModalOpen && (
                <CategoryEditModal
                    category={editingCategory}
                    onClose={handleCloseEditModal}
                    onSave={handleSaveChanges}
                />
            )}
        </div>
    );
}

export default CategoryManagement;