import React, { useState, useEffect } from 'react';
import './ProductEditModal.css';

function ProductEditModal({ product, ingredients, categories, onClose, onSave }) {
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        categoryId: '',
    });
    const [recipeItems, setRecipeItems] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                price: product.price || '',
                categoryId: product.categoryId || product.category?.id || (categories.length > 0 ? categories[0].id : ''),
            });

            // Cargar los items de la receta existente
            if (product.recipeItems && product.recipeItems.length > 0) {
                setRecipeItems(
                    product.recipeItems.map(item => ({
                        ingredientId: item.ingredientId || item.ingredient?.id || '',
                        quantity: item.quantity || '',
                    }))
                );
            } else {
                // Si no hay ingredientes, dejamos el array vacío para mostrar el mensaje
                setRecipeItems([]);
            }
        }
    }, [product, categories]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
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
        const newRecipeItems = recipeItems.filter((_, i) => i !== index);
        // Si eliminamos todos los ingredientes, dejamos el array vacío
        setRecipeItems(newRecipeItems.length > 0 ? newRecipeItems : []);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Filtrar items de receta válidos
            const validRecipeItems = recipeItems
                .filter(item => item.ingredientId && item.quantity && parseFloat(item.quantity) > 0)
                .map(item => ({
                    ingredientId: parseInt(item.ingredientId),
                    quantity: parseFloat(item.quantity)
                }));

            const productData = {
                name: formData.name,
                price: parseFloat(formData.price),
                categoryId: parseInt(formData.categoryId),
            };

            // Solo incluir recipeItems si hay elementos válidos
            if (validRecipeItems.length > 0) {
                productData.recipeItems = validRecipeItems;
            } else {
                // Si no hay ingredientes válidos, enviar array vacío para eliminarlos todos
                productData.recipeItems = [];
            }

            await onSave(product.id, productData);
            onClose();
        } catch (error) {
            console.error('Error al guardar el producto:', error);
            alert('Error al guardar el producto. Por favor intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const handleOverlayClick = (e) => {
        if (e.target.className === 'modal-overlay') {
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-content">
                <div className="modal-header">
                    <h2>✏️ Editar Producto</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <form onSubmit={handleSubmit} className="modal-form">
                        <div className="form-group">
                            <label htmlFor="name">Nombre del Producto</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Ej: Helado de Chocolate"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="price">Precio ($)</label>
                            <input
                                type="number"
                                id="price"
                                name="price"
                                value={formData.price}
                                onChange={handleInputChange}
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="categoryId">Categoría</label>
                            <select
                                id="categoryId"
                                name="categoryId"
                                value={formData.categoryId}
                                onChange={handleInputChange}
                                required
                            >
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="recipe-section">
                            <h4>🧪 Receta (Opcional)</h4>
                            {recipeItems.length === 0 ? (
                                <p style={{ color: '#999', fontStyle: 'italic', marginBottom: '12px' }}>
                                    No hay ingredientes en la receta. Haz clic en "Añadir Ingrediente" para agregar uno.
                                </p>
                            ) : (
                                recipeItems.map((item, index) => (
                                    <div key={index} className="recipe-item">
                                        <select
                                            value={item.ingredientId}
                                            onChange={(e) => handleRecipeChange(index, 'ingredientId', e.target.value)}
                                        >
                                            <option value="">Selecciona ingrediente...</option>
                                            {ingredients.map(ing => (
                                                <option key={ing.id} value={ing.id}>
                                                    {ing.name} ({ing.unit})
                                                </option>
                                            ))}
                                        </select>
                                        <input
                                            type="number"
                                            placeholder="Cantidad"
                                            value={item.quantity}
                                            onChange={(e) => handleRecipeChange(index, 'quantity', e.target.value)}
                                            step="0.01"
                                            min="0"
                                        />
                                        <button
                                            type="button"
                                            className="btn-remove-recipe"
                                            onClick={() => removeRecipeItem(index)}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                ))
                            )}
                            <button type="button" className="btn-add-recipe" onClick={addRecipeItem}>
                                ➕ Añadir Ingrediente
                            </button>
                        </div>

                        <div className="modal-actions">
                            <button type="button" className="btn-cancel" onClick={onClose}>
                                Cancelar
                            </button>
                            <button type="submit" className="btn-save" disabled={loading}>
                                {loading ? 'Guardando...' : '💾 Guardar Cambios'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ProductEditModal;
