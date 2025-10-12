import React, { useState, useEffect } from 'react';
import { inventoryService } from '../services/inventoryService';

function IngredientManagement() {
    const [ingredients, setIngredients] = useState([]);
    const [newIngredientName, setNewIngredientName] = useState('');
    const [newIngredientStock, setNewIngredientStock] = useState('');
    const [newIngredientUnit, setNewIngredientUnit] = useState('g');
    const [newIngredientCost, setNewIngredientCost] = useState('');

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

    // --- NUEVA FUNCIÓN PARA MANEJAR LA ELIMINACIÓN ---
    const handleDelete = async (ingredient) => {
        if (window.confirm(`¿Estás seguro de que deseas eliminar "${ingredient.name}"? Esta acción no se puede deshacer.`)) {
            try {
                await inventoryService.deleteIngredient(ingredient.id);
                fetchIngredients(); // Recargar la lista
            } catch (error) {
                alert(`Error al eliminar el ingrediente: ${error.response?.data?.message || error.message}`);
            }
        }
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
                    <li key={ing.id}>
                        <span>{ing.name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>{ing.stock} {ing.unit}</span>
                            <button onClick={() => handleStockAdjustment(ing, 'add')} style={{ padding: '0.2em 0.6em', fontSize: '1.2rem' }}>+</button>
                            <button onClick={() => handleStockAdjustment(ing, 'remove')} style={{ padding: '0.2em 0.7em', fontSize: '1.2rem' }}>-</button>
                            {/* --- NUEVO BOTÓN DE ELIMINAR --- */}
                            <button onClick={() => handleDelete(ing)} style={{ backgroundColor: '#e83f5b', padding: '0.4em 0.8em' }}>Eliminar</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default IngredientManagement;