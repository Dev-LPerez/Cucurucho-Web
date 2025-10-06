import React, { useEffect, useState } from 'react';
import { productService } from '../services/productService';
import { salesService } from '../services/salesService';
import { tableService } from '../services/tableService';
import { useNavigate } from 'react-router-dom';
import PaymentModal from '../components/PaymentModal'; // <-- Importamos el nuevo Modal de Pago

function PosPage() {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [tables, setTables] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const [orders, setOrders] = useState({ counter: { items: [], saleId: null } });
    const [activeOrderKey, setActiveOrderKey] = useState('counter');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [viewMode, setViewMode] = useState('counter');
    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
    const navigate = useNavigate();

    const currentOrder = orders[activeOrderKey]?.items || [];
    const currentSaleId = orders[activeOrderKey]?.saleId;

    useEffect(() => {
        // ... (sin cambios aquí)
        const fetchData = async () => {
            try {
                const [categoriesData, productsData, tablesData] = await Promise.all([
                    productService.getCategories(),
                    productService.getProducts(),
                    tableService.getTables(),
                ]);
                setCategories(categoriesData);
                setProducts(productsData);
                setTables(tablesData);
                if (categoriesData.length > 0) {
                    setSelectedCategory(categoriesData[0].id);
                }
            } catch (err) {
                setError('No se pudieron cargar los datos. ¿Está el servidor funcionando?');
            }
        };
        fetchData();
    }, []);

    const addToOrder = (product) => {
        // ... (sin cambios aquí)
        setOrders(prevOrders => {
            const current = prevOrders[activeOrderKey]?.items || [];
            const existingItem = current.find(item => item.id === product.id);
            let updatedOrder;
            if (existingItem) {
                updatedOrder = current.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            } else {
                updatedOrder = [...current, { ...product, quantity: 1 }];
            }
            return { ...prevOrders, [activeOrderKey]: { ...prevOrders[activeOrderKey], items: updatedOrder } };
        });
    };

    const calculateTotal = () => {
        return currentOrder.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    const handleSelectTable = (tableId) => {
        // ... (lógica mejorada para inicializar la orden de la mesa)
        if (!orders[`table-${tableId}`]) {
            setOrders(prev => ({...prev, [`table-${tableId}`]: { items: [], saleId: null }}));
        }
        setActiveOrderKey(`table-${tableId}`);
        setViewMode('counter');
    }

    // Abre el modal de pago. Si la orden no se ha guardado, la crea primero.
    const handleInitiatePayment = async () => {
        if (currentOrder.length === 0) {
            setError('No hay productos en la orden.');
            return;
        }
        setError('');
        setSuccess('');

        // Si la venta aún no ha sido creada en el backend (no tiene saleId), la creamos.
        if (!currentSaleId) {
            try {
                const tableId = activeOrderKey.startsWith('table-') ? parseInt(activeOrderKey.split('-')[1]) : undefined;
                const saleData = {
                    items: currentOrder.map(item => ({ productId: item.id, quantity: item.quantity })),
                    tableId,
                };
                const newSale = await salesService.createSale(saleData);

                // Guardamos el ID de la venta para futuros pagos
                setOrders(prev => ({...prev, [activeOrderKey]: {...prev[activeOrderKey], saleId: newSale.id }}));

                if (tableId) {
                    setTables(prevTables => prevTables.map(t => t.id === tableId ? { ...t, status: 'paying' } : t));
                }
                setPaymentModalOpen(true); // Abrimos el modal
            } catch (err) {
                setError(err.response?.data?.message || 'Error al crear la venta.');
            }
        } else {
            // Si la venta ya existe, solo abrimos el modal
            setPaymentModalOpen(true);
        }
    };

    // Se llama desde el modal cuando el pago es exitoso
    const handlePaymentSuccess = () => {
        setSuccess(`¡Venta completada! Total: $${calculateTotal().toFixed(2)}`);
        setPaymentModalOpen(false);

        // Limpiar la orden y resetear el estado
        const tableId = activeOrderKey.startsWith('table-') ? parseInt(activeOrderKey.split('-')[1]) : null;

        setOrders(prev => ({...prev, [activeOrderKey]: { items: [], saleId: null }}));

        if (tableId) {
            setTables(prevTables => prevTables.map(t => t.id === tableId ? { ...t, status: 'free' } : t));
            setActiveOrderKey('counter');
            setViewMode('tables');
        }

        setTimeout(() => setSuccess(''), 4000);
    };

    const filteredProducts = products.filter(
        p => p.category && p.category.id === selectedCategory
    );

    return (
        <div className="pos-container">
            {/* ... (código del header, nav y product-grid sin cambios) ... */}
            <div className="pos-main">
                <header className="pos-header">
                    <h1>Punto de Venta - {activeOrderKey.startsWith('table-') ? `Mesa ${tables.find(t => t.id === parseInt(activeOrderKey.split('-')[1]))?.name}` : 'Mostrador'}</h1>
                    <div className="view-toggle">
                        <button onClick={() => { setViewMode('counter'); setActiveOrderKey('counter'); }} className={viewMode === 'counter' ? 'active' : ''}>Mostrador</button>
                        <button onClick={() => { setViewMode('tables'); }} className={viewMode === 'tables' ? 'active' : ''}>Mesas</button>
                    </div>
                    <button onClick={() => navigate('/dashboard')} className="back-button">Dashboard</button>
                </header>

                {viewMode === 'counter' && (
                    <>
                        <nav className="category-nav">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    className={`category-button ${selectedCategory === cat.id ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory(cat.id)}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </nav>
                        <main className="product-grid">
                            {filteredProducts.map(product => (
                                <div key={product.id} className="product-card" onClick={() => addToOrder(product)}>
                                    <h3>{product.name}</h3>
                                    <p>${product.price}</p>
                                </div>
                            ))}
                        </main>
                    </>
                )}

                {viewMode === 'tables' && (
                    <main className="table-map">
                        <h2>Seleccionar Mesa</h2>
                        <div className="table-grid">
                            {tables.map(table => (
                                <div key={table.id} className={`table-card ${table.status}`} onClick={() => handleSelectTable(table.id)}>
                                    {table.name}
                                </div>
                            ))}
                        </div>
                    </main>
                )}
            </div>

            <aside className="order-sidebar">
                <h2>Orden Actual</h2>
                <div className="order-items">
                    {currentOrder.length === 0 ? (
                        <p>Añade productos a la orden.</p>
                    ) : (
                        currentOrder.map(item => (
                            <div key={item.id} className="order-item">
                                <span>{item.name} (x{item.quantity})</span>
                                <span>${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))
                    )}
                </div>
                <div className="order-total">
                    <h3>Total: ${calculateTotal().toFixed(2)}</h3>
                </div>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
                <button className="pay-button" onClick={handleInitiatePayment} disabled={currentOrder.length === 0}>
                    Cobrar / Pagar
                </button>
            </aside>

            {isPaymentModalOpen && (
                <PaymentModal
                    saleId={currentSaleId}
                    totalAmount={calculateTotal()}
                    onClose={() => setPaymentModalOpen(false)}
                    onPaymentSuccess={handlePaymentSuccess}
                />
            )}
        </div>
    );
}

export default PosPage;