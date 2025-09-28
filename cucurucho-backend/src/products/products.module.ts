import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './product.entity';
import { Category } from './category.entity';
import { Modifier } from './modifier.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Category, Modifier])], // <-- Registra las 3 entidades
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}