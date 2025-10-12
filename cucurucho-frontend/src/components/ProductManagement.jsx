import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import { inventoryService } from '../services/inventoryService';
import ProductEditModal from './ProductEditModal';

function ProductManagement() {
    const [products, setProducts] = useState([]);
    const [ingredients, setIngredients] = useState([]);
    const [categories, setCategories] = useState([]);
    const [editingProduct, setEditingProduct] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const [newProductName, setNewProductName] = useState('');
    const [newProductPrice, setNewProductPrice] = useState('');
    const [newProductCategory, setNewProductCategory] = useState('');
    const [recipeItems, setRecipeItems] = useState([{ ingredientId: '', quantity: '' }]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [prods, ings, cats] = await Promise.all([
                    productService.getProducts(),
                    inventoryService.getIngredients(),
                    productService.getCategories(),
                ]);
                setProducts(prods);
                setIngredients(ings);
                setCategories(cats);
                if (cats.length > 0) {
                    setNewProductCategory(cats[0].id);
                }
            } catch (error) {
                console.error("Error cargando datos:", error);
            }
        };
        loadData();
    }, []);

    const handleRecipeChange = (index, event) => {
        const values = [...recipeItems];
        values[index][event.target.name] = event.target.value;
        setRecipeItems(values);
    };

    const addRecipeItem = () => {
        setRecipeItems([...recipeItems, { ingredientId: '', quantity: '' }]);
    };

    const removeRecipeItem = (index) => {
        const values = [...recipeItems];
        values.splice(index, 1);
        setRecipeItems(values);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Filtramos los items de receta que estén vacíos o incompletos antes de enviar
        const finalRecipeItems = recipeItems.filter(
            item => item.ingredientId && item.quantity && parseFloat(item.quantity) > 0
        ).map(item => ({
            ingredientId: parseInt(item.ingredientId),
            quantity: parseFloat(item.quantity)
        }));

        const productData = {
            name: newProductName,
            price: parseFloat(newProductPrice),
            categoryId: parseInt(newProductCategory),
        };

        // Solo añadimos la propiedad 'recipeItems' si hay al menos un item válido
        if (finalRecipeItems.length > 0) {
            productData.recipeItems = finalRecipeItems;
        }

        try {
            await productService.createProduct(productData);
            // Recargamos la lista completa para reflejar el nuevo producto
            const updatedProducts = await productService.getProducts();
            setProducts(updatedProducts);
            // Limpiar formulario a su estado inicial
            setNewProductName('');
            setNewProductPrice('');
            if (categories.length > 0) {
                setNewProductCategory(categories[0].id);
            }
            setRecipeItems([{ ingredientId: '', quantity: '' }]);
        } catch (error) {
            console.error("Error al crear el producto:", error);
        }
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setShowEditModal(true);
    };

    const handleSaveProduct = async (productId, productData) => {
        try {
            await productService.updateProduct(productId, productData);
            // Recargar la lista de productos
            const updatedProducts = await productService.getProducts();
            setProducts(updatedProducts);
        } catch (error) {
            console.error("Error al actualizar el producto:", error);
            throw error;
        }
    };

    const handleCloseModal = () => {
        setShowEditModal(false);
        setEditingProduct(null);
    };

    const handleDeleteProduct = async (product) => {
        if (window.confirm(`¿Estás seguro de que deseas eliminar "${product.name}"? Esta acción no se puede deshacer.`)) {
            try {
                console.log('Eliminando producto con ID:', product.id);
                await productService.deleteProduct(product.id);
                console.log('Producto eliminado exitosamente');
                // Recargar la lista de productos desde el servidor
                const updatedProducts = await productService.getProducts();
                setProducts(updatedProducts);
                alert('Producto eliminado exitosamente');
            } catch (error) {
                console.error('Error completo al eliminar:', error);
                alert(`Error al eliminar el producto: ${error.response?.data?.message || error.message}`);
            }
        }
    };

    return (
        <div>
            <h2>Gestión de Productos</h2>

            <form onSubmit={handleSubmit} className="admin-form">
                <h3>Agregar Nuevo Producto</h3>
                <input
                    type="text"
                    placeholder="Nombre del producto"
                    value={newProductName}
                    onChange={e => setNewProductName(e.target.value)}
                    required
                />
                <input
                    type="number"
                    placeholder="Precio"
                    value={newProductPrice}
                    onChange={e => setNewProductPrice(e.target.value)}
                    required
                    step="0.01"
                    min="0"
                />
                <select
                    value={newProductCategory}
                    onChange={e => setNewProductCategory(e.target.value)}
                    required
                >
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>

                <h4>Receta (Opcional)</h4>
                {recipeItems.map((item, index) => (
                    <div key={index} className="recipe-item-form">
                        <select name="ingredientId" value={item.ingredientId} onChange={e => handleRecipeChange(index, e)}>
                            <option value="">Selecciona ingrediente...</option>
                            {ingredients.map(ing => <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>)}
                        </select>
                        <input
                            type="number"
                            name="quantity"
                            placeholder="Cantidad"
                            value={item.quantity}
                            onChange={e => handleRecipeChange(index, e)}
                            step="0.01"
                            min="0"
                        />
                        <button type="button" onClick={() => removeRecipeItem(index)}>Quitar</button>
                    </div>
                ))}
                <button type="button" onClick={addRecipeItem}>Añadir Ingrediente a Receta</button>

                <button type="submit">Crear Producto</button>
            </form>

            <h3>Lista de Productos</h3>
            <ul className="admin-list">
                {products.map(product => (
                    <li key={product.id} className="product-item">
                        <div className="product-info">
                            <span className="product-name">{product.name}</span>
                            <span className="product-price">${product.price}</span>
                            <span className="product-category">({product.category?.name || 'Sin Categoría'})</span>
                            <span className="product-recipe">📝 {product.recipeItems?.length || 0} ingredientes</span>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                className="btn-edit-product"
                                onClick={() => handleEditProduct(product)}
                            >
                                ✏️ Editar
                            </button>
                            <button
                                className="btn-edit-product"
                                style={{ background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)' }}
                                onClick={() => handleDeleteProduct(product)}
                            >
                                🗑️ Eliminar
                            </button>
                        </div>
                    </li>
                ))}
            </ul>

            {showEditModal && editingProduct && (
                <ProductEditModal
                    product={editingProduct}
                    ingredients={ingredients}
                    categories={categories}
                    onClose={handleCloseModal}
                    onSave={handleSaveProduct}
                />
            )}
        </div>
    );
}

export default ProductManagement;