// Ruta: cucurucho-frontend/src/components/IngredientManagement.jsx

import React, { useState, useEffect } from 'react';
import { inventoryService } from '../services/inventoryService';
import IngredientEditModal from './IngredientEditModal'; // Importamos el modal
import '../pages/Admin.css'; // Estilos comunes
import './IngredientManagement.css'; // Estilos específicos

const StockLevelBar = ({ actual, min }) => {
    if (!min || min === 0) { // Si no hay mínimo, la barra está al 100% o vacía si no hay stock
        return (
            <div className="stock-bar-container">
                <div className="stock-bar-level" style={{ width: actual > 0 ? '100%' : '0%', backgroundColor: 'var(--info)' }}></div>
            </div>
        );
    }
    const percentage = Math.min((actual / min) * 100, 100);
    let barColor = 'var(--success)';
    if (percentage < 50) barColor = 'var(--warning)';
    if (percentage < 25) barColor = 'var(--error)';

    return (
        <div className="stock-bar-container">
            <div className="stock-bar-level" style={{ width: `${percentage}%`, backgroundColor: barColor }}></div>
        </div>
    );
};

function IngredientManagement() {
    // --- ESTADOS PARA DATOS ---
    const [ingredients, setIngredients] = useState([]);

    // --- ESTADOS PARA EL MODAL DE EDICIÓN ---
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingIngredient, setEditingIngredient] = useState(null);

    // --- ESTADOS PARA EL FORMULARIO DE CREACIÓN ---
    const [newName, setNewName] = useState('');
    const [newStock, setNewStock] = useState('');
    const [newMinStock, setNewMinStock] = useState('');
    const [newUnit, setNewUnit] = useState('g');
    const [newCost, setNewCost] = useState('');

    const loadIngredients = async () => {
        try {
            const data = await inventoryService.getIngredients();
            setIngredients(data);
        } catch (error) {
            console.error("Error al cargar ingredientes:", error);
            alert('No se pudieron cargar los ingredientes desde el servidor.');
        }
    };

    useEffect(() => {
        loadIngredients();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const ingredientData = {
            name: newName,
            stock: parseFloat(newStock),
            stockMinimo: parseFloat(newMinStock),
            unit: newUnit,
            cost: parseFloat(newCost),
        };
        try {
            await inventoryService.createIngredient(ingredientData);
            alert('Ingrediente creado exitosamente!');
            setNewName('');
            setNewStock('');
            setNewMinStock('');
            setNewCost('');
            loadIngredients();
        } catch (error) {
            console.error("Error al crear ingrediente:", error);
            alert(`Error: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleDelete = async (ingredientId, ingredientName) => {
        if (window.confirm(`¿Estás seguro de que deseas eliminar "${ingredientName}"?`)) {
            try {
                await inventoryService.deleteIngredient(ingredientId);
                alert('Ingrediente eliminado.');
                loadIngredients();
            } catch (error) {
                console.error(`Error al eliminar el ingrediente ${ingredientId}:`, error);
                alert(`Error al eliminar: ${error.response?.data?.message || error.message}`);
            }
        }
    };

    // --- LÓGICA DEL MODAL DE EDICIÓN ---
    const handleOpenEditModal = (ingredient) => {
        setEditingIngredient(ingredient);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditingIngredient(null);
    };

    const handleSaveIngredient = async (id, ingredientData) => {
        try {
            await inventoryService.updateIngredient(id, ingredientData);
            alert('Ingrediente actualizado exitosamente.');
            loadIngredients(); // Recargar datos para ver los cambios
        } catch (error) {
            console.error("Error al guardar el ingrediente:", error);
            throw error; // Lanza el error para que el modal pueda manejarlo
        }
    };

    const lowStockIngredients = ingredients.filter(ing => parseFloat(ing.stock) < parseFloat(ing.stockMinimo || 0));

    return (
        <div className="admin-page-container">
            <div className="admin-page-header">
                <h2>Gestión de Ingredientes</h2>
                <p>Controla tu inventario y stock mínimo</p>
            </div>

            {lowStockIngredients.length > 0 && (
                <div className="alert-banner error">
                    <p>
                        <strong>
                            ⚠️ {lowStockIngredients.length} ingrediente(s) con stock bajo.
                        </strong>
                        Revisa la lista y realiza pedidos para mantener el inventario.
                    </p>
                </div>
            )}

            <div className="admin-card">
                <div className="admin-card-header">
                    <h3>Agregar Nuevo Ingrediente</h3>
                </div>
                <form className="add-ingredient-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Nombre</label>
                        <input type="text" id="name" placeholder="Ej: Azúcar" value={newName} onChange={e => setNewName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="stockActual">Stock Actual</label>
                        <input type="number" id="stockActual" placeholder="0" step="0.01" value={newStock} onChange={e => setNewStock(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="stockMinimo">Stock Mínimo</label>
                        <input type="number" id="stockMinimo" placeholder="0" step="0.01" value={newMinStock} onChange={e => setNewMinStock(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="unidad">Unidad</label>
                        <select id="unidad" value={newUnit} onChange={e => setNewUnit(e.target.value)}>
                            <option value="g">g</option>
                            <option value="kg">kg</option>
                            <option value="ml">ml</option>
                            <option value="l">l</option>
                            <option value="units">unidades</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="costo">Costo/Unidad ($)</label>
                        <input type="number" id="costo" placeholder="0.00" step="0.01" value={newCost} onChange={e => setNewCost(e.target.value)} required />
                    </div>
                    <button type="submit" style={{ alignSelf: 'end', height: '44px' }}>
                        + Agregar Ingrediente
                    </button>
                </form>
            </div>

            <div className="admin-card">
                <div className="admin-card-header">
                    <h3>Inventario de Ingredientes</h3>
                </div>
                <table className="admin-table">
                    <thead>
                    <tr>
                        <th>Ingrediente</th>
                        <th>Stock Actual</th>
                        <th>Stock Mínimo</th>
                        <th>Estado</th>
                        <th>Nivel de Stock</th>
                        <th>Costo/Unidad</th>
                        <th>Valor Total</th>
                        <th style={{textAlign: 'right'}}>Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {ingredients.map(ing => (
                        <tr key={ing.id}>
                            <td>{ing.name}</td>
                            <td>{parseFloat(ing.stock).toFixed(2)} {ing.unit}</td>
                            <td>{parseFloat(ing.stockMinimo || 0).toFixed(2)} {ing.unit}</td>
                            <td>
                                    <span className={`status-badge ${parseFloat(ing.stock) >= parseFloat(ing.stockMinimo || 0) ? 'positive' : 'negative'}`}>
                                        {parseFloat(ing.stock) >= parseFloat(ing.stockMinimo || 0) ? 'Bien' : 'Bajo'}
                                    </span>
                            </td>
                            <td><StockLevelBar actual={ing.stock} min={ing.stockMinimo || 0} /></td>
                            <td>${parseFloat(ing.cost).toFixed(2)}</td>
                            <td>${(parseFloat(ing.stock) * parseFloat(ing.cost)).toFixed(2)}</td>
                            <td className="actions-cell">
                                <button className="action-btn" onClick={() => handleOpenEditModal(ing)}>✏️</button>
                                <button className="action-btn delete" onClick={() => handleDelete(ing.id, ing.name)}>🗑️</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {isEditModalOpen && (
                <IngredientEditModal
                    ingredient={editingIngredient}
                    onClose={handleCloseEditModal}
                    onSave={handleSaveIngredient}
                />
            )}
        </div>
    );
}

export default IngredientManagement;