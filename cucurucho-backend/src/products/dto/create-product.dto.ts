import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

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

    // --- CAMBIO REALIZADO AQUÍ ---
    // Ahora el array de la receta es opcional
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => RecipeItemDto)
    recipeItems?: RecipeItemDto[];
}