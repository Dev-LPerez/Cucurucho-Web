// Ruta: dev-lperez/cucurucho-web/cucurucho-backend/src/products/recipe-item.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Product } from './product.entity';
import { Ingredient } from '../inventory/ingredient.entity';

// Esta entidad representa un item en la receta de un producto (la relación entre producto e ingrediente).
@Entity()
export class RecipeItem {
  @PrimaryGeneratedColumn()
  id: number;

  // La cantidad del ingrediente usada en el producto.
  @Column('decimal', { precision: 10, scale: 3 })
  quantity: number;

  @ManyToOne(() => Product, (product) => product.recipeItems, { onDelete: 'CASCADE' })
  product: Product;

  @ManyToOne(() => Ingredient, (ingredient) => ingredient.recipeItems, { eager: true, onDelete: 'CASCADE' })
  ingredient: Ingredient;
}
