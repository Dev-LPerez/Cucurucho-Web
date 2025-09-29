// Ruta: dev-lperez/cucurucho-web/cucurucho-frontend/src/components/IngredientManagement.jsx
import React, { useState, useEffect } from 'react';
import { inventoryService } from '../services/inventoryService';

function IngredientManagement() {
  const [ingredients, setIngredients] = useState([]);
  const [newIngredientName, setNewIngredientName] = useState('');
  const [newIngredientStock, setNewIngredientStock] = useState('');
  const [newIngredientUnit, setNewIngredientUnit] = useState('g');
  const [newIngredientCost, setNewIngredientCost] = useState('');

  useEffect(() => {
    inventoryService.getIngredients()
      .then(setIngredients)
      .catch(err => console.error("Error cargando ingredientes", err));
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
      const newIngredient = await inventoryService.createIngredient(ingredientData);
      setIngredients([...ingredients, newIngredient]);
      // Limpiar formulario
      setNewIngredientName('');
      setNewIngredientStock('');
      setNewIngredientCost('');
    } catch (error) {
      console.error("Error al crear ingrediente", error);
    }
  };

  return (
    <div>
      <h2>Gestión de Ingredientes</h2>
      
      {/* Formulario para agregar nuevo ingrediente */}
      <form onSubmit={handleSubmit} className="admin-form">
        <h3>Agregar Nuevo Ingrediente</h3>
        <input type="text" placeholder="Nombre del ingrediente" value={newIngredientName} onChange={e => setNewIngredientName(e.target.value)} required />
        <input type="number" placeholder="Stock Inicial" value={newIngredientStock} onChange={e => setNewIngredientStock(e.target.value)} required step="0.01" />
        <input type="number" placeholder="Costo por unidad" value={newIngredientCost} onChange={e => setNewIngredientCost(e.target.value)} required step="0.01" />
        <select value={newIngredientUnit} onChange={e => setNewIngredientUnit(e.target.value)} required>
          <option value="g">Gramos (g)</option>
          <option value="kg">Kilogramos (kg)</option>
          <option value="ml">Mililitros (ml)</option>
          <option value="l">Litros (l)</option>
          <option value="units">Unidades</option>
        </select>
        <button type="submit">Crear Ingrediente</button>
      </form>

      {/* Lista de ingredientes existentes */}
      <h3>Inventario Actual</h3>
      <ul className="admin-list">
        {ingredients.map(ing => (
          <li key={ing.id}>
            <span>{ing.name}</span>
            <span>{ing.stock} {ing.unit}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default IngredientManagement;
