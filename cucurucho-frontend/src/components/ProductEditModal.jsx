import React, { useState, useEffect } from 'react';
 import { inventoryService } from '../services/inventoryService';
import './ProductEditModal.css';

function ProductEditModal({ product, ingredients: initialIngredients, categories, onClose, onSave }) {
    const [formData, setFormData] = useState({ name: '', price: '', categoryId: '' });
    const [recipeItems, setRecipeItems] = useState([]);
    const [ingredients, setIngredients] = useState(initialIngredients || []);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                price: product.price || '',
                categoryId: product.category?.id || '',
            });
            const existingRecipe = product.recipeItems?.map(item => ({
                ingredientId: item.ingredient.id,
                quantity: item.quantity,
            })) || [];
            setRecipeItems(existingRecipe);
        }
    }, [product]);

    useEffect(() => {
        // Si no se pasan ingredientes como prop, los carga del backend
        if (!initialIngredients || initialIngredients.length === 0) {
            inventoryService.getIngredients().then(setIngredients).catch(() => setIngredients([]));
        }
    }, [initialIngredients]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRecipeChange = (index, field, value) => {
        const newRecipeItems = [...recipeItems];
        newRecipeItems[index][field] = value;
        setRecipeItems(newRecipeItems);
    };

    const addRecipeItem = () => {
        setRecipeItems([...recipeItems, { ingredientId: '', quantity: '' }]);
    };

    const removeRecipeItem = (index) => {
        setRecipeItems(recipeItems.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const productData = {
            ...formData,
            price: parseFloat(formData.price),
            categoryId: parseInt(formData.categoryId),
            recipeItems: recipeItems
                .filter(item => item.ingredientId && item.quantity)
                .map(item => ({
                    ingredientId: parseInt(item.ingredientId),
                    quantity: parseFloat(item.quantity)
                })),
        };

        try {
            await onSave(product.id, productData);
            onClose();
        } catch (error) {
            console.error("Error al guardar el producto:", error);
            alert("Hubo un error al guardar los cambios.");
        } finally {
            setLoading(false);
        }
    };

    const handleOverlayClick = (e) => {
        if (e.target.className === 'modal-overlay') {
            onClose();
        }
    };

    if (!product) return null;

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-content">
                <div className="modal-header">
                    <h2>✏️ Editar Producto</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label htmlFor="name">Nombre del Producto</label>
                        <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="price">Precio ($)</label>
                        <input type="number" id="price" name="price" value={formData.price} onChange={handleInputChange} step="0.01" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="categoryId">Categoría</label>
                        <select id="categoryId" name="categoryId" value={formData.categoryId} onChange={handleInputChange} required>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="recipe-section">
                        <h4>🧪 Receta (Opcional)</h4>
                        {recipeItems.map((item, index) => (
                            <div key={index} className="recipe-item">
                                <select value={item.ingredientId} onChange={(e) => handleRecipeChange(index, 'ingredientId', e.target.value)}>
                                    <option value="">Selecciona ingrediente...</option>
                                    {ingredients.map(ing => (
                                        <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>
                                    ))}
                                </select>
                                <input type="number" placeholder="Cantidad" value={item.quantity} onChange={(e) => handleRecipeChange(index, 'quantity', e.target.value)} step="0.01" />
                                <button type="button" className="btn-remove-recipe" onClick={() => removeRecipeItem(index)}>🗑️</button>
                            </div>
                        ))}
                        <button type="button" className="btn-add-recipe" onClick={addRecipeItem}>➕ Añadir Ingrediente</button>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn-save" disabled={loading}>
                            {loading ? 'Guardando...' : '💾 Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ProductEditModal;
