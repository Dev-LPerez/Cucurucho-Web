import React, { useState, useEffect } from 'react';
import { tableService } from '../services/tableService';

function TableManagement() {
  const [tables, setTables] = useState([]);
  const [newTableName, setNewTableName] = useState('');

  useEffect(() => {
    tableService.getTables()
      .then(setTables)
      .catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTableName) return;
    try {
      const newTable = await tableService.createTable({ name: newTableName });
      setTables([...tables, newTable]);
      setNewTableName('');
    } catch (error) {
      console.error('Error al crear la mesa', error);
    }
  };

  return (
    <div>
      <h2>Gestión de Mesas</h2>
      <form onSubmit={handleSubmit} className="admin-form">
        <h3>Añadir Nueva Mesa</h3>
        <input
          type="text"
          placeholder="Nombre o número de la mesa"
          value={newTableName}
          onChange={(e) => setNewTableName(e.target.value)}
          required
        />
        <button type="submit">Añadir Mesa</button>
      </form>

      <h3>Mesas Existentes</h3>
      <ul className="admin-list">
        {tables.map((table) => (
          <li key={table.id}>
            <span>{table.name}</span>
            <span>Estado: {table.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TableManagement;
