// Ruta: dev-lperez/cucurucho-web/cucurucho-backend/src/products/product.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { Category } from './category.entity';
import { Modifier } from './modifier.entity';
import { RecipeItem } from './recipe-item.entity'; // <-- 1. Importa la nueva entidad.

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @ManyToOne(() => Category, (category) => category.products)
  category: Category;

  @ManyToMany(() => Modifier)
  @JoinTable()
  modifiers: Modifier[];

  // 2. Añade la relación para la receta.
  @OneToMany(() => RecipeItem, (recipeItem) => recipeItem.product, {
    cascade: true,
  })
  recipeItems: RecipeItem[];
}
