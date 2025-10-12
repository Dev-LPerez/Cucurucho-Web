// Ruta: cucurucho-backend/src/products/dto/create-product.dto.ts
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

class RecipeItemDto {
  @IsNumber()
  ingredientId: number;

  @IsNumber()
  quantity: number;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  price: number;

  // --- CAMPO AÑADIDO ---
  @IsOptional()
  @IsNumber()
  cost?: number; // Costo manual y opcional

  @IsNumber()
  categoryId: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipeItemDto)
  recipeItems?: RecipeItemDto[];
}