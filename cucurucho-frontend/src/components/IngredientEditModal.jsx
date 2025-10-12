import React, { useState, useEffect } from 'react';
import './ProductEditModal.css'; // Reutilizamos los estilos

function IngredientEditModal({ ingredient, onClose, onSave }) {
    const [formData, setFormData] = useState({
        name: '',
        stock: '',
        unit: 'g',
        cost: '',
        stockMinimo: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (ingredient) {
            setFormData({
                name: ingredient.name || '',
                stock: ingredient.stock || '',
                unit: ingredient.unit || 'g',
                cost: ingredient.cost || '',
                stockMinimo: ingredient.stockMinimo || ''
            });
        }
    }, [ingredient]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // --- LÓGICA MODIFICADA ---
            const ingredientData = {
                name: formData.name,
                stock: parseFloat(formData.stock),
                unit: formData.unit,
                cost: parseFloat(formData.cost),
                stockMinimo: parseFloat(formData.stockMinimo)
            };

            await onSave(ingredient.id, ingredientData);
            onClose();
        } catch (error) {
            console.error('Error al guardar el ingrediente:', error);
            alert('Error al guardar el ingrediente. Por favor intenta de nuevo.');
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
                    <h2>✏️ Editar Ingrediente</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <form onSubmit={handleSubmit} className="modal-form">
                        <div className="form-group">
                            <label htmlFor="name">Nombre del Ingrediente</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Ej: Leche"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="stock">Stock Actual</label>
                            <input
                                type="number"
                                id="stock"
                                name="stock"
                                value={formData.stock}
                                onChange={handleInputChange}
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="unit">Unidad de Medida</label>
                            <select
                                id="unit"
                                name="unit"
                                value={formData.unit}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="g">Gramos (g)</option>
                                <option value="kg">Kilogramos (kg)</option>
                                <option value="ml">Mililitros (ml)</option>
                                <option value="l">Litros (l)</option>
                                <option value="units">Unidades</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="cost">Costo por Unidad ($)</label>
                            <input
                                type="number"
                                id="cost"
                                name="cost"
                                value={formData.cost}
                                onChange={handleInputChange}
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                required
                            />
                        </div>

                        {/* --- CAMPO AÑADIDO --- */}
                        <div className="form-group">
                            <label htmlFor="stockMinimo">Stock Mínimo</label>
                            <input
                                type="number"
                                id="stockMinimo"
                                name="stockMinimo"
                                value={formData.stockMinimo}
                                onChange={handleInputChange}
                                step="0.01"
                                min="0"
                                required
                            />
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

export default IngredientEditModal;
