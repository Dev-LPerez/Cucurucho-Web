import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateStockDto {
  @IsNumber()
  @IsNotEmpty()
    // 'change' puede ser un número positivo para añadir stock o negativo para quitar.
  change: number;
}