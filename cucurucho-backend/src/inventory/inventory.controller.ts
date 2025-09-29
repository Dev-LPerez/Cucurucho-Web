// Ruta: dev-lperez/cucurucho-web/cucurucho-backend/src/inventory/inventory.controller.ts
import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../users/user.entity';
import { Ingredient } from './ingredient.entity';

@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard) // Protege todas las rutas de este controlador.
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // Endpoint para obtener todos los ingredientes.
  @Get('ingredients')
  @Roles(UserRole.ADMIN)
  findAllIngredients(): Promise<Ingredient[]> {
    return this.inventoryService.findAllIngredients();
  }

  // Endpoint para crear un nuevo ingrediente.
  @Post('ingredients')
  @Roles(UserRole.ADMIN)
  createIngredient(@Body() ingredientData: Partial<Ingredient>): Promise<Ingredient> {
    return this.inventoryService.createIngredient(ingredientData);
  }
}
