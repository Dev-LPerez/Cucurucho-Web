import React, { useState, useEffect } from 'react';
import './ProductEditModal.css'; // Reutilizamos los estilos

function TableEditModal({ table, onClose, onSave }) {
    // --- ESTADO MODIFICADO ---
    const [formData, setFormData] = useState({ name: '', capacity: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (table) {
            // --- LÓGICA MODIFICADA ---
            setFormData({
                name: table.name || '',
                capacity: table.capacity || ''
            });
        }
    }, [table]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // --- LÓGICA MODIFICADA ---
            await onSave(table.id, {
                name: formData.name,
                capacity: parseInt(formData.capacity, 10)
            });
            onClose();
        } catch (error) {
            console.error('Error al guardar la mesa:', error);
            alert('Error al guardar la mesa. Por favor intenta de nuevo.');
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
                    <h2>✏️ Editar Mesa</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                <div className="modal-body">
                    <form onSubmit={handleSubmit} className="modal-form">
                        <div className="form-group">
                            <label htmlFor="name">Nombre de la Mesa</label>
                            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
                        </div>
                        {/* --- CAMPO AÑADIDO --- */}
                        <div className="form-group">
                            <label htmlFor="capacity">Capacidad (personas)</label>
                            <input type="number" id="capacity" name="capacity" value={formData.capacity} onChange={handleChange} min="1" required />
                        </div>
                        <div className="modal-actions">
                            <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
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

export default TableEditModal;
