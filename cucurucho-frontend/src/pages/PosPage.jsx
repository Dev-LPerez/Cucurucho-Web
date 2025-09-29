// Ruta: dev-lperez/cucurucho-web/cucurucho-frontend/src/pages/PosPage.jsx
import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';

function PosPage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [order, setOrder] = useState([]);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('counter'); // 'counter' o 'tables'

  // Carga los datos iniciales de productos y categorías.
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, prods] = await Promise.all([
          productService.getCategories(),
          productService.getProducts(),
        ]);
        setCategories(cats);
        setProducts(prods);
        if (cats.length > 0) {
          setActiveCategory(cats[0].id);
        }
      } catch (err) {
        setError('No se pudieron cargar los productos. ¿Iniciaste sesión?');
      }
    };
    fetchData();
  }, []);

  const addToOrder = (product) => {
    setOrder([...order, product]);
  };

  const calculateTotal = () => {
    return order.reduce((total, item) => total + parseFloat(item.price), 0).toFixed(2);
  };

  const filteredProducts = products.filter(
    (product) => product.category && product.category.id === activeCategory,
  );

  return (
    <div className="pos-container">
      <aside className="pos-sidebar">
        <h2>Pedido Actual</h2>
        <ul className="order-list">
          {order.map((item, index) => (
            <li key={index}>
              <span>{item.name}</span>
              <span>${parseFloat(item.price).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <div className="order-total">
          <strong>Total: ${calculateTotal()}</strong>
        </div>
        <button className="pay-button">Cobrar</button>
      </aside>

      <main className="pos-main">
        <header className="pos-header">
            <h1>Punto de Venta</h1>
            <div className="view-toggle">
                <button onClick={() => setViewMode('counter')} className={viewMode === 'counter' ? 'active' : ''}>Mostrador</button>
                <button onClick={() => setViewMode('tables')} className={viewMode === 'tables' ? 'active' : ''}>Mesas</button>
            </div>
        </header>

        {viewMode === 'counter' && (
          <>
            <nav className="category-nav">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={activeCategory === cat.id ? 'active' : ''}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </nav>
            <section className="product-grid">
              {error && <p className="error-message">{error}</p>}
              {filteredProducts.map((prod) => (
                <div key={prod.id} className="product-card" onClick={() => addToOrder(prod)}>
                  <h3>{prod.name}</h3>
                  <p>${parseFloat(prod.price).toFixed(2)}</p>
                </div>
              ))}
            </section>
          </>
        )}

        {viewMode === 'tables' && (
            <section className="table-map">
                <h2>Mapa de Mesas (Próximamente)</h2>
                <div className="table-grid">
                    {/* Aquí iría el mapa de mesas */}
                    <div className="table">Mesa 1</div>
                    <div className="table occupied">Mesa 2</div>
                    <div className="table">Mesa 3</div>
                    <div className="table">Mesa 4</div>
                </div>
            </section>
        )}
      </main>
    </div>
  );
}

export default PosPage;
