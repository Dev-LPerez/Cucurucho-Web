// Ruta: dev-lperez/cucurucho-web/cucurucho-backend/src/products/dto/create-product.dto.ts
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';

// Define la estructura de un item de la receta.
class RecipeItemDto {
  @IsNumber()
  ingredientId: number;

  @IsNumber()
  quantity: number;
}

// Define la estructura completa para crear un producto.
export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  price: number;

  @IsNumber()
  categoryId: number;

  // Valida que la receta sea un array y que cada item cumpla con la estructura de RecipeItemDto.
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipeItemDto)
  recipeItems: RecipeItemDto[];
}
