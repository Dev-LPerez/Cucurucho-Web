// Ruta: cucurucho-frontend/src/pages/PosPage.jsx

import React, { useEffect, useState } from 'react';
import { productService } from '../services/productService';
import { salesService } from '../services/salesService';
import { tableService } from '../services/tableService';
import PaymentModal from '../components/PaymentModal';

import './PosPage.css'; // Importamos los nuevos estilos del POS

function PosPage() {
    // --- ESTADOS ---
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [tables, setTables] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [currentOrder, setCurrentOrder] = useState([]);
    const [viewMode, setViewMode] = useState('mostrador'); // 'mostrador' o 'mesas'
    const [activeTable, setActiveTable] = useState(null); // Para saber qué mesa está activa

    // --- LÓGICA DE DATOS (sin cambios) ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoriesData, productsData, tablesData] = await Promise.all([
                    productService.getCategories(),
                    productService.getProducts(),
                    tableService.getTables(),
                ]);
                setCategories([{ id: 'all', name: 'Todos' }, ...categoriesData]);
                setProducts(productsData);
                setTables(tablesData);
                setSelectedCategory('all');
            } catch (err) {
                console.error('Error al cargar datos:', err);
            }
        };
        fetchData();
    }, []);

    // --- LÓGICA DE ORDEN (simplificada) ---
    const addToOrder = (product) => {
        setCurrentOrder(prevOrder => {
            const existingItem = prevOrder.find(item => item.id === product.id);
            if (existingItem) {
                return prevOrder.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prevOrder, { ...product, quantity: 1 }];
        });
    };

    const clearOrder = () => setCurrentOrder([]);

    const calculateTotal = () => {
        return currentOrder.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    // --- RENDERIZADO ---
    const renderMostrador = () => (
        <>
            <div className="category-filters">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        className={selectedCategory === cat.id ? 'active' : ''}
                        onClick={() => setSelectedCategory(cat.id)}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>
            <div className="product-grid">
                {products
                    .filter(p => selectedCategory === 'all' || p.category?.id === selectedCategory)
                    .map(product => (
                        <div key={product.id} className="product-card" onClick={() => addToOrder(product)}>
                            <h3>{product.name}</h3>
                            <p>${product.price}</p>
                            <span className="add-icon">+</span>
                        </div>
                    ))}
            </div>
        </>
    );

    const getStatusText = (status) => {
        switch (status) {
            case 'free': return 'Libre';
            case 'occupied': return 'Ocupada';
            case 'paying': return 'Pendiente';
            default: return 'Libre';
        }
    };

    const renderMesas = () => (
        <div className="table-map-grid">
            {tables.map(table => (
                <div
                    key={table.id}
                    className={`table-card status-${table.status}`}
                    onClick={() => console.log("Seleccionada mesa:", table.id)}
                >
                    <div className="table-name">{table.name}</div>
                    <span className="table-status-badge">{getStatusText(table.status)}</span>
                </div>
            ))}
        </div>
    );

    return (
        <div className="pos-page">
            {/* Columna Principal (Izquierda) */}
            <main className="pos-main-view">
                <div className="pos-header">
                    <h2>{viewMode === 'mostrador' ? 'Mostrador' : 'Mapa de Mesas'}</h2>
                    <div className="pos-view-toggle">
                        <button
                            className={viewMode === 'mostrador' ? 'active' : ''}
                            onClick={() => setViewMode('mostrador')}
                        >
                            Mostrador
                        </button>
                        <button
                            className={viewMode === 'mesas' ? 'active' : ''}
                            onClick={() => setViewMode('mesas')}
                        >
                            Mesas
                        </button>
                    </div>
                </div>

                {viewMode === 'mostrador' ? renderMostrador() : renderMesas()}
            </main>

            {/* Sidebar de Orden (Derecha) */}
            <aside className="pos-order-sidebar">
                <h3>Orden Actual</h3>

                {currentOrder.length === 0 ? (
                    <div className="order-empty">
                        <div className="order-empty-icon"> {/* Icono de Lucide iría aquí */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                        </div>
                        <p>No hay productos en la orden</p>
                    </div>
                ) : (
                    <div className="order-items-list">
                        {/* Aquí se renderizarían los items de la orden */}
                        {currentOrder.map(item => (
                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span>{item.name} x {item.quantity}</span>
                                <span>${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                )}

                <div className="order-summary">
                    <div className="summary-row">
                        <span>Subtotal</span>
                        <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                    <div className="summary-row total">
                        <span>Total</span>
                        <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                    <div className="order-actions">
                        {/* Lógica de descuento a implementar */}
                        <button className="btn btn-discount" disabled={currentOrder.length === 0}>% Descuento</button>
                        <button className="btn btn-clear" onClick={clearOrder} disabled={currentOrder.length === 0}>Limpiar</button>
                    </div>
                    <button className="btn btn-pay" style={{width: '100%', marginTop: '1rem'}} disabled={currentOrder.length === 0}>
                        Cobrar / Pagar
                    </button>
                </div>
            </aside>
        </div>
    );
}

export default PosPage;