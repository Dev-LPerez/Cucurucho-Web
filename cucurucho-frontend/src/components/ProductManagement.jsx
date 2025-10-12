// Ruta: cucurucho-frontend/src/components/ProductManagement.jsx
import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import { inventoryService } from '../services/inventoryService';
import ProductEditModal from './ProductEditModal';
import '../pages/Admin.css';

function ProductManagement() {
    // --- ESTADOS PARA DATOS REALES ---
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [ingredients, setIngredients] = useState([]);

    // --- ESTADOS PARA EL MODAL DE EDICIÓN ---
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // --- ESTADOS PARA EL FORMULARIO DE CREACIÓN ---
    const [newProductName, setNewProductName] = useState('');
    const [newProductPrice, setNewProductPrice] = useState('');
    const [newProductCategory, setNewProductCategory] = useState('');
    const [newProductCost, setNewProductCost] = useState(''); // --- ESTADO AÑADIDO ---

    // --- FUNCIÓN PARA CARGAR DATOS ---
    const loadData = async () => {
        try {
            const [productsData, categoriesData, ingredientsData] = await Promise.all([
                productService.getProducts(),
                productService.getCategories(),
                inventoryService.getIngredients(),
            ]);
            setProducts(productsData);
            setCategories(categoriesData);
            setIngredients(ingredientsData);

            if (categoriesData.length > 0 && !newProductCategory) {
                setNewProductCategory(categoriesData[0].id);
            }
        } catch (error) {
            console.error("Error al cargar datos:", error);
            alert("Hubo un error al cargar los datos. Revisa la consola para más detalles.");
        }
    };

    // --- Carga inicial de datos al montar el componente ---
    useEffect(() => {
        loadData();
    }, []);

    // --- MANEJO DEL FORMULARIO DE CREACIÓN ---
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
        };
        // --- LÓGICA MODIFICADA ---
        if (newProductCost) {
            productData.cost = parseFloat(newProductCost);
        }

        try {
            await productService.createProduct(productData);
            alert('¡Producto creado exitosamente!');
            setNewProductName('');
            setNewProductPrice('');
            setNewProductCost(''); // Limpiar el nuevo campo
            loadData(); // Recargar la lista de productos
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
                loadData();
            } catch (error) {
                console.error(`Error al eliminar el producto ${productId}:`, error);
                alert(`Error al eliminar: ${error.response?.data?.message || error.message}`);
            }
        }
    };

    // --- LÓGICA DEL MODAL DE EDICIÓN ---
    const handleOpenEditModal = (product) => {
        setEditingProduct(product);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditingProduct(null);
    };

    const handleSaveProduct = async (productId, productData) => {
        await productService.updateProduct(productId, productData);
        alert('Producto actualizado exitosamente.');
        loadData(); // Recargar datos para ver los cambios
    };

    // --- FUNCIÓN DE CÁLCULO ---
    const calculateMargin = (price, cost) => {
        const numPrice = parseFloat(price);
        const numCost = parseFloat(cost);
        if (!numPrice || isNaN(numCost) || numPrice === 0) return 'N/A';
        const margin = ((numPrice - numCost) / numPrice) * 100;
        return margin.toFixed(1) + '%';
    };

    return (
        <div className="admin-page-container">
            <div className="admin-page-header">
                <h2>Gestión de Productos</h2>
                <p>Administra tu menú y recetas</p>
            </div>

            {/* Formulario para Agregar Producto */}
            <div className="admin-card">
                <div className="admin-card-header">
                    <h3>Agregar Nuevo Producto</h3>
                </div>
                <form className="admin-form-grid" onSubmit={handleSubmit} style={{gridTemplateColumns: '2fr 1fr 1fr 1fr auto'}}>
                    <div className="form-group">
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
                    {/* --- CAMPO AÑADIDO --- */}
                    <div className="form-group">
                        <label htmlFor="cost">Costo (Opcional)</label>
                        <input
                            type="number"
                            id="cost"
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            value={newProductCost}
                            onChange={(e) => setNewProductCost(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="price">Precio ($)</label>
                        <input
                            type="number"
                            id="price"
                            placeholder="0.00"
                            step="0.01"
                            min="0"
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

            {/* Tabla de Productos Registrados */}
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
                            <td>
                                <button className="action-btn" onClick={() => handleOpenEditModal(product)}>
                                    Ver ({product.recipeItems?.length || 0})
                                </button>
                            </td>
                            <td className="actions-cell">
                                <button className="action-btn" onClick={() => handleOpenEditModal(product)}>✏️</button>
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

            {/* Renderizado Condicional del Modal */}
            {isEditModalOpen && (
                <ProductEditModal
                    product={editingProduct}
                    ingredients={ingredients}
                    categories={categories}
                    onClose={handleCloseEditModal}
                    onSave={handleSaveProduct}
                />
            )}
        </div>
    );
}

export default ProductManagement;

