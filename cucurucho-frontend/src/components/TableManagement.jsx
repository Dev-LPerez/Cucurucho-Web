import React, { useState, useEffect } from 'react';
import { tableService } from '../services/tableService';
import TableEditModal from './TableEditModal';

function TableManagement() {
  const [tables, setTables] = useState([]);
  const [newTableName, setNewTableName] = useState('');
  const [editingTable, setEditingTable] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = () => {
    tableService.getTables()
      .then(setTables)
      .catch(console.error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTableName) return;
    try {
      await tableService.createTable({ name: newTableName });
      setNewTableName('');
      loadTables();
    } catch (error) {
      console.error('Error al crear la mesa', error);
    }
  };

  const handleEdit = (table) => {
    setEditingTable(table);
    setShowEditModal(true);
  };

  const handleSave = async (id, tableData) => {
    try {
      await tableService.updateTable(id, tableData);
      loadTables();
    } catch (error) {
      console.error('Error al actualizar la mesa:', error);
      throw error;
    }
  };

  const handleDelete = async (table) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar "${table.name}"? Esta acción no se puede deshacer.`)) {
      try {
        await tableService.deleteTable(table.id);
        loadTables();
      } catch (error) {
        alert(`Error al eliminar la mesa: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setEditingTable(null);
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
          <li key={table.id} className="product-item">
            <div className="product-info">
              <span className="product-name">{table.name}</span>
              <span className="product-category">
                Estado: {table.status === 'available' ? '✅ Disponible' : '🔴 Ocupada'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn-edit-product"
                onClick={() => handleEdit(table)}
              >
                ✏️ Editar
              </button>
              <button
                className="btn-edit-product"
                style={{ background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)' }}
                onClick={() => handleDelete(table)}
              >
                🗑️ Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>

      {showEditModal && editingTable && (
        <TableEditModal
          table={editingTable}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

export default TableManagement;
