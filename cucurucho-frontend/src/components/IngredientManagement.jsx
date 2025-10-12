// Ruta: cucurucho-frontend/src/components/IngredientManagement.jsx

import React, { useState, useEffect } from 'react';
import { inventoryService } from '../services/inventoryService';
import '../pages/Admin.css'; // Estilos comunes
import './IngredientManagement.css'; // Estilos específicos

const StockLevelBar = ({ actual, min }) => {
    if (min === 0 || actual === 0) { // Evita división por cero y muestra barra vacía si no hay stock
        return (
            <div className="stock-bar-container">
                <div className="stock-bar-level" style={{ width: '0%', backgroundColor: 'var(--error)' }}></div>
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
    // --- ESTADOS PARA DATOS REALES ---
    const [ingredients, setIngredients] = useState([]);

    // --- ESTADOS PARA EL FORMULARIO ---
    const [newName, setNewName] = useState('');
    const [newStock, setNewStock] = useState('');
    const [newMinStock, setNewMinStock] = useState('');
    const [newUnit, setNewUnit] = useState('g');
    const [newCost, setNewCost] = useState('');

    // --- FUNCIÓN PARA CARGAR DATOS ---
    const loadIngredients = async () => {
        try {
            const data = await inventoryService.getIngredients();
            setIngredients(data);
        } catch (error) {
            console.error("Error al cargar ingredientes:", error);
            alert('No se pudieron cargar los ingredientes desde el servidor.');
        }
    };

    // --- Carga inicial de datos ---
    useEffect(() => {
        loadIngredients();
    }, []);

    // --- MANEJO DEL FORMULARIO ---
    const handleSubmit = async (event) => {
        event.preventDefault();
        const ingredientData = {
            name: newName,
            stock: parseFloat(newStock),
            stockMinimo: parseFloat(newMinStock), // Asegúrate que tu backend maneje este campo
            unit: newUnit,
            cost: parseFloat(newCost),
        };

        try {
            await inventoryService.createIngredient(ingredientData);
            alert('Ingrediente creado exitosamente!');
            // Limpiar formulario y recargar lista
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

    // --- MANEJO DE ELIMINACIÓN ---
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

    const lowStockIngredients = ingredients.filter(ing => ing.stock < (ing.stockMinimo || 0));

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
                        <input type="number" id="stockActual" placeholder="0" value={newStock} onChange={e => setNewStock(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="stockMinimo">Stock Mínimo</label>
                        <input type="number" id="stockMinimo" placeholder="0" value={newMinStock} onChange={e => setNewMinStock(e.target.value)} required />
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
                            <td>{ing.stock} {ing.unit}</td>
                            <td>{ing.stockMinimo || 0} {ing.unit}</td>
                            <td>
                                    <span className={`status-badge ${ing.stock >= (ing.stockMinimo || 0) ? 'positive' : 'negative'}`}>
                                        {ing.stock >= (ing.stockMinimo || 0) ? 'Bien' : 'Bajo'}
                                    </span>
                            </td>
                            <td><StockLevelBar actual={ing.stock} min={ing.stockMinimo || 0} /></td>
                            <td>${parseFloat(ing.cost).toFixed(2)}</td>
                            <td>${(ing.stock * ing.cost).toFixed(2)}</td>
                            <td className="actions-cell">
                                <button className="action-btn">✏️</button>
                                <button className="action-btn delete" onClick={() => handleDelete(ing.id, ing.name)}>🗑️</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default IngredientManagement;