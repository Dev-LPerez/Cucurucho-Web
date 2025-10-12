import React, { useState, useEffect } from 'react';
import { inventoryService } from '../services/inventoryService';
import IngredientEditModal from './IngredientEditModal';

function IngredientManagement() {
    const [ingredients, setIngredients] = useState([]);
    const [newIngredientName, setNewIngredientName] = useState('');
    const [newIngredientStock, setNewIngredientStock] = useState('');
    const [newIngredientUnit, setNewIngredientUnit] = useState('g');
    const [newIngredientCost, setNewIngredientCost] = useState('');
    const [editingIngredient, setEditingIngredient] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const fetchIngredients = () => {
        inventoryService.getIngredients()
            .then(setIngredients)
            .catch(err => console.error("Error cargando ingredientes", err));
    };

    useEffect(() => {
        fetchIngredients();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const ingredientData = {
            name: newIngredientName,
            stock: parseFloat(newIngredientStock),
            unit: newIngredientUnit,
            cost: parseFloat(newIngredientCost),
        };
        try {
            await inventoryService.createIngredient(ingredientData);
            fetchIngredients();
            setNewIngredientName('');
            setNewIngredientStock('');
            setNewIngredientCost('');
        } catch (error) {
            console.error("Error al crear ingrediente", error);
        }
    };

    const handleStockAdjustment = async (ingredient, adjustmentType) => {
        const amountStr = prompt(`¿Qué cantidad de "${ingredient.name}" deseas ${adjustmentType === 'add' ? 'añadir' : 'quitar'}?`);
        if (amountStr === null) return;

        const amount = parseFloat(amountStr);
        if (isNaN(amount) || amount <= 0) {
            alert('Por favor, introduce un número positivo válido.');
            return;
        }

        const change = adjustmentType === 'add' ? amount : -amount;

        try {
            await inventoryService.updateStock(ingredient.id, change);
            fetchIngredients();
        } catch (error) {
            alert(`Error al ajustar el stock: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleEdit = (ingredient) => {
        setEditingIngredient(ingredient);
        setShowEditModal(true);
    };

    const handleSave = async (id, ingredientData) => {
        try {
            await inventoryService.updateIngredient(id, ingredientData);
            fetchIngredients();
        } catch (error) {
            console.error('Error al actualizar el ingrediente:', error);
            throw error;
        }
    };

    const handleDelete = async (ingredient) => {
        if (window.confirm(`¿Estás seguro de que deseas eliminar "${ingredient.name}"? Esta acción no se puede deshacer.`)) {
            try {
                await inventoryService.deleteIngredient(ingredient.id);
                fetchIngredients();
            } catch (error) {
                alert(`Error al eliminar el ingrediente: ${error.response?.data?.message || error.message}`);
            }
        }
    };

    const handleCloseModal = () => {
        setShowEditModal(false);
        setEditingIngredient(null);
    };

    return (
        <div>
            <h2>Gestión de Ingredientes</h2>

            <form onSubmit={handleSubmit} className="admin-form">
                <h3>Agregar Nuevo Ingrediente</h3>
                <input type="text" placeholder="Nombre del ingrediente" value={newIngredientName} onChange={e => setNewIngredientName(e.target.value)} required />
                <input type="number" placeholder="Stock Inicial" value={newIngredientStock} onChange={e => setNewIngredientStock(e.target.value)} required step="0.01" min="0" />
                <input type="number" placeholder="Costo por unidad" value={newIngredientCost} onChange={e => setNewIngredientCost(e.target.value)} required step="0.01" min="0" />
                <select value={newIngredientUnit} onChange={e => setNewIngredientUnit(e.target.value)} required>
                    <option value="g">Gramos (g)</option>
                    <option value="kg">Kilogramos (kg)</option>
                    <option value="ml">Mililitros (ml)</option>
                    <option value="l">Litros (l)</option>
                    <option value="units">Unidades</option>
                </select>
                <button type="submit">Crear Ingrediente</button>
            </form>

            <h3>Inventario Actual</h3>
            <ul className="admin-list">
                {ingredients.map(ing => (
                    <li key={ing.id} className="product-item">
                        <div className="product-info">
                            <span className="product-name">{ing.name}</span>
                            <span className="product-price">{ing.stock} {ing.unit}</span>
                            <span className="product-category">${ing.cost} / {ing.unit}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <button onClick={() => handleStockAdjustment(ing, 'add')} style={{ padding: '8px 16px', fontSize: '1.2rem', background: '#4ade80', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>+</button>
                            <button onClick={() => handleStockAdjustment(ing, 'remove')} style={{ padding: '8px 16px', fontSize: '1.2rem', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>-</button>
                            <button
                                className="btn-edit-product"
                                onClick={() => handleEdit(ing)}
                            >
                                ✏️ Editar
                            </button>
                            <button
                                className="btn-edit-product"
                                style={{ background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)' }}
                                onClick={() => handleDelete(ing)}
                            >
                                🗑️ Eliminar
                            </button>
                        </div>
                    </li>
                ))}
            </ul>

            {showEditModal && editingIngredient && (
                <IngredientEditModal
                    ingredient={editingIngredient}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                />
            )}
        </div>
    );
}

export default IngredientManagement;