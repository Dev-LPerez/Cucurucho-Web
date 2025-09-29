// Ruta: dev-lperez/cucurucho-web/cucurucho-backend/src/products/products.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './product.entity';
import { Category } from './category.entity';
import { Modifier } from './modifier.entity';
import { RecipeItem } from './recipe-item.entity'; // <-- 1. Importa la nueva entidad

@Module({
  imports: [TypeOrmModule.forFeature([Product, Category, Modifier, RecipeItem])], // <-- 2. Registra la entidad
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
