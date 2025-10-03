import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsPositive, ValidateNested } from 'class-validator';

class SaleItemDto {
  @IsNumber()
  productId: number;

  @IsNumber()
  @IsPositive()
  quantity: number;
}

export class CreateSaleDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];

  // Opcional: ID de la mesa a la que se asocia la venta
  @IsNumber()
  @IsOptional()
  tableId?: number;
}
