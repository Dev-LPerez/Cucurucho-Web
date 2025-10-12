import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import { inventoryService } from '../services/inventoryService';

function ProductManagement() {
    const [products, setProducts] = useState([]);
    const [ingredients, setIngredients] = useState([]);
    const [categories, setCategories] = useState([]);

    const [newProductName, setNewProductName] = useState('');
    const [newProductPrice, setNewProductPrice] = useState('');
    const [newProductCategory, setNewProductCategory] = useState('');
    const [recipeItems, setRecipeItems] = useState([{ ingredientId: '', quantity: '' }]);

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

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Filtramos los items de receta que estén vacíos o incompletos antes de enviar
        const finalRecipeItems = recipeItems.filter(
            item => item.ingredientId && item.quantity && parseFloat(item.quantity) > 0
        ).map(item => ({
            ingredientId: parseInt(item.ingredientId),
            quantity: parseFloat(item.quantity)
        }));

        const productData = {
            name: newProductName,
            price: parseFloat(newProductPrice),
            categoryId: parseInt(newProductCategory),
        };

        // Solo añadimos la propiedad 'recipeItems' si hay al menos un item válido
        if (finalRecipeItems.length > 0) {
            productData.recipeItems = finalRecipeItems;
        }

        try {
            await productService.createProduct(productData);
            // Recargamos la lista completa para reflejar el nuevo producto
            const updatedProducts = await productService.getProducts();
            setProducts(updatedProducts);
            // Limpiar formulario a su estado inicial
            setNewProductName('');
            setNewProductPrice('');
            if (categories.length > 0) {
                setNewProductCategory(categories[0].id);
            }
            setRecipeItems([{ ingredientId: '', quantity: '' }]);
        } catch (error) {
            console.error("Error al crear el producto:", error);
        }
    };

    return (
        <div>
            <h2>Gestión de Productos</h2>

            <form onSubmit={handleSubmit} className="admin-form">
                <h3>Agregar Nuevo Producto</h3>
                <input
                    type="text"
                    placeholder="Nombre del producto"
                    value={newProductName}
                    onChange={e => setNewProductName(e.target.value)}
                    required
                />
                <input
                    type="number"
                    placeholder="Precio"
                    value={newProductPrice}
                    onChange={e => setNewProductPrice(e.target.value)}
                    required
                    step="0.01"
                    min="0"
                />
                <select
                    value={newProductCategory}
                    onChange={e => setNewProductCategory(e.target.value)}
                    required
                >
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>

                <h4>Receta (Opcional)</h4>
                {recipeItems.map((item, index) => (
                    <div key={index} className="recipe-item-form">
                        <select name="ingredientId" value={item.ingredientId} onChange={e => handleRecipeChange(index, e)}>
                            <option value="">Selecciona ingrediente...</option>
                            {ingredients.map(ing => <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>)}
                        </select>
                        <input
                            type="number"
                            name="quantity"
                            placeholder="Cantidad"
                            value={item.quantity}
                            onChange={e => handleRecipeChange(index, e)}
                            step="0.01"
                            min="0"
                        />
                        <button type="button" onClick={() => removeRecipeItem(index)}>Quitar</button>
                    </div>
                ))}
                <button type="button" onClick={addRecipeItem}>Añadir Ingrediente a Receta</button>

                <button type="submit">Crear Producto</button>
            </form>

            <h3>Lista de Productos</h3>
            <ul className="admin-list">
                {products.map(product => (
                    <li key={product.id}>
                        <span>{product.name} - ${product.price} ({product.category?.name || 'Sin Categoría'})</span>
                        <span>Ingredientes en receta: {product.recipeItems?.length || 0}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ProductManagement;