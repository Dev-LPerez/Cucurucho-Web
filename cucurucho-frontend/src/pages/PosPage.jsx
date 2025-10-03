import React, { useEffect, useState } from 'react';
import { productService } from '../services/productService';
import { salesService } from '../services/salesService'; // Importamos el nuevo servicio
import { useNavigate } from 'react-router-dom';

function PosPage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentOrder, setCurrentOrder] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, productsData] = await Promise.all([
          productService.getCategories(),
          productService.getProducts(),
        ]);
        setCategories(categoriesData);
        setProducts(productsData);
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

  const calculateTotal = () => {
    return currentOrder.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  };

  // --- NUEVA FUNCIÓN ---
  const handleCompleteSale = async () => {
    if (currentOrder.length === 0) {
      setError('No hay productos en la orden.');
      return;
    }
    setError('');
    setSuccess('');
    try {
      await salesService.createSale(currentOrder);
      setSuccess('¡Venta completada con éxito!');
      setCurrentOrder([]); // Limpiamos la orden
      // Opcional: mostrar un mensaje de éxito por unos segundos
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
          <h1>Punto de Venta</h1>
          <button onClick={() => navigate('/dashboard')} className="back-button">Volver al Dashboard</button>
        </header>
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
        <button className="pay-button" onClick={handleCompleteSale}>
          Completar Venta
        </button>
      </aside>
    </div>
  );
}

export default PosPage;

