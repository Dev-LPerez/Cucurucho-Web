// Ruta: dev-lperez/cucurucho-web/cucurucho-backend/src/products/products.controller.ts
import { Controller, Get, Post, Body, UseGuards, ValidationPipe } from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../users/user.entity';
import { CreateProductDto } from './dto/create-product.dto'; // <-- 1. Importa el DTO

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // --- Endpoints para Productos ---
  @Get()
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  findAllProducts() {
    return this.productsService.findAllProducts();
  }

  // --- ENDPOINT ACTUALIZADO ---
  @Post()
  @Roles(UserRole.ADMIN)
  // 2. Usa el DTO y el ValidationPipe para validar los datos de entrada.
  createProduct(@Body(new ValidationPipe()) productData: CreateProductDto) {
    return this.productsService.createProduct(productData);
  }

  // --- Endpoints para Categorías ---
  @Get('categories')
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  findAllCategories() {
    return this.productsService.findAllCategories();
  }

  @Post('categories')
  @Roles(UserRole.ADMIN)
  createCategory(@Body() categoryData: any) {
    return this.productsService.createCategory(categoryData);
  }

  // --- Endpoints para Modificadores ---
  @Get('modifiers')
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  findAllModifiers() {
    return this.productsService.findAllModifiers();
  }

  @Post('modifiers')
  @Roles(UserRole.ADMIN)
  createModifier(@Body() modifierData: any) {
    return this.productsService.createModifier(modifierData);
  }
}
