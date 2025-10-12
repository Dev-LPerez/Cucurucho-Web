// Ruta: cucurucho-backend/src/inventory/ingredient.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { RecipeItem } from '../products/recipe-item.entity';

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

  @Column('decimal', { precision: 10, scale: 2 })
  stock: number;

  // --- CAMPO AÑADIDO ---
  @Column('decimal', { precision: 10, scale: 2, nullable: true, default: 0 })
  stockMinimo: number;

  @Column({
    type: 'enum',
    enum: Unit,
    default: Unit.UNITS,
  })
  unit: Unit;

  @Column('decimal', { precision: 10, scale: 2 })
  cost: number;

  @OneToMany(() => RecipeItem, (recipeItem) => recipeItem.ingredient)
  recipeItems: RecipeItem[];
}