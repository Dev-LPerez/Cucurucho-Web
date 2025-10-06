// Ruta: cucurucho-web/cucurucho-backend/src/products/products.controller.ts
import { Controller, Get, Post, Body, UseGuards, ValidationPipe, Param, Patch, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../users/user.entity';
import { CreateProductDto } from './dto/create-product.dto';

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

    @Post()
    @Roles(UserRole.ADMIN)
    createProduct(@Body(new ValidationPipe()) productData: CreateProductDto) {
        return this.productsService.createProduct(productData);
    }

    // --- NUEVO: Endpoint para actualizar un producto ---
    @Patch(':id')
    @Roles(UserRole.ADMIN)
    updateProduct(@Param('id') id: string, @Body(new ValidationPipe()) productData: Partial<CreateProductDto>) {
        return this.productsService.updateProduct(+id, productData);
    }

    // --- NUEVO: Endpoint para eliminar un producto ---
    @Delete(':id')
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteProduct(@Param('id') id: string) {
        return this.productsService.deleteProduct(+id);
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
