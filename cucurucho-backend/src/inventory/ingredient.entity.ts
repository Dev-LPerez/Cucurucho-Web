// Ruta: dev-lperez/cucurucho-web/cucurucho-backend/src/inventory/ingredient.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { RecipeItem } from '../products/recipe-item.entity';

// Enum para definir las unidades de medida de los ingredientes.
export enum Unit {
  GRAMS = 'g',
  KILOGRAMS = 'kg',
  MILLILITERS = 'ml',
  LITERS = 'l',
  UNITS = 'units',
}

@Entity()
export class Ingredient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  // Stock actual del ingrediente.
  @Column('decimal', { precision: 10, scale: 2 })
  stock: number;

  @Column({
    type: 'enum',
    enum: Unit,
    default: Unit.UNITS,
  })
  unit: Unit;

  // Costo del ingrediente por unidad.
  @Column('decimal', { precision: 10, scale: 2 })
  cost: number;

  // Relación con los items de receta.
  @OneToMany(() => RecipeItem, (recipeItem) => recipeItem.ingredient)
  recipeItems: RecipeItem[];
}
