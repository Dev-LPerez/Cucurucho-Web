// Ruta: cucurucho-backend/src/tables/dto/create-table.dto.ts
import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateTableDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  // --- CAMPO AÑADIDO CON VALIDACIÓN ---
  @IsNumber()
  @IsPositive()
  capacity: number;
}