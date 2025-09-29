// Ruta: dev-lperez/cucurucho-web/cucurucho-frontend/src/components/ProductManagement.jsx
import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import { inventoryService } from '../services/inventoryService';

function ProductManagement() {
  // Estados para los datos
  const [products, setProducts] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Estados para el formulario de nuevo producto
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('');
  const [recipeItems, setRecipeItems] = useState([{ ingredientId: '', quantity: '' }]);

  // Carga inicial de datos
  useEffect(() => {
    const loadData = async () => {
      try {
        const [prods, ings, cats] = await Promise.all([
          productService.getProducts(),
          inventoryService.getIngredients(),
          productService.getCategories(),
        ]);
        setProducts(prods);
        setIngredients(ings);
        setCategories(cats);
        if (cats.length > 0) {
          setNewProductCategory(cats[0].id);
        }
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };
    loadData();
  }, []);

  // Manejadores para la receta
  const handleRecipeChange = (index, event) => {
    const values = [...recipeItems];
    values[index][event.target.name] = event.target.value;
    setRecipeItems(values);
  };

  const addRecipeItem = () => {
    setRecipeItems([...recipeItems, { ingredientId: '', quantity: '' }]);
  };

  const removeRecipeItem = (index) => {
    const values = [...recipeItems];
    values.splice(index, 1);
    setRecipeItems(values);
  };

  // Manejador para enviar el formulario
  const handleSubmit = async (event) => {
    event.preventDefault();
    const productData = {
      name: newProductName,
      price: parseFloat(newProductPrice),
      categoryId: parseInt(newProductCategory),
      recipeItems: recipeItems.map(item => ({
        ingredientId: parseInt(item.ingredientId),
        quantity: parseFloat(item.quantity)
      })),
    };

    try {
      const newProduct = await productService.createProduct(productData);
      setProducts([...products, newProduct]);
      // Limpiar formulario
      setNewProductName('');
      setNewProductPrice('');
      setRecipeItems([{ ingredientId: '', quantity: '' }]);
    } catch (error) {
      console.error("Error al crear el producto:", error);
    }
  };

  return (
    <div>
      <h2>Gestión de Productos</h2>
      
      {/* Formulario para agregar nuevo producto */}
      <form onSubmit={handleSubmit} className="admin-form">
        <h3>Agregar Nuevo Producto</h3>
        <input type="text" placeholder="Nombre del producto" value={newProductName} onChange={e => setNewProductName(e.target.value)} required />
        <input type="number" placeholder="Precio" value={newProductPrice} onChange={e => setNewProductPrice(e.target.value)} required step="0.01" />
        <select value={newProductCategory} onChange={e => setNewProductCategory(e.target.value)} required>
          {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
        </select>

        <h4>Receta</h4>
        {recipeItems.map((item, index) => (
          <div key={index} className="recipe-item-form">
            <select name="ingredientId" value={item.ingredientId} onChange={e => handleRecipeChange(index, e)} required>
              <option value="">Selecciona ingrediente</option>
              {ingredients.map(ing => <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>)}
            </select>
            <input type="number" name="quantity" placeholder="Cantidad" value={item.quantity} onChange={e => handleRecipeChange(index, e)} required step="0.001" />
            <button type="button" onClick={() => removeRecipeItem(index)}>Quitar</button>
          </div>
        ))}
        <button type="button" onClick={addRecipeItem}>Añadir Ingrediente a Receta</button>
        
        <button type="submit">Crear Producto</button>
      </form>

      {/* Lista de productos existentes */}
      <h3>Lista de Productos</h3>
      <ul className="admin-list">
        {products.map(product => (
          <li key={product.id}>
            <span>{product.name} - ${product.price} ({product.category?.name})</span>
            <span>Receta: {product.recipeItems?.length || 0} items</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProductManagement;
