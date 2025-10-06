import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsPositive,
  ValidateNested,
  IsEnum,
  IsObject,
} from 'class-validator';
import { PaymentMethod } from '../payment.entity';

class SaleItemDto {
  @IsNumber()
  productId: number;

  @IsNumber()
  @IsPositive()
  quantity: number;
}

// DTO para pagos inmediatos (ventas de mostrador)
export class ImmediatePaymentDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;
}

// DTO para descuentos
export class DiscountDto {
    @IsEnum(['percentage', 'fixed'])
    type: 'percentage' | 'fixed';

    @IsNumber()
    @IsPositive()
    value: number;
}

export class CreateSaleDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];

  @IsNumber()
  @IsOptional()
  tableId?: number;

  // Opcional: para aplicar un descuento a la venta total
  @IsObject()
  @ValidateNested()
  @Type(() => DiscountDto)
  @IsOptional()
  discount?: DiscountDto;

  // Opcional: para registrar pagos en el momento de la creación (mostrador)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImmediatePaymentDto)
  @IsOptional()
  payments?: ImmediatePaymentDto[];
}

