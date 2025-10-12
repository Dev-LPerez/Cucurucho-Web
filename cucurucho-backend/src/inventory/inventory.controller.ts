import { Controller, Get, Post, Body, UseGuards, Patch, Param, ValidationPipe, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../users/user.entity';
import { Ingredient } from './ingredient.entity';
import { UpdateStockDto } from './dto/update-stock.dto';

@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('ingredients')
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  findAllIngredients(): Promise<Ingredient[]> {
    return this.inventoryService.findAllIngredients();
  }

  @Post('ingredients')
  @Roles(UserRole.ADMIN)
  createIngredient(@Body() ingredientData: Partial<Ingredient>): Promise<Ingredient> {
    return this.inventoryService.createIngredient(ingredientData);
  }

  @Patch('ingredients/:id/stock')
  @Roles(UserRole.ADMIN)
  updateStock(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateStockDto: UpdateStockDto,
  ): Promise<Ingredient> {
    return this.inventoryService.updateStock(+id, updateStockDto.change);
  }

  @Patch('ingredients/:id')
  @Roles(UserRole.ADMIN)
  updateIngredient(
    @Param('id') id: string,
    @Body() ingredientData: Partial<Ingredient>,
  ): Promise<Ingredient> {
    return this.inventoryService.updateIngredient(+id, ingredientData);
  }

  @Delete('ingredients/:id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteIngredient(@Param('id') id: string): Promise<void> {
    return this.inventoryService.deleteIngredient(+id);
  }
}