import React, { useEffect, useState } from 'react';
import { productService } from '../services/productService';
import { salesService } from '../services/salesService';
import { tableService } from '../services/tableService'; // Importamos el servicio de mesas
import { useNavigate } from 'react-router-dom';

function PosPage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [tables, setTables] = useState([]); // Estado para las mesas
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Modificamos el estado para manejar múltiples órdenes
  const [orders, setOrders] = useState({ counter: [] }); // 'counter' para el mostrador, y luego por ID de mesa
  const [activeOrderKey, setActiveOrderKey] = useState('counter'); // Clave de la orden activa

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [viewMode, setViewMode] = useState('counter'); // 'counter' o 'tables'
  const navigate = useNavigate();

  const currentOrder = orders[activeOrderKey] || [];

  useEffect(() => {
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
    setOrders(prevOrders => {
      const current = prevOrders[activeOrderKey] || [];
      const existingItem = current.find(item => item.id === product.id);
      let updatedOrder;
      if (existingItem) {
        updatedOrder = current.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        updatedOrder = [...current, { ...product, quantity: 1 }];
      }
      return { ...prevOrders, [activeOrderKey]: updatedOrder };
    });
  };

  const calculateTotal = () => {
    return currentOrder.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  };

  const handleSelectTable = (tableId) => {
    setActiveOrderKey(`table-${tableId}`);
    setViewMode('counter'); // Cambiamos a la vista de productos para añadir items
  }

  const handleCompleteSale = async () => {
    if (currentOrder.length === 0) {
      setError('No hay productos en la orden.');
      return;
    }
    setError('');
    setSuccess('');

    const tableId = activeOrderKey.startsWith('table-') ? parseInt(activeOrderKey.split('-')[1]) : null;

    try {
      await salesService.createSale({ items: currentOrder, tableId });
      setSuccess(`¡Venta completada! Total: $${calculateTotal()}`);

      // Limpiar orden y actualizar estado de la mesa si aplica
      setOrders(prev => ({...prev, [activeOrderKey]: []}));
      if(tableId) {
        setTables(prevTables => prevTables.map(t => t.id === tableId ? {...t, status: 'occupied'} : t));
        setActiveOrderKey('counter'); // Volvemos al mostrador por defecto
        setViewMode('tables');
      }

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al procesar la venta.');
    }
  };

  const filteredProducts = products.filter(
    p => p.category && p.category.id === selectedCategory
  );

  return (
    <div className="pos-container">
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
          <h3>Total: ${calculateTotal()}</h3>
        </div>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
        <button className="pay-button" onClick={handleCompleteSale} disabled={currentOrder.length === 0}>
          Completar Venta
        </button>
      </aside>
    </div>
  );
}

export default PosPage;
