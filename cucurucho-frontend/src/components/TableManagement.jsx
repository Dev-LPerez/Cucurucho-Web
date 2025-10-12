// Ruta: cucurucho-frontend/src/components/TableManagement.jsx

import React, { useState, useEffect } from 'react';
import { tableService } from '../services/tableService';
import '../pages/Admin.css';
import './TableManagement.css';

function TableManagement() {
    // --- ESTADOS PARA DATOS REALES ---
    const [tables, setTables] = useState([]);

    // --- ESTADOS PARA EL FORMULARIO ---
    const [newTableName, setNewTableName] = useState('');
    const [newTableCapacity, setNewTableCapacity] = useState('');

    // --- FUNCIÓN PARA CARGAR DATOS ---
    const loadTables = async () => {
        try {
            const data = await tableService.getTables();
            setTables(data);
        } catch (error) {
            console.error("Error al cargar las mesas:", error);
            alert('No se pudieron cargar las mesas.');
        }
    };

    // --- Carga inicial de datos ---
    useEffect(() => {
        loadTables();
    }, []);

    // --- MANEJO DEL FORMULARIO ---
    const handleSubmit = async (event) => {
        event.preventDefault();
        const tableData = {
            name: newTableName,
            capacity: parseInt(newTableCapacity, 10),
        };

        if (!tableData.name || !tableData.capacity || tableData.capacity <= 0) {
            alert('Por favor, ingresa un nombre y una capacidad válida.');
            return;
        }

        try {
            await tableService.createTable(tableData);
            alert('Mesa creada exitosamente.');
            // Limpiar formulario y recargar
            setNewTableName('');
            setNewTableCapacity('');
            loadTables();
        } catch (error) {
            console.error("Error al crear la mesa:", error);
            alert(`Error: ${error.response?.data?.message || error.message}`);
        }
    };

    // --- MANEJO DE ELIMINACIÓN ---
    const handleDelete = async (tableId, tableName) => {
        if (window.confirm(`¿Estás seguro de que deseas eliminar la "${tableName}"?`)) {
            try {
                await tableService.deleteTable(tableId);
                alert('Mesa eliminada.');
                loadTables();
            } catch (error) {
                console.error(`Error al eliminar la mesa ${tableId}:`, error);
                alert(`Error al eliminar: ${error.response?.data?.message || error.message}`);
            }
        }
    };

    // --- CÁLCULOS PARA LAS MÉTRICAS ---
    const totalCapacity = tables.reduce((acc, table) => acc + (table.capacity || 0), 0);
    const activeTables = tables.length; // Suponiendo que todas las mesas de la lista están activas

    return (
        <div className="admin-page-container">
            <div className="admin-page-header">
                <h2>Gestión de Mesas</h2>
                <p>Administra la distribución de tu salón</p>
            </div>

            <div className="table-stats-grid">
                <div className="stat-card">
                    <p className="stat-title">Mesas Totales</p>
                    <p className="stat-value">{tables.length}</p>
                </div>
                <div className="stat-card">
                    <p className="stat-title">Mesas Activas</p>
                    <p className="stat-value success">{activeTables}</p>
                </div>
                <div className="stat-card">
                    <p className="stat-title">Capacidad Total</p>
                    <p className="stat-value">{totalCapacity} personas</p>
                </div>
            </div>

            <div className="admin-card">
                <div className="admin-card-header">
                    <h3>Agregar Nueva Mesa</h3>
                </div>
                <form className="add-table-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="tableName">Número de Mesa</label>
                        <input type="text" id="tableName" placeholder="Ej: 1" value={newTableName} onChange={e => setNewTableName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="tableCapacity">Capacidad (personas)</label>
                        <input type="number" id="tableCapacity" placeholder="Ej: 4" value={newTableCapacity} onChange={e => setNewTableCapacity(e.target.value)} required />
                    </div>
                    <button type="submit">+ Agregar Mesa</button>
                </form>
            </div>

            <div className="admin-card">
                <div className="admin-card-header">
                    <h3>Mesas del Salón</h3>
                </div>
                <div className="salon-tables-grid">
                    {tables.map(table => (
                        <div className="table-manage-card" key={table.id}>
                            <div className="table-card-header">
                                <div className="table-info">
                                    <div className="table-icon">🪑</div>
                                    <div>
                                        <p className="table-name">{table.name}</p>
                                        <p className="table-capacity">{table.capacity} personas</p>
                                    </div>
                                </div>
                                <span className="status-badge positive">Activa</span>
                            </div>
                            <div className="table-card-actions">
                                <button className="btn-action">Desactivar</button>
                                <button className="btn-action btn-icon">✏️</button>
                                <button className="btn-action btn-icon delete" onClick={() => handleDelete(table.id, table.name)}>🗑️</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default TableManagement;