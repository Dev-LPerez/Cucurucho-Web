import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { ImmediatePaymentDto } from './create-sale.dto';

// Este DTO manejará la adición de uno o más pagos a una venta existente.
// Reutilizamos ImmediatePaymentDto que ya define 'amount' y 'method'.
export class AddPaymentDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImmediatePaymentDto)
  payments: ImmediatePaymentDto[];
}