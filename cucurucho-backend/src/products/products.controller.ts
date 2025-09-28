import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator'; // Crearemos este decorador
import { RolesGuard } from '../auth/roles.guard'; // Crearemos este guard
import { UserRole } from '../users/user.entity';

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard) // Proteger todas las rutas de este controlador
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // --- Endpoints para Productos ---
  @Get()
  @Roles(UserRole.ADMIN, UserRole.CASHIER) // Admin y Cajero pueden ver
  findAllProducts() {
    return this.productsService.findAllProducts();
  }

  @Post()
  @Roles(UserRole.ADMIN) // Solo el Admin puede crear
  createProduct(@Body() productData: any) {
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