// Ruta: cucurucho-frontend/src/components/ProductManagement.jsx
import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import '../pages/Admin.css'; // Estilos comunes de admin

function ProductManagement() {
    // --- ESTADOS PARA DATOS REALES ---
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    // --- ESTADOS PARA EL FORMULARIO ---
    const [newProductName, setNewProductName] = useState('');
    const [newProductPrice, setNewProductPrice] = useState('');
    const [newProductCategory, setNewProductCategory] = useState('');

    // --- FUNCIÓN PARA CARGAR DATOS ---
    const loadData = async () => {
        try {
            const [productsData, categoriesData] = await Promise.all([
                productService.getProducts(),
                productService.getCategories(),
            ]);
            setProducts(productsData);
            setCategories(categoriesData);
            // Establecer una categoría por defecto en el formulario si existen categorías
            if (categoriesData.length > 0) {
                setNewProductCategory(categoriesData[0].id);
            }
        } catch (error) {
            console.error("Error al cargar datos:", error);
            // Aquí podrías mostrar una notificación al usuario
        }
    };

    // --- Carga inicial de datos al montar el componente ---
    useEffect(() => {
        loadData();
    }, []);

    // --- MANEJO DEL FORMULARIO ---
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!newProductName || !newProductPrice || !newProductCategory) {
            alert('Por favor, completa todos los campos.');
            return;
        }

        const productData = {
            name: newProductName,
            price: parseFloat(newProductPrice),
            categoryId: parseInt(newProductCategory),
            // La receta se manejará en el modal de edición
        };

        try {
            await productService.createProduct(productData);
            alert('¡Producto creado exitosamente!');
            // Limpiar formulario y recargar la lista de productos
            setNewProductName('');
            setNewProductPrice('');
            loadData();
        } catch (error) {
            console.error("Error al crear el producto:", error);
            alert(`Error al crear el producto: ${error.response?.data?.message || error.message}`);
        }
    };

    // --- MANEJO DE ELIMINACIÓN ---
    const handleDelete = async (productId, productName) => {
        if (window.confirm(`¿Estás seguro de que deseas eliminar el producto "${productName}"?`)) {
            try {
                await productService.deleteProduct(productId);
                alert('Producto eliminado exitosamente.');
                loadData(); // Recargar la lista
            } catch (error) {
                console.error(`Error al eliminar el producto ${productId}:`, error);
                alert(`Error al eliminar: ${error.response?.data?.message || error.message}`);
            }
        }
    };

    // --- FUNCIÓN DE CÁLCULO (sin cambios) ---
    const calculateMargin = (price, cost) => {
        const numPrice = parseFloat(price);
        const numCost = parseFloat(cost);
        if (!numPrice || !numCost || numPrice === 0) return 'N/A';
        const margin = ((numPrice - numCost) / numPrice) * 100;
        return margin.toFixed(1) + '%';
    };

    return (
        <div className="admin-page-container">
            <div className="admin-page-header">
                <h2>Gestión de Productos</h2>
                <p>Administra tu menú y recetas</p>
            </div>

            {/* Formulario para Agregar Producto (CONECTADO) */}
            <div className="admin-card">
                <div className="admin-card-header">
                    <h3>Agregar Nuevo Producto</h3>
                </div>
                <form className="admin-form-grid" onSubmit={handleSubmit}>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label htmlFor="name">Nombre del Producto</label>
                        <input
                            type="text"
                            id="name"
                            placeholder="Ej: Helado de Fresa"
                            value={newProductName}
                            onChange={(e) => setNewProductName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="category">Categoría</label>
                        <select
                            id="category"
                            value={newProductCategory}
                            onChange={(e) => setNewProductCategory(e.target.value)}
                            required
                        >
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="price">Precio ($)</label>
                        <input
                            type="number"
                            id="price"
                            placeholder="0.00"
                            step="0.01"
                            value={newProductPrice}
                            onChange={(e) => setNewProductPrice(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" style={{ alignSelf: 'end', height: '44px' }}>
                        + Agregar Producto
                    </button>
                </form>
            </div>

            {/* Tabla de Productos Registrados (CONECTADA) */}
            <div className="admin-card">
                <div className="admin-card-header">
                    <h3>Productos Registrados</h3>
                </div>
                <table className="admin-table">
                    <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Categoría</th>
                        <th>Costo</th>
                        <th>Precio</th>
                        <th>Margen</th>
                        <th>Receta</th>
                        <th style={{textAlign: 'right'}}>Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {products.map(product => (
                        <tr key={product.id}>
                            <td>{product.name}</td>
                            <td>{product.category?.name || 'N/A'}</td>
                            <td className="text-error">${parseFloat(product.cost || 0).toFixed(2)}</td>
                            <td>${parseFloat(product.price).toFixed(2)}</td>
                            <td>
                                    <span className="status-badge positive">
                                        {calculateMargin(product.price, product.cost)}
                                    </span>
                            </td>
                            <td>Ver ({product.recipeItems?.length || 0})</td>
                            <td className="actions-cell">
                                <button className="action-btn">✏️</button>
                                <button
                                    className="action-btn delete"
                                    onClick={() => handleDelete(product.id, product.name)}
                                >
                                    🗑️
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ProductManagement;